'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Music2, CalendarDays, Users2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NavigationTabs: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Inicio', icon: Home, exact: true },
    { href: '/services', label: 'Servicios & Setlists', icon: CalendarDays },
    { href: '/songs', label: 'Biblioteca de Canciones', icon: Music2 },
    { href: '/team', label: 'Equipo de Alabanza', icon: Users2 },
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-950/40 sticky top-16 z-30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5 no-scrollbar">
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
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
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
  );
};
