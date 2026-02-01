# PostgreSQL 迁移 (Flyway)

## 目录

- `migrations/`：Flyway 迁移脚本，命名 `V{version}__{description}.sql`

## 规范

- 命名：`V1__init_schema.sql`、`V2__add_indexes.sql` 等
- 版本号递增，不可修改已执行脚本

## 使用方式

### 1. 通过 Spring Boot (Agent 1)

在 `core-bank-service` 中配置：

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
```

将 `database/postgresql/migrations/` 下的脚本复制或软链到 `core-bank-service/src/main/resources/db/migration/`，或通过 build 将 `database/postgresql/migrations` 作为 `classpath:db/migration` 的源。

### 2. 使用 Flyway CLI

```bash
# 安装 Flyway，配置 flyway.conf 或环境变量
export FLYWAY_URL=jdbc:postgresql://localhost:5432/digitalbank
export FLYWAY_USER=postgres
export FLYWAY_PASSWORD=***
export FLYWAY_LOCATIONS=filesystem:./database/postgresql/migrations

flyway migrate
```

### 3. 使用 Docker / 初始化卷

将 `migrations/` 挂载到 Flyway 容器的 `/flyway/sql`，并配置 `flyway.conf` 指向 `filesystem:/flyway/sql`。

## 当前脚本

| 版本 | 文件 | 说明 |
|------|------|------|
| V1 | V1__init_schema.sql | 创建 customers、bank_accounts、transactions 及基础索引 |
| V2 | V2__add_indexes.sql | 补充复合索引 |
