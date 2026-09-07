'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, MusicalRole, ROLE_LABELS } from '@/types';
import { Navbar } from '@/components/shared/Navbar';
import { NavigationTabs } from '@/components/shared/NavigationTabs';
import { UsersService } from '@/lib/firebase/users.service';
import { useAuth } from '@/context/AuthContext';
import { Users, Shield, Sparkles, UserCheck, Search } from 'lucide-react';

export default function TeamPage() {
  const { isAdmin } = useAuth();
  const [team, setTeam] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredTeam = team.filter(u =>
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <NavigationTabs />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Directorio</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Equipo de Alabanza</h1>
            <p className="text-sm text-slate-400 mt-1">
              Miembros, músicos, directores de alabanza y roles de administración
            </p>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar músico por nombre o correo electrónico..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Lista de Miembros */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredTeam.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeam.map((member) => (
              <div
                key={member.id}
                className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {member.photoURL ? (
                      <img
                        src={member.photoURL}
                        alt={member.displayName}
                        className="w-11 h-11 rounded-full ring-2 ring-indigo-500/20 object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm uppercase">
                        {member.displayName.substring(0, 2)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-100 truncate">{member.displayName}</h3>
                      <p className="text-xs text-slate-400 truncate">{member.email}</p>
                    </div>
                  </div>

                  {member.skills && member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {member.skills.map((skill, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                          {ROLE_LABELS[skill] || skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Permisos / Rol:</span>

                  {isAdmin ? (
                    <select
                      value={member.role}
                      onChange={e => handleRoleChange(member.id, e.target.value as UserRole)}
                      className="text-xs font-bold bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-indigo-300 focus:outline-none focus:border-indigo-500"
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
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No se encontraron miembros registrados con ese criterio.</p>
          </div>
        )}
      </main>
    </div>
  );
}
