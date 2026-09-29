import React, { useState, useEffect } from 'react';
import { Search, User as UserIcon, ListMusic, Play, Radio, Volume2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchTrendingTracks } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { getCurrentUser, subscribeToAuth, waitForAuthInit } from '../services/firebase';
import { FloatingPlayer } from '../components/FloatingPlayer';
import { SearchOverlay } from '../components/SearchOverlay';
import { AccountOverlay } from '../components/AccountOverlay';
import { QueueOverlay } from '../components/QueueOverlay';
import { FullPlayerModal } from '../components/FullPlayerModal';
import type { User } from 'firebase/auth';

export const SingleScreenPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [authReady, setAuthReady] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const status = usePlayerStore((s) => s.status);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);

  useEffect(() => {
    waitForAuthInit().then((u) => {
      setUser(u);
      setAuthReady(true);
      if (!u) {
        setIsAccountOpen(true);
      }
    });

    const unsubscribe = subscribeToAuth((u) => {
      setUser(u);
      setAuthReady(true);
      if (u) {
        setIsAccountOpen(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const { data: trendingTracks = [] } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrendingTracks,
  });

  const isPlaying = status === 'playing';

  // Dynamic atmospheric background
  const backgroundArtwork =
    currentTrack?.artworkUrl ||
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80';

  const handleStartListening = () => {
    if (currentTrack) {
      togglePlayPause();
    } else if (trendingTracks.length > 0) {
      playTrack(trendingTracks[0], trendingTracks);
    }
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden flex flex-col justify-between p-4 sm:p-7 pt-safe pb-safe text-white font-sans selection:bg-white/20 select-none">
      {/* 1. Full-Screen Cinematic Visual Background */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-40 blur-2xl scale-110 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: `url("${backgroundArtwork}")` }}
      />
      {/* Dark gradient & atmospheric vignette overlay for text readability */}
      <div className="fixed inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/40 to-neutral-950/70 pointer-events-none" />

      {/* 2. TOP AREA: Minimal & Elegant Controls */}
      <header className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <span className="text-sm sm:text-base font-black tracking-widest uppercase text-white drop-shadow-md">
            AURA
          </span>
          <span className="text-[10px] font-semibold text-neutral-400 tracking-wider bg-white/10 px-2 py-0.5 rounded-full border border-white/10 hidden sm:inline-block">
            192K LOSSLESS
          </span>
        </div>

        {/* Top Control Icons */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 rounded-full bg-neutral-950/40 hover:bg-white/15 active:scale-95 text-neutral-300 hover:text-white backdrop-blur-xl border border-white/15 transition shadow-lg"
            aria-label="Search music"
          >
            <Search size={18} />
          </button>

          {/* Queue / Discover Button */}
          <button
            onClick={() => setIsQueueOpen(true)}
            className="p-2.5 rounded-full bg-neutral-950/40 hover:bg-white/15 active:scale-95 text-neutral-300 hover:text-white backdrop-blur-xl border border-white/15 transition shadow-lg"
            aria-label="Queue and Discover"
          >
            <ListMusic size={18} />
          </button>

          {/* Account Button */}
          <button
            onClick={() => setIsAccountOpen(true)}
            className="p-2.5 rounded-full bg-neutral-950/40 hover:bg-white/15 active:scale-95 text-neutral-300 hover:text-white backdrop-blur-xl border border-white/15 transition shadow-lg relative"
            aria-label="Account"
          >
            <UserIcon size={18} />
            {!user && authReady && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-neutral-950" />
            )}
          </button>
        </div>
      </header>

      {/* 3. CENTER AREA: High Visual Focus & Large Breathing Space */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto px-4 max-w-xl mx-auto w-full">
        {currentTrack ? (
          /* Currently Playing Context */
          <div className="space-y-3 animate-in fade-in duration-500">
            {/* Ambient Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-sm">
              <Radio size={13} className="text-emerald-400" />
              <span className="text-[11px] font-semibold text-neutral-200 tracking-wide uppercase">
                {isPlaying ? 'Now Playing' : 'Paused'}
              </span>
            </div>

            {/* Song Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-xl line-clamp-2 leading-tight">
              {currentTrack.title}
            </h1>

            {/* Artist & Context */}
            <p className="text-sm sm:text-base font-semibold text-neutral-300 drop-shadow">
              {currentTrack.artist.name}
            </p>

            {/* Subtle licensing / stream status */}
            <p className="text-[11px] text-neutral-400 tracking-wider font-medium">
              Jamendo v3 • Permitted Streaming
            </p>
          </div>
        ) : (
          /* Initial Ambient State (When Opened) */
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-sm">
              <Volume2 size={14} className="text-emerald-400" />
              <span className="text-xs font-semibold text-neutral-200 tracking-wider uppercase">
                Atmospheric Music
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-widest uppercase text-white drop-shadow-2xl">
              AURA MUSIC
            </h1>

            <p className="text-xs sm:text-sm font-medium tracking-wide text-neutral-300 drop-shadow max-w-xs mx-auto">
              Pure Sound • Zero Distractions • Ad-Free
            </p>

            {/* One-tap Start Listening CTA */}
            <div className="pt-2">
              <button
                onClick={handleStartListening}
                className="py-3 px-6 rounded-full bg-white text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-neutral-100 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition mx-auto cursor-pointer"
              >
                <Play size={16} fill="currentColor" />
                <span>Start Listening</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM AREA: Floating Compact Music Player */}
      <div className="relative z-10 w-full flex flex-col items-center gap-2">
        <FloatingPlayer onExpand={() => setIsFullPlayerOpen(true)} />

        {/* Minimal Footer Watermark */}
        <p className="text-[10px] text-neutral-500 tracking-wider font-medium select-none pt-1">
          Aura Music • Ad-Free • Privacy-First
        </p>
      </div>

      {/* 5. In-Screen Overlays (Zero Page Switching) */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AccountOverlay
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        forceAuthMode={!user && authReady}
      />
      <QueueOverlay isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
      <FullPlayerModal isOpen={isFullPlayerOpen} onClose={() => setIsFullPlayerOpen(false)} />
    </div>
  );
};
