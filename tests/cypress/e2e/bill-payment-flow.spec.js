/**
 * 账单支付流程 E2E 测试（ADR-008）
 * 命名：bill-payment-flow.spec.js；it('should_xxx_when_yyy')
 * 遵循 technical-standards-v2.0、naming-conventions
 */

describe('Bill Payment Flow', () => {
  const loginStub = () => {
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: { token: 'e2e-token', user: { id: '1', username: 'e2e', customerId: 1, name: 'E2E' } },
        timestamp: new Date().toISOString(),
      },
    });
  };

  const accountsStub = () => {
    cy.intercept('GET', '**/api/v1/accounts*', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: {
          items: [
            { accountId: 1, accountNumber: '6200123456789012', customerId: 1, balance: 10000, currency: 'CNY', accountType: 'savings', status: 'active' },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
        },
        timestamp: new Date().toISOString(),
      },
    }).as('listAccounts');
  };

  const billPaymentsListStub = (items = []) => {
    cy.intercept('GET', '**/api/v1/payments/bill', {
      statusCode: 200,
      body: {
        code: 200,
        data: { items, total: items.length, page: 1, pageSize: 20 },
        timestamp: new Date().toISOString(),
      },
    }).as('listBillPayments');
  };

  beforeEach(() => {
    loginStub();
    accountsStub();
    cy.visit('/login');
    cy.get('input[autocomplete="username"]').type('e2euser');
    cy.get('input[autocomplete="current-password"]').type('password1');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/accounts');
  });

  it('should_display_bill_payment_page_when_authenticated', () => {
    billPaymentsListStub([]);
    cy.visit('/bill-payment');
    cy.wait('@listAccounts');
    cy.contains('账单支付').should('be.visible');
    cy.contains('支付账单').should('be.visible');
    cy.contains('水电煤').should('be.visible');
  });

  it('should_query_bill_info_when_click_query_button', () => {
    billPaymentsListStub([]);
    cy.intercept('GET', '**/api/v1/payments/bill/query*', {
      statusCode: 200,
      body: {
        code: 200,
        data: {
          billType: 'utility',
          billAccount: '1234567890',
          vendor: '国家电网',
          balance: 156.80,
          status: 'unpaid',
        },
        timestamp: new Date().toISOString(),
      },
    }).as('queryBill');

    cy.visit('/bill-payment');
    cy.wait('@listAccounts');
    cy.get('select').first().select('1');
    cy.wait('@listBillPayments');

    // 输入账单账户号
    cy.get('input[placeholder*="户号"]').type('1234567890');
    cy.contains('查询').click();
    cy.wait('@queryBill');

    // 验证账单信息显示
    cy.contains('国家电网').should('be.visible');
    cy.contains('156.80').should('be.visible');
  });

  it('should_submit_bill_payment_when_valid', () => {
    billPaymentsListStub([]);
    cy.intercept('GET', '**/api/v1/payments/bill/query*', {
      statusCode: 200,
      body: {
        code: 200,
        data: {
          billType: 'utility',
          billAccount: '1234567890',
          vendor: '国家电网',
          balance: 100,
          status: 'unpaid',
        },
        timestamp: new Date().toISOString(),
      },
    }).as('queryBill');

    cy.intercept('POST', '**/api/v1/payments/bill', {
      statusCode: 201,
      body: {
        code: 201,
        data: {
          paymentId: 'BP-001',
          billType: 'utility',
          billAccount: '1234567890',
          payerAccountId: 1,
          amount: 100,
          status: 'completed',
          transactionId: 'TX-BILL-001',
          billReferenceNo: 'BILL123456',
          billVendor: '国家电网',
          createdAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
    }).as('createBillPayment');

    cy.visit('/bill-payment');
    cy.wait('@listAccounts');
    cy.get('select').first().select('1');
    cy.wait('@listBillPayments');

    cy.get('input[placeholder*="户号"]').type('1234567890');
    cy.contains('查询').click();
    cy.wait('@queryBill');

    cy.contains('确认支付').click();
    cy.wait('@createBillPayment');
  });

  it('should_display_payment_history', () => {
    const items = [
      {
        paymentId: 'BP-hist-001',
        billType: 'utility',
        billAccount: '1234567890',
        payerAccountId: 1,
        amount: 156.80,
        status: 'completed',
        billVendor: '国家电网',
        billReferenceNo: 'BILL111',
        createdAt: new Date().toISOString(),
      },
      {
        paymentId: 'BP-hist-002',
        billType: 'telecom',
        billAccount: '13800138000',
        payerAccountId: 1,
        amount: 100,
        status: 'completed',
        billVendor: '中国移动',
        billReferenceNo: 'BILL222',
        createdAt: new Date().toISOString(),
      },
    ];
    billPaymentsListStub(items);

    cy.visit('/bill-payment');
    cy.wait('@listAccounts');
    cy.get('select').first().select('1');
    cy.wait('@listBillPayments');

    cy.contains('支付记录').should('be.visible');
    cy.contains('国家电网').should('be.visible');
    cy.contains('中国移动').should('be.visible');
    cy.contains('已完成').should('have.length', 2);
  });

  it('should_switch_bill_types', () => {
    billPaymentsListStub([]);
    cy.visit('/bill-payment');
    cy.wait('@listAccounts');

    // 验证账单类型切换
    cy.get('select').eq(1).select('telecom');
    cy.get('input[placeholder*="手机号码"]').should('be.visible');

    cy.get('select').eq(1).select('credit_card');
    cy.get('input[placeholder*="信用卡"]').should('be.visible');

    cy.get('select').eq(1).select('utility');
    cy.get('input[placeholder*="户号"]').should('be.visible');
  });

  it('should_show_error_when_bill_not_found', () => {
    billPaymentsListStub([]);
    cy.intercept('GET', '**/api/v1/payments/bill/query*', {
      statusCode: 404,
      body: {
        code: 404,
        errorCode: 'PYB011',
        message: '账单账户不存在',
      },
    }).as('queryBillFail');

    cy.visit('/bill-payment');
    cy.wait('@listAccounts');
    cy.get('select').first().select('1');
    cy.wait('@listBillPayments');

    cy.get('input[placeholder*="户号"]').type('9999999999');
    cy.contains('查询').click();
    cy.wait('@queryBillFail');

    cy.contains('账单账户不存在').should('be.visible');
  });

  it('should_show_error_when_insufficient_balance', () => {
    billPaymentsListStub([]);
    cy.intercept('GET', '**/api/v1/payments/bill/query*', {
      statusCode: 200,
      body: {
        code: 200,
        data: {
          billType: 'credit_card',
          billAccount: '6222021234567890123',
          vendor: '工商银行',
          balance: 5000,
          status: 'unpaid',
        },
        timestamp: new Date().toISOString(),
      },
    }).as('queryBill');

    cy.intercept('POST', '**/api/v1/payments/bill', {
      statusCode: 400,
      body: {
        code: 400,
        errorCode: 'PYB008',
        message: '余额不足',
      },
    }).as('createBillPaymentFail');

    cy.visit('/bill-payment');
    cy.wait('@listAccounts');
    cy.get('select').first().select('1');
    cy.wait('@listBillPayments');

    cy.get('select').eq(1).select('credit_card');
    cy.get('input[placeholder*="信用卡"]').type('6222021234567890123');
    cy.contains('查询').click();
    cy.wait('@queryBill');

    // 修改金额为超出余额的值
    cy.get('#amount').clear().type('999999');
    cy.contains('确认支付').click();
    cy.wait('@createBillPaymentFail');

    cy.get('[role="alert"]').should('be.visible');
    cy.contains('余额不足').should('be.visible');
  });
});
