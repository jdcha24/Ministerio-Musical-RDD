'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ServicePlan, Song, UserProfile, ROLE_LABELS } from '@/types';
import { Navbar } from '@/components/shared/Navbar';
import { NavigationTabs } from '@/components/shared/NavigationTabs';
import { ServicePlanService } from '@/lib/firebase/services.service';
import { SongsService } from '@/lib/firebase/songs.service';
import { UsersService } from '@/lib/firebase/users.service';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';
import { 
  Music2, 
  CalendarDays, 
  Users2, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  FileText, 
  PlusCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const { user, profile, isLeaderOrAdmin } = useAuth();
  const [services, setServices] = useState<ServicePlan[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [team, setTeam] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [servicesData, songsData, teamData] = await Promise.all([
          ServicePlanService.getAll(),
          SongsService.getAll(),
          UsersService.getAll(),
        ]);
        setServices(servicesData);
        setSongs(songsData);
        setTeam(teamData);
      } catch (e) {
        console.error('Error cargando datos del dashboard:', e);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  const nextService = services.length > 0 ? services[0] : null;
  const myUpcomingServices = services.filter(s => 
    s.team?.some(m => m.userId === user?.uid)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />
      <NavigationTabs />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero de Bienvenida */}
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/20 p-6 sm:p-10 shadow-2xl overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ministerio Musical Río</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {profile ? `¡Hola, ${profile.displayName}!` : 'Bienvenido a Ministerio Musical Río'}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2">
              Gestión centralizada de partituras, cifrados por tonalidad y planificación semanal del equipo de alabanza.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/25"
              >
                <span>Ver Servicios Planificados</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/songs"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
              >
                <Music2 className="w-4 h-4 text-indigo-400" />
                <span>Explorar Biblioteca</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/songs" className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center">
                <Music2 className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-slate-100">{songs.length}</h3>
              <p className="text-xs text-slate-400 font-medium">Canciones en el Catálogo</p>
            </div>
          </Link>

          <Link href="/services" className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/15 text-emerald-400 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-slate-100">{services.length}</h3>
              <p className="text-xs text-slate-400 font-medium">Servicios Planificados</p>
            </div>
          </Link>

          <Link href="/team" className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-600/15 text-purple-400 flex items-center justify-center">
                <Users2 className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-slate-100">{team.length}</h3>
              <p className="text-xs text-slate-400 font-medium">Músicos y Servidores</p>
            </div>
          </Link>
        </div>

        {/* Sección: Próximo Servicio */}
        {nextService && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-400" />
                <span>Próximo Servicio Principal</span>
              </h2>
              <Link href={`/services/${nextService.id}`} className="text-xs font-semibold text-indigo-400 hover:underline">
                Abrir Tablero Completo →
              </Link>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{formatDate(nextService.date)} • {nextService.time} hs</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">{nextService.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Líder: {nextService.leaderName}</p>
                </div>

                <Link
                  href={`/services/${nextService.id}/print`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors self-start sm:self-auto"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ver Atril / Imprimir</span>
                </Link>
              </div>

              {/* Vista rápida de canciones */}
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Canciones del Servicio ({nextService.setlist?.length || 0})
                </h4>
                {nextService.setlist && nextService.setlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {nextService.setlist.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600/15 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                            {item.order}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-200 truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-400 truncate">{item.artist}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-slate-900 border border-slate-700 text-indigo-300 px-2 py-0.5 rounded-md shrink-0">
                          {item.keyToPlay}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No se han cargado canciones aún en este servicio.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
