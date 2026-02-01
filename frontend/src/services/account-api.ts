import { apiClient } from './api-client';
import type { ApiResponse } from './api-client';

/** 账户（与 OpenAPI AccountResponse 对齐） */
export interface Account {
  accountId: number;
  accountNumber: string;
  customerId: number;
  balance: number;
  currency: string;
  accountType: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 账户列表响应（AccountListResponse） */
export interface AccountListResponse {
  items: Account[];
  total: number;
  page: number;
  pageSize: number;
}

/** 余额查询响应 */
export interface BalanceResponse {
  accountId: number;
  balance: number;
  currency: string;
}

export interface ListAccountsParams {
  page?: number;
  pageSize?: number;
  customerId?: number;
  status?: string;
}

/**
 * 账户 API（经 api-client，baseURL /api/v1 指向网关或核心银行）
 * - GET /api/v1/accounts
 * - GET /api/v1/accounts/{account-id}
 * - GET /api/v1/accounts/{account-id}/balance
 */
export const accountApi = {
  listAccounts: async (params?: ListAccountsParams): Promise<AccountListResponse> => {
    const resp = await apiClient.get<ApiResponse<AccountListResponse>>('/accounts', {
      params: params ?? {},
    });
    const r = resp as ApiResponse<AccountListResponse>;
    return r.data ?? { items: [], total: 0, page: 1, pageSize: 20 };
  },

  getAccount: async (accountId: number): Promise<Account> => {
    const resp = await apiClient.get<ApiResponse<Account>>(`/accounts/${accountId}`);
    return (resp as ApiResponse<Account>).data;
  },

  getBalance: async (accountId: number): Promise<BalanceResponse> => {
    const resp = await apiClient.get<ApiResponse<BalanceResponse>>(`/accounts/${accountId}/balance`);
    return (resp as ApiResponse<BalanceResponse>).data;
  },
};
