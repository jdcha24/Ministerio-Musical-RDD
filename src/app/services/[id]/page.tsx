'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ServicePlan } from '@/types';
import { Navbar } from '@/components/shared/Navbar';
import { NavigationTabs } from '@/components/shared/NavigationTabs';
import { ServiceDashboardBoard } from '@/components/services/ServiceDashboardBoard';
import { ServicePlanService } from '@/lib/firebase/services.service';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;

  const [service, setService] = useState<ServicePlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) return;

    const unsubscribe = ServicePlanService.subscribeToServiceById(serviceId, (data) => {
      setService(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [serviceId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />
      <NavigationTabs />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="mb-4">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a todos los servicios</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-xs text-slate-400 font-medium">Cargando tablero del servicio...</p>
          </div>
        ) : service ? (
          <ServiceDashboardBoard initialService={service} />
        ) : (
          <div className="text-center py-24 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <h2 className="text-lg font-bold text-slate-200">Servicio no encontrado</h2>
            <p className="text-xs text-slate-400 mt-1">El servicio solicitado no existe o fue eliminado.</p>
            <Link
              href="/services"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
            >
              Ir a la lista de servicios
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
