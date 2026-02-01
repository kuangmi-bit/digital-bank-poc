import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Alert } from '@/components/ui';
import { accountApi } from '@/services/account-api';
import type { Account } from '@/services/account-api';
import { billPaymentApi, BILL_TYPES } from '@/services/bill-payment-api';
import type { BillPayment as BillPaymentType, BillInfo } from '@/services/bill-payment-api';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/store/ToastContext';
import { PageLayout } from '@/components/layout';

const NAV_LINKS = [
  { label: '账户概览', to: '/accounts' },
  { label: '普通转账', to: '/transfer' },
  { label: '批量转账', to: '/batch-transfer' },
];

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN');
}

function getStatusLabel(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: '处理中', color: 'bg-yellow-100 text-yellow-700' },
    processing: { label: '处理中', color: 'bg-blue-100 text-blue-700' },
    completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
    failed: { label: '已失败', color: 'bg-red-100 text-red-700' },
  };
  return map[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
}

export function BillPayment() {
  const navigate = useNavigate();
  const toast = useToast();
  const { state, logout } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [paymentList, setPaymentList] = useState<BillPaymentType[]>([]);
  const [payerAccountId, setPayerAccountId] = useState<number | ''>('');
  const [billType, setBillType] = useState<string>('utility');
  const [billAccount, setBillAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [billInfo, setBillInfo] = useState<BillInfo | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isQueryingBill, setIsQueryingBill] = useState(false);
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

  const loadPaymentList = async (accountId: number) => {
    setIsLoadingList(true);
    try {
      const resp = await billPaymentApi.listBillPayments({ payerAccountId: accountId });
      setPaymentList(resp.items ?? []);
    } catch {
      setPaymentList([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (payerAccountId !== '') {
      loadPaymentList(payerAccountId);
    } else {
      setPaymentList([]);
    }
  }, [payerAccountId]);

  const handleQueryBill = async () => {
    if (!billAccount.trim()) {
      setErrors({ billAccount: '请输入账单账户号' });
      return;
    }
    setIsQueryingBill(true);
    setBillInfo(null);
    setErrors({});
    try {
      const info = await billPaymentApi.queryBillInfo(billType, billAccount.trim());
      setBillInfo(info);
      if (info.balance > 0) {
        setAmount(info.balance.toFixed(2));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '查询失败';
      setErrors({ billAccount: msg });
    } finally {
      setIsQueryingBill(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const err: Record<string, string> = {};

    if (payerAccountId === '') err.payerAccountId = '请选择付款账户';
    if (!billAccount.trim()) err.billAccount = '请输入账单账户号';
    const amt = Number(amount);
    if (Number.isNaN(amt) || amt < 0.01) err.amount = '金额须不小于 0.01';

    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setIsSubmitting(true);
    try {
      await billPaymentApi.createBillPayment({
        billType: billType as 'utility' | 'telecom' | 'credit_card',
        billAccount: billAccount.trim(),
        amount: amt,
        payerAccountId: payerAccountId as number,
      });
      toast.success('账单支付成功');
      setBillAccount('');
      setAmount('');
      setBillInfo(null);
      if (payerAccountId !== '') loadPaymentList(payerAccountId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '支付失败';
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
      title="账单支付"
      navLinks={NAV_LINKS}
      showLogout
      onLogout={handleLogout}
      maxWidth="max-w-2xl"
    >
      {submitError && (
        <Alert variant="error" onDismiss={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      <Card title="支付账单">
        {isLoadingAccounts ? (
          <div className="text-center py-4 text-neutral-text-soft">加载中...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text-soft mb-1">付款账户</label>
              <select
                value={payerAccountId === '' ? '' : String(payerAccountId)}
                onChange={(e) => setPayerAccountId(e.target.value === '' ? '' : Number(e.target.value))}
                className={`w-full px-3 py-2 rounded border bg-neutral-surface ${
                  errors.payerAccountId ? 'border-red-500' : 'border-neutral-border'
                }`}
              >
                <option value="">请选择账户</option>
                {accounts.map((a) => (
                  <option key={a.accountId} value={a.accountId}>
                    {a.accountNumber}（余额: {a.balance} {a.currency}）
                  </option>
                ))}
              </select>
              {errors.payerAccountId && (
                <p className="mt-1 text-sm text-red-500">{errors.payerAccountId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-text-soft mb-1">账单类型</label>
              <select
                value={billType}
                onChange={(e) => {
                  setBillType(e.target.value);
                  setBillInfo(null);
                }}
                className="w-full px-3 py-2 rounded border border-neutral-border bg-neutral-surface"
              >
                {BILL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-text-soft mb-1">账单账户号</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={billAccount}
                  onChange={(e) => {
                    setBillAccount(e.target.value);
                    setBillInfo(null);
                  }}
                  className={`flex-1 px-3 py-2 rounded border bg-neutral-surface ${
                    errors.billAccount ? 'border-red-500' : 'border-neutral-border'
                  }`}
                  placeholder={
                    billType === 'utility' ? '户号/电表号' :
                    billType === 'telecom' ? '手机号码' :
                    '信用卡卡号'
                  }
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleQueryBill}
                  disabled={isQueryingBill}
                >
                  {isQueryingBill ? '查询中...' : '查询'}
                </Button>
              </div>
              {errors.billAccount && (
                <p className="mt-1 text-sm text-red-500">{errors.billAccount}</p>
              )}
            </div>

            {billInfo && (
              <div className="p-3 bg-neutral-surface-2 rounded text-sm">
                <div><span className="font-medium">供应商:</span> {billInfo.vendor}</div>
                <div><span className="font-medium">待缴金额:</span> ¥{billInfo.balance.toFixed(2)}</div>
                <div><span className="font-medium">状态:</span> {billInfo.status === 'paid' ? '已缴清' : '待缴费'}</div>
              </div>
            )}

            <Input
              label="支付金额"
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={errors.amount}
              placeholder="0.00"
            />

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting || payerAccountId === ''}>
                {isSubmitting ? '支付中...' : '确认支付'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/accounts')}>
                取消
              </Button>
            </div>
          </form>
        )}
      </Card>

      {payerAccountId !== '' && (
        <Card title="支付记录" className="mt-4">
          {isLoadingList ? (
            <div className="text-center py-4 text-neutral-text-soft">加载中...</div>
          ) : paymentList.length === 0 ? (
            <div className="text-center py-4 text-neutral-text-soft">暂无支付记录</div>
          ) : (
            <div className="space-y-3">
              {paymentList.map((p) => {
                const statusInfo = getStatusLabel(p.status);
                const typeLabel = BILL_TYPES.find((t) => t.value === p.billType)?.label || p.billType;
                return (
                  <div key={p.paymentId} className="p-3 bg-neutral-surface-2 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium">{typeLabel} - {p.billVendor || p.billAccount}</div>
                        <div className="text-sm">金额: ¥{p.amount.toFixed(2)}</div>
                        <div className="text-xs text-neutral-text-soft">{formatDateTime(p.createdAt)}</div>
                        {p.billReferenceNo && (
                          <div className="text-xs text-neutral-text-soft">参考号: {p.billReferenceNo}</div>
                        )}
                        {p.errorMessage && (
                          <div className="text-xs text-red-500">错误: {p.errorMessage}</div>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </PageLayout>
  );
}
