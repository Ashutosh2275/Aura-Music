import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Play, User } from 'lucide-react';
import { fetchArtist } from '../services/api';
import { TrackRow } from '../components/TrackRow';
import { usePlayerStore } from '../store/playerStore';

export const ArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playTrack = usePlayerStore((s) => s.playTrack);

  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => (id ? fetchArtist(id) : null),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="py-20 text-center text-neutral-500 text-sm">Loading artist...</div>;
  }

  if (!artist) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto">
        <p className="text-neutral-400">Artist not found.</p>
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
    if (artist.tracks.length > 0) {
      playTrack(artist.tracks[0], artist.tracks);
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

      {/* Artist Hero */}
      <div className="px-5 mb-6 flex items-center gap-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl shrink-0">
          {artist.artworkUrl ? (
            <img src={artist.artworkUrl} alt={artist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-600">
              <User size={36} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Artist</p>
          <h1 className="text-2xl font-black text-white truncate">{artist.name}</h1>
          <p className="text-xs text-neutral-400 mt-1">{artist.tracks.length} tracks available</p>

          <button
            onClick={handlePlayAll}
            className="mt-3 px-4 py-1.5 rounded-full bg-emerald-500 text-neutral-950 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-emerald-400 active:scale-95 transition"
          >
            <Play size={14} fill="currentColor" />
            <span>Play All</span>
          </button>
        </div>
      </div>

      {/* Bio */}
      {artist.bio && (
        <div className="px-5 mb-6">
          <p className="text-xs text-neutral-400 leading-relaxed bg-neutral-900/50 p-3.5 rounded-xl border border-neutral-800/60">
            {artist.bio}
          </p>
        </div>
      )}

      {/* Track List */}
      <div className="px-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 mb-2 px-1">
          Popular Releases
        </h2>
        <div className="space-y-1">
          {artist.tracks.map((track) => (
            <TrackRow key={`artist-track-${track.id}`} track={track} queueContext={artist.tracks} />
          ))}
        </div>
      </div>
    </div>
  );
};
