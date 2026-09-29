from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.app.models.track import Track, TrackListResponse
from backend.app.adapters.music_provider import PermittedCreativeCommonsProvider

router = APIRouter()
provider = PermittedCreativeCommonsProvider()


@router.get("/tracks/{track_id}", response_model=Track)
async def get_track(track_id: str):
    track = await provider.get_track(track_id)
    if not track:
        raise HTTPException(
            status_code=404,
            detail={"code": "RESOURCE_NOT_FOUND", "message": f"Track '{track_id}' not found."},
        )
    return track


@router.get("/search", response_model=TrackListResponse)
async def search_tracks(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
):
    results = await provider.search(query=q, limit=limit, offset=offset)
    return TrackListResponse(
        tracks=results,
        total=len(results),
        offset=offset,
        limit=limit,
    )


@router.get("/explore/trending", response_model=List[Track])
async def get_trending(limit: int = Query(20, ge=1, le=50)):
    return await provider.get_trending(limit=limit)
