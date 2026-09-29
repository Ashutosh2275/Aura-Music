import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Library, Settings, LogOut, Trash2, ShieldCheck, Check } from 'lucide-react';
import { getCurrentUser, signOutUser } from '../services/firebase';
import { deleteUserData } from '../services/api';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    await signOutUser();
    onClose();
    navigate('/login', { replace: true });
  };

  const handleDeleteData = async () => {
    if (
      window.confirm(
        'Right to Erasure (Privacy-First):\n\nThis will permanently delete all your likes, playlists, and listening history from the servers and your device.'
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-3xl bg-neutral-900/90 border border-white/10 p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Account</h2>
              <p className="text-[11px] text-neutral-400 truncate max-w-[190px]">
                {user?.email || 'Anonymous Session'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="py-4 space-y-1">
          <button
            onClick={() => {
              onClose();
              navigate('/library');
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-neutral-200 hover:text-white transition text-xs font-semibold"
          >
            <div className="flex items-center gap-3">
              <Library size={16} className="text-neutral-400" />
              <span>Your Library</span>
            </div>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Playlists & Likes</span>
          </button>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-neutral-300">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Privacy Mode</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">Active (Zero PII)</span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-neutral-300">
              <Settings size={16} className="text-neutral-400" />
              <span>Audio Quality</span>
            </div>
            <span className="text-[11px] text-neutral-400">192 kbps Direct</span>
          </div>
        </div>

        {/* Privacy Erasure */}
        <div className="pt-2 pb-4 border-t border-white/5">
          <button
            onClick={handleDeleteData}
            disabled={isDeleting || deleteSuccess}
            className="w-full flex items-center justify-between p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition text-xs font-semibold"
          >
            <div className="flex items-center gap-3">
              {deleteSuccess ? <Check size={16} className="text-emerald-400" /> : <Trash2 size={16} />}
              <span>{deleteSuccess ? 'All Data Purged' : 'Erase All Personal Data'}</span>
            </div>
            <span className="text-[10px] text-neutral-500">Right to Erasure</span>
          </button>
        </div>

        {/* Sign Out */}
        <div className="pt-2 border-t border-white/5">
          <button
            onClick={handleSignOut}
            className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
