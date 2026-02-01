import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Alert, TransferFormSkeleton } from '@/components/ui';
import { accountApi } from '@/services/account-api';
import type { Account } from '@/services/account-api';
import { transactionApi } from '@/services/transaction-api';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/store/ToastContext';
import { PageLayout } from '@/components/layout';

const NAV_LINKS = [
  { label: '账户概览', to: '/accounts' },
  { label: '交易历史', to: '/transactions' },
];

function validateTransferForm(values: {
  fromAccountId: number | '';
  toAccountId: string;
  amount: string;
}): Record<string, string> {
  const err: Record<string, string> = {};
  if (values.fromAccountId === '') {
    err.fromAccountId = '请选择转出账户';
  }
  const toId = values.toAccountId.trim();
  if (!toId) {
    err.toAccountId = '请输入收款账户 ID';
  } else {
    const n = Number(toId);
    if (!Number.isInteger(n) || n < 1) err.toAccountId = '收款账户 ID 须为正整数';
  }
  const amt = Number(values.amount);
  if (Number.isNaN(amt) || amt < 0.01) {
    err.amount = '金额须不小于 0.01';
  }
  if (values.fromAccountId !== '' && toId) {
    const toN = Number(toId);
    if (Number.isInteger(toN) && values.fromAccountId === toN) {
      err.toAccountId = '转出与收款账户不能相同';
    }
  }
  return err;
}

export function Transfer() {
  const navigate = useNavigate();
  const toast = useToast();
  const { state, logout } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromAccountId, setFromAccountId] = useState<number | ''>('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const vals = { fromAccountId, toAccountId, amount };
    const err = validateTransferForm(vals);
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    const from = fromAccountId as number;
    const to = Number(toAccountId.trim());
    const amt = Number(amount);
    setIsSubmitting(true);
    transactionApi
      .transfer({ fromAccountId: from, toAccountId: to, amount: amt, remark: remark || undefined })
      .then(() => {
        setFromAccountId('');
        setToAccountId('');
        setAmount('');
        setRemark('');
        setErrors({});
        setSubmitError(null);
        toast.success('转账申请已提交');
        navigate('/accounts', { replace: true });
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : '转账失败，请稍后重试';
        setSubmitError(msg);
        toast.error(msg);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <PageLayout
      title="转账"
      navLinks={NAV_LINKS}
      showLogout
      onLogout={handleLogout}
      maxWidth="max-w-lg"
    >
      {submitError && (
        <Alert variant="error" onDismiss={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      <Card title="行内转账">
        {isLoadingAccounts && <TransferFormSkeleton />}
        {!isLoadingAccounts && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fromAccountId" className="block text-sm font-medium text-neutral-text-soft mb-1">
                转出账户
              </label>
              <select
                id="fromAccountId"
                value={fromAccountId === '' ? '' : String(fromAccountId)}
                onChange={(e) => setFromAccountId(e.target.value === '' ? '' : Number(e.target.value))}
                className={`w-full px-3 py-2 rounded border bg-neutral-surface font-sans text-neutral-text ${
                  errors.fromAccountId ? 'border-red-500' : 'border-neutral-border'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                aria-invalid={Boolean(errors.fromAccountId)}
              >
                <option value="">请选择</option>
                {accounts.map((a) => (
                  <option key={a.accountId} value={a.accountId}>
                    {a.accountNumber}（{a.currency}）
                  </option>
                ))}
              </select>
              {errors.fromAccountId && (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {errors.fromAccountId}
                </p>
              )}
            </div>

            <Input
              label="收款账户 ID"
              id="toAccountId"
              type="text"
              inputMode="numeric"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              error={errors.toAccountId}
              placeholder="请输入对方账户 ID（正整数）"
            />

            <Input
              label="金额"
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={errors.amount}
              placeholder="0.00"
              hint="最小 0.01"
            />

            <Input
              label="备注（选填）"
              id="remark"
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="转账说明"
            />

            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '提交中…' : '确认转账'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/accounts')}>
                取消
              </Button>
            </div>
          </form>
        )}
      </Card>
    </PageLayout>
  );
}
