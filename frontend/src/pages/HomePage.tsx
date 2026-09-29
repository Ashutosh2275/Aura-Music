import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, TrendingUp, Clock, ShieldCheck } from 'lucide-react';
import { fetchTrendingTracks, fetchRecommendations } from '../services/api';
import { TrackRow } from '../components/TrackRow';
import { InstallPromptBanner } from '../components/InstallPromptBanner';
import { usePlayerStore } from '../store/playerStore';

export const HomePage: React.FC = () => {
  const recentlyPlayed = usePlayerStore((s) => s.recentlyPlayed);

  const { data: trendingTracks = [] } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrendingTracks,
  });

  const { data: recommendedTracks = [] } = useQuery({
    queryKey: ['recommendations'],
    queryFn: fetchRecommendations,
  });

  return (
    <div className="pb-36 pt-4 max-w-lg mx-auto">
      {/* Header */}
      <header className="px-5 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">AURA MUSIC</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span className="text-[11px] font-medium text-emerald-400">
              Ad-Free • Privacy-First PWA
            </span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          <Sparkles size={16} className="text-neutral-400" />
        </div>
      </header>

      {/* PWA iPhone Home Screen Guide */}
      <InstallPromptBanner />

      {/* Continue Listening / Most Recent */}
      {recentlyPlayed.length > 0 && (
        <section className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Clock size={16} className="text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
              Continue Listening
            </h2>
          </div>
          <div className="space-y-1">
            {recentlyPlayed.slice(0, 2).map((track) => (
              <TrackRow key={`continue-${track.id}`} track={track} queueContext={recentlyPlayed} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Tracks */}
      <section className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-2 px-1">
          <TrendingUp size={16} className="text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
            Trending Today
          </h2>
        </div>
        <div className="space-y-1">
          {trendingTracks.map((track) => (
            <TrackRow key={`trending-${track.id}`} track={track} queueContext={trendingTracks} />
          ))}
        </div>
      </section>

      {/* Recommended for You */}
      <section className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Sparkles size={16} className="text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
            Recommended Discovery
          </h2>
        </div>
        <div className="space-y-1">
          {recommendedTracks.map((track) => (
            <TrackRow key={`rec-${track.id}`} track={track} queueContext={recommendedTracks} />
          ))}
        </div>
      </section>

      {/* Recently Played Full List */}
      {recentlyPlayed.length > 2 && (
        <section className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Clock size={16} className="text-neutral-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
              Recently Played
            </h2>
          </div>
          <div className="space-y-1">
            {recentlyPlayed.slice(2, 6).map((track) => (
              <TrackRow key={`recent-${track.id}`} track={track} queueContext={recentlyPlayed} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
