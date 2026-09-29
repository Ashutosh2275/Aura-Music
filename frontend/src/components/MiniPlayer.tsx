import React from 'react';
import { Play, Pause, SkipForward, SkipBack, AlertCircle, X } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

interface MiniPlayerProps {
  onExpand: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const status = usePlayerStore((s) => s.status);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const skipNext = usePlayerStore((s) => s.skipNext);
  const skipPrevious = usePlayerStore((s) => s.skipPrevious);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const supersededNotice = usePlayerStore((s) => s.supersededNotice);
  const dismissSupersededNotice = usePlayerStore((s) => s.dismissSupersededNotice);

  if (!currentTrack) {
    if (supersededNotice) {
      return (
        <div className="fixed left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[480px] bottom-[calc(4.25rem+env(safe-area-inset-bottom,16px))] z-40 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 backdrop-blur-xl flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-amber-400" />
            <span>Playback paused: playing on another device.</span>
          </div>
          <button onClick={dismissSupersededNotice} className="p-1 hover:text-white">
            <X size={14} />
          </button>
        </div>
      );
    }
    return null;
  }

  const isPlaying = status === 'playing';
  const progressPercent = duration > 0 ? Math.min((position / duration) * 100, 100) : 0;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = Math.max(0, Math.min(clickX / rect.width, 1));
    if (duration > 0) {
      seekTo(newPercent * duration);
    }
  };

  return (
    <div className="fixed left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[480px] bottom-[calc(4.25rem+env(safe-area-inset-bottom,16px))] z-40 flex flex-col gap-2">
      {/* Superseded Single Active Device Notice */}
      {supersededNotice && (
        <div className="p-2.5 rounded-2xl bg-neutral-900/90 border border-amber-500/30 backdrop-blur-xl flex items-center justify-between text-xs text-amber-200 shadow-xl">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-amber-400" />
            <span>Playback switched to another device.</span>
          </div>
          <button onClick={dismissSupersededNotice} className="p-1 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Floating Capsule Player (Inspired by Reference Visual) */}
      <div
        onClick={onExpand}
        className="w-full rounded-full bg-neutral-950/80 backdrop-blur-2xl border border-white/20 shadow-[0_16px_50px_rgba(0,0,0,0.85)] p-2 pl-2.5 pr-3 flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] transition-transform select-none"
      >
        {/* Left: Circular Artwork with Vinyl Spindle Aesthetic */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/25 shadow-md bg-neutral-900 flex items-center justify-center">
          <img
            src={currentTrack.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80'}
            alt={currentTrack.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''
            }`}
          />
          {/* Center spindle dot */}
          <div className="absolute w-2.5 h-2.5 rounded-full bg-neutral-950/80 border border-white/40 shadow-sm pointer-events-none" />
        </div>

        {/* Center: Track Info + Sleek In-Capsule Progress Bar */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-sm">
            {currentTrack.title}
          </p>
          <p className="text-[11px] text-neutral-400 font-medium truncate drop-shadow-sm -mt-0.5">
            {currentTrack.artist.name}
          </p>

          {/* Inline Sleek Progress Bar with Timestamps */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] text-neutral-400 font-mono tracking-tight shrink-0">
              {formatTime(position)}
            </span>
            <div
              onClick={handleProgressBarClick}
              className="relative h-1 flex-1 bg-white/15 rounded-full overflow-hidden cursor-pointer group py-1"
            >
              <div
                className="h-full bg-white rounded-full group-hover:bg-emerald-400 transition-colors"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[9px] text-neutral-400 font-mono tracking-tight shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Pill Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Previous */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              skipPrevious();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-neutral-300 hover:text-white transition"
            aria-label="Previous track"
          >
            <SkipBack size={14} fill="currentColor" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="w-10 h-10 rounded-full bg-white text-neutral-950 active:scale-95 flex items-center justify-center shadow-lg hover:bg-neutral-100 transition"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={17} fill="currentColor" />
            ) : (
              <Play size={17} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              skipNext();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-neutral-300 hover:text-white transition"
            aria-label="Next track"
          >
            <SkipForward size={14} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};
