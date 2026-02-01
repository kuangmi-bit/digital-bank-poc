import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';
import { authApi } from '@/services/auth-api';
import { AuthProvider } from '@/store/AuthContext';
import { ToastProvider } from '@/store/ToastContext';

vi.mock('@/services/auth-api');

function renderWithRouter(ui: React.ReactElement, { route = '/register' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.mocked(authApi.register).mockReset();
  });

  it('渲染注册表单', () => {
    renderWithRouter(<RegisterPage />);
    expect(screen.getByLabelText(/姓名/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /注册/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /登录/ })).toHaveAttribute('href', '/login');
  });

  it('提交时调用 authApi.register', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.register).mockResolvedValue({
      customerId: 1,
      name: '张三',
      status: 'active',
    });
    renderWithRouter(<RegisterPage />);
    await user.type(screen.getByLabelText(/姓名/), '张三');
    await user.click(screen.getByRole('button', { name: /注册/ }));
    expect(authApi.register).toHaveBeenCalledWith(
      expect.objectContaining({ name: '张三' })
    );
  });

  it('注册失败时显示错误', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.register).mockRejectedValue(new Error('身份证号已存在'));
    renderWithRouter(<RegisterPage />);
    await user.type(screen.getByLabelText(/姓名/), '李四');
    await user.click(screen.getByRole('button', { name: /注册/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('身份证号已存在');
  });
});
