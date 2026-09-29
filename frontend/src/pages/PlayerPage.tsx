import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FullPlayerModal } from '../components/FullPlayerModal';
import { usePlayerStore } from '../store/playerStore';

export const PlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  if (!currentTrack) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center text-neutral-400">
        <p className="text-sm">No track currently playing</p>
        <button
          onClick={() => navigate('/home')}
          className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <FullPlayerModal
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  );
};
