# 组件库结构

## ui/ - 基础 UI 组件

- `Button.tsx` - 按钮（primary, secondary, outline, ghost）
- `Input.tsx` - 输入框（text, password, 错误态）
- `Card.tsx` - 卡片容器

## layout/ - 布局组件（后续）

- `Header`, `Sidebar`, `PageLayout` 等

## 使用

```tsx
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
```

## 命名与规范

- 组件名: PascalCase（如 `AccountOverview`）
- 文件名: 与组件名一致（如 `Button.tsx`）
- 遵循 `docs/architecture/naming-conventions.md` 与 `technical-standards-v1.0`
