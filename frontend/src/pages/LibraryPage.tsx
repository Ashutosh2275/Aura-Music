import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Play, Shuffle, Plus, ListMusic, Clock, ChevronRight } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { TrackRow } from '../components/TrackRow';

type LibraryTab = 'likes' | 'playlists' | 'recents';

function getRandomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LibraryTab>('likes');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');

  const likedTracks = usePlayerStore((s) => s.likedTracks);
  const playlists = usePlayerStore((s) => s.playlists);
  const recentlyPlayed = usePlayerStore((s) => s.recentlyPlayed);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const createPlaylist = usePlayerStore((s) => s.createPlaylist);

  const handlePlayAllLikes = () => {
    if (likedTracks.length > 0) {
      playTrack(likedTracks[0], likedTracks);
    }
  };

  const handleShufflePlayLikes = () => {
    if (likedTracks.length > 0) {
      toggleShuffle();
      const randIdx = getRandomIndex(likedTracks.length);
      playTrack(likedTracks[randIdx], likedTracks);
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;
    const pl = createPlaylist(newPlaylistTitle.trim());
    setNewPlaylistTitle('');
    setIsCreatingPlaylist(false);
    navigate(`/playlist/${pl.id}`);
  };

  return (
    <div className="pb-44 pt-3 max-w-lg mx-auto text-white font-sans px-4">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Your Library</h1>
          <p className="text-xs text-neutral-400 mt-0.5">Saved locally and synced to your account</p>
        </div>

        {activeTab === 'playlists' && (
          <button
            onClick={() => setIsCreatingPlaylist(true)}
            className="py-1.5 px-3 rounded-full bg-white text-neutral-950 text-xs font-bold flex items-center gap-1.5 hover:bg-neutral-100 transition active:scale-95"
          >
            <Plus size={14} />
            <span>New</span>
          </button>
        )}
      </div>

      {/* Segmented Tab Controls */}
      <div className="grid grid-cols-3 p-1 mb-5 rounded-2xl bg-neutral-900/80 border border-white/10">
        <button
          onClick={() => setActiveTab('likes')}
          className={`py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'likes' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Liked ({likedTracks.length})
        </button>
        <button
          onClick={() => setActiveTab('playlists')}
          className={`py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'playlists' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Playlists ({playlists.length})
        </button>
        <button
          onClick={() => setActiveTab('recents')}
          className={`py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'recents' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Recent ({recentlyPlayed.length})
        </button>
      </div>

      {/* New Playlist Modal / Box */}
      {isCreatingPlaylist && (
        <div className="mb-5 p-4 rounded-2xl bg-neutral-900/90 border border-white/15 backdrop-blur-xl shadow-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Create New Playlist</h3>
          <form onSubmit={handleCreatePlaylist} className="flex gap-2">
            <input
              type="text"
              placeholder="Playlist name..."
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
              autoFocus
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingPlaylist(false)}
              className="px-3 py-2.5 rounded-xl bg-white/5 text-neutral-400 font-semibold text-xs hover:text-white"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Tab: Liked Songs */}
      {activeTab === 'likes' && (
        <div>
          {likedTracks.length > 0 && (
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={handlePlayAllLikes}
                className="flex-1 py-3 px-4 rounded-2xl bg-white text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-100 active:scale-95 shadow-md transition"
              >
                <Play size={15} fill="currentColor" />
                <span>Play All Likes</span>
              </button>
              <button
                onClick={handleShufflePlayLikes}
                className="py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition"
              >
                <Shuffle size={15} />
                <span>Shuffle</span>
              </button>
            </div>
          )}

          {likedTracks.length > 0 ? (
            <div className="space-y-1.5">
              {likedTracks.map((track) => (
                <TrackRow key={`liked-${track.id}`} track={track} queueContext={likedTracks} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-neutral-900/30 rounded-2xl border border-white/5">
              <Heart size={32} className="mx-auto text-neutral-600 mb-2" />
              <p className="text-sm font-semibold text-neutral-300">No liked songs yet</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-[240px] mx-auto">
                Tap the heart button on any track to save it directly to your library.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Playlists */}
      {activeTab === 'playlists' && (
        <div className="space-y-2">
          {playlists.length > 0 ? (
            playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => navigate(`/playlist/${pl.id}`)}
                className="p-3 rounded-2xl bg-neutral-900/60 border border-white/5 hover:border-white/15 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {pl.artworkUrl ? (
                      <img src={pl.artworkUrl} alt={pl.title} className="w-full h-full object-cover" />
                    ) : (
                      <ListMusic size={22} className="text-neutral-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{pl.title}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{pl.tracks.length} tracks</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-neutral-500 group-hover:text-white transition shrink-0" />
              </div>
            ))
          ) : (
            <div className="py-16 text-center bg-neutral-900/30 rounded-2xl border border-white/5">
              <ListMusic size={32} className="mx-auto text-neutral-600 mb-2" />
              <p className="text-sm font-semibold text-neutral-300">No playlists created yet</p>
              <p className="text-xs text-neutral-500 mt-1">Tap "+ New" above to organize your music.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Recently Played */}
      {activeTab === 'recents' && (
        <div>
          {recentlyPlayed.length > 0 ? (
            <div className="space-y-1.5">
              {recentlyPlayed.map((track) => (
                <TrackRow key={`recent-lib-${track.id}`} track={track} queueContext={recentlyPlayed} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-neutral-900/30 rounded-2xl border border-white/5">
              <Clock size={32} className="mx-auto text-neutral-600 mb-2" />
              <p className="text-sm font-semibold text-neutral-300">No listening history yet</p>
              <p className="text-xs text-neutral-500 mt-1">Songs you play will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
