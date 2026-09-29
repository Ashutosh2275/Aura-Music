import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_get_track_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/tracks/trk_cc_01")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "trk_cc_01"
        assert "audio_url" in data
        assert "license" in data


@pytest.mark.asyncio
async def test_get_track_stream():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/tracks/trk_cc_01/stream")
        assert response.status_code == 200
        data = response.json()
        assert data["track_id"] == "trk_cc_01"
        assert "audio_url" in data


@pytest.mark.asyncio
async def test_get_artist():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/artists/art_kai")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "art_kai"
        assert data["name"] == "Kai Engel"


@pytest.mark.asyncio
async def test_get_album():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/albums/alb_motion")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "alb_motion"
        assert data["title"] == "Sustained Motion"


@pytest.mark.asyncio
async def test_search_tracks():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/search?q=Aura")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert data["tracks"][0]["title"] == "Aura of Serenity"


@pytest.mark.asyncio
async def test_get_trending():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/trending")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1


@pytest.mark.asyncio
async def test_get_recommendations():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/recommendations?limit=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 2


@pytest.mark.asyncio
async def test_get_library():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/library")
        assert response.status_code == 200
        data = response.json()
        assert "liked_tracks" in data
        assert "playlists" in data


@pytest.mark.asyncio
async def test_events_ingestion():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "events": [
                {
                    "event_type": "play_start",
                    "track_id": "trk_cc_01",
                    "playback_duration_seconds": 12.5,
                    "completed": False,
                    "source": "discovery",
                }
            ]
        }
        response = await ac.post("/api/v1/events", json=payload)
        assert response.status_code == 202
        assert response.json()["count"] == 1


@pytest.mark.asyncio
async def test_privacy_erasure():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.delete("/api/v1/me")
        assert response.status_code == 204
