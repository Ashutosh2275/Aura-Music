from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class UserPreferences(BaseModel):
    audio_quality: str = "high"
    private_session: bool = False


class UserProfile(BaseModel):
    user_id: str
    created_at: datetime
    preferences: UserPreferences = UserPreferences()


class PlaylistCreate(BaseModel):
    title: str
    description: Optional[str] = None


class Playlist(BaseModel):
    id: str
    owner_id: str
    title: str
    description: Optional[str] = None
    track_count: int = 0
    created_at: datetime
    updated_at: datetime
