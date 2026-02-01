import { Button, Input, Card } from '@/components/ui';
import { useI18n } from '@/store/I18nContext';

export function HomePage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen p-4 md:p-6 bg-neutral-surface-2">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-sans text-2xl font-bold text-primary-600">
          {t('home.title')}
        </h1>
        <p className="text-neutral-muted">
          {t('home.intro')}
        </p>

        <Card title="基础组件示例" accentBar>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">主要</Button>
              <Button variant="secondary">次要</Button>
              <Button variant="outline">轮廓</Button>
              <Button variant="ghost">幽灵</Button>
              <Button variant="primary" compact>紧凑</Button>
            </div>
            <Input
              label="用户名"
              placeholder="请输入"
              hint="4–20 位字符"
            />
            <Input
              label="密码"
              type="password"
              placeholder="请输入密码"
              error="密码至少 8 位"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
