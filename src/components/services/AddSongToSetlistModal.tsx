'use client';

import React, { useState, useEffect } from 'react';
import { Song, SetlistItem, MusicalKey } from '@/types';
import { X, Search, Music, Plus } from 'lucide-react';
import { SongsService } from '@/lib/firebase/songs.service';

const ALL_KEYS: MusicalKey[] = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 
  'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'
];

interface Props {
  isOpen: boolean;
  currentSetlistCount: number;
  onClose: () => void;
  onAddSong: (item: SetlistItem) => void;
}

export const AddSongToSetlistModal: React.FC<Props> = ({
  isOpen,
  currentSetlistCount,
  onClose,
  onAddSong,
}) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [keyToPlay, setKeyToPlay] = useState<MusicalKey>('G');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      SongsService.getAll().then(data => setSongs(data));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setKeyToPlay(song.originalKey || (song.attachments?.[0]?.key as MusicalKey) || 'G');
  };

  const handleAdd = () => {
    if (!selectedSong) return;

    // Buscar si hay un PDF en el tono elegido
    const matchingAttachment = selectedSong.attachments?.find(a => a.key === keyToPlay);

    const newItem: SetlistItem = {
      id: crypto.randomUUID(),
      songId: selectedSong.id,
      order: currentSetlistCount + 1,
      title: selectedSong.title,
      artist: selectedSong.artist,
      tempoType: selectedSong.tempoType || 'slow',
      keyToPlay,
      notes: notes.trim() || undefined,
      attachmentUrlForKey: matchingAttachment ? matchingAttachment.downloadURL : undefined,
      youtubeUrl: selectedSong.youtubeUrl || undefined,
      spotifyUrl: selectedSong.spotifyUrl || undefined,
    };

    onAddSong(newItem);
    setSelectedSong(null);
    setNotes('');
    onClose();
  };

  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Añadir Canción al Setlist</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 flex-1 overflow-hidden">
          {/* Lista de canciones disponibles */}
          <div className="flex flex-col border border-slate-800/80 rounded-xl p-3 bg-slate-950/40">
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar canción..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-64">
              {filtered.map(song => (
                <div
                  key={song.id}
                  onClick={() => handleSelectSong(song)}
                  className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    selectedSong?.id === song.id
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-200 font-semibold'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{song.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{song.artist}</p>
                  </div>
                  {song.originalKey && (
                    <span className="text-[10px] font-bold bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">
                      {song.originalKey}
                    </span>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-6">No hay canciones disponibles.</p>
              )}
            </div>
          </div>

          {/* Configuración del Setlist Item */}
          <div className="flex flex-col justify-between border border-slate-800/80 rounded-xl p-4 bg-slate-950/60">
            {selectedSong ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{selectedSong.title}</h4>
                  <p className="text-xs text-slate-400">
                    {selectedSong.artist} {selectedSong.originalKey ? `• Original: ${selectedSong.originalKey}` : ''}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tono a Ejecutar:</label>
                  <select
                    value={keyToPlay}
                    onChange={e => setKeyToPlay(e.target.value as MusicalKey)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {ALL_KEYS.map(k => (
                      <option key={k} value={k}>
                        Tono {k} {selectedSong.attachments?.some(a => a.key === k) ? ' (PDF disponible)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Notas / Arreglo:</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Ej: Intro acústica + pad. Subir modulación al final."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-8">
                <Music className="w-8 h-8 opacity-40 mb-2" />
                <p className="text-xs">Selecciona una canción de la izquierda para configurar su tono</p>
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={!selectedSong}
              className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Agregar al Servicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
