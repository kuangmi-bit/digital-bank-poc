# 数字银行前端 - 设计系统

## 颜色 (Colors)

| 用途       | Token            | 值/示例        | 说明           |
|------------|------------------|----------------|----------------|
| 主色       | primary-500      | #1a7f37        | 品牌绿，按钮、链接 |
| 主色浅     | primary-50~400   | -              | 背景、悬停     |
| 强调色     | accent-400       | #d9730d        | 高亮、标签     |
| 表面       | neutral-surface  | #ffffff        | 卡片、模态     |
| 表面 2     | neutral-surface-2| #f6f8fa        | 页面背景       |
| 边框       | neutral-border   | #d0d7de        | 分割、输入框   |
| 正文       | neutral-text     | #1f2328        | 主要文字       |
| 次要文字   | neutral-text-soft| #424a53        | 副标题         |
| 弱化       | neutral-muted    | #656d76        | 提示、占位     |

## 字体 (Typography)

- **无衬线**: `font-sans` → Outfit, system-ui
- **等宽**: `font-mono` → IBM Plex Mono
- 字重: 400, 500, 600, 700

## 间距 (Spacing)

基于 4px 基准，使用 Tailwind 间距：`1`=4px, `2`=8px, `3`=12px, `4`=16px, `5`=20px, `6`=24px 等。
另有: `4.5`=18px, `18`=72px。

## 圆角与阴影

- 圆角: `rounded` 10px, `rounded-sm` 6px
- 阴影: `shadow-card`, `shadow-card-hover`

## 使用

在组件中通过 Tailwind 类使用，例如：

- `bg-primary-500 text-white`
- `font-sans font-medium`
- `p-4 gap-3`
- `rounded shadow-card`
