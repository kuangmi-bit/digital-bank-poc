# 测试数据

遵循 `naming-conventions`：测试数据描述性命名（如 `validAccountData`, `invalidAccountNumber`）。

## generators/

- `account-generator.js` - 账户、客户、交易（Faker.js）
- `payment-generator.js` - 支付、清算
- `risk-generator.py` - 风控请求、黑名单（Python Faker，可选）
- `run-generate.js` - 入口脚本

## 运行

```bash
cd generators
npm ci
npm run generate        # all, 20 条
npm run generate:account
npm run generate:payment
```

输出目录：`tests/data/output/*.json`，供 Postman/测试脚本引用或种子数据导入。

## Python 风控数据（可选）

```bash
pip install faker
python risk-generator.py --type risk_check -n 10 -o ../output/risk-checks.json
```
