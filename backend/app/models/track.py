from pydantic import BaseModel, HttpUrl
from typing import List, Optional


class ArtistRef(BaseModel):
    id: str
    name: str


class AlbumRef(BaseModel):
    id: str
    title: str


class Track(BaseModel):
    id: str
    title: str
    artist: ArtistRef
    album: Optional[AlbumRef] = None
    duration_seconds: int
    audio_url: str
    artwork_url: Optional[str] = None
    license: str
    source_provider: str
    genre: List[str] = []
    tags: List[str] = []


class TrackListResponse(BaseModel):
    tracks: List[Track]
    total: int
    offset: int
    limit: int
