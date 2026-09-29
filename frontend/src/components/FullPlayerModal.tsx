import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListMusic,
  Radio,
} from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

interface FullPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [showQueue, setShowQueue] = useState(false);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const queue = usePlayerStore((s) => s.queue);
  const queueIndex = usePlayerStore((s) => s.queueIndex);
  const status = usePlayerStore((s) => s.status);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const isShuffle = usePlayerStore((s) => s.isShuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);

  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const skipNext = usePlayerStore((s) => s.skipNext);
  const skipPrevious = usePlayerStore((s) => s.skipPrevious);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeatMode = usePlayerStore((s) => s.cycleRepeatMode);
  const toggleLike = usePlayerStore((s) => s.toggleLike);
  const isLiked = usePlayerStore((s) => s.isLiked);
  const playTrack = usePlayerStore((s) => s.playTrack);

  if (!isOpen || !currentTrack) return null;

  const isPlaying = status === 'playing';
  const hasMediaSession = 'mediaSession' in navigator;

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const liked = isLiked(currentTrack.id);

  const handleArtistClick = () => {
    onClose();
    navigate(`/artist/${currentTrack.artist.id}`);
  };

  const handleAlbumClick = () => {
    if (currentTrack.album?.id) {
      onClose();
      navigate(`/album/${currentTrack.album.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col justify-between p-6 pt-safe pb-safe overflow-y-auto animate-in fade-in slide-in-from-bottom duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-neutral-400 hover:text-neutral-100 transition active:scale-95"
          aria-label="Collapse player"
        >
          <ChevronDown size={28} />
        </button>

        <div className="text-center flex-1 px-4">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
            Playing from Catalog
          </p>
          {currentTrack.album?.id ? (
            <button
              onClick={handleAlbumClick}
              className="text-xs font-medium text-neutral-300 hover:text-emerald-400 truncate max-w-[200px] mx-auto block"
            >
              {currentTrack.album.title}
            </button>
          ) : (
            <p className="text-xs font-medium text-neutral-300 truncate max-w-[200px] mx-auto">
              Permitted Music Stream
            </p>
          )}
        </div>

        <button
          onClick={() => setShowQueue(!showQueue)}
          className={`p-2 -mr-2 transition active:scale-95 ${
            showQueue ? 'text-emerald-400' : 'text-neutral-400 hover:text-neutral-100'
          }`}
          aria-label="Toggle queue"
        >
          <ListMusic size={22} />
        </button>
      </div>

      {showQueue ? (
        /* Queue View */
        <div className="flex-1 my-6 overflow-y-auto max-h-[60vh]">
          <h3 className="text-sm font-semibold text-neutral-300 mb-3 uppercase tracking-wider">
            Up Next ({queue.length})
          </h3>
          <div className="space-y-2">
            {queue.map((track, idx) => {
              const isCurrent = idx === queueIndex;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => playTrack(track, queue)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition ${
                    isCurrent ? 'bg-neutral-800/80 border border-emerald-500/30' : 'hover:bg-neutral-900'
                  }`}
                >
                  <img
                    src={track.artworkUrl || 'https://via.placeholder.com/80'}
                    alt={track.title}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate font-medium ${isCurrent ? 'text-emerald-400' : 'text-neutral-200'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">{track.artist.name}</p>
                  </div>
                  <span className="text-xs text-neutral-500">{formatTime(track.duration)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Standard Player View */
        <>
          {/* Artwork */}
          <div className="my-auto py-2 flex flex-col items-center">
            <div className="relative w-[68vw] max-w-[280px] aspect-square max-h-[35vh] rounded-2xl overflow-hidden shadow-2xl bg-neutral-900 border border-neutral-800/60">
              <img
                src={currentTrack.artworkUrl || 'https://via.placeholder.com/400'}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Track Meta & Like */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-4">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 truncate">
                  {currentTrack.title}
                </h2>
                <button
                  onClick={handleArtistClick}
                  className="text-sm sm:text-base text-neutral-400 hover:text-emerald-400 truncate mt-0.5 text-left block"
                >
                  {currentTrack.artist.name}
                </button>
              </div>
              <button
                onClick={() => toggleLike(currentTrack.id)}
                className="p-2 text-neutral-400 hover:text-red-500 active:scale-90 transition"
                aria-label={liked ? 'Unlike' : 'Like'}
              >
                <Heart size={24} className={liked ? 'fill-red-500 text-red-500' : ''} />
              </button>
            </div>

            {/* License attribution */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400">
              <span>{currentTrack.license}</span>
            </div>
          </div>
        </>
      )}

      {/* Scrub Bar & Controls */}
      <div className="space-y-4 pt-4">
        {/* Scrubber */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={position}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
            <span>{formatTime(position)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition active:scale-90 ${
              isShuffle ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            aria-label="Shuffle"
          >
            <Shuffle size={20} />
          </button>

          <button
            onClick={skipPrevious}
            className="p-2 text-neutral-200 hover:text-white active:scale-90 transition"
            aria-label="Previous track"
          >
            <SkipBack size={26} />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-white text-neutral-950 flex items-center justify-center hover:bg-neutral-100 active:scale-95 shadow-lg shadow-white/10 transition"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>

          <button
            onClick={skipNext}
            className="p-2 text-neutral-200 hover:text-white active:scale-90 transition"
            aria-label="Next track"
          >
            <SkipForward size={26} />
          </button>

          <button
            onClick={cycleRepeatMode}
            className={`p-2 transition active:scale-90 ${
              repeatMode !== 'off' ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            aria-label="Repeat mode"
          >
            {repeatMode === 'track' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>

        {/* Media Session / iOS Background Indicator */}
        <div className="flex items-center justify-center gap-2 py-2 text-[11px] text-neutral-500 bg-neutral-900/60 rounded-lg border border-neutral-800/40">
          <Radio size={14} className={hasMediaSession ? 'text-emerald-400' : 'text-amber-500'} />
          <span>
            {hasMediaSession
              ? 'Media Session Active • iOS Lock Screen & Background Playback Supported'
              : 'Standard HTML5 Audio Playback'}
          </span>
        </div>
      </div>
    </div>
  );
};
