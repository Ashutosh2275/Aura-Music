import React, { useState } from 'react';
import { Heart, Play, Trash2, Shield, ListPlus } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { PERMITTED_TRACKS } from '../services/mockData';
import { TrackRow } from '../components/TrackRow';
import { deleteUserData } from '../services/api';

export const LibraryPage: React.FC = () => {
  const likes = usePlayerStore((s) => s.likes);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const [deletedSuccess, setDeletedSuccess] = useState(false);

  // Match liked IDs with catalog
  const likedTracks = PERMITTED_TRACKS.filter((t) => likes.includes(t.id));

  const handlePlayAllLikes = () => {
    if (likedTracks.length > 0) {
      playTrack(likedTracks[0], likedTracks);
    }
  };

  const handleDeleteAllData = async () => {
    if (
      window.confirm(
        'Privacy Right to Erasure:\n\nAre you sure you want to permanently delete all your likes, history, and pseudonymous interaction data?'
      )
    ) {
      await deleteUserData();
      setDeletedSuccess(true);
      setTimeout(() => setDeletedSuccess(false), 4000);
      window.location.reload();
    }
  };

  return (
    <div className="pb-36 pt-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="px-5 mb-5">
        <h1 className="text-2xl font-black tracking-tight text-white">Your Library</h1>
        <p className="text-xs text-neutral-400 mt-0.5">Stored pseudonomously on your device</p>
      </div>

      {/* Liked Tracks Header Card */}
      <div className="mx-4 mb-6 p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-900/60 border border-neutral-800 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Heart size={24} className="fill-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">Liked Songs</h2>
              <p className="text-xs text-neutral-400">{likedTracks.length} tracks favorited</p>
            </div>
          </div>

          {likedTracks.length > 0 && (
            <button
              onClick={handlePlayAllLikes}
              className="w-11 h-11 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center hover:bg-emerald-400 active:scale-95 shadow-md shadow-emerald-500/20 transition"
              aria-label="Play all liked songs"
            >
              <Play size={20} fill="currentColor" className="ml-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* Liked Tracks List */}
      <section className="px-4 mb-8">
        {likedTracks.length > 0 ? (
          <div className="space-y-1">
            {likedTracks.map((track) => (
              <TrackRow key={`liked-${track.id}`} track={track} queueContext={likedTracks} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-neutral-900/30 rounded-xl border border-neutral-900">
            <p className="text-sm text-neutral-400">No liked songs yet</p>
            <p className="text-xs text-neutral-600 mt-1">Tap the heart on any track to save it here</p>
          </div>
        )}
      </section>

      {/* Playlists Placeholder */}
      <section className="px-4 mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300">Playlists</h3>
          <button className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium">
            <ListPlus size={14} />
            <span>New Playlist</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-200">Favorites & Relax</p>
            <p className="text-xs text-neutral-500">Auto-generated • Offline ready</p>
          </div>
          <span className="text-xs text-neutral-500">{likedTracks.length} items</span>
        </div>
      </section>

      {/* Privacy Control & Data Deletion Panel */}
      <section className="px-4">
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-3">
          <div className="flex items-center gap-2 text-neutral-300">
            <Shield size={16} className="text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Privacy & Right to Erasure</h4>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Aura collects zero personally identifiable information (no name, email, phone, location,
            advertising IDs, or trackers). You can permanently purge all stored preferences,
            playlists, and telemetry at any time.
          </p>

          {deletedSuccess && (
            <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
              All user data and pseudonymous history successfully purged.
            </div>
          )}

          <button
            onClick={handleDeleteAllData}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-950/70 border border-red-800/50 text-red-400 text-xs font-semibold transition active:scale-95"
          >
            <Trash2 size={14} />
            <span>Delete All My Data & Reset</span>
          </button>
        </div>
      </section>
    </div>
  );
};
