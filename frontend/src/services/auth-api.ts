import { apiClient } from './api-client';
import type { ApiResponse } from './api-client';

/** 登录请求（api-design-spec: /api/v1/auth/login，待后端实现） */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  customerId?: number;
  name?: string;
  role?: string;
}

/** 登录响应：data 内为 token 与 user */
export interface LoginResponse {
  token: string;
  user: User;
}

/** 客户注册请求（POST /api/v1/customers，与 OpenAPI CreateCustomerRequest 一致） */
export interface RegisterRequest {
  name: string;
  idCard?: string;
  phone?: string;
  email?: string;
  address?: string;
}

/** 客户注册响应（CustomerResponse） */
export interface RegisterResponse {
  customerId: number;
  name: string;
  idCard?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 认证 API
 * - login: POST /api/v1/auth/login（需后端实现；baseURL 已含 /api/v1）
 * - register: POST /api/v1/customers
 */
export const authApi = {
  login: async (body: LoginRequest): Promise<LoginResponse> => {
    const resp = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', body);
    return (resp as ApiResponse<LoginResponse>).data;
  },

  register: async (body: RegisterRequest): Promise<RegisterResponse> => {
    const resp = await apiClient.post<ApiResponse<RegisterResponse>>('/customers', body);
    return (resp as ApiResponse<RegisterResponse>).data;
  },
};
