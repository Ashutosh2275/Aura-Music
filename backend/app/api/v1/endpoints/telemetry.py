from fastapi import APIRouter, status
from backend.app.models.telemetry import BatchTelemetryRequest

router = APIRouter()

# In-memory interaction buffer
_TELEMETRY_LOGS = []


@router.post("/events", status_code=status.HTTP_202_ACCEPTED)
@router.post("/telemetry/events", status_code=status.HTTP_202_ACCEPTED)
async def ingest_telemetry(payload: BatchTelemetryRequest):
    """
    Ingests pseudonymous interaction events for the recommendation engine.
    Never collects PII, IP addresses, or device IDs.
    """
    for event in payload.events:
        _TELEMETRY_LOGS.append(event)
    return {"status": "accepted", "count": len(payload.events)}
