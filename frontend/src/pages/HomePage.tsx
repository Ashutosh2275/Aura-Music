import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  User as UserIcon,
  Play,
  TrendingUp,
  Sparkles,
  Clock,
  Radio,
  Compass,
} from 'lucide-react';
import { fetchTrendingTracks, fetchRecommendations } from '../services/api';
import { TrackRow } from '../components/TrackRow';
import { InstallPromptBanner } from '../components/InstallPromptBanner';
import { AccountModal } from '../components/AccountModal';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '../audio/types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const recentlyPlayed = usePlayerStore((s) => s.recentlyPlayed);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const { data: trendingTracks = [] } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrendingTracks,
  });

  const { data: recommendedTracks = [] } = useQuery({
    queryKey: ['recommendations'],
    queryFn: fetchRecommendations,
  });

  // Dynamic atmospheric background image
  const backgroundArtwork =
    currentTrack?.artworkUrl ||
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80';

  const heroTrack: Track | undefined = currentTrack || trendingTracks[0] || recommendedTracks[0];

  const genres = [
    { name: 'Lo-Fi Study', query: 'lofi' },
    { name: 'Ambient Chill', query: 'ambient' },
    { name: 'Acoustic Piano', query: 'piano' },
    { name: 'Deep Focus', query: 'focus' },
    { name: 'Electronic Drift', query: 'electronic' },
  ];

  return (
    <div className="relative min-h-screen text-white font-sans overflow-x-hidden selection:bg-white/20 pb-44">
      {/* Fullscreen Atmospheric Dynamic Background (Universal Music-First) */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: `url("${backgroundArtwork}")` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/85 to-neutral-950 pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-3">
        {/* Top Bar: Minimal & Functional */}
        <header className="flex items-center justify-between py-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-black tracking-widest uppercase text-white">
              AURA
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/search')}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-neutral-300 hover:text-white transition border border-white/5"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <button
              onClick={() => setIsAccountOpen(true)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-neutral-300 hover:text-white transition border border-white/5"
              aria-label="Account"
            >
              <UserIcon size={18} />
            </button>
          </div>
        </header>

        {/* PWA Home Screen Installation Guide */}
        <InstallPromptBanner />

        {/* Hero Banner: Atmospheric Spotlight */}
        {heroTrack && (
          <div className="relative mb-8 rounded-3xl overflow-hidden border border-white/15 bg-neutral-900/60 backdrop-blur-xl shadow-2xl p-6 flex flex-col justify-end min-h-[220px]">
            {/* Backdrop visual inside hero */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: `url("${heroTrack.artworkUrl || backgroundArtwork}")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider mb-2">
                <Radio size={12} className="text-emerald-400" />
                <span>{currentTrack ? 'Now Playing' : 'Featured Atmosphere'}</span>
              </div>
              <h2 className="text-2xl font-black text-white truncate drop-shadow-md">
                {heroTrack.title}
              </h2>
              <p className="text-xs font-medium text-neutral-300 truncate mt-0.5 drop-shadow">
                {heroTrack.artist.name}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => playTrack(heroTrack, trendingTracks)}
                  className="py-2.5 px-5 rounded-full bg-white text-neutral-950 font-bold text-xs flex items-center gap-2 hover:bg-neutral-100 active:scale-95 shadow-lg transition"
                >
                  <Play size={14} fill="currentColor" />
                  <span>{currentTrack?.id === heroTrack.id ? 'Resume' : 'Play Now'}</span>
                </button>
                <span className="text-[11px] text-neutral-400 font-medium">
                  {Math.round(heroTrack.duration / 60)} min • Ad-free
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Continue Listening (if history exists) */}
        {recentlyPlayed.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Clock size={15} className="text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Continue Listening
              </h3>
            </div>
            <div className="space-y-1.5">
              {recentlyPlayed.slice(0, 3).map((track) => (
                <TrackRow
                  key={`continue-${track.id}`}
                  track={track}
                  queueContext={recentlyPlayed}
                />
              ))}
            </div>
          </section>
        )}

        {/* Trending Tracks (Jamendo Live Catalog) */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Trending Tracks
              </h3>
            </div>
            <span className="text-[10px] text-neutral-500 font-medium">Jamendo v3</span>
          </div>

          {/* Horizontal Scrolling Cards */}
          <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x -mx-4 px-4">
            {trendingTracks.slice(0, 8).map((track) => (
              <div
                key={`trending-card-${track.id}`}
                onClick={() => playTrack(track, trendingTracks)}
                className="w-36 shrink-0 snap-start rounded-2xl bg-neutral-900/60 border border-white/10 p-2.5 backdrop-blur-md hover:bg-white/5 active:scale-[0.98] transition cursor-pointer group"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-neutral-800">
                  <img
                    src={track.artworkUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300'}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <div className="w-8 h-8 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-lg">
                      <Play size={14} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                </div>
                <p className="text-xs font-bold text-white truncate">{track.title}</p>
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                  {track.artist.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended Discovery (Multi-signal Recommender) */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Sparkles size={15} className="text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Recommended for You
            </h3>
          </div>
          <div className="space-y-1.5">
            {recommendedTracks.slice(0, 5).map((track) => (
              <TrackRow
                key={`rec-${track.id}`}
                track={track}
                queueContext={recommendedTracks}
              />
            ))}
          </div>
        </section>

        {/* Discover by Genre / Vibe */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Compass size={15} className="text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Discover Atmospheres
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button
                key={g.name}
                onClick={() => navigate(`/search?q=${encodeURIComponent(g.query)}`)}
                className="py-2 px-4 rounded-xl bg-neutral-900/70 border border-white/10 hover:border-white/20 text-xs font-medium text-neutral-300 hover:text-white transition active:scale-95"
              >
                {g.name}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Account Modal */}
      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </div>
  );
};
