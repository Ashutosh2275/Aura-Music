import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Music, Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchCatalog, fetchTrendingTracks } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '../audio/types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const playTrack = usePlayerStore((s) => s.playTrack);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 280);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: defaultTrending = [] } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrendingTracks,
    enabled: isOpen,
  });

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search', debouncedTerm],
    queryFn: () => searchCatalog(debouncedTerm),
    enabled: isOpen && debouncedTerm.length > 0,
  });

  if (!isOpen) return null;

  const displayTracks = debouncedTerm.length > 0 ? searchResults : defaultTrending.slice(0, 10);

  const handleSelectTrack = (track: Track) => {
    playTrack(track, displayTracks);
    onClose();
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[85vh] rounded-3xl bg-neutral-900/90 border border-white/15 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col backdrop-blur-2xl">
        {/* Top Search Input */}
        <div className="relative flex items-center mb-4 shrink-0">
          <SearchIcon size={18} className="absolute left-3.5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tracks, artists, or atmospheres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full bg-neutral-950/80 border border-white/10 text-white rounded-2xl pl-10 pr-10 py-3 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white/30 transition"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-10 p-1 text-neutral-400 hover:text-white transition"
              aria-label="Clear input"
            >
              <X size={15} />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="ml-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition shrink-0"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between pb-2 px-1 text-xs text-neutral-400 font-medium shrink-0 border-b border-white/5">
          <span>{debouncedTerm ? `Results for "${debouncedTerm}"` : 'Trending on Jamendo'}</span>
          <span>{displayTracks.length} tracks</span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pt-3 pr-1">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-neutral-400 flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Searching music catalog...</span>
            </div>
          ) : displayTracks.length > 0 ? (
            displayTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track)}
                className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/10 border border-transparent hover:border-white/10 cursor-pointer transition select-none"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-800 shrink-0">
                    <img
                      src={track.artworkUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=120'}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <Play size={14} fill="white" className="text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-300 transition">
                      {track.title}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">{track.artist.name}</p>
                  </div>
                </div>
                <span className="text-xs text-neutral-500 font-mono pl-3 shrink-0">
                  {formatDuration(track.duration)}
                </span>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-neutral-400">
              <Music size={32} className="mx-auto text-neutral-600 mb-2" />
              <p className="text-sm font-medium">No tracks found</p>
              <p className="text-xs text-neutral-600 mt-1">Try another search keyword</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
