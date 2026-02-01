import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Alert } from '@/components/ui';
import { accountApi } from '@/services/account-api';
import type { Account } from '@/services/account-api';
import { transactionApi } from '@/services/transaction-api';
import type { TransferItem, TransferResult } from '@/services/transaction-api';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/store/ToastContext';
import { PageLayout } from '@/components/layout';

const NAV_LINKS = [
  { label: '账户概览', to: '/accounts' },
  { label: '普通转账', to: '/transfer' },
  { label: '预约转账', to: '/scheduled-transfer' },
];

interface TransferRow {
  id: string;
  fromAccountId: number | '';
  toAccountId: string;
  amount: string;
  remark: string;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export function BatchTransfer() {
  const navigate = useNavigate();
  const toast = useToast();
  const { state, logout } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [rows, setRows] = useState<TransferRow[]>([
    { id: generateId(), fromAccountId: '', toAccountId: '', amount: '', remark: '' },
  ]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [results, setResults] = useState<TransferResult[] | null>(null);

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
        if (!cancelled) setAccounts(res.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setAccounts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAccounts(false);
      });
    return () => { cancelled = true; };
  }, [state.user?.customerId]);

  const addRow = () => {
    if (rows.length >= 100) {
      toast.error('最多支持 100 笔转账');
      return;
    }
    setRows([...rows, { id: generateId(), fromAccountId: '', toAccountId: '', amount: '', remark: '' }]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: keyof TransferRow, value: string | number) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setResults(null);

    // 验证
    const transfers: TransferItem[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.fromAccountId === '') {
        setSubmitError(`第 ${i + 1} 笔：请选择转出账户`);
        return;
      }
      const toId = Number(row.toAccountId.trim());
      if (!Number.isInteger(toId) || toId < 1) {
        setSubmitError(`第 ${i + 1} 笔：收款账户 ID 须为正整数`);
        return;
      }
      const amt = Number(row.amount);
      if (Number.isNaN(amt) || amt < 0.01) {
        setSubmitError(`第 ${i + 1} 笔：金额须不小于 0.01`);
        return;
      }
      if (row.fromAccountId === toId) {
        setSubmitError(`第 ${i + 1} 笔：转出与收款账户不能相同`);
        return;
      }
      transfers.push({
        fromAccountId: row.fromAccountId as number,
        toAccountId: toId,
        amount: amt,
        remark: row.remark || undefined,
      });
    }

    setIsSubmitting(true);
    try {
      const batchId = `batch-${Date.now()}-${generateId()}`;
      const resp = await transactionApi.batchTransfer({ batchId, transfers });
      setResults(resp.results);
      toast.success(`批量转账完成：成功 ${resp.successCount} 笔，失败 ${resp.failedCount} 笔`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '批量转账失败';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <PageLayout
      title="批量转账"
      navLinks={NAV_LINKS}
      showLogout
      onLogout={handleLogout}
      maxWidth="max-w-4xl"
    >
      {submitError && (
        <Alert variant="error" onDismiss={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      <Card title="批量转账（最多 100 笔）">
        {isLoadingAccounts ? (
          <div className="text-center py-8 text-neutral-text-soft">加载中...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {rows.map((row, idx) => (
                <div key={row.id} className="flex flex-wrap gap-2 items-end p-3 bg-neutral-surface-2 rounded">
                  <div className="text-sm font-medium text-neutral-text-soft w-8">#{idx + 1}</div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs text-neutral-text-soft mb-1">转出账户</label>
                    <select
                      value={row.fromAccountId === '' ? '' : String(row.fromAccountId)}
                      onChange={(e) => updateRow(row.id, 'fromAccountId', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-sm rounded border border-neutral-border bg-neutral-surface"
                    >
                      <option value="">请选择</option>
                      {accounts.map((a) => (
                        <option key={a.accountId} value={a.accountId}>
                          {a.accountNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-xs text-neutral-text-soft mb-1">收款账户ID</label>
                    <input
                      type="text"
                      value={row.toAccountId}
                      onChange={(e) => updateRow(row.id, 'toAccountId', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm rounded border border-neutral-border bg-neutral-surface"
                      placeholder="账户ID"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-neutral-text-soft mb-1">金额</label>
                    <input
                      type="text"
                      value={row.amount}
                      onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm rounded border border-neutral-border bg-neutral-surface"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex-1 min-w-[80px]">
                    <label className="block text-xs text-neutral-text-soft mb-1">备注</label>
                    <input
                      type="text"
                      value={row.remark}
                      onChange={(e) => updateRow(row.id, 'remark', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm rounded border border-neutral-border bg-neutral-surface"
                      placeholder="选填"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 1}
                  >
                    删除
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={addRow} disabled={rows.length >= 100}>
                + 添加一笔
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '提交中...' : `提交 ${rows.length} 笔转账`}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/accounts')}>
                取消
              </Button>
            </div>
          </form>
        )}
      </Card>

      {results && (
        <Card title="执行结果" className="mt-4">
          <div className="space-y-2">
            {results.map((r) => (
              <div
                key={r.index}
                className={`flex items-center gap-2 p-2 rounded text-sm ${
                  r.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                <span className="font-medium">#{r.index + 1}</span>
                <span>{r.status === 'completed' ? '✓ 成功' : '✗ 失败'}</span>
                {r.transactionId && <span className="text-xs">交易ID: {r.transactionId}</span>}
                {r.message && <span className="text-xs">({r.message})</span>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageLayout>
  );
}
