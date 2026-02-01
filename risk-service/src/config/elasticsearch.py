"""
Elasticsearch 连接管理 - 异步客户端，用于风控日志与黑名单
遵循 naming-conventions: 索引 snake_case (risk_events, risk_blacklist)
"""
import logging
from typing import Optional

from elasticsearch import AsyncElasticsearch

from src.config.settings import get_settings
from src.models.blacklist import RISK_BLACKLIST_INDEX, RISK_BLACKLIST_MAPPING
from src.models.risk_events import RISK_EVENTS_INDEX, RISK_EVENTS_MAPPING

logger = logging.getLogger(__name__)

_es_client: Optional[AsyncElasticsearch] = None


async def ensure_risk_events_index() -> None:
    """若 risk_events 索引不存在则创建；ES 不可用时仅记日志."""
    try:
        es = await get_es_client()
        if not await es.indices.exists(index=RISK_EVENTS_INDEX):
            await es.indices.create(index=RISK_EVENTS_INDEX, body=RISK_EVENTS_MAPPING)
            logger.info("Created Elasticsearch index: %s", RISK_EVENTS_INDEX)
    except Exception as e:
        logger.warning("Could not ensure index %s: %s", RISK_EVENTS_INDEX, e)


async def ensure_risk_blacklist_index() -> None:
    """若 risk_blacklist 索引不存在则创建（黑名单数据结构配置）. """
    es = await get_es_client()
    try:
        if not await es.indices.exists(index=RISK_BLACKLIST_INDEX):
            await es.indices.create(index=RISK_BLACKLIST_INDEX, body=RISK_BLACKLIST_MAPPING)
            logger.info("Created Elasticsearch index: %s", RISK_BLACKLIST_INDEX)
    except Exception as e:
        logger.warning("Could not ensure index %s: %s", RISK_BLACKLIST_INDEX, e)


async def get_es_client() -> AsyncElasticsearch:
    """获取或创建异步 Elasticsearch 客户端（单例）. """
    global _es_client
    if _es_client is None:
        s = get_settings()
        _es_client = AsyncElasticsearch(
            [s.elasticsearch_url],
            basic_auth=(s.elasticsearch_user, s.elasticsearch_password)
            if s.elasticsearch_user and s.elasticsearch_password
            else None,
            verify_certs=False,
            request_timeout=10,
        )
        try:
            info = await _es_client.info()
            logger.info("Elasticsearch connected: %s", info.get("version", {}).get("number"))
        except Exception as e:
            logger.warning("Elasticsearch connection check failed (may be ok if ES not yet up): %s", e)
    return _es_client


async def close_es_client() -> None:
    """关闭 Elasticsearch 客户端."""
    global _es_client
    if _es_client is not None:
        await _es_client.close()
        _es_client = None
        logger.info("Elasticsearch client closed")
