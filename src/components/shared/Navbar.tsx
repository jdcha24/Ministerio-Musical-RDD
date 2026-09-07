'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Music, LogIn, LogOut, User as UserIcon, Shield, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, role, isLeaderOrAdmin, loginWithGoogle, logout, loading } = useAuth();

  const getRoleBadge = () => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
          <Shield className="w-3 h-3" /> Admin
        </span>
      );
    }
    if (role === 'leader') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3" /> Líder
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full">
        Músico
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              WorshipFlow
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
              RDD
            </span>
          </div>
        </Link>

        {/* User profile / Auth actions */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-200">
                  {profile?.displayName || user.displayName || 'Usuario'}
                </span>
                <div className="mt-0.5">{getRoleBadge()}</div>
              </div>

              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Avatar'}
                  className="w-9 h-9 rounded-full ring-2 ring-indigo-500/30 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}

              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Acceder con Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
