# 测试用例与脚本模板

遵循 `technical-standards-v1.0`、`naming-conventions`。

## 文件

| 文件 | 用途 |
|------|------|
| `test-case-template.yaml` | 测试用例 YAML 模板，复制到 `test-management/test-cases/` |
| `postman-request-template.md` | Postman 请求命名与测试脚本片段 |
| `cypress-spec-template.js` | Cypress E2E spec 结构与命名示例 |

## 命名要点

- 测试方法：`test_{scenario}_{expected_result}()` 或 `should_{expected}_when_{condition}()`
- 测试数据：描述性命名，如 `validAccountData`、`invalidAccountNumber`
- 测试报告：`{service}-test-report-{date}.json`（kebab-case）
