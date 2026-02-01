# 测试管理（TestRail 等价物）

TestRail 为 SaaS，需单独部署/账号。本目录提供**可导入 TestRail 的用例结构与本地等价物**，作为单一数据源。

## 目录

- `test-case-schema.json` - 用例 JSON 结构说明，供导入/校验
- `test-cases/*.yaml` - 用例池，可按 suite 拆分，便于 TestRail CSV 导入或 Allure 等
- `test-cases/README.md` - 用例书写约定

## TestRail 集成

1. **CSV 导入**：将 `test-cases/*.yaml` 转成 CSV（id, title, suite, steps, expected, priority），在 TestRail 中导入。
2. **API**：使用 TestRail REST API，将本结构映射为 `add_case` 所需字段；需 `TESTRAIL_URL`、`TESTRAIL_USER`、`TESTRAIL_API_KEY`。
3. **等价物**：不启用 TestRail 时，直接以 `test-cases/` 为真相源，供报告、Allure 或内部仪表盘引用。

## 环境变量（可选）

- `TESTRAIL_URL` - TestRail 实例地址
- `TESTRAIL_USER` - 登录邮箱
- `TESTRAIL_API_KEY` - API Key

## 命名

- 用例文件：`{suite}-{scope}.yaml`，如 `core-bank-api.yaml`、`e2e-smoke.yaml`
- 用例 id：`TC-{suite}-{nnn}`，如 `TC-CB-001`
