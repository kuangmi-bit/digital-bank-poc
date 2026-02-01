import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Alert, LoadingSpinner, TransactionTableSkeleton } from '@/components/ui';
import { accountApi } from '@/services/account-api';
import type { Account } from '@/services/account-api';
import { transactionApi } from '@/services/transaction-api';
import type { Transaction } from '@/services/transaction-api';
import { useAuth } from '@/store/AuthContext';
import { PageLayout } from '@/components/layout';

const NAV_LINKS = [
  { label: '账户概览', to: '/accounts' },
  { label: '转账', to: '/transfer' },
];
const PAGE_SIZE = 20;

function formatTime(iso?: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function formatAmount(amount: number, type?: string): string {
  const s = new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  const out = type === 'transfer_out' || type === 'withdrawal' || type === 'payment';
  return out ? `-${s}` : `+${s}`;
}

export function TransactionHistory() {
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState<number | ''>('');
  const [items, setItems] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cid = state.user?.customerId;
    if (cid == null) {
      setIsLoadingAccounts(false);
      return;
    }
    setIsLoadingAccounts(true);
    accountApi
      .listAccounts({ customerId: cid })
      .then((res) => {
        if (!cancelled) {
          setAccounts(res.items ?? []);
          const first = res.items?.[0]?.accountId;
          if (first != null && accountId === '') setAccountId(first);
        }
      })
      .catch(() => {
        if (!cancelled) setAccounts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAccounts(false);
      });
    return () => { cancelled = true; };
  }, [state.user?.customerId]);

  useEffect(() => {
    if (accountId === '') {
      setItems([]);
      setTotal(0);
      return;
    }
    let cancelled = false;
    setError(null);
    setIsLoading(true);
    transactionApi
      .getTransactionHistory({ accountId: accountId as number, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (!cancelled) {
          setItems(res.items ?? []);
          setTotal(res.total ?? 0);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '加载失败');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [accountId, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <PageLayout
      title="交易历史"
      navLinks={NAV_LINKS}
      showLogout
      onLogout={handleLogout}
      maxWidth="max-w-4xl"
    >
      {error && (
        <Alert variant="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card title="按账户查询">
        {isLoadingAccounts && <LoadingSpinner text="加载账户…" />}
        {!isLoadingAccounts && (
          <>
            <div className="mb-4">
              <label htmlFor="accountId" className="block text-sm font-medium text-neutral-text-soft mb-1">
                账户
              </label>
              <select
                id="accountId"
                value={accountId === '' ? '' : String(accountId)}
                onChange={(e) => {
                  setAccountId(e.target.value === '' ? '' : Number(e.target.value));
                  setPage(1);
                }}
                className="w-full max-w-xs px-3 py-2 rounded border border-neutral-border bg-neutral-surface font-sans text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">请选择账户</option>
                {accounts.map((a) => (
                  <option key={a.accountId} value={a.accountId}>
                    {a.accountNumber}
                  </option>
                ))}
              </select>
            </div>

            {accountId === '' && <p className="text-neutral-muted">请先选择账户</p>}

            {accountId !== '' && (
              <>
                {isLoading && <TransactionTableSkeleton rows={5} />}
                {!isLoading && (
                  <>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <table className="w-full min-w-[32rem] text-sm">
                        <thead>
                          <tr className="border-b border-neutral-border text-left text-neutral-muted">
                            <th className="py-2 pr-4">时间</th>
                            <th className="py-2 pr-4">类型</th>
                            <th className="py-2 pr-4">对手方/账户</th>
                            <th className="py-2 pr-4 text-right">金额</th>
                            <th className="py-2 pr-4">状态</th>
                            <th className="py-2">备注</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-6 text-center text-neutral-muted">
                                暂无记录
                              </td>
                            </tr>
                          ) : (
                            items.map((t) => (
                              <tr
                                key={t.transactionId}
                                className="border-b border-neutral-border last:border-0"
                              >
                                <td className="py-2 pr-4 whitespace-nowrap">{formatTime(t.createdAt)}</td>
                                <td className="py-2 pr-4">{t.transactionType || '—'}</td>
                                <td className="py-2 pr-4">{t.counterAccountId ?? '—'}</td>
                                <td className="py-2 pr-4 text-right font-mono">
                                  {formatAmount(t.amount, t.transactionType)}
                                </td>
                                <td className="py-2 pr-4">{t.status ?? '—'}</td>
                                <td className="py-2 truncate max-w-[8rem]" title={t.remark ?? ''}>
                                  {t.remark ?? '—'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-2 border-t border-neutral-border">
                      <span className="text-sm text-neutral-muted">共 {total} 条</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          compact
                          disabled={page <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          上一页
                        </Button>
                        <span className="py-1.5 text-sm text-neutral-muted min-w-[4rem] text-center">
                          {page} / {totalPages}
                        </span>
                        <Button
                          variant="secondary"
                          compact
                          disabled={page >= totalPages}
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                          下一页
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </Card>
    </PageLayout>
  );
}
