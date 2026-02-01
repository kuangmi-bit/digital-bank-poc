/**
 * PaymentService 单元测试
 * 遵循 technical-standards-v1.0 测试规范、Jest
 */

const { PaymentError } = require('../src/utils/payment-error');

jest.mock('../src/models/payment');
jest.mock('../src/mocks/payment-gateway');
jest.mock('../src/clients/core-bank-client', () => ({
  isAvailable: jest.fn(),
  getBalance: jest.fn(),
  debit: jest.fn(),
}));

const Payment = require('../src/models/payment');
const mockGateway = require('../src/mocks/payment-gateway');
const coreBankClient = require('../src/clients/core-bank-client');

// 在 mock 之后 require，以便使用 mock 后的模块
const paymentService = require('../src/services/payment-service');

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayment (d3a2t3a)', () => {
    it('应成功创建支付订单并调用 Mock 网关', async () => {
      mockGateway.createOrder.mockResolvedValue({
        gatewayOrderId: 'MOCK_001',
        code: 'MOCK_SUCCESS',
        message: 'Order created',
      });

      const mockSave = jest.fn().mockResolvedValue(undefined);
      const mockDoc = {
        paymentId: 'pay-1',
        orderId: 'ord-1',
        userId: 'u1',
        amount: 100,
        save: mockSave,
      };
      Payment.mockImplementation(() => ({ ...mockDoc, save: mockSave }));

      const result = await paymentService.createPayment({
        orderId: 'ord-1',
        userId: 'u1',
        amount: 100,
      });

      expect(mockGateway.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 'ord-1', amount: 100 })
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('缺少 orderId 时应抛出 PYV001', async () => {
      await expect(
        paymentService.createPayment({ userId: 'u1', amount: 100 })
      ).rejects.toMatchObject({
        name: 'PaymentError',
        errorCode: 'PYV001',
        httpStatus: 400,
      });
    });

    it('amount 非正时应抛出 PYV001', async () => {
      await expect(
        paymentService.createPayment({ orderId: 'o1', userId: 'u1', amount: 0 })
      ).rejects.toMatchObject({ errorCode: 'PYV001', httpStatus: 400 });
    });
  });

  describe('processPayment (d3a2t3b)', () => {
    it('应成功处理并更新为 completed', async () => {
      const mockPayment = {
        paymentId: 'pay-1',
        orderId: 'o1',
        amount: 50,
        currency: 'CNY',
        channel: 'mock',
        status: 'pending',
        gatewayResponse: { gatewayOrderId: 'G1' },
        save: jest.fn().mockResolvedValue(undefined),
      };
      Payment.findOne.mockResolvedValue(mockPayment);
      // Day 5: processPayment 使用 findOneAndUpdate 做并发幂等锁（pending -> processing）
      Payment.findOneAndUpdate.mockResolvedValue(mockPayment);
      mockGateway.processPayment.mockResolvedValue({
        code: 'MOCK_SUCCESS',
        message: 'Payment completed',
        paidAt: '2026-01-27T12:00:00.000Z',
        gatewayOrderId: 'G1',
      });

      const result = await paymentService.processPayment('pay-1');

      expect(mockGateway.processPayment).toHaveBeenCalled();
      expect(mockPayment.status).toBe('completed');
      expect(mockPayment.save).toHaveBeenCalled();
      expect(result).toBe(mockPayment);
    });

    it('带 accountId 且 core-bank 可用时，应调用 debit(refId=paymentId)（ADR-005 幂等）', async () => {
      const lockedPayment = {
        paymentId: 'pay-99',
        orderId: 'o99',
        accountId: '1',
        amount: 10,
        currency: 'CNY',
        channel: 'mock',
        status: 'pending',
        gatewayResponse: { gatewayOrderId: 'G99' },
        retryCount: 0,
        save: jest.fn().mockResolvedValue(undefined),
      };

      Payment.findOne.mockResolvedValue({ ...lockedPayment });
      Payment.findOneAndUpdate.mockResolvedValue(lockedPayment);

      coreBankClient.isAvailable.mockReturnValue(true);
      coreBankClient.getBalance.mockResolvedValue({ accountId: 1, balance: 999, currency: 'CNY' });
      coreBankClient.debit.mockResolvedValue({ transactionId: 'tx-1', status: 'completed' });

      mockGateway.processPayment.mockResolvedValue({
        code: 'MOCK_SUCCESS',
        message: 'Payment completed',
        paidAt: '2026-01-27T12:00:00.000Z',
        gatewayOrderId: 'G99',
      });

      const result = await paymentService.processPayment('pay-99');

      expect(coreBankClient.getBalance).toHaveBeenCalledWith('1');
      expect(coreBankClient.debit).toHaveBeenCalledWith(
        '1',
        10,
        'pay-99',
        expect.stringContaining('payment:o99')
      );
      expect(result.status).toBe('completed');
    });

    it('core-bank 余额不足时应 failed，并返回 PYB008（不调用 mock 网关）', async () => {
      const lockedPayment = {
        paymentId: 'pay-ib',
        orderId: 'o-ib',
        accountId: 1,
        amount: 100,
        currency: 'CNY',
        channel: 'mock',
        status: 'pending',
        gatewayResponse: { gatewayOrderId: 'G-ib' },
        retryCount: 0,
        save: jest.fn().mockResolvedValue(undefined),
      };

      Payment.findOne.mockResolvedValue({ ...lockedPayment });
      Payment.findOneAndUpdate.mockResolvedValue(lockedPayment);

      coreBankClient.isAvailable.mockReturnValue(true);
      coreBankClient.getBalance.mockResolvedValue({ accountId: 1, balance: 1, currency: 'CNY' });

      const result = await paymentService.processPayment('pay-ib');

      expect(result.status).toBe('failed');
      expect(result.lastErrorCode).toBe('PYB008');
      expect(coreBankClient.debit).not.toHaveBeenCalled();
      expect(mockGateway.processPayment).not.toHaveBeenCalled();
    });

    it('订单不存在时应抛出 PYB003', async () => {
      Payment.findOne.mockResolvedValue(null);

      await expect(paymentService.processPayment('pay-none')).rejects.toMatchObject({
        errorCode: 'PYB003',
        httpStatus: 404,
      });
    });

    it('订单已支付时应抛出 PYB004', async () => {
      Payment.findOne.mockResolvedValue({ paymentId: 'p1', status: 'completed' });

      await expect(paymentService.processPayment('p1')).rejects.toMatchObject({
        errorCode: 'PYB004',
        httpStatus: 400,
      });
    });

    it('simulateFailure 时应收款单更新为 failed', async () => {
      const mockPayment = {
        paymentId: 'pay-1',
        orderId: 'o1',
        amount: 50,
        currency: 'CNY',
        channel: 'mock',
        status: 'pending',
        gatewayResponse: {},
        save: jest.fn().mockResolvedValue(undefined),
      };
      Payment.findOne.mockResolvedValue(mockPayment);
      Payment.findOneAndUpdate.mockResolvedValue(mockPayment);
      mockGateway.processPayment.mockResolvedValue({
        code: 'MOCK_FAILED',
        message: 'Simulated gateway failure',
      });

      const result = await paymentService.processPayment('pay-1', { simulateFailure: true });

      expect(mockPayment.status).toBe('failed');
      expect(result).toBe(mockPayment);
    });
  });

  describe('getPaymentById (d3a2t3c)', () => {
    it('找到时应返回文档', async () => {
      const doc = { paymentId: 'pay-1', status: 'completed' };
      Payment.findOne.mockResolvedValue(doc);

      const result = await paymentService.getPaymentById('pay-1');
      expect(result).toEqual(doc);
      expect(Payment.findOne).toHaveBeenCalledWith({ paymentId: 'pay-1' });
    });

    it('未找到时应返回 null', async () => {
      Payment.findOne.mockResolvedValue(null);
      const result = await paymentService.getPaymentById('pay-none');
      expect(result).toBeNull();
    });
  });
});
