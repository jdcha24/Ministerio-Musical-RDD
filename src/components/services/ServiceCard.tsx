'use client';

import React from 'react';
import Link from 'next/link';
import { ServicePlan, SERVICE_TYPE_LABELS } from '@/types';
import { 
  Calendar, 
  Clock, 
  Music2, 
  Users2, 
  ChevronRight, 
  CheckCircle2, 
  Clock4, 
  XCircle,
  Printer,
  Trash2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ServicePlanService } from '@/lib/firebase/services.service';

interface Props {
  service: ServicePlan;
  isLeader: boolean;
  onDeleted?: () => void;
}

export const ServiceCard: React.FC<Props> = ({ service, isLeader, onDeleted }) => {
  const confirmedCount = (service.team || []).filter(m => m.status === 'confirmed').length;
  const pendingCount = (service.team || []).filter(m => m.status === 'pending').length;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`¿Eliminar la planificación del "${service.title}"?`)) {
      await ServicePlanService.delete(service.id);
      if (onDeleted) onDeleted();
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-xl hover:shadow-indigo-950/20 group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Info principal */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
              {SERVICE_TYPE_LABELS[service.serviceType] || 'Servicio'}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatDate(service.date)}</span>
              <span>•</span>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{service.time} hs</span>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
            {service.title}
          </h3>
          <p className="text-xs text-slate-400">
            Líder: <strong className="text-slate-300 font-semibold">{service.leaderName}</strong>
          </p>
        </div>

        {/* Métricas y Acceso rápido */}
        <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800" title="Canciones">
              <Music2 className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold">{service.setlist?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800" title="Músicos asignados">
              <Users2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">{service.team?.length || 0}</span>
              <span className="text-[10px] text-slate-500 font-medium">({confirmedCount} ✓)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/services/${service.id}/print`}
              title="Ver versión para atril / imprimir"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
            </Link>

            {isLeader && (
              <button
                onClick={handleDelete}
                title="Eliminar servicio"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <Link
              href={`/services/${service.id}`}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/20"
            >
              <span>Abrir Tablero</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
