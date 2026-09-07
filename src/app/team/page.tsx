'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, MusicalRole, ROLE_LABELS } from '@/types';
import { Navbar } from '@/components/shared/Navbar';
import { NavigationTabs } from '@/components/shared/NavigationTabs';
import { EditMemberSkillsModal } from '@/components/team/EditMemberSkillsModal';
import { UsersService } from '@/lib/firebase/users.service';
import { useAuth } from '@/context/AuthContext';
import { Users, Shield, Sparkles, Search, SlidersHorizontal, Music } from 'lucide-react';

export default function TeamPage() {
  const { user, isAdmin, isLeaderOrAdmin } = useAuth();
  const [team, setTeam] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [editingMemberSkills, setEditingMemberSkills] = useState<UserProfile | null>(null);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const data = await UsersService.getAll();
      setTeam(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!isAdmin) return;
    await UsersService.updateRole(userId, newRole);
    setTeam(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const filteredTeam = team.filter(u => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSkill =
      selectedSkillFilter === 'all' ||
      (u.skills && u.skills.includes(selectedSkillFilter as MusicalRole));

    return matchesSearch && matchesSkill;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />
      <NavigationTabs />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Directorio Ministerial</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Equipo de Alabanza</h1>
            <p className="text-sm text-slate-400 mt-1">
              Inventario de músicos, instrumentos asignados y niveles de acceso
            </p>
          </div>
        </div>

        {/* Filtros: Búsqueda + Filtro por Instrumento */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o correo electrónico..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSkillFilter}
              onChange={e => setSelectedSkillFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todos los instrumentos / áreas</option>
              {Object.entries(ROLE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid de Miembros */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-44 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredTeam.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTeam.map((member) => {
              const canEditSkills = isLeaderOrAdmin || user?.uid === member.id;

              return (
                <div
                  key={member.id}
                  className="bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/40 rounded-2xl p-5 shadow-xs flex flex-col justify-between group transition-all"
                >
                  <div>
                    {/* Header del miembro */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {member.photoURL ? (
                          <img
                            src={member.photoURL}
                            alt={member.displayName}
                            className="w-12 h-12 rounded-full ring-2 ring-emerald-500/20 object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                            {member.displayName.substring(0, 2)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-emerald-300 transition-colors">
                            {member.displayName}
                          </h3>
                          <p className="text-xs text-slate-400 truncate">{member.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Lista de Instrumentos */}
                    <div className="my-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Music className="w-3.5 h-3.5 text-emerald-400" />
                          Instrumentos ({member.skills?.length || 0})
                        </span>
                        {canEditSkills && (
                          <button
                            onClick={() => setEditingMemberSkills(member)}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
                          >
                            + Asignar
                          </button>
                        )}
                      </div>

                      {member.skills && member.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {member.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-emerald-950/40 text-emerald-300 px-2.5 py-0.5 rounded-lg border border-emerald-500/30 font-medium"
                            >
                              {ROLE_LABELS[skill] || skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No tiene instrumentos asignados aún.</p>
                      )}
                    </div>
                  </div>

                  {/* Footer del Miembro: Rol de Permisos */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Permisos:</span>

                    {isAdmin ? (
                      <select
                        value={member.role}
                        onChange={e => handleRoleChange(member.id, e.target.value as UserRole)}
                        className="text-xs font-bold bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-indigo-300 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="member">Músico</option>
                        <option value="leader">Líder de Alabanza</option>
                        <option value="admin">Administrador</option>
                      </select>
                    ) : (
                      <span className="text-xs font-bold text-indigo-400 capitalize">
                        {member.role === 'admin' ? 'Administrador' : member.role === 'leader' ? 'Líder' : 'Músico'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-200">No se encontraron músicos</h3>
            <p className="text-xs text-slate-400 mt-1">
              Prueba cambiando los filtros de búsqueda o instrumento.
            </p>
          </div>
        )}
      </main>

      {/* Modal para Editar Instrumentos */}
      <EditMemberSkillsModal
        member={editingMemberSkills}
        isOpen={!!editingMemberSkills}
        onClose={() => setEditingMemberSkills(null)}
        onSaved={loadTeam}
      />
    </div>
  );
}
