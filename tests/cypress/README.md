# Cypress E2E 测试框架

遵循 `technical-standards-v1.0`、`naming-conventions`。E2E：Cypress。

## 目录

- `e2e/` - 用例：`{flow}.spec.js`，如 `login-flow.spec.js`、`transfer-flow.spec.js`
- `support/` - `e2e.js` 钩子与自定义命令

## 运行

```bash
# 安装
npm ci

# 无头运行（需先启动前端 http://localhost:3000）
npm run e2e

# 交互
npm run e2e:open
```

## 环境

- `CYPRESS_BASE_URL`：前端地址，默认 `http://localhost:3000`
- `API_BASE`：后端 API 基地址（供 intercept 等）

## 命名

- 文件：`{module-name}.spec.js`（如 `login-flow.spec.js`）
- 用例：`should_{expected}_when_{condition}` 或 `should_{expected}`
