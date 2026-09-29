from fastapi import APIRouter, HTTPException, Query
from typing import List
from backend.app.models.track import Track, Artist, Album, StreamInfo, TrackListResponse
from backend.app.adapters.music_provider import get_music_provider
from backend.app.services.recommendation import ContentBasedRecommender

router = APIRouter()
provider = get_music_provider()
recommender = ContentBasedRecommender()


@router.get("/tracks/{track_id}", response_model=Track)
async def get_track(track_id: str):
    track = await provider.get_track(track_id)
    if not track:
        raise HTTPException(
            status_code=404,
            detail={"code": "RESOURCE_NOT_FOUND", "message": f"Track '{track_id}' not found."},
        )
    return track


@router.get("/tracks/{track_id}/stream", response_model=StreamInfo)
async def get_stream(track_id: str):
    stream_info = await provider.get_stream(track_id)
    if not stream_info:
        raise HTTPException(
            status_code=404,
            detail={"code": "STREAM_NOT_FOUND", "message": f"Stream for track '{track_id}' not found."},
        )
    return stream_info


@router.get("/tracks/{track_id}/similar", response_model=List[Track])
async def get_similar_tracks(track_id: str, limit: int = Query(5, ge=1, le=20)):
    tracks = await provider.get_trending(limit=50)
    recommender.fit(tracks)
    return recommender.get_similar_tracks(track_id=track_id, limit=limit)


@router.get("/artists/{artist_id}", response_model=Artist)
async def get_artist(artist_id: str):
    artist = await provider.get_artist(artist_id)
    if not artist:
        raise HTTPException(
            status_code=404,
            detail={"code": "ARTIST_NOT_FOUND", "message": f"Artist '{artist_id}' not found."},
        )
    return artist


@router.get("/albums/{album_id}", response_model=Album)
async def get_album(album_id: str):
    album = await provider.get_album(album_id)
    if not album:
        raise HTTPException(
            status_code=404,
            detail={"code": "ALBUM_NOT_FOUND", "message": f"Album '{album_id}' not found."},
        )
    return album


@router.get("/search", response_model=TrackListResponse)
async def search_tracks(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
):
    results = await provider.search_tracks(query=q, limit=limit, offset=offset)
    return TrackListResponse(
        tracks=results,
        total=len(results),
        offset=offset,
        limit=limit,
    )


@router.get("/trending", response_model=List[Track])
async def get_trending(limit: int = Query(20, ge=1, le=50)):
    return await provider.get_trending(limit=limit)
