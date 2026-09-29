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
  PlusCircle,
  Check,
} from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

interface FullPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [showQueue, setShowQueue] = useState(false);
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const queue = usePlayerStore((s) => s.queue);
  const queueIndex = usePlayerStore((s) => s.queueIndex);
  const status = usePlayerStore((s) => s.status);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const isShuffle = usePlayerStore((s) => s.isShuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const playlists = usePlayerStore((s) => s.playlists);

  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const skipNext = usePlayerStore((s) => s.skipNext);
  const skipPrevious = usePlayerStore((s) => s.skipPrevious);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeatMode = usePlayerStore((s) => s.cycleRepeatMode);
  const toggleLike = usePlayerStore((s) => s.toggleLike);
  const isLiked = usePlayerStore((s) => s.isLiked);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const addTrackToPlaylist = usePlayerStore((s) => s.addTrackToPlaylist);
  const createPlaylist = usePlayerStore((s) => s.createPlaylist);

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

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;
    const pl = createPlaylist(newPlaylistTitle.trim());
    addTrackToPlaylist(pl.id, currentTrack);
    setNewPlaylistTitle('');
    setShowPlaylistPicker(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col justify-between p-6 pt-safe pb-safe overflow-hidden animate-in fade-in slide-in-from-bottom duration-300">
      {/* Dynamic Background Glow */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 blur-3xl scale-125 pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `url("${currentTrack.artworkUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'}")`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/90 to-neutral-950 pointer-events-none" />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-neutral-400 hover:text-white transition active:scale-95"
          aria-label="Collapse player"
        >
          <ChevronDown size={28} />
        </button>

        <div className="text-center flex-1 px-4">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
            Aura Music Player
          </p>
          {currentTrack.album?.id ? (
            <button
              onClick={handleAlbumClick}
              className="text-xs font-semibold text-neutral-300 hover:text-white truncate max-w-[200px] mx-auto block transition"
            >
              {currentTrack.album.title}
            </button>
          ) : (
            <p className="text-xs font-semibold text-neutral-400 truncate max-w-[200px] mx-auto">
              Single Stream
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowPlaylistPicker(!showPlaylistPicker)}
            className={`p-2 transition active:scale-95 ${
              showPlaylistPicker ? 'text-white' : 'text-neutral-400 hover:text-white'
            }`}
            aria-label="Add to playlist"
          >
            <PlusCircle size={22} />
          </button>
          <button
            onClick={() => {
              setShowQueue(!showQueue);
              setShowPlaylistPicker(false);
            }}
            className={`p-2 transition active:scale-95 ${
              showQueue ? 'text-white' : 'text-neutral-400 hover:text-white'
            }`}
            aria-label="Toggle queue"
          >
            <ListMusic size={22} />
          </button>
        </div>
      </div>

      {/* Playlist Picker Popover */}
      {showPlaylistPicker && (
        <div className="relative z-20 my-4 p-4 rounded-2xl bg-neutral-900/95 border border-white/10 backdrop-blur-xl shadow-2xl max-h-[45vh] overflow-y-auto">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Add to Playlist
          </h4>
          <div className="space-y-1 mb-4">
            {playlists.map((pl) => {
              const inPlaylist = pl.tracks.some((t) => t.id === currentTrack.id);
              return (
                <button
                  key={pl.id}
                  onClick={() => {
                    addTrackToPlaylist(pl.id, currentTrack);
                    setShowPlaylistPicker(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-left text-xs transition"
                >
                  <span className="font-semibold text-neutral-200">{pl.title}</span>
                  {inPlaylist ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <Check size={14} /> Added
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-500">Tap to add</span>
                  )}
                </button>
              );
            })}
          </div>
          <form onSubmit={handleCreateAndAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="New playlist name..."
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-white text-neutral-950 font-bold text-xs"
            >
              Create
            </button>
          </form>
        </div>
      )}

      {showQueue ? (
        /* Queue View */
        <div className="relative z-10 flex-1 my-6 overflow-y-auto max-h-[55vh]">
          <h3 className="text-xs font-bold text-neutral-400 mb-3 uppercase tracking-wider">
            Up Next ({queue.length})
          </h3>
          <div className="space-y-1.5">
            {queue.map((track, idx) => {
              const isCurrent = idx === queueIndex;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => playTrack(track, queue)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition ${
                    isCurrent
                      ? 'bg-white/10 border border-white/20'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <img
                    src={track.artworkUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100'}
                    alt={track.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate font-semibold ${
                        isCurrent ? 'text-white' : 'text-neutral-300'
                      }`}
                    >
                      {track.title}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">{track.artist.name}</p>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono">{formatTime(track.duration)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Standard Visual Player View */
        <div className="relative z-10 my-auto py-4 flex flex-col items-center">
          {/* Large Artwork */}
          <div className="relative w-[72vw] max-w-[300px] aspect-square rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] bg-neutral-900 border border-white/10">
            <img
              src={
                currentTrack.artworkUrl ||
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
              }
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Track Meta & Like */}
          <div className="w-full max-w-[320px] mt-6 flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-3">
              <h2 className="text-xl font-bold text-white truncate drop-shadow">
                {currentTrack.title}
              </h2>
              <button
                onClick={handleArtistClick}
                className="text-sm font-medium text-neutral-400 hover:text-white truncate mt-0.5 text-left block transition"
              >
                {currentTrack.artist.name}
              </button>
            </div>
            <button
              onClick={() => toggleLike(currentTrack)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-red-400 active:scale-90 transition"
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <Heart size={22} className={liked ? 'fill-red-500 text-red-500' : ''} />
            </button>
          </div>
        </div>
      )}

      {/* Scrub Bar & Controls */}
      <div className="relative z-10 space-y-4 pt-2">
        {/* Scrubber */}
        <div className="space-y-1.5 max-w-[340px] mx-auto w-full">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={position}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 font-mono tracking-tight">
            <span>{formatTime(position)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-between max-w-[320px] mx-auto w-full">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition active:scale-90 ${
              isShuffle ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            aria-label="Shuffle"
          >
            <Shuffle size={19} />
          </button>

          <button
            onClick={skipPrevious}
            className="p-2 text-neutral-200 hover:text-white active:scale-90 transition"
            aria-label="Previous track"
          >
            <SkipBack size={24} fill="currentColor" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-white text-neutral-950 flex items-center justify-center hover:bg-neutral-100 active:scale-95 shadow-xl transition"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play size={28} fill="currentColor" className="ml-1" />
            )}
          </button>

          <button
            onClick={skipNext}
            className="p-2 text-neutral-200 hover:text-white active:scale-90 transition"
            aria-label="Next track"
          >
            <SkipForward size={24} fill="currentColor" />
          </button>

          <button
            onClick={cycleRepeatMode}
            className={`p-2 transition active:scale-90 ${
              repeatMode !== 'off' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            aria-label="Repeat mode"
          >
            {repeatMode === 'track' ? <Repeat1 size={19} /> : <Repeat size={19} />}
          </button>
        </div>

        {/* Media Session / iOS Background Indicator */}
        <div className="flex items-center justify-center gap-1.5 py-1 text-[10px] text-neutral-500">
          <Radio size={12} className={hasMediaSession ? 'text-emerald-400' : 'text-neutral-600'} />
          <span>
            {hasMediaSession
              ? 'Lock Screen & Background Audio Active'
              : 'HTML5 Audio Mode'}
          </span>
        </div>
      </div>
    </div>
  );
};
