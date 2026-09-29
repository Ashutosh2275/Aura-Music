import logging
from abc import ABC, abstractmethod
from typing import List, Optional
import httpx
from backend.app.core.config import settings
from backend.app.models.track import Track, Artist, Album, StreamInfo, ArtistRef, AlbumRef

logger = logging.getLogger("aura.adapters.music_provider")


class MusicProvider(ABC):
    """
    Abstract interface for permitted music providers.
    All external provider specifics, licensing constraints, rate limits,
    and authentication remain strictly inside this adapter layer.
    """

    @abstractmethod
    async def search_tracks(self, query: str, limit: int = 20, offset: int = 0) -> List[Track]:
        pass

    @abstractmethod
    async def get_track(self, track_id: str) -> Optional[Track]:
        pass

    @abstractmethod
    async def get_artist(self, artist_id: str) -> Optional[Artist]:
        pass

    @abstractmethod
    async def get_album(self, album_id: str) -> Optional[Album]:
        pass

    @abstractmethod
    async def get_stream(self, track_id: str) -> Optional[StreamInfo]:
        pass

    @abstractmethod
    async def get_trending(self, limit: int = 20) -> List[Track]:
        pass


class PermittedCreativeCommonsProvider(MusicProvider):
    """
    Default permitted music provider adhering strictly to Creative Commons / Open Access licensing.
    Never scrapes or bypasses proprietary restricted catalogs.
    """

    def __init__(self):
        self._tracks = [
            Track(
                id="trk_cc_01",
                title="Aura of Serenity",
                artist=ArtistRef(id="art_kai", name="Kai Engel"),
                album=AlbumRef(id="alb_motion", title="Sustained Motion"),
                duration_seconds=226,
                audio_url="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
                artwork_url="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
                license="Pixabay Content License (Permitted Free Streaming)",
                source_provider="creative_commons",
                genre=["Ambient", "Lo-Fi"],
                tags=["peaceful", "study", "relax"],
            ),
            Track(
                id="trk_cc_02",
                title="Nocturne Drift",
                artist=ArtistRef(id="art_ghost", name="Ghostrifter Official"),
                album=AlbumRef(id="alb_breeze", title="Afternoon Breeze"),
                duration_seconds=168,
                audio_url="https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=smoke-143172.mp3",
                artwork_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
                license="Creative Commons CC-BY 4.0",
                source_provider="creative_commons",
                genre=["Lo-Fi", "Chillhop"],
                tags=["beats", "night", "city"],
            ),
            Track(
                id="trk_cc_03",
                title="Deep Horizon",
                artist=ArtistRef(id="art_purrple", name="Purrple Cat"),
                album=AlbumRef(id="alb_stars", title="Distant Stars"),
                duration_seconds=194,
                audio_url="https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=chill-abstract-intention-12099.mp3",
                artwork_url="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
                license="Creative Commons CC-BY-SA 4.0",
                source_provider="creative_commons",
                genre=["Electronic", "Ambient"],
                tags=["space", "horizon", "focus"],
            ),
            Track(
                id="trk_cc_04",
                title="Ethereal Voyage",
                artist=ArtistRef(id="art_aero", name="Aerøhead"),
                album=AlbumRef(id="alb_atm", title="Atmospheres"),
                duration_seconds=210,
                audio_url="https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=ambient-piano-amp-strings-10711.mp3",
                artwork_url="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80",
                license="Creative Commons CC-BY 3.0",
                source_provider="creative_commons",
                genre=["Classical", "Cinematic"],
                tags=["piano", "strings", "voyage"],
            ),
        ]

    async def search_tracks(self, query: str, limit: int = 20, offset: int = 0) -> List[Track]:
        q = query.lower()
        matched = [
            t
            for t in self._tracks
            if q in t.title.lower()
            or q in t.artist.name.lower()
            or any(q in tag.lower() for tag in t.tags)
            or any(q in g.lower() for g in t.genre)
        ]
        return matched[offset : offset + limit]

    async def get_track(self, track_id: str) -> Optional[Track]:
        for t in self._tracks:
            if t.id == track_id:
                return t
        return None

    async def get_artist(self, artist_id: str) -> Optional[Artist]:
        artist_tracks = [t for t in self._tracks if t.artist.id == artist_id]
        if not artist_tracks:
            return None
        return Artist(
            id=artist_id,
            name=artist_tracks[0].artist.name,
            bio="Independent artist publishing under open Creative Commons licensing.",
            artwork_url=artist_tracks[0].artwork_url,
            tracks=artist_tracks,
        )

    async def get_album(self, album_id: str) -> Optional[Album]:
        album_tracks = [t for t in self._tracks if t.album and t.album.id == album_id]
        if not album_tracks:
            return None
        return Album(
            id=album_id,
            title=album_tracks[0].album.title,
            artist=album_tracks[0].artist,
            artwork_url=album_tracks[0].artwork_url,
            tracks=album_tracks,
            release_date="2024-01-01",
        )

    async def get_stream(self, track_id: str) -> Optional[StreamInfo]:
        track = await self.get_track(track_id)
        if not track:
            return None
        return StreamInfo(
            track_id=track.id,
            audio_url=track.audio_url,
            format="audio/mp3",
            bitrate_kbps=192,
        )

    async def get_trending(self, limit: int = 20) -> List[Track]:
        return self._tracks[:limit]


class JamendoMusicProvider(MusicProvider):
    """
    Production-ready music provider adapter integrating the Jamendo API v3.
    Provides legal, permitted streaming of Creative Commons and independent music.
    Enforces track-level streaming only; never accesses unauthorized radio endpoints.
    Gracefully falls back to PermittedCreativeCommonsProvider when offline, rate-limited,
    or handling fallback IDs.
    """

    JAMENDO_BASE_URL = "https://api.jamendo.com/v3.0"

    def __init__(self, client_id: Optional[str] = None, timeout: float = 6.0):
        self.client_id = client_id if client_id is not None else settings.JAMENDO_CLIENT_ID
        self.timeout = timeout
        self._fallback = PermittedCreativeCommonsProvider()
        self.headers = {
            "User-Agent": "AuraMusic/1.0 (PWA; iOS/Safari/Chrome; +https://github.com/Ashutosh2275/Aura-Music)"
        }

    def _normalize_track(self, item: dict) -> Track:
        track_id = str(item.get("id"))
        artist_id = str(item.get("artist_id", ""))
        artist_name = item.get("artist_name", "Unknown Artist")
        album_id = str(item.get("album_id", "")) if item.get("album_id") else None
        album_name = item.get("album_name", "") if album_id else None

        license_url = item.get("license_ccurl") or "Creative Commons (Jamendo Permitted Streaming)"
        artwork = item.get("image") or item.get("album_image")
        audio_url = item.get("audio", "")

        return Track(
            id=track_id,
            title=item.get("name", "Untitled Track"),
            artist=ArtistRef(id=artist_id, name=artist_name),
            album=AlbumRef(id=album_id, title=album_name) if album_id and album_name else None,
            duration_seconds=int(item.get("duration", 0)),
            audio_url=audio_url,
            artwork_url=artwork,
            license=license_url,
            source_provider="jamendo",
            genre=["Indie"],
            tags=["jamendo", "streaming"],
        )

    async def search_tracks(self, query: str, limit: int = 20, offset: int = 0) -> List[Track]:
        fallback_results = await self._fallback.search_tracks(query, limit=limit, offset=offset)

        if not self.client_id:
            return fallback_results

        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=self.timeout) as client:
                resp = await client.get(
                    f"{self.JAMENDO_BASE_URL}/tracks/",
                    params={
                        "client_id": self.client_id,
                        "format": "json",
                        "namesearch": query,
                        "limit": limit,
                        "offset": offset,
                        "order": "popularity_total_desc",
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    results = data.get("results", [])
                    jamendo_tracks = [self._normalize_track(item) for item in results]
                    # Combine matching fallback results with Jamendo results, avoiding duplicate IDs
                    combined = fallback_results + [
                        t for t in jamendo_tracks if not any(f.id == t.id for f in fallback_results)
                    ]
                    return combined[:limit] if combined else jamendo_tracks[:limit]
        except Exception as exc:
            logger.warning("Jamendo search_tracks failed: %s. Using fallback provider.", exc)

        return fallback_results

    async def get_track(self, track_id: str) -> Optional[Track]:
        if track_id.startswith("trk_cc_"):
            return await self._fallback.get_track(track_id)

        if not self.client_id:
            return await self._fallback.get_track(track_id)

        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=self.timeout) as client:
                resp = await client.get(
                    f"{self.JAMENDO_BASE_URL}/tracks/",
                    params={
                        "client_id": self.client_id,
                        "format": "json",
                        "id": track_id,
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    results = data.get("results", [])
                    if results:
                        return self._normalize_track(results[0])
        except Exception as exc:
            logger.warning("Jamendo get_track(%s) failed: %s. Checking fallback.", track_id, exc)

        return await self._fallback.get_track(track_id)

    async def get_artist(self, artist_id: str) -> Optional[Artist]:
        if artist_id.startswith("art_"):
            return await self._fallback.get_artist(artist_id)

        if not self.client_id:
            return await self._fallback.get_artist(artist_id)

        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=self.timeout) as client:
                artist_resp = await client.get(
                    f"{self.JAMENDO_BASE_URL}/artists/",
                    params={"client_id": self.client_id, "format": "json", "id": artist_id},
                )
                tracks_resp = await client.get(
                    f"{self.JAMENDO_BASE_URL}/tracks/",
                    params={
                        "client_id": self.client_id,
                        "format": "json",
                        "artist_id": artist_id,
                        "limit": 20,
                    },
                )

                artist_data = (
                    artist_resp.json().get("results", []) if artist_resp.status_code == 200 else []
                )
                tracks_data = (
                    tracks_resp.json().get("results", []) if tracks_resp.status_code == 200 else []
                )

                if artist_data:
                    info = artist_data[0]
                    norm_tracks = [self._normalize_track(t) for t in tracks_data]
                    return Artist(
                        id=str(info.get("id")),
                        name=info.get("name", "Unknown Artist"),
                        bio=f"Independent artist publishing on Jamendo. Member since {info.get('joindate', 'N/A')}.",
                        artwork_url=info.get("image"),
                        tracks=norm_tracks,
                    )
        except Exception as exc:
            logger.warning("Jamendo get_artist(%s) failed: %s. Checking fallback.", artist_id, exc)

        return await self._fallback.get_artist(artist_id)

    async def get_album(self, album_id: str) -> Optional[Album]:
        if album_id.startswith("alb_"):
            return await self._fallback.get_album(album_id)

        if not self.client_id:
            return await self._fallback.get_album(album_id)

        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=self.timeout) as client:
                album_resp = await client.get(
                    f"{self.JAMENDO_BASE_URL}/albums/",
                    params={"client_id": self.client_id, "format": "json", "id": album_id},
                )
                tracks_resp = await client.get(
                    f"{self.JAMENDO_BASE_URL}/tracks/",
                    params={
                        "client_id": self.client_id,
                        "format": "json",
                        "album_id": album_id,
                        "limit": 30,
                    },
                )

                album_data = (
                    album_resp.json().get("results", []) if album_resp.status_code == 200 else []
                )
                tracks_data = (
                    tracks_resp.json().get("results", []) if tracks_resp.status_code == 200 else []
                )

                if album_data:
                    info = album_data[0]
                    norm_tracks = [self._normalize_track(t) for t in tracks_data]
                    return Album(
                        id=str(info.get("id")),
                        title=info.get("name", "Unknown Album"),
                        artist=ArtistRef(
                            id=str(info.get("artist_id", "")), name=info.get("artist_name", "")
                        ),
                        artwork_url=info.get("image"),
                        tracks=norm_tracks,
                        release_date=info.get("releasedate"),
                    )
        except Exception as exc:
            logger.warning("Jamendo get_album(%s) failed: %s. Checking fallback.", album_id, exc)

        return await self._fallback.get_album(album_id)

    async def get_stream(self, track_id: str) -> Optional[StreamInfo]:
        track = await self.get_track(track_id)
        if not track:
            return None
        return StreamInfo(
            track_id=track.id,
            audio_url=track.audio_url,
            format="audio/mp3",
            bitrate_kbps=192,
        )

    async def get_trending(self, limit: int = 20) -> List[Track]:
        if not self.client_id:
            return await self._fallback.get_trending(limit=limit)

        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=self.timeout) as client:
                resp = await client.get(
                    f"{self.JAMENDO_BASE_URL}/tracks/",
                    params={
                        "client_id": self.client_id,
                        "format": "json",
                        "order": "popularity_total_desc",
                        "limit": limit,
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    results = data.get("results", [])
                    if results:
                        return [self._normalize_track(item) for item in results]
        except Exception as exc:
            logger.warning("Jamendo get_trending failed: %s. Using fallback.", exc)

        return await self._fallback.get_trending(limit=limit)


_provider_instance: Optional[MusicProvider] = None


def get_music_provider() -> MusicProvider:
    """
    Returns the singleton music provider instance.
    Defaults to JamendoMusicProvider which automatically uses fallback provider when needed.
    """
    global _provider_instance
    if _provider_instance is None:
        _provider_instance = JamendoMusicProvider()
    return _provider_instance
