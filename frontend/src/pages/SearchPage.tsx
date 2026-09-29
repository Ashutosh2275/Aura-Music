import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, X, Music } from 'lucide-react';
import { searchCatalog, fetchTrendingTracks } from '../services/api';
import { TrackRow } from '../components/TrackRow';

const GENRE_TAGS = ['All', 'Ambient', 'Lo-Fi', 'Chillhop', 'Electronic', 'Classical'];

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const { data: defaultCatalog = [] } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrendingTracks,
  });

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => searchCatalog(searchTerm),
    enabled: searchTerm.trim().length > 0,
  });

  const activeTracks = searchTerm.trim() ? searchResults : defaultCatalog;

  const filteredTracks = activeTracks.filter((t) => {
    if (selectedGenre === 'All') return true;
    return (
      t.genre?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase()) ||
      t.tags?.some((tag) => tag.toLowerCase() === selectedGenre.toLowerCase())
    );
  });

  return (
    <div className="pb-36 pt-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="px-5 mb-3">
        <h1 className="text-2xl font-black tracking-tight text-white mb-3">Search</h1>

        {/* Search Input Box */}
        <div className="relative flex items-center">
          <SearchIcon size={18} className="absolute left-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search tracks, artists, or moods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/80 transition"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 p-1 text-neutral-400 hover:text-neutral-200"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Genre Pills */}
      <div className="px-5 mb-4 flex gap-2 overflow-x-auto no-scrollbar py-1">
        {GENRE_TAGS.map((genre) => {
          const isSelected = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition active:scale-95 ${
                isSelected
                  ? 'bg-emerald-500 text-neutral-950 font-semibold shadow-sm shadow-emerald-500/20'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Results List */}
      <div className="px-4">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-neutral-500">Searching catalog...</div>
        ) : filteredTracks.length > 0 ? (
          <div className="space-y-1">
            {filteredTracks.map((track) => (
              <TrackRow key={`search-${track.id}`} track={track} queueContext={filteredTracks} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Music size={32} className="mx-auto text-neutral-600 mb-2" />
            <p className="text-sm text-neutral-400">No tracks match your query</p>
            <p className="text-xs text-neutral-600 mt-1">Try searching for "Aura", "Ghost", or "Ambient"</p>
          </div>
        )}
      </div>
    </div>
  );
};
