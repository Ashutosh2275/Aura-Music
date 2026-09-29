import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Play, Disc } from 'lucide-react';
import { fetchAlbum } from '../services/api';
import { TrackRow } from '../components/TrackRow';
import { usePlayerStore } from '../store/playerStore';

export const AlbumPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playTrack = usePlayerStore((s) => s.playTrack);

  const { data: album, isLoading } = useQuery({
    queryKey: ['album', id],
    queryFn: () => (id ? fetchAlbum(id) : null),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="py-20 text-center text-neutral-500 text-sm">Loading album...</div>;
  }

  if (!album) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto">
        <p className="text-neutral-400">Album not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-neutral-900 text-neutral-200 text-xs rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (album.tracks.length > 0) {
      playTrack(album.tracks[0], album.tracks);
    }
  };

  return (
    <div className="pb-36 pt-4 max-w-lg mx-auto">
      {/* Back button */}
      <div className="px-4 mb-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-neutral-400 hover:text-neutral-100 transition active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      {/* Album Hero */}
      <div className="px-5 mb-6 flex items-center gap-4">
        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl shrink-0">
          {album.artworkUrl ? (
            <img src={album.artworkUrl} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-600">
              <Disc size={40} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Album</p>
          <h1 className="text-xl sm:text-2xl font-black text-white truncate">{album.title}</h1>
          <p className="text-xs text-neutral-300 font-medium mt-0.5 truncate">{album.artist.name}</p>
          <p className="text-[11px] text-neutral-500 mt-1">
            {album.tracks.length} tracks • {album.releaseDate || '2024'}
          </p>

          <button
            onClick={handlePlayAll}
            className="mt-3 px-4 py-1.5 rounded-full bg-emerald-500 text-neutral-950 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-emerald-400 active:scale-95 transition"
          >
            <Play size={14} fill="currentColor" />
            <span>Play Album</span>
          </button>
        </div>
      </div>

      {/* Track List */}
      <div className="px-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 mb-2 px-1">
          Tracklist
        </h2>
        <div className="space-y-1">
          {album.tracks.map((track) => (
            <TrackRow key={`album-track-${track.id}`} track={track} queueContext={album.tracks} />
          ))}
        </div>
      </div>
    </div>
  );
};
