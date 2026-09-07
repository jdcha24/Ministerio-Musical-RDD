'use client';

import React, { useState } from 'react';
import { ServicePlan, ServiceType, SERVICE_TYPE_LABELS } from '@/types';
import { X, CalendarDays } from 'lucide-react';
import { ServicePlanService } from '@/lib/firebase/services.service';
import { useAuth } from '@/context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (newId?: string) => void;
  initialService?: ServicePlan | null;
}

export const ServiceFormModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSaved, 
  initialService 
}) => {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState(initialService?.title || 'Servicio Dominical');
  const [date, setDate] = useState(initialService?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialService?.time || '10:00');
  const [serviceType, setServiceType] = useState<ServiceType>(initialService?.serviceType || 'sunday_morning');
  const [rehearsalDateTime, setRehearsalDateTime] = useState(initialService?.rehearsalDateTime || '');
  const [notes, setNotes] = useState(initialService?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      setError('Por favor completa el título y la fecha');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (initialService) {
        await ServicePlanService.update(initialService.id, {
          title: title.trim(),
          date,
          time,
          serviceType,
          rehearsalDateTime: rehearsalDateTime || undefined,
          notes: notes.trim() || undefined,
        });
        onSaved();
      } else {
        const newId = await ServicePlanService.create({
          title: title.trim(),
          date,
          time,
          serviceType,
          leaderId: user?.uid || '',
          leaderName: profile?.displayName || user?.displayName || 'Líder',
          rehearsalDateTime: rehearsalDateTime || undefined,
          notes: notes.trim() || undefined,
          team: [],
          setlist: [],
          isPublished: true,
        });
        onSaved(newId);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al guardar el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              {initialService ? 'Editar Servicio' : 'Planificar Nuevo Servicio'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Título del Servicio *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Servicio Dominical - Serie Adoración"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fecha *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hora Inicio *</label>
              <input
                type="time"
                required
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tipo de Evento</label>
            <select
              value={serviceType}
              onChange={e => setServiceType(e.target.value as ServiceType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(SERVICE_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fecha/Hora Ensayo Previo (Opcional)</label>
            <input
              type="datetime-local"
              value={rehearsalDateTime}
              onChange={e => setRehearsalDateTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notas Generales para el Equipo</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej: Ensayo puntual 30 min antes. Vestimenta casual oscuro."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              {loading ? 'Guardando...' : (initialService ? 'Actualizar Servicio' : 'Crear Servicio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
