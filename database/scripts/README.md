# database/scripts

执行迁移、初始化与导入的脚本。遵循 **data-dictionary-v1.0**、**ADR-003**；不修改已有 V1 迁移，新需求以新迁移迭代。

## PostgreSQL 迁移

### 方式一：psql（本目录脚本）

1. 创建数据库：`createdb digitalbank`（或等价方式）
2. 执行迁移：
   - **Windows**: `.\run-pg-migrate.ps1`
   - **Linux/macOS**: `./run-pg-migrate.sh`
3. 连接串：默认 `postgresql://postgres:postgres@localhost:5432/digitalbank`，可通过 `$env:PGURL` / `PGURL` 覆盖。

### 方式二：Flyway

见 `database/postgresql/README.md`，使用 `database/postgresql/migrations/` 下的 `V1__init_schema.sql`、`V2__add_indexes.sql`。

## MongoDB 集合创建

```bash
mongosh "mongodb://localhost:27017" --file database/scripts/init-mongodb-collections.js
```

或设置 `MONGO_URI` 后：

```bash
mongosh $MONGO_URI --file database/scripts/init-mongodb-collections.js
```

在 `payment_db` 中创建 `payments`、`settlements` 及 data-dictionary / schemas 中定义的索引。

## 测试数据生成（客户 5万+、账户 10万+）

在项目根目录或 `tests/data/generators` 下：

```bash
cd tests/data/generators
npm install
npm run generate:bulk
```

产出：

- `database/test-data/customers.csv`（5万+ 行）
- `database/test-data/accounts.csv`（10万+ 行）

可选导入 PostgreSQL（需先完成迁移）：

- **Windows**: `.\database\scripts\import-pg-csv.ps1`
- **Linux/macOS**: `./database/scripts/import-pg-csv.sh`

（从项目根运行；脚本内路径为 `database/test-data/*.csv`。）

## 验证数据模型

迁移并导入后，在 PostgreSQL 中执行：

```bash
psql $PGURL -f database/scripts/verify-data-model.sql
```

或使用对应 `verify-data-model.sql` 在客户端中运行。
