import time
import logging
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.core.config import settings
from backend.app.core.cache import cache
from backend.app.api.v1.router import api_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("aura.api")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    # 1. Rate Limiting Check (PHASE 9 & 10)
    client_ip = request.client.host if request.client else "unknown"
    is_allowed = await cache.check_rate_limit(client_ip=client_ip, limit=120, window_seconds=60)
    if not is_allowed:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": {"code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests. Please slow down."}},
        )

    # 2. Structured Request Logging & Timing (PHASE 4)
    start_time = time.time()
    response: Response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000

    logger.info(
        f"{request.method} {request.url.path} - {response.status_code} ({duration_ms:.2f}ms) [{client_ip}]"
    )

    # 3. Privacy & Security Headers (PHASE 10)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

    return response


app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.VERSION}
