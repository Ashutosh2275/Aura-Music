import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart } from 'lucide-react';
import type { Track } from '../audio/types';
import { usePlayerStore } from '../store/playerStore';

interface TrackRowProps {
  track: Track;
  queueContext?: Track[];
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, queueContext }) => {
  const navigate = useNavigate();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const status = usePlayerStore((s) => s.status);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const toggleLike = usePlayerStore((s) => s.toggleLike);
  const isLiked = usePlayerStore((s) => s.isLiked);

  const isCurrent = currentTrack?.id === track.id;
  const isPlaying = isCurrent && status === 'playing';
  const liked = isLiked(track.id);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      playTrack(track, queueContext);
    }
  };

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/artist/${track.artist.id}`);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition select-none ${
        isCurrent ? 'bg-neutral-900 border border-emerald-500/20' : 'hover:bg-neutral-900/60'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
          <img
            src={track.artworkUrl || 'https://via.placeholder.com/100'}
            alt={track.title}
            className="w-full h-full object-cover"
          />
          {isCurrent && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              {isPlaying ? (
                <Pause size={16} fill="white" className="text-white" />
              ) : (
                <Play size={16} fill="white" className="text-white ml-0.5" />
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold truncate ${
              isCurrent ? 'text-emerald-400' : 'text-neutral-100 group-hover:text-emerald-400'
            }`}
          >
            {track.title}
          </p>
          <button
            onClick={handleArtistClick}
            className="text-xs text-neutral-400 hover:text-emerald-400 truncate mt-0.5 text-left block"
          >
            {track.artist.name}
          </button>
          <span className="text-[10px] text-neutral-500 truncate block mt-0.5">
            {track.license}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-3 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track);
          }}
          className="p-1.5 text-neutral-500 hover:text-red-500 active:scale-90 transition"
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <Heart size={18} className={liked ? 'fill-red-500 text-red-500' : ''} />
        </button>

        <span className="text-xs text-neutral-500 font-mono w-10 text-right">
          {formatTime(track.duration)}
        </span>
      </div>
    </div>
  );
};
