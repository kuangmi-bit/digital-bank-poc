import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Alert,
  BalanceCardSkeleton,
  AccountListSkeleton,
} from '@/components/ui';
import { PageLayout } from '@/components/layout';
import { accountApi } from '@/services/account-api';
import type { Account } from '@/services/account-api';
import { useAuth } from '@/store/AuthContext';

const NAV_LINKS = [
  { label: '转账', to: '/transfer' },
  { label: '交易历史', to: '/transactions' },
  { label: '管理后台', to: '/admin' },
];

function formatBalance(value: number, currency = 'CNY'): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(value);
}

export function AccountOverview() {
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const [items, setItems] = useState<Account[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setIsLoading(true);
    const params = state.user?.customerId != null ? { customerId: state.user.customerId } : undefined;
    accountApi
      .listAccounts(params)
      .then((res) => {
        if (cancelled) return;
        setItems(res.items ?? []);
        const sum = (res.items ?? []).reduce((a, b) => a + (b.balance ?? 0), 0);
        setTotalBalance(sum);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '加载失败');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [state.user?.customerId]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <PageLayout
      title="账户概览"
      subtitle={state.user?.name ? `欢迎，${state.user.name}` : undefined}
      navLinks={NAV_LINKS}
      showLogout
      onLogout={handleLogout}
    >
      {error && (
        <Alert variant="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isLoading && (
        <>
          <Card title="总余额" accentBar>
            <BalanceCardSkeleton />
          </Card>
          <Card title="账户列表">
            <AccountListSkeleton />
          </Card>
        </>
      )}

      {!isLoading && !error && (
        <>
          <Card title="总余额" accentBar>
            <p className="text-2xl font-semibold text-primary-600">{formatBalance(totalBalance)}</p>
          </Card>
          <Card title="账户列表">
            {items.length === 0 ? (
              <p className="text-neutral-muted">暂无账户</p>
            ) : (
              <ul className="space-y-3">
                {items.map((a) => (
                  <li
                    key={a.accountId}
                    className="flex justify-between items-center py-2 border-b border-neutral-border last:border-0"
                  >
                    <span className="font-mono text-sm">{a.accountNumber}</span>
                    <span className="font-sans font-medium">{formatBalance(a.balance, a.currency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </PageLayout>
  );
}
