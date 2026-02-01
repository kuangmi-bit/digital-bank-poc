import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { authApi } from '@/services/auth-api';
import { AuthProvider } from '@/store/AuthContext';

vi.mock('@/services/auth-api');

function renderWithRouter(ui: React.ReactElement, { route = '/login' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(authApi.login).mockReset();
  });

  it('渲染登录表单', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByLabelText(/用户名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /注册/ })).toHaveAttribute('href', '/register');
  });

  it('提交时调用 authApi.login', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockResolvedValue({
      token: 't',
      user: { id: '1', username: 'u', name: 'Test' },
    });
    renderWithRouter(<LoginPage />);
    await user.type(screen.getByLabelText(/用户名/), 'alice');
    await user.type(screen.getByLabelText(/密码/), 'Pass1234');
    await user.click(screen.getByRole('button', { name: /登录/ }));
    expect(authApi.login).toHaveBeenCalledWith({ username: 'alice', password: 'Pass1234' });
  });

  it('登录失败时显示错误', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockRejectedValue(new Error('用户名或密码错误'));
    renderWithRouter(<LoginPage />);
    await user.type(screen.getByLabelText(/用户名/), 'a');
    await user.type(screen.getByLabelText(/密码/), 'p');
    await user.click(screen.getByRole('button', { name: /登录/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('用户名或密码错误');
  });
});
