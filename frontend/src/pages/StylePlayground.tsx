import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import {
  Skeleton,
  SkeletonLines,
  AccountListSkeleton,
  BalanceCardSkeleton,
  TransactionTableSkeleton,
  TransferFormSkeleton,
} from '../components/ui/Skeleton';

export default function StylePlayground() {
  const [inputValue, setInputValue] = useState('');
  const [showAlerts, setShowAlerts] = useState({ error: true, success: true, info: true });

  return (
    <div className="min-h-screen bg-neutral-surface-2 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="font-sans text-3xl font-bold text-neutral-text mb-2">
            Digital Bank <span className="text-primary-500">Style Playground</span>
          </h1>
          <p className="text-neutral-muted font-mono text-sm">
            UI 组件库展示 | Design System Preview
          </p>
        </header>

        {/* Color Palette */}
        <Card title="Color Palette 调色板" accentBar>
          <div className="space-y-6">
            {/* Primary Colors */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-text-soft mb-3">Primary 主色</h4>
              <div className="flex flex-wrap gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="text-center">
                    <div
                      className={`w-16 h-16 rounded-lg shadow-card bg-primary-${shade}`}
                      style={{ backgroundColor: `var(--tw-colors-primary-${shade}, ${getPrimaryColor(shade)})` }}
                    />
                    <span className="text-xs font-mono text-neutral-muted mt-1 block">{shade}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accent Colors */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-text-soft mb-3">Accent 强调色</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { shade: 50, color: '#fff8eb' },
                  { shade: 100, color: '#ffecd1' },
                  { shade: 200, color: '#ffd5a3' },
                  { shade: 300, color: '#ffb86a' },
                  { shade: 400, color: '#d9730d' },
                  { shade: 500, color: '#b35f0b' },
                ].map(({ shade, color }) => (
                  <div key={shade} className="text-center">
                    <div className="w-16 h-16 rounded-lg shadow-card" style={{ backgroundColor: color }} />
                    <span className="text-xs font-mono text-neutral-muted mt-1 block">{shade}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Neutral Colors */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-text-soft mb-3">Neutral 中性色</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'surface', color: '#ffffff', textDark: true },
                  { name: 'surface-2', color: '#f6f8fa', textDark: true },
                  { name: 'border', color: '#d0d7de', textDark: true },
                  { name: 'muted', color: '#656d76', textDark: false },
                  { name: 'text-soft', color: '#424a53', textDark: false },
                  { name: 'text', color: '#1f2328', textDark: false },
                ].map(({ name, color, textDark }) => (
                  <div key={name} className="text-center">
                    <div
                      className="w-20 h-16 rounded-lg shadow-card border border-neutral-border flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <span className={`text-xs font-mono ${textDark ? 'text-neutral-text' : 'text-white'}`}>
                        {name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Typography */}
        <Card title="Typography 字体排版" accentBar>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono text-neutral-muted block mb-1">font-sans (Outfit)</span>
              <p className="font-sans text-4xl font-bold text-neutral-text">数字银行 Digital Bank</p>
            </div>
            <div>
              <span className="text-xs font-mono text-neutral-muted block mb-1">font-mono (IBM Plex Mono)</span>
              <p className="font-mono text-lg text-neutral-text">Account: 6200 1234 5678 9012</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div>
                <span className="text-xs font-mono text-neutral-muted block">text-xs</span>
                <p className="text-xs text-neutral-text">辅助说明文字</p>
              </div>
              <div>
                <span className="text-xs font-mono text-neutral-muted block">text-sm</span>
                <p className="text-sm text-neutral-text">次要内容文字</p>
              </div>
              <div>
                <span className="text-xs font-mono text-neutral-muted block">text-base</span>
                <p className="text-base text-neutral-text">正文内容文字</p>
              </div>
              <div>
                <span className="text-xs font-mono text-neutral-muted block">text-lg</span>
                <p className="text-lg text-neutral-text">强调内容文字</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Buttons */}
        <Card title="Buttons 按钮" accentBar>
          <div className="space-y-6">
            {/* Button Variants */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-text-soft mb-3">Variants 变体</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary 主要</Button>
                <Button variant="secondary">Secondary 次要</Button>
                <Button variant="outline">Outline 描边</Button>
                <Button variant="ghost">Ghost 幽灵</Button>
              </div>
            </div>

            {/* Button States */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-text-soft mb-3">States 状态</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Normal 正常</Button>
                <Button variant="primary" disabled>Disabled 禁用</Button>
                <Button variant="primary" compact>Compact 紧凑</Button>
              </div>
            </div>

            {/* All Variants Compact */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-text-soft mb-3">Compact Mode 紧凑模式</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" compact>确认</Button>
                <Button variant="secondary" compact>取消</Button>
                <Button variant="outline" compact>详情</Button>
                <Button variant="ghost" compact>跳过</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Inputs */}
        <Card title="Inputs 输入框" accentBar>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="用户名" placeholder="请输入用户名" hint="4-20 个字符" />
            <Input
              label="密码"
              type="password"
              placeholder="请输入密码"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              label="金额"
              type="number"
              placeholder="0.00"
              error="金额必须大于 0"
            />
            <Input label="只读字段" value="6200 1234 5678 9012" readOnly />
          </div>
        </Card>

        {/* Cards */}
        <Card title="Cards 卡片" accentBar>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="基础卡片">
              <p className="text-sm text-neutral-text-soft">
                这是一个基础卡片组件，带有标题栏。
              </p>
            </Card>
            <Card title="Accent Bar 强调条" accentBar>
              <p className="text-sm text-neutral-text-soft">
                带有顶部渐变强调条的卡片。
              </p>
            </Card>
            <Card>
              <p className="text-sm text-neutral-text-soft">
                无标题的简洁卡片，适用于内容展示。
              </p>
            </Card>
          </div>
        </Card>

        {/* Alerts */}
        <Card title="Alerts 提示" accentBar>
          <div className="space-y-3">
            {showAlerts.error && (
              <Alert variant="error" onDismiss={() => setShowAlerts((s) => ({ ...s, error: false }))}>
                Error 错误提示：操作失败，请重试。
              </Alert>
            )}
            {showAlerts.success && (
              <Alert variant="success" onDismiss={() => setShowAlerts((s) => ({ ...s, success: false }))}>
                Success 成功提示：转账已完成！
              </Alert>
            )}
            {showAlerts.info && (
              <Alert variant="info" onDismiss={() => setShowAlerts((s) => ({ ...s, info: false }))}>
                Info 信息提示：系统将于 22:00 进行维护。
              </Alert>
            )}
            {(!showAlerts.error || !showAlerts.success || !showAlerts.info) && (
              <Button
                variant="ghost"
                compact
                onClick={() => setShowAlerts({ error: true, success: true, info: true })}
              >
                重置所有提示
              </Button>
            )}
          </div>
        </Card>

        {/* Skeletons */}
        <Card title="Skeletons 骨架屏" accentBar>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-neutral-text-soft mb-3">Basic Skeleton</h4>
              <div className="space-y-2">
                <Skeleton height={20} />
                <Skeleton height={20} width="80%" />
                <Skeleton height={20} width="60%" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-text-soft mb-3">Skeleton Lines</h4>
              <SkeletonLines lines={4} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-text-soft mb-3">Balance Card Skeleton</h4>
              <BalanceCardSkeleton />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-text-soft mb-3">Account List Skeleton</h4>
              <AccountListSkeleton />
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-neutral-text-soft mb-3">Transaction Table Skeleton</h4>
            <TransactionTableSkeleton rows={3} />
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-neutral-text-soft mb-3">Transfer Form Skeleton</h4>
            <div className="max-w-md">
              <TransferFormSkeleton />
            </div>
          </div>
        </Card>

        {/* Shadows & Borders */}
        <Card title="Shadows & Borders 阴影与边框" accentBar>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-neutral-surface rounded border border-neutral-border shadow-card text-center">
              <span className="text-xs font-mono text-neutral-muted">shadow-card</span>
            </div>
            <div className="p-4 bg-neutral-surface rounded border border-neutral-border shadow-card-hover text-center">
              <span className="text-xs font-mono text-neutral-muted">shadow-card-hover</span>
            </div>
            <div className="p-4 bg-neutral-surface rounded-sm border border-neutral-border text-center">
              <span className="text-xs font-mono text-neutral-muted">rounded-sm (6px)</span>
            </div>
            <div className="p-4 bg-neutral-surface rounded border border-neutral-border text-center">
              <span className="text-xs font-mono text-neutral-muted">rounded (10px)</span>
            </div>
          </div>
        </Card>

        {/* Spacing */}
        <Card title="Spacing 间距" accentBar>
          <div className="space-y-4">
            <p className="text-sm text-neutral-text-soft">基于 4px 基准的间距系统</p>
            <div className="flex items-end gap-2 flex-wrap">
              {[1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24].map((n) => (
                <div key={n} className="text-center">
                  <div
                    className="bg-primary-500 rounded-sm"
                    style={{ width: `${n * 4}px`, height: `${n * 4}px` }}
                  />
                  <span className="text-xs font-mono text-neutral-muted mt-1 block">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Form Example */}
        <Card title="Form Example 表单示例" accentBar>
          <form className="max-w-md space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Input label="收款账户" placeholder="请输入收款账号" />
            <Input label="转账金额" type="number" placeholder="0.00" hint="单笔限额 50,000 元" />
            <Input label="备注" placeholder="可选" />
            <div className="flex gap-3 pt-2">
              <Button variant="primary" type="submit">确认转账</Button>
              <Button variant="secondary" type="button">取消</Button>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <footer className="text-center py-8 text-neutral-muted text-sm font-mono">
          <p>Digital Bank POC | Style Playground v1.0</p>
          <p className="mt-1">Built with React + TypeScript + Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
}

// Helper function to get primary colors
function getPrimaryColor(shade: number): string {
  const colors: Record<number, string> = {
    50: '#eef9f2',
    100: '#d6f0df',
    200: '#b0e2c4',
    300: '#7dcea1',
    400: '#4ab47d',
    500: '#1a7f37',
    600: '#146530',
    700: '#115129',
    800: '#0f4223',
    900: '#0d371e',
  };
  return colors[shade] || '#1a7f37';
}
