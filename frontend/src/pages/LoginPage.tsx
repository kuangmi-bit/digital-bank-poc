import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, Card, Alert } from '@/components/ui';
import { authApi } from '@/services/auth-api';
import { useAuth } from '@/store/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registered = searchParams.get('registered') === '1';
  const { login, setLoginFailure } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { token, user } = await authApi.login({ username, password });
      login(user, token);
      navigate('/accounts', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '登录失败，请重试';
      setError(msg);
      setLoginFailure();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-surface-2">
      <Card className="w-full max-w-md" title="登录" accentBar>
        {registered && (
          <Alert variant="success" className="mb-4">
            注册成功，请登录。
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="用户名"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            autoComplete="username"
            required
            hint="4–20 位字符"
          />
          <Input
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            autoComplete="current-password"
            required
          />
          {error && (
            <Alert variant="error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}
          <div className="flex flex-col gap-2 pt-1">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '登录中…' : '登录'}
            </Button>
            <p className="text-center text-sm text-neutral-muted">
              还没有账号？ <Link to="/register" className="text-primary-500 hover:underline">注册</Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
