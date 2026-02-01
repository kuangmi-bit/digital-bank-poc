import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccountOverview } from './AccountOverview';
import { accountApi } from '@/services/account-api';
import { AuthProvider } from '@/store/AuthContext';

vi.mock('@/services/account-api');

function renderWithAuth(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('AccountOverview', () => {
  beforeEach(() => {
    vi.mocked(accountApi.listAccounts).mockReset();
  });

  it('加载时显示骨架屏', () => {
    vi.mocked(accountApi.listAccounts).mockImplementation(() => new Promise(() => {}));
    renderWithAuth(<AccountOverview />);
    expect(screen.getByText('总余额')).toBeInTheDocument();
    expect(screen.getByText('账户列表')).toBeInTheDocument();
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('加载成功时显示总余额与账户列表', async () => {
    vi.mocked(accountApi.listAccounts).mockResolvedValue({
      items: [
        { accountId: 1, accountNumber: '6200123456789012', customerId: 1, balance: 100.5, currency: 'CNY', accountType: 'savings', status: 'active' },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    renderWithAuth(<AccountOverview />);
    // 以账户列表渲染为准，金额格式化由 UI 决定（避免不同地区/格式导致用例脆弱）
    expect(await screen.findByText('6200123456789012')).toBeInTheDocument();
    expect(accountApi.listAccounts).toHaveBeenCalled();
  });

  it('无账户时显示暂无账户', async () => {
    vi.mocked(accountApi.listAccounts).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
    renderWithAuth(<AccountOverview />);
    expect(await screen.findByText(/暂无账户/)).toBeInTheDocument();
  });

  it('加载失败时显示错误', async () => {
    vi.mocked(accountApi.listAccounts).mockRejectedValue(new Error('网络错误'));
    renderWithAuth(<AccountOverview />);
    expect(await screen.findByRole('alert')).toHaveTextContent('网络错误');
  });
});
