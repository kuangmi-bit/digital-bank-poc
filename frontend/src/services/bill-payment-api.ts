import { apiClient } from './api-client';
import type { ApiResponse } from './api-client';

/** 账单支付请求 */
export interface BillPaymentRequest {
  billType: 'utility' | 'telecom' | 'credit_card';
  billAccount: string;
  amount: number;
  payerAccountId: number;
}

/** 账单支付响应 */
export interface BillPayment {
  paymentId: string;
  billType: string;
  billAccount: string;
  payerAccountId: number;
  amount: number;
  status: string;
  transactionId?: string;
  billReferenceNo?: string;
  billVendor?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
}

/** 账单支付列表响应 */
export interface BillPaymentListResponse {
  items: BillPayment[];
  total: number;
  page: number;
  pageSize: number;
}

/** 账单信息 */
export interface BillInfo {
  billType: string;
  billAccount: string;
  vendor: string;
  balance: number;
  status: string;
}

/** 账单类型选项 */
export const BILL_TYPES = [
  { value: 'utility', label: '水电煤' },
  { value: 'telecom', label: '电信缴费' },
  { value: 'credit_card', label: '信用卡还款' },
] as const;

export const billPaymentApi = {
  /** 创建账单支付 */
  createBillPayment: async (body: BillPaymentRequest): Promise<BillPayment> => {
    const resp = await apiClient.post<ApiResponse<BillPayment>>('/payments/bill', body);
    const r = resp as ApiResponse<BillPayment>;
    if (r?.data) return r.data;
    return resp as unknown as BillPayment;
  },

  /** 查询账单支付列表 */
  listBillPayments: async (params: {
    payerAccountId: number;
    billType?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<BillPaymentListResponse> => {
    const resp = await apiClient.get<ApiResponse<BillPaymentListResponse>>('/payments/bill', { params });
    const r = resp as ApiResponse<BillPaymentListResponse>;
    return r?.data ?? { items: [], total: 0, page: 1, pageSize: 20 };
  },

  /** 查询账单信息 */
  queryBillInfo: async (billType: string, billAccount: string): Promise<BillInfo> => {
    const resp = await apiClient.get<ApiResponse<BillInfo>>('/payments/bill/query', {
      params: { billType, billAccount },
    });
    const r = resp as ApiResponse<BillInfo>;
    if (r?.data) return r.data;
    return resp as unknown as BillInfo;
  },
};
