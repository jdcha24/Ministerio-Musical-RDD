'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ServicePlan, ROLE_LABELS, SERVICE_TYPE_LABELS } from '@/types';
import { ServicePlanService } from '@/lib/firebase/services.service';
import { formatDate } from '@/lib/utils';
import { Printer, ArrowLeft, Music, Users, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ServicePrintPage() {
  const params = useParams();
  const serviceId = params?.id as string;
  const [service, setService] = useState<ServicePlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) return;
    ServicePlanService.getById(serviceId).then(data => {
      setService(data);
      setLoading(false);
    });
  }, [serviceId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Cargando hoja de servicio...</div>;
  }

  if (!service) {
    return <div className="p-8 text-center text-rose-400">Servicio no encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 sm:p-10 font-sans print:p-0">
      {/* Botones de acción no imprimibles */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex items-center justify-between border-b pb-4">
        <Link
          href={`/services/${service.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Tablero
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
        >
          <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
        </button>
      </div>

      {/* Contenido Imprimible de Alta Claridad */}
      <div className="max-w-4xl mx-auto border border-slate-200 print:border-none p-8 rounded-2xl shadow-xs print:p-0">
        {/* Cabecera */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {SERVICE_TYPE_LABELS[service.serviceType]} • MINISTERIO MUSICAL RÍO
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">{service.title}</h1>
            </div>
            <div className="text-right text-xs text-slate-700 font-semibold">
              <p>{formatDate(service.date)}</p>
              <p className="text-sm font-bold text-slate-900">{service.time} hs</p>
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-600 flex flex-wrap gap-4">
            <p>Líder: <strong className="text-slate-900">{service.leaderName}</strong></p>
            {service.rehearsalDateTime && (
              <p>Ensayo: <strong className="text-slate-900">{new Date(service.rehearsalDateTime).toLocaleString()}</strong></p>
            )}
          </div>

          {service.notes && (
            <div className="mt-2 text-xs text-slate-700 bg-slate-100 p-2 rounded-lg italic">
              Nota: {service.notes}
            </div>
          )}
        </div>

        {/* Setlist */}
        <div className="mb-8">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5 border-b pb-1">
            <Music className="w-4 h-4" /> Setlist de Canciones ({service.setlist?.length || 0})
          </h2>

          <div className="divide-y divide-slate-200">
            {service.setlist && service.setlist.length > 0 ? (
              service.setlist.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 card-print">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                      {item.order}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-950">{item.title}</h3>
                        <span className="text-[10px] font-bold text-slate-700 uppercase px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300">
                          {item.tempoType === 'fast' ? '⚡ Rápida' : '🕊️ Lenta'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {item.artist}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-indigo-700 font-medium mt-0.5">
                          Arreglo / Notas: {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded-lg text-base font-black text-slate-950">
                      Tono {item.keyToPlay}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-xs text-slate-500 italic">No se especificó setlist.</p>
            )}
          </div>
        </div>

        {/* Alineación de Músicos */}
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5 border-b pb-1">
            <Users className="w-4 h-4" /> Equipo de Alabanza Asignado
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {service.team && service.team.length > 0 ? (
              service.team.map((member) => (
                <div key={member.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs font-black text-slate-900">{member.userDisplayName}</p>
                  <p className="text-[11px] text-slate-600 font-semibold uppercase">{ROLE_LABELS[member.role] || member.role}</p>
                  {member.notes && <p className="text-[10px] text-slate-500 italic">{member.notes}</p>}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">Sin músicos asignados.</p>
            )}
          </div>
        </div>

        {/* Pie de página */}
        <div className="mt-8 pt-4 border-t text-[10px] text-slate-400 text-center">
          WorshipFlow • Ministerio Musical RDD • Generado el {new Date().toLocaleDateString('es-ES')}
        </div>
      </div>
    </div>
  );
}
