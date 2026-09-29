import React, { useState } from 'react';
import { X, User as UserIcon, LogOut, Trash2, ShieldCheck, Check, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { getCurrentUser, signOutUser, signInWithEmail, signUpWithEmail } from '../services/firebase';
import { deleteUserData } from '../services/api';
import { usePlayerStore } from '../store/playerStore';

interface AccountOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  forceAuthMode?: boolean;
}

export const AccountOverlay: React.FC<AccountOverlayProps> = ({ isOpen, onClose, forceAuthMode = false }) => {
  const user = getCurrentUser();
  const likedTracks = usePlayerStore((s) => s.likedTracks);
  const playlists = usePlayerStore((s) => s.playlists);

  // Auth form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Erasure state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email || !password) {
      setAuthError('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setIsAuthLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setAuthError('Invalid credentials. Please verify your email and password.');
      } else if (code === 'auth/email-already-in-use') {
        setAuthError('An account already exists with this email address.');
      } else if (code === 'auth/invalid-email') {
        setAuthError('Please enter a valid email address.');
      } else if (code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters.');
      } else {
        setAuthError(err?.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    onClose();
  };

  const handleDeleteData = async () => {
    if (
      window.confirm(
        'Right to Erasure (Privacy-First):\n\nThis will permanently delete all your likes, playlists, and listening history.'
      )
    ) {
      setIsDeleting(true);
      await deleteUserData();
      setIsDeleting(false);
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
        window.location.reload();
      }, 1500);
    }
  };

  const isAuthView = !user || forceAuthMode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-neutral-900/90 border border-white/15 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <UserIcon size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {isAuthView ? 'Welcome to Aura' : 'Account'}
              </h2>
              <p className="text-[11px] text-neutral-400 truncate max-w-[190px]">
                {isAuthView ? 'Sign in to access Aura Music' : user?.email}
              </p>
            </div>
          </div>
          {!forceAuthMode && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content: Auth Form vs Account View */}
        {isAuthView ? (
          /* Authentication Form */
          <div className="pt-4">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 mb-4 rounded-xl bg-neutral-950/60 border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setAuthError(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  !isSignUp ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setAuthError(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  isSignUp ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-xs text-red-400">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-1">
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3 text-neutral-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-950/80 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-neutral-500 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-950/80 border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-white text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-100 active:scale-95 transition shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isAuthLoading ? (
                  <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Account Details */
          <div className="py-4 space-y-2">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Privacy Mode</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">Active (Zero PII)</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
              <span className="text-neutral-300">Library Summary</span>
              <span className="text-[11px] text-neutral-400">
                {likedTracks.length} likes • {playlists.length} playlists
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
              <span className="text-neutral-300">Audio Stream</span>
              <span className="text-[11px] text-neutral-400">192 kbps Direct MP3</span>
            </div>

            <button
              onClick={handleDeleteData}
              disabled={isDeleting || deleteSuccess}
              className="w-full mt-2 flex items-center justify-between p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                {deleteSuccess ? <Check size={15} className="text-emerald-400" /> : <Trash2 size={15} />}
                <span>{deleteSuccess ? 'All Data Purged' : 'Erase Personal Data'}</span>
              </div>
              <span className="text-[10px] text-neutral-500">Right to Erasure</span>
            </button>

            <button
              onClick={handleSignOut}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
