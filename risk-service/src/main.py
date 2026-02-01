"""
风控合规服务 - FastAPI 应用入口 (risk-service)
遵循 technical-standards-v1.0、naming-conventions、agent-3-risk SKILL。
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config.settings import get_settings
from src.config.elasticsearch import get_es_client, close_es_client, ensure_risk_blacklist_index, ensure_risk_events_index
from src.controllers.risk_controller import router as risk_router

logging.basicConfig(
    level=logging.INFO,
    format='{"timestamp":"%(asctime)s","level":"%(levelname)s","service":"risk-service","message":"%(message)s"}',
)
logger = logging.getLogger(__name__)

SETTINGS = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时初始化 ES，关闭时清理."""
    logger.info("Risk service starting, initializing Elasticsearch client")
    await get_es_client()
    await ensure_risk_blacklist_index()
    await ensure_risk_events_index()
    yield
    logger.info("Risk service shutting down, closing Elasticsearch client")
    await close_es_client()


app = FastAPI(
    title="Risk Service - 风控合规服务",
    description="交易限额检查、风控规则引擎、黑名单管理。Agent 3 风控合规守护者。",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risk_router, prefix="/api/v1/risk", tags=["risk"])


@app.get("/health")
async def health():
    """健康检查，供 K8s / 网关使用."""
    return {"status": "healthy", "service": "risk-service"}
