import React, { useState } from 'react';
import { X, Play, Sparkles, ListMusic, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchTrendingTracks, fetchRecommendations } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '../audio/types';

interface QueueOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueueOverlay: React.FC<QueueOverlayProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'discover'>('queue');

  const queue = usePlayerStore((s) => s.queue);
  const queueIndex = usePlayerStore((s) => s.queueIndex);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const toggleLike = usePlayerStore((s) => s.toggleLike);
  const isLiked = usePlayerStore((s) => s.isLiked);

  const { data: trendingTracks = [] } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrendingTracks,
    enabled: isOpen,
  });

  const { data: recommendedTracks = [] } = useQuery({
    queryKey: ['recommendations'],
    queryFn: fetchRecommendations,
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const handlePlay = (track: Track, context: Track[]) => {
    playTrack(track, context);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[85vh] rounded-3xl bg-neutral-900/90 border border-white/15 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col backdrop-blur-2xl">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === 'queue'
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Up Next ({queue.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === 'discover'
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Discover Tracks
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pt-3 pr-1">
          {activeTab === 'queue' ? (
            queue.length > 0 ? (
              queue.map((track, idx) => {
                const isCurrent = idx === queueIndex;
                const liked = isLiked(track.id);
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => handlePlay(track, queue)}
                    className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition select-none ${
                      isCurrent
                        ? 'bg-white/15 border border-white/20'
                        : 'bg-white/[0.02] hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-800 shrink-0">
                        <img
                          src={track.artworkUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=120'}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play size={14} fill="white" className="text-white ml-0.5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isCurrent ? 'text-white' : 'text-neutral-200 group-hover:text-white'
                          }`}
                        >
                          {track.title}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">{track.artist.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track);
                        }}
                        className="p-1 text-neutral-500 hover:text-red-400 transition"
                      >
                        <Heart size={16} className={liked ? 'fill-red-500 text-red-500' : ''} />
                      </button>
                      <span className="text-xs text-neutral-500 font-mono">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-neutral-400">
                <ListMusic size={32} className="mx-auto text-neutral-600 mb-2" />
                <p className="text-sm font-medium">Queue is empty</p>
                <p className="text-xs text-neutral-600 mt-1">Select a track to build your queue.</p>
              </div>
            )
          ) : (
            /* Discover Tab: Recommended & Trending */
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2 px-1 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  <Sparkles size={14} className="text-emerald-400" />
                  <span>Recommended for You</span>
                </div>
                <div className="space-y-1">
                  {recommendedTracks.slice(0, 5).map((track) => (
                    <div
                      key={`rec-${track.id}`}
                      onClick={() => handlePlay(track, recommendedTracks)}
                      className="group flex items-center justify-between p-2 rounded-2xl bg-white/[0.02] hover:bg-white/10 cursor-pointer transition select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={track.artworkUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100'}
                          alt={track.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{track.artist.name}</p>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-500 font-mono pl-2">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2 px-1 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  <Play size={14} className="text-emerald-400" />
                  <span>Trending on Jamendo</span>
                </div>
                <div className="space-y-1">
                  {trendingTracks.slice(0, 8).map((track) => (
                    <div
                      key={`trend-${track.id}`}
                      onClick={() => handlePlay(track, trendingTracks)}
                      className="group flex items-center justify-between p-2 rounded-2xl bg-white/[0.02] hover:bg-white/10 cursor-pointer transition select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={track.artworkUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100'}
                          alt={track.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{track.artist.name}</p>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-500 font-mono pl-2">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
