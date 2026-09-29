import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Shuffle, Trash2, Edit3, Music2 } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { TrackRow } from '../components/TrackRow';

function getRandomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

export const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playlists = usePlayerStore((s) => s.playlists);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const renamePlaylist = usePlayerStore((s) => s.renamePlaylist);
  const deletePlaylist = usePlayerStore((s) => s.deletePlaylist);
  const removeTrackFromPlaylist = usePlayerStore((s) => s.removeTrackFromPlaylist);

  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const playlist = playlists.find((p) => p.id === id);

  if (!playlist) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center text-neutral-400">
        <p className="text-sm">Playlist not found.</p>
        <button
          onClick={() => navigate('/library')}
          className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition"
        >
          Back to Library
        </button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const handleShufflePlay = () => {
    if (playlist.tracks.length > 0) {
      toggleShuffle();
      const randomIndex = getRandomIndex(playlist.tracks.length);
      playTrack(playlist.tracks[randomIndex], playlist.tracks);
    }
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      renamePlaylist(playlist.id, newTitle.trim());
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${playlist.title}"?`)) {
      deletePlaylist(playlist.id);
      navigate('/library', { replace: true });
    }
  };

  const totalDuration = playlist.tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const durationMin = Math.round(totalDuration / 60);

  return (
    <div className="pb-36 pt-4 max-w-lg mx-auto min-h-screen text-white font-sans px-4">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-white/5 text-neutral-400 hover:text-white transition"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setNewTitle(playlist.title);
              setIsEditing(true);
            }}
            className="p-2 text-neutral-400 hover:text-white transition"
            aria-label="Edit title"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-neutral-400 hover:text-red-400 transition"
            aria-label="Delete playlist"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Playlist Hero Banner */}
      <div className="mb-6 p-5 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-4">
        <div className="w-24 h-24 rounded-2xl bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
          {playlist.artworkUrl ? (
            <img src={playlist.artworkUrl} alt={playlist.title} className="w-full h-full object-cover" />
          ) : (
            <Music2 size={36} className="text-neutral-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <form onSubmit={handleRename} className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                className="w-full px-2.5 py-1 rounded-lg bg-neutral-950 border border-white/20 text-sm text-white"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded-lg bg-white text-neutral-950 text-xs font-bold"
              >
                Save
              </button>
            </form>
          ) : (
            <h1 className="text-xl font-bold text-white truncate drop-shadow-sm">{playlist.title}</h1>
          )}
          <p className="text-xs text-neutral-400 mt-1">
            {playlist.tracks.length} tracks • {durationMin} min
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">Custom User Playlist</p>
        </div>
      </div>

      {/* Actions */}
      {playlist.tracks.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handlePlayAll}
            className="flex-1 py-3 px-4 rounded-2xl bg-white text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-100 active:scale-95 shadow-md transition"
          >
            <Play size={16} fill="currentColor" />
            <span>Play All</span>
          </button>
          <button
            onClick={handleShufflePlay}
            className="py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition"
          >
            <Shuffle size={16} />
            <span>Shuffle</span>
          </button>
        </div>
      )}

      {/* Track List */}
      <section className="space-y-1">
        {playlist.tracks.length > 0 ? (
          playlist.tracks.map((track) => (
            <div key={track.id} className="relative group">
              <TrackRow track={track} queueContext={playlist.tracks} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTrackFromPlaylist(playlist.id, track.id);
                }}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-red-400 opacity-60 hover:opacity-100 transition"
                title="Remove from playlist"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="py-12 text-center bg-neutral-900/30 rounded-2xl border border-white/5">
            <Music2 size={32} className="mx-auto text-neutral-600 mb-2" />
            <p className="text-sm text-neutral-400 font-semibold">Playlist is empty</p>
            <p className="text-xs text-neutral-600 mt-1 max-w-[220px] mx-auto">
              Add songs from Home, Search, or Trending using the + icon in the player.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
