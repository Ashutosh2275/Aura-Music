import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, X, Music, ArrowLeft } from 'lucide-react';
import { searchCatalog, fetchTrendingTracks } from '../services/api';
import { TrackRow } from '../components/TrackRow';

const GENRE_TAGS = ['All', 'Lo-Fi', 'Ambient', 'Piano', 'Electronic', 'Chillhop', 'Classical'];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedTerm, setDebouncedTerm] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
      if (searchTerm.trim()) {
        setSearchParams({ q: searchTerm.trim() }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, setSearchParams]);

  const { data: defaultCatalog = [] } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrendingTracks,
  });

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search', debouncedTerm],
    queryFn: () => searchCatalog(debouncedTerm),
    enabled: debouncedTerm.length > 0,
  });

  const activeTracks = debouncedTerm.length > 0 ? searchResults : defaultCatalog;

  const filteredTracks = activeTracks.filter((t) => {
    if (selectedGenre === 'All') return true;
    const g = selectedGenre.toLowerCase();
    return (
      t.genre?.some((item) => item.toLowerCase().includes(g)) ||
      t.tags?.some((item) => item.toLowerCase().includes(g)) ||
      t.title.toLowerCase().includes(g)
    );
  });

  return (
    <div className="pb-44 pt-3 max-w-lg mx-auto text-white font-sans px-4">
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-white/5 text-neutral-400 hover:text-white transition"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white">Search Music</h1>
      </div>

      {/* Search Input Box */}
      <div className="relative flex items-center mb-4">
        <SearchIcon size={18} className="absolute left-3.5 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search tracks, artists, or genres..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
          className="w-full bg-neutral-900/80 border border-white/10 text-white rounded-2xl pl-10 pr-10 py-3 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white/30 backdrop-blur-xl transition"
        />
        {searchTerm ? (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 p-1.5 text-neutral-400 hover:text-white"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {/* Genre Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none -mx-4 px-4">
        {GENRE_TAGS.map((genre) => {
          const isSelected = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                isSelected
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'bg-neutral-900/80 border border-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between py-2 px-1 text-xs text-neutral-400 font-medium">
        <span>{debouncedTerm ? `Results for "${debouncedTerm}"` : 'Trending Picks'}</span>
        <span>{filteredTracks.length} tracks</span>
      </div>

      {/* Results List */}
      <div className="space-y-1.5 mt-1">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-neutral-500">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2" />
            <span>Searching live catalog...</span>
          </div>
        ) : filteredTracks.length > 0 ? (
          filteredTracks.map((track) => (
            <TrackRow key={`search-${track.id}`} track={track} queueContext={filteredTracks} />
          ))
        ) : (
          <div className="py-16 text-center bg-neutral-900/30 rounded-2xl border border-white/5">
            <Music size={32} className="mx-auto text-neutral-600 mb-2" />
            <p className="text-sm font-semibold text-neutral-300">No tracks match your query</p>
            <p className="text-xs text-neutral-500 mt-1">Try searching for "Wish", "Lo-Fi", or "Piano"</p>
          </div>
        )}
      </div>
    </div>
  );
};
