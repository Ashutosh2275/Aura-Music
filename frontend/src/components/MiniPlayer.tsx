import React from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

interface MiniPlayerProps {
  onExpand: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const status = usePlayerStore((s) => s.status);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const skipNext = usePlayerStore((s) => s.skipNext);

  if (!currentTrack) return null;

  const isPlaying = status === 'playing';
  const progressPercent = duration > 0 ? Math.min((position / duration) * 100, 100) : 0;

  return (
    <div
      onClick={onExpand}
      className="fixed left-2 right-2 bottom-[calc(3.75rem+env(safe-area-inset-bottom,16px))] z-30 bg-neutral-900/95 backdrop-blur-lg border border-neutral-800 rounded-xl shadow-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition-transform max-w-lg mx-auto"
    >
      {/* Progress line */}
      <div className="h-[2px] w-full bg-neutral-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between p-2.5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img
            src={currentTrack.artworkUrl || 'https://via.placeholder.com/100'}
            alt={currentTrack.title}
            className="w-11 h-11 rounded-lg object-cover bg-neutral-800 shadow-sm shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-neutral-100 truncate">{currentTrack.title}</p>
            <p className="text-xs text-neutral-400 truncate">{currentTrack.artist.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-950 flex items-center justify-center hover:bg-white active:scale-95 transition"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              skipNext();
            }}
            className="p-2 text-neutral-400 hover:text-neutral-100 active:scale-95 transition"
            aria-label="Next track"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
