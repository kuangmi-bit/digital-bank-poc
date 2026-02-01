# Postman 请求模板

## 请求命名

- `{HTTP方法} {资源} - {场景}`，如 `POST 开户 - 成功`、`GET 账户列表 - 分页`

## 测试脚本模板

```javascript
pm.test("Status code is 200", function () { pm.response.to.have.status(200); });
pm.test("Response time is less than 2000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("should_{expected}_when_{condition}", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("data");
});
```

## 环境变量

- 基地址：`{{core_bank_base_url}}`、`{{payment_base_url}}`、`{{risk_base_url}}`
- 运行时写入：`{{account_id}}`、`{{payment_id}}`、`{{customer_id}}`
