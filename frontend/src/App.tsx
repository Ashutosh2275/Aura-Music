import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePlayerStore } from './store/playerStore';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LibraryPage } from './pages/LibraryPage';
import { BottomNav } from './components/BottomNav';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayerModal } from './components/FullPlayerModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function App() {
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const initialize = usePlayerStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col justify-between selection:bg-emerald-500/30">
          {/* Main View Area */}
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/library" element={<LibraryPage />} />
            </Routes>
          </main>

          {/* Persistent Mini Player */}
          <MiniPlayer onExpand={() => setIsFullPlayerOpen(true)} />

          {/* Fullscreen Player Modal */}
          <FullPlayerModal
            isOpen={isFullPlayerOpen}
            onClose={() => setIsFullPlayerOpen(false)}
          />

          {/* Primary Bottom Navigation */}
          <BottomNav />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
