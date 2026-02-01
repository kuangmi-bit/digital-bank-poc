import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Alert } from '@/components/ui';
import { accountApi } from '@/services/account-api';
import type { Account } from '@/services/account-api';
import { transactionApi } from '@/services/transaction-api';
import type { ScheduledTransfer as ScheduledTransferType } from '@/services/transaction-api';
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
    pending: { label: '待执行', color: 'bg-yellow-100 text-yellow-700' },
    processing: { label: '执行中', color: 'bg-blue-100 text-blue-700' },
    completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
    failed: { label: '已失败', color: 'bg-red-100 text-red-700' },
    cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-700' },
  };
  return map[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
}

export function ScheduledTransfer() {
  const navigate = useNavigate();
  const toast = useToast();
  const { state, logout } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [scheduledList, setScheduledList] = useState<ScheduledTransferType[]>([]);
  const [fromAccountId, setFromAccountId] = useState<number | ''>('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [remark, setRemark] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

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

  const loadScheduledList = async (accountId: number) => {
    setIsLoadingList(true);
    try {
      const resp = await transactionApi.listScheduledTransfers({ accountId });
      setScheduledList(resp.items ?? []);
    } catch {
      setScheduledList([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (fromAccountId !== '') {
      loadScheduledList(fromAccountId);
    } else {
      setScheduledList([]);
    }
  }, [fromAccountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const err: Record<string, string> = {};

    if (fromAccountId === '') err.fromAccountId = '请选择转出账户';
    const toId = Number(toAccountId.trim());
    if (!Number.isInteger(toId) || toId < 1) err.toAccountId = '收款账户 ID 须为正整数';
    const amt = Number(amount);
    if (Number.isNaN(amt) || amt < 0.01) err.amount = '金额须不小于 0.01';
    if (!scheduledTime) err.scheduledTime = '请选择预约时间';
    else {
      const t = new Date(scheduledTime);
      if (t.getTime() < Date.now() + 60000) err.scheduledTime = '预约时间须至少在 1 分钟后';
    }
    if (fromAccountId !== '' && toId === fromAccountId) err.toAccountId = '转出与收款账户不能相同';

    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setIsSubmitting(true);
    try {
      await transactionApi.createScheduledTransfer({
        fromAccountId: fromAccountId as number,
        toAccountId: toId,
        amount: amt,
        scheduledTime: new Date(scheduledTime).toISOString(),
        remark: remark || undefined,
      });
      toast.success('预约转账创建成功');
      setToAccountId('');
      setAmount('');
      setScheduledTime('');
      setRemark('');
      setShowForm(false);
      if (fromAccountId !== '') loadScheduledList(fromAccountId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '创建预约失败';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (scheduledId: string) => {
    try {
      await transactionApi.cancelScheduledTransfer(scheduledId);
      toast.success('预约已取消');
      if (fromAccountId !== '') loadScheduledList(fromAccountId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '取消失败';
      toast.error(msg);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <PageLayout
      title="预约转账"
      navLinks={NAV_LINKS}
      showLogout
      onLogout={handleLogout}
      maxWidth="max-w-3xl"
    >
      {submitError && (
        <Alert variant="error" onDismiss={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      <Card title="选择账户">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-text-soft mb-1">转出账户</label>
            <select
              value={fromAccountId === '' ? '' : String(fromAccountId)}
              onChange={(e) => setFromAccountId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 rounded border border-neutral-border bg-neutral-surface"
              disabled={isLoadingAccounts}
            >
              <option value="">请选择账户</option>
              {accounts.map((a) => (
                <option key={a.accountId} value={a.accountId}>
                  {a.accountNumber}（余额: {a.balance} {a.currency}）
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            onClick={() => setShowForm(!showForm)}
            disabled={fromAccountId === ''}
          >
            {showForm ? '收起表单' : '+ 新建预约'}
          </Button>
        </div>
      </Card>

      {showForm && fromAccountId !== '' && (
        <Card title="新建预约转账" className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="收款账户 ID"
              id="toAccountId"
              type="text"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              error={errors.toAccountId}
              placeholder="请输入对方账户 ID"
            />
            <Input
              label="金额"
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={errors.amount}
              placeholder="0.00"
            />
            <div>
              <label className="block text-sm font-medium text-neutral-text-soft mb-1">预约时间</label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className={`w-full px-3 py-2 rounded border bg-neutral-surface ${
                  errors.scheduledTime ? 'border-red-500' : 'border-neutral-border'
                }`}
              />
              {errors.scheduledTime && (
                <p className="mt-1 text-sm text-red-500">{errors.scheduledTime}</p>
              )}
            </div>
            <Input
              label="备注（选填）"
              id="remark"
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="转账说明"
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '提交中...' : '创建预约'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                取消
              </Button>
            </div>
          </form>
        </Card>
      )}

      {fromAccountId !== '' && (
        <Card title="预约列表" className="mt-4">
          {isLoadingList ? (
            <div className="text-center py-4 text-neutral-text-soft">加载中...</div>
          ) : scheduledList.length === 0 ? (
            <div className="text-center py-4 text-neutral-text-soft">暂无预约转账</div>
          ) : (
            <div className="space-y-3">
              {scheduledList.map((s) => {
                const statusInfo = getStatusLabel(s.status);
                return (
                  <div key={s.scheduledId} className="p-3 bg-neutral-surface-2 rounded flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-sm">
                        <span className="font-medium">收款账户:</span> {s.toAccountId}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">金额:</span> ¥{s.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-neutral-text-soft">
                        预约时间: {formatDateTime(s.scheduledTime)}
                      </div>
                      {s.remark && (
                        <div className="text-xs text-neutral-text-soft">备注: {s.remark}</div>
                      )}
                      {s.errorMessage && (
                        <div className="text-xs text-red-500">错误: {s.errorMessage}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      {s.status === 'pending' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(s.scheduledId)}
                        >
                          取消
                        </Button>
                      )}
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
