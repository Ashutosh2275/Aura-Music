import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.services.recommendation import ContentBasedRecommender
from backend.app.adapters.music_provider import (
    PermittedCreativeCommonsProvider,
    JamendoMusicProvider,
)


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_security_headers():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.headers.get("X-Content-Type-Options") == "nosniff"
        assert response.headers.get("X-Frame-Options") == "DENY"
        assert response.headers.get("Referrer-Policy") == "no-referrer"


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
async def test_get_similar_tracks():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/tracks/trk_cc_01/similar?limit=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 2
        # Ensure it does not recommend itself
        assert all(t["id"] != "trk_cc_01" for t in data)


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


@pytest.mark.asyncio
async def test_recommendation_v1_unit():
    provider = PermittedCreativeCommonsProvider()
    tracks = await provider.get_trending(limit=10)
    recommender = ContentBasedRecommender()
    recommender.fit(tracks)

    recs = recommender.recommend(
        user_id="user_test",
        user_history=["trk_cc_01"],
        candidate_tracks=tracks,
        limit=2,
    )
    assert len(recs) <= 2
    # Ensure history item is not recommended
    assert all(r.id != "trk_cc_01" for r in recs)


@pytest.mark.asyncio
async def test_jamendo_provider_fallback_when_no_client_id():
    provider = JamendoMusicProvider(client_id="")
    trending = await provider.get_trending(limit=2)
    assert len(trending) >= 1
    assert trending[0].source_provider == "creative_commons"

    track = await provider.get_track("trk_cc_01")
    assert track is not None
    assert track.title == "Aura of Serenity"


@pytest.mark.asyncio
async def test_jamendo_provider_trending():
    provider = JamendoMusicProvider(client_id="abe76907")
    trending = await provider.get_trending(limit=3)
    assert len(trending) >= 1
    assert trending[0].audio_url != ""
