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
        response = await ac.get("/v1/tracks/trk_cc_01")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "trk_cc_01"
        assert "audio_url" in data
        assert "license" in data


@pytest.mark.asyncio
async def test_get_track_not_found():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/v1/tracks/non_existent_id")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_search_tracks():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/v1/search?q=Aura")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert data["tracks"][0]["title"] == "Aura of Serenity"


@pytest.mark.asyncio
async def test_privacy_erasure():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.delete("/v1/me")
        assert response.status_code == 204


@pytest.mark.asyncio
async def test_telemetry_ingestion():
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
        response = await ac.post("/v1/telemetry/events", json=payload)
        assert response.status_code == 202
        assert response.json()["count"] == 1


@pytest.mark.asyncio
async def test_personalized_recommendations():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/v1/recommendations/personalized?limit=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 2
