'use client';

import React, { useState, useEffect } from 'react';
import { ServicePlan } from '@/types';
import { Navbar } from '@/components/shared/Navbar';
import { NavigationTabs } from '@/components/shared/NavigationTabs';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceFormModal } from '@/components/services/ServiceFormModal';
import { ServicePlanService } from '@/lib/firebase/services.service';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { CalendarDays, Plus, Search } from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();
  const { isLeaderOrAdmin } = useAuth();
  const [services, setServices] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await ServicePlanService.getAll();
      setServices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = ServicePlanService.subscribeToServices((data) => {
      setServices(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.date.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <NavigationTabs />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Planificación</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Servicios & Setlists</h1>
            <p className="text-sm text-slate-400 mt-1">
              Programa cultos dominicales, alinea a los músicos y define el orden de las canciones
            </p>
          </div>

          {isLeaderOrAdmin && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/25"
            >
              <Plus className="w-4 h-4" />
              <span>Planificar Servicio</span>
            </button>
          )}
        </div>

        {/* Búsqueda */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar servicio por título, fecha (YYYY-MM-DD) o líder..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Listado */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="space-y-4">
            {filteredServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                isLeader={isLeaderOrAdmin}
                onDeleted={loadServices}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No hay servicios programados</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Comienza planificando el próximo servicio dominical o evento especial de alabanza.
            </p>
            {isLeaderOrAdmin && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500"
              >
                Planificar primer servicio
              </button>
            )}
          </div>
        )}
      </main>

      <ServiceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={(newId) => {
          if (newId) {
            router.push(`/services/${newId}`);
          } else {
            loadServices();
          }
        }}
      />
    </div>
  );
}
