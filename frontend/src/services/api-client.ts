import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '@/config/api';

/** 标准 API 响应（与 technical-standards 一致） */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

/** 标准 API 错误 */
export interface ApiErrorBody {
  code?: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (err) => Promise.reject(err)
  );

  client.interceptors.response.use(
    (res) => res.data,
    (err: AxiosError<ApiErrorBody>) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        const p = window.location.pathname;
        if (!p.startsWith('/login') && !p.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
      const msg = err.response?.data?.message ?? '网络错误，请稍后重试';
      return Promise.reject(new Error(msg));
    }
  );

  return client;
}

export const apiClient = createApiClient();
