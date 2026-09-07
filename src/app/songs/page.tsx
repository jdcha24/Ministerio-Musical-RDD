'use client';

import React, { useState, useEffect } from 'react';
import { Song, SongAttachment, MusicalKey } from '@/types';
import { Navbar } from '@/components/shared/Navbar';
import { NavigationTabs } from '@/components/shared/NavigationTabs';
import { SongCard } from '@/components/songs/SongCard';
import { SongFormModal } from '@/components/songs/SongFormModal';
import { PdfUploadModal } from '@/components/songs/PdfUploadModal';
import { PdfViewerModal } from '@/components/songs/PdfViewerModal';
import { SongsService } from '@/lib/firebase/songs.service';
import { useAuth } from '@/context/AuthContext';
import { Plus, Search, Filter, Music2, RefreshCw } from 'lucide-react';

export default function SongsPage() {
  const { isLeaderOrAdmin } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeyFilter, setSelectedKeyFilter] = useState<string>('all');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [uploadPdfSong, setUploadPdfSong] = useState<Song | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<{ att: SongAttachment; title: string } | null>(null);

  const loadSongs = async () => {
    setLoading(true);
    try {
      const data = await SongsService.getAll();
      setSongs(data);
    } catch (e) {
      console.error('Error cargando canciones:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Suscripción en tiempo real
    const unsubscribe = SongsService.subscribeToSongs((updatedSongs) => {
      setSongs(updatedSongs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredSongs = songs.filter(song => {
    const matchesSearch = 
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.tags && song.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesKey = selectedKeyFilter === 'all' || 
      song.originalKey === selectedKeyFilter || 
      (song.attachments && song.attachments.some(a => a.key === selectedKeyFilter));

    return matchesSearch && matchesKey;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 sm:pb-12">
      <Navbar />
      <NavigationTabs />

      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8">
        {/* Encabezado y Acción */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Catálogo Musical</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Biblioteca de Canciones</h1>
            <p className="text-sm text-slate-400 mt-1">
              {songs.length} temas registrados con cifrados y partituras por tono
            </p>
          </div>

          {isLeaderOrAdmin && (
            <button
              onClick={() => {
                setEditingSong(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/25"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Canción</span>
            </button>
          )}
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, artista o etiqueta (ej. Gracia, Adoración)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedKeyFilter}
              onChange={e => setSelectedKeyFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todas las tonalidades</option>
              <option value="C">Tono C</option>
              <option value="D">Tono D</option>
              <option value="E">Tono E</option>
              <option value="F">Tono F</option>
              <option value="G">Tono G</option>
              <option value="A">Tono A</option>
              <option value="B">Tono B</option>
            </select>
          </div>
        </div>

        {/* Grid de Canciones */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredSongs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSongs.map(song => (
              <SongCard
                key={song.id}
                song={song}
                isLeader={isLeaderOrAdmin}
                onEdit={song => {
                  setEditingSong(song);
                  setIsFormOpen(true);
                }}
                onAddPdf={song => setUploadPdfSong(song)}
                onViewPdf={(att, title) => setViewingAttachment({ att, title })}
                onDeleted={loadSongs}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Music2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No se encontraron canciones</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {searchTerm 
                ? 'Prueba modificando los términos de búsqueda o filtros.'
                : 'Comienza agregando la primera canción al repertorio de la iglesia.'}
            </p>
            {isLeaderOrAdmin && !searchTerm && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500"
              >
                Agregar primera canción
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modales */}
      <SongFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialSong={editingSong}
        onSaved={loadSongs}
      />

      <PdfUploadModal
        song={uploadPdfSong}
        isOpen={!!uploadPdfSong}
        onClose={() => setUploadPdfSong(null)}
        onUploaded={loadSongs}
      />

      <PdfViewerModal
        isOpen={!!viewingAttachment}
        attachment={viewingAttachment?.att || null}
        songTitle={viewingAttachment?.title}
        onClose={() => setViewingAttachment(null)}
      />
    </div>
  );
}
