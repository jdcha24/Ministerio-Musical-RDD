'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ServicePlan, 
  SetlistItem, 
  ServiceMemberAssignment, 
  MusicalKey, 
  SongAttachment,
  ROLE_LABELS,
  SERVICE_TYPE_LABELS,
  MemberConfirmationStatus
} from '@/types';
import { 
  Music, 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock4, 
  Printer, 
  ArrowUp, 
  ArrowDown, 
  Pencil,
  Sparkles,
  Info
} from 'lucide-react';
import { ServicePlanService } from '@/lib/firebase/services.service';
import { useAuth } from '@/context/AuthContext';
import { AddSongToSetlistModal } from './AddSongToSetlistModal';
import { AssignMusicianModal } from './AssignMusicianModal';
import { ServiceFormModal } from './ServiceFormModal';
import { PdfViewerModal } from '@/components/songs/PdfViewerModal';
import { formatDate } from '@/lib/utils';

const ALL_KEYS: MusicalKey[] = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 
  'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'
];

interface Props {
  initialService: ServicePlan;
}

export const ServiceDashboardBoard: React.FC<Props> = ({ initialService }) => {
  const { user, isLeaderOrAdmin } = useAuth();
  const [service, setService] = useState<ServicePlan>(initialService);
  const [saving, setSaving] = useState(false);

  // Modals state
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [isAssignMemberOpen, setIsAssignMemberOpen] = useState(false);
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
  const [viewingAttachment, setViewingAttachment] = useState<{ att: SongAttachment; title: string } | null>(null);

  // Reordenar canciones
  const moveSong = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= service.setlist.length) return;

    const newSetlist = [...service.setlist];
    const [moved] = newSetlist.splice(index, 1);
    newSetlist.splice(targetIndex, 0, moved);

    const reordered = newSetlist.map((item, idx) => ({ ...item, order: idx + 1 }));
    setService(prev => ({ ...prev, setlist: reordered }));

    if (isLeaderOrAdmin) {
      setSaving(true);
      await ServicePlanService.updateSetlist(service.id, reordered);
      setSaving(false);
    }
  };

  // Cambiar tono de una canción en el servicio
  const handleKeyChange = async (itemId: string, newKey: MusicalKey) => {
    const updated = service.setlist.map(item => 
      item.id === itemId ? { ...item, keyToPlay: newKey } : item
    );
    setService(prev => ({ ...prev, setlist: updated }));

    if (isLeaderOrAdmin) {
      setSaving(true);
      await ServicePlanService.updateSetlist(service.id, updated);
      setSaving(false);
    }
  };

  // Eliminar canción del setlist
  const handleDeleteSong = async (itemId: string) => {
    const filtered = service.setlist.filter(i => i.id !== itemId).map((item, idx) => ({
      ...item,
      order: idx + 1
    }));
    setService(prev => ({ ...prev, setlist: filtered }));

    if (isLeaderOrAdmin) {
      setSaving(true);
      await ServicePlanService.updateSetlist(service.id, filtered);
      setSaving(false);
    }
  };

  // Añadir canción
  const handleAddSong = async (newItem: SetlistItem) => {
    const newSetlist = [...service.setlist, newItem];
    setService(prev => ({ ...prev, setlist: newSetlist }));
    setSaving(true);
    await ServicePlanService.updateSetlist(service.id, newSetlist);
    setSaving(false);
  };

  // Asignar músico
  const handleAssignMember = async (newAssignment: ServiceMemberAssignment) => {
    const newTeam = [...(service.team || []), newAssignment];
    setService(prev => ({ ...prev, team: newTeam }));
    setSaving(true);
    await ServicePlanService.updateTeam(service.id, newTeam);
    setSaving(false);
  };

  // Eliminar asignación de músico
  const handleRemoveMember = async (assignmentId: string) => {
    const filtered = (service.team || []).filter(m => m.id !== assignmentId);
    setService(prev => ({ ...prev, team: filtered }));
    if (isLeaderOrAdmin) {
      setSaving(true);
      await ServicePlanService.updateTeam(service.id, filtered);
      setSaving(false);
    }
  };

  // Cambiar estado de confirmación
  const handleStatusChange = async (assignmentId: string, status: MemberConfirmationStatus) => {
    const updated = (service.team || []).map(m => 
      m.id === assignmentId ? { ...m, status } : m
    );
    setService(prev => ({ ...prev, team: updated }));
    setSaving(true);
    await ServicePlanService.updateTeam(service.id, updated);
    setSaving(false);
  };

  // Ver si el usuario actual está asignado
  const myAssignment = (service.team || []).find(m => m.userId === user?.uid);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Banner de Cabecera */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full">
                {SERVICE_TYPE_LABELS[service.serviceType]}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>{formatDate(service.date)}</span>
                <span>•</span>
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>{service.time} hs</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">{service.title}</h1>
            <p className="text-sm text-slate-400 mt-1">
              Líder a cargo: <strong className="text-slate-200">{service.leaderName}</strong>
              {service.rehearsalDateTime && (
                <span className="ml-3 text-indigo-300">
                  • Ensayo: {new Date(service.rehearsalDateTime).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              )}
            </p>

            {service.notes && (
              <div className="mt-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start gap-2 max-w-2xl">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{service.notes}</span>
              </div>
            )}
          </div>

          {/* Acciones de Cabecera */}
          <div className="flex flex-wrap items-center gap-2.5">
            {saving && (
              <span className="text-xs text-indigo-400 animate-pulse font-medium mr-2">Sincronizando...</span>
            )}

            <Link
              href={`/services/${service.id}/print`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Vista Imprimir / Atril</span>
            </Link>

            {isLeaderOrAdmin && (
              <button
                onClick={() => setIsEditServiceOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Editar Datos</span>
              </button>
            )}
          </div>
        </div>

        {/* Tarjeta de Confirmación de Asistencia Personal si aplica */}
        {myAssignment && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-950/30 border border-indigo-800/40 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-sm font-bold text-indigo-200">
                  Estás convocado como: <span className="text-white uppercase">{ROLE_LABELS[myAssignment.role]}</span>
                </p>
                <p className="text-xs text-indigo-300/80">Por favor confirma tu asistencia al servicio y ensayo.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStatusChange(myAssignment.id, 'confirmed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  myAssignment.status === 'confirmed'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/80 text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/30'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar Asistencia
              </button>
              <button
                onClick={() => handleStatusChange(myAssignment.id, 'declined')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  myAssignment.status === 'declined'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-900/80 text-rose-400 hover:bg-rose-950/40 border border-rose-500/30'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" /> No Podré Asistir
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cuadrícula Principal: Setlist (7 cols) + Equipo (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA: SETLIST */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold tracking-tight text-slate-100">
                Setlist del Día ({service.setlist?.length || 0})
              </h2>
            </div>
            {isLeaderOrAdmin && (
              <button
                onClick={() => setIsAddSongOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
              >
                <Plus className="w-4 h-4" /> Añadir Canción
              </button>
            )}
          </div>

          <div className="space-y-3">
            {service.setlist && service.setlist.length > 0 ? (
              service.setlist.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/40 rounded-2xl p-4 transition-all shadow-sm flex items-center gap-3 group"
                >
                  {/* Reordenar Botones */}
                  {isLeaderOrAdmin && (
                    <div className="flex flex-col gap-1 text-slate-500">
                      <button
                        onClick={() => moveSong(index, 'up')}
                        disabled={index === 0}
                        className="hover:text-slate-200 disabled:opacity-20 p-0.5 rounded hover:bg-slate-800"
                        title="Subir orden"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSong(index, 'down')}
                        disabled={index === service.setlist.length - 1}
                        className="hover:text-slate-200 disabled:opacity-20 p-0.5 rounded hover:bg-slate-800"
                        title="Bajar orden"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Número de orden */}
                  <div className="w-7 h-7 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {item.order}
                  </div>

                  {/* Detalle Canción */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-100 truncate">{item.title}</h4>
                      {item.tempoType === 'fast' ? (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded shrink-0">
                          Rápida
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.5 rounded shrink-0">
                          Lenta
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {item.artist}
                    </p>
                    {item.notes && (
                      <p className="text-[11px] text-indigo-300 italic mt-0.5 truncate">
                        📝 {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Selector de Tono */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <label className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Tono:</label>
                    <select
                      value={item.keyToPlay}
                      onChange={e => handleKeyChange(item.id, e.target.value as MusicalKey)}
                      disabled={!isLeaderOrAdmin}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-500"
                    >
                      {ALL_KEYS.map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>

                  {/* Enlace o Visor PDF */}
                  {item.attachmentUrlForKey ? (
                    <a
                      href={item.attachmentUrlForKey}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-indigo-600/15 text-indigo-400 hover:bg-indigo-600/30 transition-colors shrink-0"
                      title="Abrir Cifrado PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="p-2 text-slate-600 shrink-0" title="Sin PDF cargado para este tono">
                      <FileText className="w-4 h-4" />
                    </span>
                  )}

                  {/* Eliminar del setlist */}
                  {isLeaderOrAdmin && (
                    <button
                      onClick={() => handleDeleteSong(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors shrink-0"
                      title="Quitar canción"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <Music className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Aún no has agregado canciones al setlist de este servicio.</p>
                {isLeaderOrAdmin && (
                  <button
                    onClick={() => setIsAddSongOpen(true)}
                    className="mt-3 text-xs font-bold text-indigo-400 hover:underline"
                  >
                    + Agregar primera canción
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: EQUIPO ASIGNADO */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold tracking-tight text-slate-100">
                Equipo Asignado ({service.team?.length || 0})
              </h2>
            </div>
            {isLeaderOrAdmin && (
              <button
                onClick={() => setIsAssignMemberOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <Plus className="w-4 h-4" /> Asignar Músico
              </button>
            )}
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            {service.team && service.team.length > 0 ? (
              service.team.map((member) => (
                <div 
                  key={member.id} 
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                      {member.userDisplayName.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-100 truncate">{member.userDisplayName}</p>
                      <p className="text-xs text-indigo-400 font-medium">{ROLE_LABELS[member.role] || member.role}</p>
                      {member.notes && (
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{member.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Selector de estado editable para líderes */}
                    {isLeaderOrAdmin ? (
                      <select
                        value={member.status}
                        onChange={e => handleStatusChange(member.id, e.target.value as MemberConfirmationStatus)}
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 border focus:outline-none ${
                          member.status === 'confirmed'
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                            : member.status === 'declined'
                              ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                              : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                        }`}
                      >
                        <option value="pending">⏳ Pendiente</option>
                        <option value="confirmed">✓ Confirmado</option>
                        <option value="declined">✗ No asiste</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        member.status === 'confirmed'
                          ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                          : member.status === 'declined'
                            ? 'text-rose-400 bg-rose-950/40 border border-rose-500/30'
                            : 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
                      }`}>
                        {member.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                        {member.status === 'declined' && <XCircle className="w-3 h-3" />}
                        {member.status === 'pending' && <Clock4 className="w-3 h-3" />}
                        {member.status === 'confirmed' ? 'Confirmado' : member.status === 'declined' ? 'No asiste' : 'Pendiente'}
                      </span>
                    )}

                    {isLeaderOrAdmin && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                        title="Quitar asignación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-7 h-7 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Aún no se han asignado músicos a este servicio.</p>
                {isLeaderOrAdmin && (
                  <button
                    onClick={() => setIsAssignMemberOpen(true)}
                    className="mt-2 text-xs font-bold text-emerald-400 hover:underline"
                  >
                    + Asignar primer integrante
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <AddSongToSetlistModal
        isOpen={isAddSongOpen}
        currentSetlistCount={service.setlist?.length || 0}
        onClose={() => setIsAddSongOpen(false)}
        onAddSong={handleAddSong}
      />

      <AssignMusicianModal
        isOpen={isAssignMemberOpen}
        onClose={() => setIsAssignMemberOpen(false)}
        onAssign={handleAssignMember}
      />

      <ServiceFormModal
        isOpen={isEditServiceOpen}
        initialService={service}
        onClose={() => setIsEditServiceOpen(false)}
        onSaved={() => {
          ServicePlanService.getById(service.id).then(updated => {
            if (updated) setService(updated);
          });
        }}
      />

      <PdfViewerModal
        isOpen={!!viewingAttachment}
        attachment={viewingAttachment?.att || null}
        songTitle={viewingAttachment?.title}
        onClose={() => setViewingAttachment(null)}
      />
    </div>
  );
};
