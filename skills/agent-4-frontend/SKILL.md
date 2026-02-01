---
name: agent-4-frontend
version: 1.0.0
description: 前端体验构建器Agent技能 - 负责实现数字银行系统的前端用户界面，包括登录、账户管理、转账等核心页面。使用React 18 + TypeScript 5.x + Tailwind CSS 3.x技术栈。
author: Digital Bank POC Team
license: MIT
keywords:
  - react
  - typescript
  - tailwind-css
  - frontend
  - ui-ux
  - web-development
  - responsive-design
---

# Agent 4: 前端体验构建器 🎨

## 概述

Agent 4负责实现数字银行系统的前端用户界面，包括登录、账户管理、转账等核心页面。使用React 18 + TypeScript 5.x + Tailwind CSS 3.x技术栈，构建现代化、响应式的Web应用。

## 何时使用

当需要：
- 实现前端用户界面
- 创建React组件
- 集成后端API
- 实现用户交互流程
- 编写E2E测试

## 技术栈

- **框架**: React 18
- **语言**: TypeScript 5.x
- **样式**: Tailwind CSS 3.x
- **路由**: React Router v6
- **状态管理**: Context API / Redux Toolkit
- **HTTP客户端**: Axios
- **测试**: Jest + React Testing Library, Cypress
- **构建工具**: Vite

## 核心功能（MVP）

### 1. 用户认证
- 登录页面
- 注册页面
- 认证状态管理

### 2. 账户管理
- 账户概览页面
- 账户详情页面

### 3. 交易功能
- 转账页面
- 交易历史页面

### 4. 管理后台
- 管理后台基础框架
- 数据统计展示

## 自动化能力

- **页面生成**: 60%自动化
  - 组件库自动生成（基于设计系统）
  - API集成代码自动生成（基于OpenAPI）
  - 路由配置自动生成
  - E2E测试自动编写（Cypress）

## 交付标准

- **页面数量**: 5-8个
- **组件数量**: 20-30个
- **代码行数**: 约6000行
- **响应式设计**: 支持移动端和桌面端

## 项目结构

```
frontend/
├── src/
│   ├── pages/           # 页面组件（Login, Register, AccountOverview等）
│   ├── components/     # 可复用组件
│   │   ├── ui/         # 基础UI组件（Button, Input, Card等）
│   │   └── layout/     # 布局组件
│   ├── store/          # 状态管理（authStore, accountStore等）
│   ├── services/       # API服务（api.ts）
│   ├── routes/         # 路由配置
│   ├── styles/         # 样式文件
│   │   └── tailwind.config.js
│   └── config/         # 配置文件（api.ts）
├── tests/              # 测试代码
│   ├── unit/           # 单元测试
│   └── e2e/            # E2E测试（Cypress）
└── public/             # 静态资源
```

## 设计系统

- **颜色**: 使用Tailwind默认调色板，支持深色模式
- **字体**: 系统字体栈
- **间距**: 使用Tailwind间距系统
- **组件**: 遵循Material Design或Ant Design原则

## 技术标准规范要求

**重要**: 必须严格遵循技术标准规范和命名规范。

### 必须遵循的规范文档

1. **技术标准规范 v1.0**: `docs/architecture/technical-standards-v1.0.md`
2. **命名规范 v1.0**: `docs/architecture/naming-conventions.md`

## 代码规范

- 遵循React Hooks最佳实践
- **严格遵循技术标准规范中的TypeScript/React代码规范**
- **严格遵循命名规范**
- 使用TypeScript严格模式
- 组件使用函数式组件
- 样式使用Tailwind CSS
- 所有组件必须有PropTypes或TypeScript类型定义

### 命名规范要点

- **组件名**: PascalCase (如 `AccountOverview`, `PaymentForm`)
- **文件名**: PascalCase (如 `AccountOverview.tsx`)
- **函数名**: camelCase (如 `fetchAccount()`, `handleSubmit()`)
- **变量名**: camelCase (如 `accountBalance`, `isLoading`)
- **常量**: UPPER_SNAKE_CASE (如 `API_BASE_URL`)
- **类型/接口**: PascalCase (如 `Account`, `Payment`)
- **API调用**: kebab-case (如 `/api/v1/accounts`)

## 协作关系

- **与Agent 1**: 调用核心银行服务API
- **与Agent 2**: 调用支付服务API
- **与Agent 3**: 调用风控服务API（可选）
- **与Agent 5**: 通过API Gateway访问后端服务
- **与Agent 6**: 提供E2E测试目标

## 关键里程碑

- **Day 2**: 项目骨架和设计系统完成
- **Day 3**: 登录、注册、账户概览页面完成
- **Day 4**: 转账、交易历史页面完成
- **Day 5**: UI优化和响应式设计完成
- **Day 7**: 前端功能完整实现

## 示例代码结构

### Component示例
```typescript
import React from 'react';

// 遵循命名规范: PascalCase接口名
interface ButtonProps {  // 遵循命名规范: Props后缀
  children: React.ReactNode;
  onClick?: () => void;  // 遵循命名规范: camelCase属性名
  variant?: 'primary' | 'secondary';
}

// 遵循命名规范: PascalCase组件名
export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick,  // 遵循命名规范: camelCase参数名
  variant = 'primary' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded ${
        variant === 'primary' 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-800'
      }`}
    >
      {children}
    </button>
  );
};
```

### Page示例
```typescript
import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { coreBankApi } from '../services/api';  // 遵循命名规范: camelCase服务名

// 遵循命名规范: PascalCase组件名
export const AccountOverview: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);  // 遵循命名规范: camelCase状态变量
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  React.useEffect(() => {
    // 遵循命名规范: API路径kebab-case
    coreBankApi.getAccountBalance().then(setBalance);
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">账户概览</h1>
      <p className="text-xl mt-4">余额: ¥{balance.toFixed(2)}</p>
    </div>
  );
};
```

## 错误边界处理

### 全局错误边界

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误到日志服务
    console.error('ErrorBoundary caught:', error, errorInfo);
    // 可以发送到错误监控服务
    // errorReportingService.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback p-8 text-center">
          <h2 className="text-xl font-bold text-red-600">出错了</h2>
          <p className="mt-2 text-gray-600">请刷新页面重试</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 加载状态管理

### 统一加载Hook

```typescript
import { useState, useCallback } from 'react';

interface UseLoadingState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

function useLoading<T>(
  asyncFn: (...args: any[]) => Promise<T>
): UseLoadingState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, execute, reset };
}

// 使用示例
const AccountPage: React.FC = () => {
  const { data: account, isLoading, error, execute } = useLoading(
    () => api.getAccount(accountId)
  );

  useEffect(() => {
    execute();
  }, [execute]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!account) return null;

  return <AccountDetails account={account} />;
};
```

### 全局加载状态组件

```typescript
// components/ui/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
      {text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  );
};
```

---

## 表单验证规范

### 表单验证Schema

```typescript
import { z } from 'zod';

// 转账表单验证
export const transferFormSchema = z.object({
  fromAccountId: z.string().min(1, '请选择转出账户'),
  toAccountNumber: z.string()
    .min(10, '账号至少10位')
    .max(20, '账号最多20位')
    .regex(/^\d+$/, '账号只能包含数字'),
  amount: z.number()
    .positive('金额必须大于0')
    .max(500000, '单笔最高50万'),
  remark: z.string().max(100, '备注最多100字').optional(),
});

export type TransferFormData = z.infer<typeof transferFormSchema>;

// 登录表单验证
export const loginFormSchema = z.object({
  username: z.string()
    .min(4, '用户名至少4位')
    .max(20, '用户名最多20位'),
  password: z.string()
    .min(8, '密码至少8位')
    .regex(/[A-Z]/, '密码需包含大写字母')
    .regex(/[a-z]/, '密码需包含小写字母')
    .regex(/[0-9]/, '密码需包含数字'),
});
```

### 表单组件封装

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  register: any;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  register
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border rounded-md ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      {...register(name)}
    />
    {error && (
      <p className="mt-1 text-sm text-red-500">{error}</p>
    )}
  </div>
);

// 使用示例
const TransferForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferFormSchema)
  });

  const onSubmit = async (data: TransferFormData) => {
    await api.createTransfer(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        label="转入账号"
        name="toAccountNumber"
        register={register}
        error={errors.toAccountNumber?.message}
      />
      {/* 其他字段 */}
    </form>
  );
};
```

---

## API调用封装

### 统一API客户端

```typescript
// services/api-client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

interface ApiError {
  code: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Token过期，跳转登录
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: AxiosError<ApiError>): Error {
    const apiError = error.response?.data;
    return new Error(apiError?.message || '网络错误，请稍后重试');
  }

  async get<T>(url: string, params?: object): Promise<T> {
    return this.client.get(url, { params });
  }

  async post<T>(url: string, data?: object): Promise<T> {
    return this.client.post(url, data);
  }

  async put<T>(url: string, data?: object): Promise<T> {
    return this.client.put(url, data);
  }

  async delete<T>(url: string): Promise<T> {
    return this.client.delete(url);
  }
}

export const apiClient = new ApiClient();
```

### 业务API封装

```typescript
// services/account-api.ts
import { apiClient } from './api-client';

export interface Account {
  id: string;
  accountNumber: string;
  balance: number;
  status: string;
}

export const accountApi = {
  getAccounts: () =>
    apiClient.get<Account[]>('/accounts'),

  getAccountById: (id: string) =>
    apiClient.get<Account>(`/accounts/${id}`),

  getBalance: (id: string) =>
    apiClient.get<{ balance: number }>(`/accounts/${id}/balance`),
};

// services/payment-api.ts
export const paymentApi = {
  createTransfer: (data: TransferFormData) =>
    apiClient.post('/transactions/transfer', data),

  getTransactions: (params: { page: number; pageSize: number }) =>
    apiClient.get('/transactions', params),
};
```

---

## 状态管理最佳实践

### Context + Reducer模式

```typescript
// store/auth-context.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return { ...initialState };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
} | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 相关资源

- Agent启动提示词: `agent_prompts.md`
- 详细工作计划: `digital_bank_poc_workplan.md`
- **技术标准规范 v1.0**: `docs/architecture/technical-standards-v1.0.md` ⚠️ **必须遵循**
- **命名规范 v1.0**: `docs/architecture/naming-conventions.md` ⚠️ **必须遵循**

---

**版本**: v1.1.0  
**创建日期**: 2026-01-26  
**维护者**: Digital Bank POC Team
