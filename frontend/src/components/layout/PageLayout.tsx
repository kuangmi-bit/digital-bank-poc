import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';

export interface NavLink {
  label: string;
  to: string;
}

export interface PageLayoutProps {
  /** 页面标题 */
  title: string;
  /** 子元素 */
  children: ReactNode;
  /** 主导航链接（如 账户概览、转账、交易历史） */
  navLinks?: NavLink[];
  /** 是否显示退出并跳转登录 */
  showLogout?: boolean;
  /** 退出回调 */
  onLogout?: () => void;
  /** 副标题或欢迎语 */
  subtitle?: ReactNode;
  /** 最大宽度容器 class，默认 max-w-2xl，表格页可传 max-w-4xl */
  maxWidth?: 'max-w-2xl' | 'max-w-4xl' | 'max-w-lg';
}

export function PageLayout({
  title,
  children,
  navLinks = [],
  showLogout = false,
  onLogout,
  subtitle,
  maxWidth = 'max-w-2xl',
}: PageLayoutProps) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen p-4 sm:p-5 md:p-6 bg-neutral-surface-2">
      <div className={`${maxWidth} mx-auto space-y-4`}>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-sans text-xl sm:text-2xl font-bold text-neutral-text">{title}</h1>
            {subtitle != null && <div className="mt-0.5 text-sm text-neutral-muted">{subtitle}</div>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {navLinks.map(({ label, to }) => (
              <Button key={to} variant="secondary" compact onClick={() => navigate(to)}>
                {label}
              </Button>
            ))}
            {showLogout && onLogout && (
              <Button variant="ghost" compact onClick={onLogout}>
                退出
              </Button>
            )}
          </div>
        </header>

        <main className="space-y-4">{children}</main>
      </div>
    </div>
  );
}
