'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, MusicalRole, ServiceMemberAssignment, ROLE_LABELS } from '@/types';
import { X, UserPlus, Shield } from 'lucide-react';
import { UsersService } from '@/lib/firebase/users.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assignment: ServiceMemberAssignment) => void;
}

export const AssignMusicianModal: React.FC<Props> = ({ isOpen, onClose, onAssign }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState<MusicalRole>('worship_leader');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      UsersService.getAll().then(data => {
        setUsers(data);
        if (data.length > 0 && !selectedUserId) {
          setSelectedUserId(data[0].id);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const user = users.find(u => u.id === selectedUserId);
    if (!user) return;

    const assignment: ServiceMemberAssignment = {
      id: crypto.randomUUID(),
      userId: user.id,
      userDisplayName: user.displayName,
      userPhotoURL: user.photoURL,
      role,
      status: 'pending',
      notes: notes.trim() || undefined,
    };

    onAssign(assignment);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Asignar Músico o Voz</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Seleccionar Miembro</label>
            {users.length > 0 ? (
              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} ({u.email})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-slate-400">Cargando directorio de músicos...</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rol / Instrumento en este Servicio</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as MusicalRole)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(ROLE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notas Específicas (Opcional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej: Encargado de coros femeninos"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!selectedUserId}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              Asignar al Servicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
