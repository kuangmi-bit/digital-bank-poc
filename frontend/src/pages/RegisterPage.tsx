import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card, Alert } from '@/components/ui';
import { authApi } from '@/services/auth-api';
import { useToast } from '@/store/ToastContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.register({
        name,
        idCard: idCard || undefined,
        phone: phone || undefined,
        email: email || undefined,
      });
      toast.success('注册成功，请登录');
      navigate('/login?registered=1', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-surface-2">
      <Card className="w-full max-w-md" title="客户注册" accentBar>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="姓名"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入姓名"
            required
          />
          <Input
            label="身份证号"
            type="text"
            value={idCard}
            onChange={(e) => setIdCard(e.target.value)}
            placeholder="选填"
          />
          <Input
            label="手机号"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="选填"
          />
          <Input
            label="邮箱"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="选填"
          />
          {error && (
          <Alert variant="error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}
          <div className="flex flex-col gap-2 pt-1">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中…' : '注册'}
            </Button>
            <p className="text-center text-sm text-neutral-muted">
              已有账号？ <Link to="/login" className="text-primary-500 hover:underline">登录</Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
