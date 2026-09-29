from abc import ABC, abstractmethod
from typing import List, Optional
from backend.app.models.track import Track, Artist, Album, StreamInfo, ArtistRef, AlbumRef


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
