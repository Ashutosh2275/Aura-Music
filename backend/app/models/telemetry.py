from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime

EventType = Literal[
    "impression",
    "search",
    "play_start",
    "listen_30s",
    "complete",
    "skip",
    "like",
    "unlike",
    "add_to_playlist",
]


class InteractionEvent(BaseModel):
    event_type: EventType
    track_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    playback_duration_seconds: float = 0.0
    completed: bool = False
    source: str = "direct"


class BatchTelemetryRequest(BaseModel):
    events: List[InteractionEvent]
