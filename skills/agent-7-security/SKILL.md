---
name: agent-7-security
version: 1.0.0
description: 安全扫描卫士Agent技能 - 负责代码安全扫描、API安全测试、依赖漏洞检查和渗透测试。使用SonarQube + OWASP ZAP + HashiCorp Vault技术栈。
author: Digital Bank POC Team
license: MIT
keywords:
  - security
  - sast
  - dast
  - sonarqube
  - owasp
  - vulnerability-scanning
  - penetration-testing
  - vault
---

# Agent 7: 安全扫描卫士 🔒

## 概述

Agent 7负责代码安全扫描、API安全测试、依赖漏洞检查和渗透测试。确保系统安全，零高危漏洞，符合安全标准。

## 何时使用

当需要：
- 执行代码安全扫描（SAST）
- 执行动态安全扫描（DAST）
- 检查依赖漏洞
- 执行渗透测试
- 管理密钥和敏感信息

## 技术栈

- **SAST**: SonarQube
- **DAST**: OWASP ZAP
- **依赖扫描**: Snyk / Dependabot
- **密钥管理**: HashiCorp Vault
- **安全配置**: OWASP Top 10检查

## 核心功能

### 1. 代码安全扫描（SAST）
- 每次代码提交自动触发
- 代码漏洞检测
- 代码质量检查

### 2. 动态安全扫描（DAST）
- 每12小时自动扫描
- API安全测试
- Web应用安全测试

### 3. 依赖漏洞检查
- 每日自动检查
- 第三方库漏洞扫描
- 自动修复建议

### 4. 安全配置
- 安全配置基线
- 密钥管理（Vault）
- 安全策略配置

## 自动化能力

- **安全自动化**: 95%自动化
  - SAST每次代码提交自动触发
  - DAST每12小时自动扫描
  - 依赖漏洞每日自动检查
  - 高危漏洞自动阻断部署
  - 安全报告自动生成

## 扫描覆盖

- **代码安全**: 100%代码库
- **API安全**: 100%对外接口
- **依赖安全**: 所有第三方库
- **配置安全**: 所有配置文件

## 交付标准

- **零严重/高危漏洞**: 必须达成
- **安全扫描报告**: 5+份
- **渗透测试报告**: 1份
- **安全配置基线文档**: 完整

## 项目结构

```
security/
├── sonar-project.properties  # SonarQube配置
├── owasp-zap-config.json      # OWASP ZAP配置
├── vault-config.hcl            # Vault配置
├── security-baseline.md       # 安全配置基线
└── reports/                    # 安全报告
    ├── sast-day4.md
    ├── dast-day8.md
    ├── dependency-dayX.md
    ├── final-security-report.md
    └── penetration-test-report.md
```

## 技术标准规范要求

**重要**: 必须严格遵循技术标准规范和命名规范。

### 必须遵循的规范文档

1. **技术标准规范 v1.0**: `docs/architecture/technical-standards-v1.0.md`
2. **命名规范 v1.0**: `docs/architecture/naming-conventions.md`

## 安全标准

- OWASP Top 10检查
- CWE Top 25检查
- **严格遵循技术标准规范中的安全规范**
- **严格遵循命名规范**
- 零高危漏洞容忍
- 中危漏洞及时修复
- 所有密钥使用Vault管理

### 命名规范要点

- **扫描报告**: `{service}-security-scan-{date}.json` (kebab-case)
- **漏洞标识**: `{service}-{vuln-id}` (kebab-case)
- **配置文件**: kebab-case或snake_case (如 `sonar-project.properties`)

## 协作关系

- **与所有开发Agent**: 扫描代码安全
- **与Agent 5**: 配置安全策略
- **与Agent 8**: 集成到CI/CD流水线
- **与Agent 0**: 报告安全问题和风险

## 关键里程碑

- **Day 1**: 安全工具配置完成
- **Day 4**: 首次SAST扫描完成
- **Day 8**: DAST扫描完成
- **Day 11**: 完整安全扫描和渗透测试完成

## 安全扫描示例

### SonarQube配置示例
```properties
sonar.projectKey=digital-bank-poc
sonar.projectName=Digital Bank POC
sonar.sources=src
sonar.tests=tests
sonar.java.binaries=target/classes
sonar.exclusions=**/generated/**
```

### OWASP ZAP扫描示例
```json
{
  "scanner": "zap",
  "target": "https://api.example.com",
  "scanType": "full",
  "reportFormat": "json"
}
```

## 安全编码指南

### OWASP Top 10 防护清单

| 风险 | 防护措施 | 代码示例 |
|-----|---------|---------|
| A01:注入 | 使用参数化查询 | `PreparedStatement` / `Parameterized Query` |
| A02:认证失败 | 强密码+MFA+JWT | bcrypt加密、Token过期机制 |
| A03:敏感数据泄露 | 加密传输+脱敏存储 | HTTPS、AES-256加密 |
| A04:XXE | 禁用外部实体 | `XMLInputFactory.setProperty()` |
| A05:访问控制 | RBAC+资源鉴权 | `@PreAuthorize`注解 |
| A06:安全配置错误 | 安全基线检查 | 禁用默认账户、移除示例代码 |
| A07:XSS | 输出编码+CSP | `HtmlUtils.htmlEscape()` |
| A08:反序列化 | 白名单验证 | 避免Java原生序列化 |
| A09:已知漏洞组件 | 定期依赖扫描 | Snyk/Dependabot |
| A10:日志伪造 | 日志过滤+监控 | 过滤特殊字符、告警 |

### 安全编码示例

#### SQL注入防护 (Java)
```java
// ❌ 危险：字符串拼接
String sql = "SELECT * FROM users WHERE id = " + userId;

// ✅ 安全：参数化查询
@Query("SELECT u FROM User u WHERE u.id = :userId")
User findByUserId(@Param("userId") Long userId);

// ✅ 安全：JPA Criteria API
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<User> query = cb.createQuery(User.class);
Root<User> root = query.from(User.class);
query.where(cb.equal(root.get("id"), userId));
```

#### XSS防护 (JavaScript)
```javascript
// ❌ 危险：直接插入HTML
element.innerHTML = userInput;

// ✅ 安全：使用textContent
element.textContent = userInput;

// ✅ 安全：使用DOMPurify
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

#### 密码存储 (Python)
```python
import bcrypt

# 密码哈希
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt).decode()

# 密码验证
def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())
```

---

## 敏感数据脱敏规则

### 脱敏规则定义

| 数据类型 | 脱敏规则 | 示例 |
|---------|---------|------|
| 手机号 | 保留前3后4 | `138****1234` |
| 身份证 | 保留前4后4 | `3201****5678` |
| 银行卡号 | 保留前6后4 | `622848****1234` |
| 邮箱 | 保留首字母 | `z****@example.com` |
| 姓名 | 保留姓 | `张**` |
| 地址 | 保留省市 | `江苏省南京市****` |

### 脱敏工具类

```java
public class DataMasker {

    public static String maskPhone(String phone) {
        if (phone == null || phone.length() != 11) return phone;
        return phone.substring(0, 3) + "****" + phone.substring(7);
    }

    public static String maskIdCard(String idCard) {
        if (idCard == null || idCard.length() < 8) return idCard;
        return idCard.substring(0, 4) + "****" + idCard.substring(idCard.length() - 4);
    }

    public static String maskBankCard(String cardNo) {
        if (cardNo == null || cardNo.length() < 10) return cardNo;
        return cardNo.substring(0, 6) + "****" + cardNo.substring(cardNo.length() - 4);
    }

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        int atIndex = email.indexOf("@");
        return email.charAt(0) + "****" + email.substring(atIndex);
    }

    public static String maskName(String name) {
        if (name == null || name.length() < 2) return name;
        return name.charAt(0) + "**";
    }
}
```

### 日志脱敏注解

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Sensitive {
    SensitiveType type();
}

public enum SensitiveType {
    PHONE, ID_CARD, BANK_CARD, EMAIL, NAME, ADDRESS
}

// 使用示例
public class Customer {
    @Sensitive(type = SensitiveType.NAME)
    private String name;

    @Sensitive(type = SensitiveType.PHONE)
    private String phone;

    @Sensitive(type = SensitiveType.BANK_CARD)
    private String bankCard;
}
```

---

## 安全事件响应流程

### 安全事件分级

| 级别 | 定义 | 响应时间 | 示例 |
|-----|------|---------|------|
| P0-紧急 | 系统被入侵或数据泄露 | 15分钟内响应 | 数据库被拖库、勒索软件 |
| P1-高 | 存在被利用的高危漏洞 | 1小时内响应 | 远程代码执行漏洞 |
| P2-中 | 存在潜在安全风险 | 24小时内响应 | SQL注入漏洞（未被利用） |
| P3-低 | 安全配置问题 | 7天内修复 | 过期证书、弱密码策略 |

### 安全事件响应流程

```
┌──────────────┐
│  事件发现    │ (监控告警/扫描发现/人工报告)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  事件确认    │ (确认真实性和影响范围)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  事件分级    │ (P0/P1/P2/P3)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  应急响应    │ (隔离/止损/取证)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  问题修复    │ (漏洞修复/配置加固)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  复盘总结    │ (根因分析/改进措施)
└──────────────┘
```

### 安全事件报告模板

```markdown
# 安全事件报告 - SEC-YYYY-NNNN

## 事件概述
- **事件ID**: SEC-2026-0001
- **发现时间**: 2026-01-26 10:00:00
- **事件级别**: P1
- **状态**: 已修复

## 事件描述
[详细描述安全事件的情况]

## 影响范围
- 受影响服务: core-bank-service
- 受影响数据: 无
- 受影响用户: 0

## 根因分析
[分析事件发生的根本原因]

## 处理过程
1. 10:00 - 监控告警发现异常
2. 10:15 - 确认安全事件
3. 10:30 - 隔离受影响服务
4. 11:00 - 漏洞修复完成
5. 11:30 - 服务恢复正常

## 改进措施
1. [措施1]
2. [措施2]
```

---

## 合规检查清单

### 金融行业安全合规

| 检查项 | 要求 | 状态 |
|-------|------|------|
| 数据加密 | 敏感数据AES-256加密 | ✅ |
| 传输加密 | 全链路HTTPS/TLS 1.2+ | ✅ |
| 身份认证 | 强密码+会话管理 | ✅ |
| 访问控制 | 最小权限原则 | ✅ |
| 审计日志 | 关键操作可追溯 | ✅ |
| 密钥管理 | 使用Vault管理密钥 | ✅ |
| 漏洞管理 | 定期扫描+及时修复 | ✅ |
| 安全培训 | 开发人员安全意识 | ✅ |

### 自动化合规检查

```yaml
# .gitlab-ci.yml 安全检查阶段
security-scan:
  stage: security
  script:
    # SAST扫描
    - sonar-scanner -Dsonar.projectKey=digital-bank-poc

    # 依赖漏洞扫描
    - snyk test --severity-threshold=high

    # 密钥泄露检查
    - gitleaks detect --source . --verbose

    # 容器镜像扫描
    - trivy image digitalbank/core-bank-service:$CI_COMMIT_SHA

  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"
```

---

## 相关资源

- Agent启动提示词: `agent_prompts.md`
- 详细工作计划: `digital_bank_poc_workplan.md`
- **技术标准规范 v1.0**: `docs/architecture/technical-standards-v1.0.md` ⚠️ **必须遵循**
- **命名规范 v1.0**: `docs/architecture/naming-conventions.md` ⚠️ **必须遵循**

---

**版本**: v1.1.0  
**创建日期**: 2026-01-26  
**维护者**: Digital Bank POC Team
