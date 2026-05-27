import logging
from contextlib import asynccontextmanager
from typing import Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import DetailRequest, DetailResponse, ExpandRequest, ExpandResponse
from services.ai_service import ai_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory exploration sessions (MVP)
exploration_sessions: Dict[str, dict] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    configured = ai_service.is_configured
    logger.info(
        "WorldFlow API starting — DashScope configured: %s, model: %s",
        configured,
        ai_service.model if configured else "none",
    )
    if not configured:
        logger.info("Running in demo mode. Set DASHSCOPE_API_KEY in .env")
    yield


app = FastAPI(
    title="WorldFlow API",
    description="AI Infinite Exploration Universe",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "WorldFlow",
        "provider": "dashscope",
        "model": ai_service.model,
        "ai_configured": ai_service.is_configured,
    }


@app.post("/api/explore/expand", response_model=ExpandResponse)
async def expand_exploration(req: ExpandRequest):
    is_root = req.parent_title is None
    topic = req.topic if is_root else req.parent_title or req.topic

    context = list(req.context_path)
    if not is_root and req.parent_title:
        context = context + [req.parent_title]

    nodes = await ai_service.expand_nodes(topic, context, is_root=is_root)
    return ExpandResponse(nodes=nodes)


@app.post("/api/explore/detail", response_model=DetailResponse)
async def get_detail(req: DetailRequest):
    detail = await ai_service.get_node_detail(
        req.title,
        req.description,
        req.context_path,
    )
    return DetailResponse(detail=detail)
