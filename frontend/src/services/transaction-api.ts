import { apiClient } from './api-client';
import type { ApiResponse } from './api-client';

/** 转账请求（与 OpenAPI TransferRequest 一致） */
export interface TransferRequest {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  remark?: string;
}

/** 转账响应（行内转账 200） */
export interface TransferResponse {
  transactionId: string;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  status: string;
}

/** 交易（与 OpenAPI TransactionResponse 一致） */
export interface Transaction {
  transactionId: string;
  accountId: number;
  counterAccountId?: number | null;
  amount: number;
  transactionType: string;
  status: string;
  remark?: string | null;
  createdAt?: string;
}

/** 交易列表响应 */
export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListTransactionsParams {
  page?: number;
  pageSize?: number;
  accountId?: number;
  status?: string;
}

export interface GetTransactionHistoryParams {
  accountId: number;
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
}

/** 批量转账单项 */
export interface TransferItem {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  remark?: string;
}

/** 批量转账请求 */
export interface BatchTransferRequest {
  batchId: string;
  transfers: TransferItem[];
}

/** 批量转账单项结果 */
export interface TransferResult {
  index: number;
  transactionId: string | null;
  status: string;
  errorCode?: string;
  message?: string;
}

/** 批量转账响应 */
export interface BatchTransferResponse {
  batchId: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  results: TransferResult[];
}

/** 预约转账请求 */
export interface ScheduledTransferRequest {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  scheduledTime: string;
  remark?: string;
}

/** 预约转账响应 */
export interface ScheduledTransfer {
  scheduledId: string;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  scheduledTime: string;
  status: string;
  transactionId?: string;
  errorMessage?: string;
  remark?: string;
  createdAt: string;
}

/** 预约转账列表响应 */
export interface ScheduledTransferListResponse {
  items: ScheduledTransfer[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 交易 API（baseURL /api/v1）
 * - POST /transactions/transfer
 * - GET /transactions
 * - GET /transactions/history
 */
export const transactionApi = {
  transfer: async (body: TransferRequest): Promise<TransferResponse> => {
    const resp = await apiClient.post<ApiResponse<TransferResponse>>('/transactions/transfer', body);
    const r = resp as ApiResponse<TransferResponse>;
    if (r?.data) return r.data;
    return resp as unknown as TransferResponse;
  },

  listTransactions: async (params?: ListTransactionsParams): Promise<TransactionListResponse> => {
    const resp = await apiClient.get<ApiResponse<TransactionListResponse>>('/transactions', {
      params: params ?? {},
    });
    const r = resp as ApiResponse<TransactionListResponse>;
    return r?.data ?? { items: [], total: 0, page: 1, pageSize: 20 };
  },

  getTransactionHistory: async (
    params: GetTransactionHistoryParams
  ): Promise<TransactionListResponse> => {
    const resp = await apiClient.get<ApiResponse<TransactionListResponse>>('/transactions/history', {
      params,
    });
    const r = resp as ApiResponse<TransactionListResponse>;
    return r?.data ?? { items: [], total: 0, page: 1, pageSize: 20 };
  },

  /** 批量转账 */
  batchTransfer: async (body: BatchTransferRequest): Promise<BatchTransferResponse> => {
    const resp = await apiClient.post<ApiResponse<BatchTransferResponse>>('/transactions/batch-transfer', body);
    const r = resp as ApiResponse<BatchTransferResponse>;
    if (r?.data) return r.data;
    return resp as unknown as BatchTransferResponse;
  },

  /** 创建预约转账 */
  createScheduledTransfer: async (body: ScheduledTransferRequest): Promise<ScheduledTransfer> => {
    const resp = await apiClient.post<ApiResponse<ScheduledTransfer>>('/transactions/scheduled', body);
    const r = resp as ApiResponse<ScheduledTransfer>;
    if (r?.data) return r.data;
    return resp as unknown as ScheduledTransfer;
  },

  /** 查询预约转账列表 */
  listScheduledTransfers: async (params: { accountId: number; status?: string; page?: number; pageSize?: number }): Promise<ScheduledTransferListResponse> => {
    const resp = await apiClient.get<ApiResponse<ScheduledTransferListResponse>>('/transactions/scheduled', { params });
    const r = resp as ApiResponse<ScheduledTransferListResponse>;
    return r?.data ?? { items: [], total: 0, page: 1, pageSize: 20 };
  },

  /** 取消预约转账 */
  cancelScheduledTransfer: async (scheduledId: string): Promise<ScheduledTransfer> => {
    const resp = await apiClient.delete<ApiResponse<ScheduledTransfer>>(`/transactions/scheduled/${scheduledId}`);
    const r = resp as ApiResponse<ScheduledTransfer>;
    if (r?.data) return r.data;
    return resp as unknown as ScheduledTransfer;
  },
};
