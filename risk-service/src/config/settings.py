"""
风控服务配置 - 从环境变量加载
遵循 naming-conventions: UPPER_SNAKE_CASE 环境变量，如 RISK_SERVICE_ELASTICSEARCH_HOST
"""
from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置，环境变量前缀 RISK_ 或通用 ELASTICSEARCH_."""

    # Elasticsearch
    elasticsearch_host: str = "localhost"
    elasticsearch_port: int = 9200
    elasticsearch_scheme: str = "http"
    elasticsearch_user: Optional[str] = None
    elasticsearch_password: Optional[str] = None

    # 规则配置路径
    rules_config_path: str = "config/rules.yaml"

    # 服务
    app_env: str = "dev"

    @property
    def elasticsearch_url(self) -> str:
        base = f"{self.elasticsearch_scheme}://{self.elasticsearch_host}:{self.elasticsearch_port}"
        return base

    model_config = {"env_prefix": "RISK_", "env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
