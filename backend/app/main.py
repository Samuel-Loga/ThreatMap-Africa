import asyncio
import json
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, indicators, export, taxii, notifications

logger = logging.getLogger(__name__)

connected_websockets: list[WebSocket] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(redis_listener())
    yield


app = FastAPI(
    title="ThreatMap Africa API",
    description="African Cyber Threat Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(indicators.router)
app.include_router(export.router)
app.include_router(taxii.router)
app.include_router(notifications.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "ThreatMap Africa API"}


@app.websocket("/ws/enrichment")
async def ws_enrichment(websocket: WebSocket):
    await websocket.accept()
    connected_websockets.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connected_websockets.remove(websocket)
    except Exception:
        if websocket in connected_websockets:
            connected_websockets.remove(websocket)


async def redis_listener():
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.REDIS_URL)
        pubsub = r.pubsub()
        await pubsub.subscribe("enrichment_events")
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = message["data"]
                if isinstance(data, bytes):
                    data = data.decode()
                dead = []
                for ws in connected_websockets:
                    try:
                        await ws.send_text(data)
                    except Exception:
                        dead.append(ws)
                for ws in dead:
                    connected_websockets.remove(ws)
    except Exception as e:
        logger.warning(f"Redis listener error: {e}")
