'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Music2, CalendarDays, Users2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NavigationTabs: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Inicio', shortLabel: 'Inicio', icon: Home, exact: true },
    { href: '/services', label: 'Servicios & Setlists', shortLabel: 'Servicios', icon: CalendarDays },
    { href: '/songs', label: 'Biblioteca de Canciones', shortLabel: 'Canciones', icon: Music2 },
    { href: '/team', label: 'Equipo de Alabanza', shortLabel: 'Equipo', icon: Users2 },
  ];

  return (
    <>
      {/* Desktop / Tablet Top Tabs Bar (hidden on small screens) */}
      <div className="hidden sm:block border-b border-slate-800 bg-slate-950/60 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-2 py-2.5 overflow-x-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = link.exact 
                ? pathname === link.href 
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-400' : 'text-slate-400')} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (App style on phones) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-lg pb-safe">
        <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact 
              ? pathname === link.href 
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 transition-all relative',
                  isActive ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-0.5 bg-indigo-500 rounded-full" />
                )}
                <Icon className={cn('w-5 h-5', isActive ? 'text-indigo-400 scale-110' : 'text-slate-500')} />
                <span className="text-[10px] tracking-tight">{link.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
