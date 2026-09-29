from fastapi import APIRouter
from backend.app.api.v1.endpoints import tracks, users, telemetry, recommendations

api_router = APIRouter()

api_router.include_router(tracks.router, tags=["Tracks & Catalog"])
api_router.include_router(users.router, tags=["User & Privacy"])
api_router.include_router(telemetry.router, tags=["Telemetry & Events"])
api_router.include_router(recommendations.router, tags=["Recommendations"])
