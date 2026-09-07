'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, MusicalRole, ROLE_LABELS } from '@/types';
import { X, Music2, Check, Sparkles } from 'lucide-react';
import { UsersService } from '@/lib/firebase/users.service';

interface Props {
  member: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const ALL_ROLES: { id: MusicalRole; label: string; iconEmoji: string }[] = [
  { id: 'worship_leader', label: 'Líder de Alabanza', iconEmoji: '👑' },
  { id: 'lead_vocals', label: 'Voz Principal', iconEmoji: '🎤' },
  { id: 'backing_vocals', label: 'Coros / Voces', iconEmoji: '🎶' },
  { id: 'acoustic_guitar', label: 'Guitarra Acústica', iconEmoji: '🎸' },
  { id: 'electric_guitar', label: 'Guitarra Eléctrica', iconEmoji: '⚡' },
  { id: 'bass', label: 'Bajo Eléctrico', iconEmoji: '🎸' },
  { id: 'keys', label: 'Piano / Teclado', iconEmoji: '🎹' },
  { id: 'synth', label: 'Sintetizador / Pads', iconEmoji: '🎛️' },
  { id: 'drums', label: 'Batería / Percusión', iconEmoji: '🥁' },
  { id: 'sound_engineer', label: 'Ingeniero de Sonido', iconEmoji: '🎧' },
  { id: 'media', label: 'Multimedia / Proyección', iconEmoji: '💻' },
];

export const EditMemberSkillsModal: React.FC<Props> = ({
  member,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [selectedSkills, setSelectedSkills] = useState<MusicalRole[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setSelectedSkills(member.skills || []);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const toggleSkill = (role: MusicalRole) => {
    setSelectedSkills((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await UsersService.updateSkills(member.id, selectedSkills);
      onSaved();
      onClose();
    } catch (err) {
      console.error('Error guardando habilidades:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Instrumentos y Habilidades
              </h3>
              <p className="text-xs text-slate-400">{member.displayName} ({member.email})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5">
          <p className="text-xs text-slate-400 mb-3 font-medium">
            Selecciona todos los instrumentos, voces o áreas en las que este integrante puede servir:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {ALL_ROLES.map((role) => {
              const isSelected = selectedSkills.includes(role.id);
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => toggleSkill(role.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all text-left ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-xs'
                      : 'bg-slate-950/60 border-slate-800/90 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{role.iconEmoji}</span>
                    <span>{role.label}</span>
                  </span>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            {selectedSkills.length} {selectedSkills.length === 1 ? 'instrumento' : 'instrumentos'} seleccionados
          </span>

          <div className="flex items-center gap-2">
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
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-emerald-600/20"
            >
              {loading ? 'Guardando...' : 'Guardar Instrumentos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
