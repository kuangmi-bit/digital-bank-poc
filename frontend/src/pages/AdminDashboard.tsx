import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { PageLayout } from '@/components/layout';
import { useAuth } from '@/store/AuthContext';

const NAV_LINKS = [
  { label: '账户概览', to: '/accounts' },
  { label: '转账', to: '/transfer' },
  { label: '交易历史', to: '/transactions' },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { state, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <PageLayout
      title="管理后台"
      subtitle={state.user?.name ? `当前用户：${state.user.name}` : undefined}
      navLinks={NAV_LINKS}
      showLogout
      onLogout={handleLogout}
    >
      <Card title="导航">
        <nav className="flex flex-wrap gap-2">
          <Button variant="secondary" compact onClick={() => navigate('/admin')}>
            管理首页
          </Button>
          <Button variant="secondary" compact onClick={() => navigate('/accounts')}>
            账户概览
          </Button>
          <Button variant="secondary" compact onClick={() => navigate('/transfer')}>
            转账
          </Button>
          <Button variant="secondary" compact onClick={() => navigate('/transactions')}>
            交易历史
          </Button>
        </nav>
      </Card>

      <Card title="数据统计">
        <p className="text-neutral-muted">（占位：后续扩展统计图表与汇总数据）</p>
      </Card>
    </PageLayout>
  );
}
