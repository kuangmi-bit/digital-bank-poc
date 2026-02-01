/**
 * API 基础配置
 * 遵循 naming-conventions: 常量 UPPER_SNAKE_CASE
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export const API_TIMEOUT_MS = 30000;
