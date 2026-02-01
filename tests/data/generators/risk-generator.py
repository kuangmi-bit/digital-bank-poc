"""
风控测试数据生成
遵循 naming-conventions、technical-standards-v1.0
使用 Faker (pip install faker)
"""

import json
import random
from datetime import datetime, timedelta

try:
    from faker import Faker
    fake = Faker("zh_CN")
except ImportError:
    fake = None


def generate_risk_check_request(overrides=None):
    overrides = overrides or {}
    return {
        "customer_id": overrides.get("customer_id") or f"cust-{fake.uuid4()[:8]}" if fake else "cust-001",
        "account_id": overrides.get("account_id"),
        "amount": overrides.get("amount", round(random.uniform(1, 100000), 2)),
        "transaction_type": overrides.get("transaction_type", random.choice(["transfer", "withdrawal", "payment"])),
        "currency": overrides.get("currency", "CNY"),
    }


def generate_blacklist_entry(overrides=None):
    overrides = overrides or {}
    return {
        "type": overrides.get("type", random.choice(["customer", "account", "card", "ip", "device"])),
        "value": overrides.get("value") or (fake.uuid4() if fake else "val-001"),
        "reason": overrides.get("reason", "manual"),
        "createdAt": (datetime.utcnow() - timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


def generate_risk_check_requests(count, overrides=None):
    return [generate_risk_check_request(overrides) for _ in range(count)]


def generate_blacklist_entries(count, overrides=None):
    return [generate_blacklist_entry(overrides) for _ in range(count)]


def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--type", choices=["risk_check", "blacklist"], default="risk_check")
    ap.add_argument("-n", type=int, default=5)
    ap.add_argument("-o", "--out", default=None)
    args = ap.parse_args()
    if args.type == "risk_check":
        data = generate_risk_check_requests(args.n)
    else:
        data = generate_blacklist_entries(args.n)
    s = json.dumps(data, ensure_ascii=False, indent=2)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(s)
    else:
        print(s)


if __name__ == "__main__":
    main()
