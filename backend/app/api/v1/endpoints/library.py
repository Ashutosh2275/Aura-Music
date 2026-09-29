from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from backend.app.models.track import Track
from backend.app.models.user import Playlist
from backend.app.adapters.music_provider import PermittedCreativeCommonsProvider

router = APIRouter()
provider = PermittedCreativeCommonsProvider()


class LibraryResponse(BaseModel):
    liked_tracks: List[Track] = []
    playlists: List[Playlist] = []
    recently_played: List[Track] = []


@router.get("/library", response_model=LibraryResponse)
async def get_user_library():
    """
    Returns the user's pseudonymous library (liked tracks, playlists, recent tracks).
    Stored in Firestore in production.
    """
    all_tracks = await provider.get_trending(limit=10)
    return LibraryResponse(
        liked_tracks=all_tracks[:2],
        playlists=[],
        recently_played=all_tracks[:3],
    )
