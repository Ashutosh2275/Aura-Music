from pydantic import BaseModel
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


class Artist(BaseModel):
    id: str
    name: str
    bio: Optional[str] = None
    artwork_url: Optional[str] = None
    tracks: List[Track] = []


class Album(BaseModel):
    id: str
    title: str
    artist: ArtistRef
    artwork_url: Optional[str] = None
    tracks: List[Track] = []
    release_date: Optional[str] = None


class StreamInfo(BaseModel):
    track_id: str
    audio_url: str
    format: str = "audio/mp3"
    bitrate_kbps: int = 192
    expires_in_seconds: Optional[int] = None


class TrackListResponse(BaseModel):
    tracks: List[Track]
    total: int
    offset: int
    limit: int
