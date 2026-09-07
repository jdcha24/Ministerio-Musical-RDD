'use client';

import React, { useState } from 'react';
import { Song, MusicalKey, TimeSignature } from '@/types';
import { X, Music2 } from 'lucide-react';
import { SongsService } from '@/lib/firebase/songs.service';

const ALL_KEYS: MusicalKey[] = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 
  'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'
];

const TIME_SIGNATURES: TimeSignature[] = ['4/4', '6/8', '3/4', '2/4', '12/8'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialSong?: Song | null;
}

export const SongFormModal: React.FC<Props> = ({ isOpen, onClose, onSaved, initialSong }) => {
  const [title, setTitle] = useState(initialSong?.title || '');
  const [artist, setArtist] = useState(initialSong?.artist || '');
  const [originalKey, setOriginalKey] = useState<MusicalKey>(initialSong?.originalKey || 'G');
  const [bpm, setBpm] = useState<number | undefined>(initialSong?.bpm);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>(initialSong?.timeSignature || '4/4');
  const [youtubeUrl, setYoutubeUrl] = useState(initialSong?.youtubeUrl || '');
  const [spotifyUrl, setSpotifyUrl] = useState(initialSong?.spotifyUrl || '');
  const [tagsInput, setTagsInput] = useState(initialSong?.tags?.join(', ') || '');
  const [lyrics, setLyrics] = useState(initialSong?.lyrics || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      setError('El título y el artista son obligatorios');
      return;
    }

    setLoading(true);
    setError(null);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      if (initialSong) {
        await SongsService.update(initialSong.id, {
          title: title.trim(),
          artist: artist.trim(),
          originalKey,
          bpm: bpm ? Number(bpm) : undefined,
          timeSignature,
          youtubeUrl: youtubeUrl.trim() || undefined,
          spotifyUrl: spotifyUrl.trim() || undefined,
          lyrics: lyrics.trim() || undefined,
          tags,
        });
      } else {
        await SongsService.create({
          title: title.trim(),
          artist: artist.trim(),
          originalKey,
          bpm: bpm ? Number(bpm) : undefined,
          timeSignature,
          youtubeUrl: youtubeUrl.trim() || undefined,
          spotifyUrl: spotifyUrl.trim() || undefined,
          lyrics: lyrics.trim() || undefined,
          tags,
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al guardar la canción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Music2 className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              {initialSong ? 'Editar Canción' : 'Nueva Canción'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Título *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej: La Bondad de Dios"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Artista / Autor *</label>
              <input
                type="text"
                required
                value={artist}
                onChange={e => setArtist(e.target.value)}
                placeholder="Ej: Bethel Music / Montesanto"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tono Original</label>
              <select
                value={originalKey}
                onChange={e => setOriginalKey(e.target.value as MusicalKey)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {ALL_KEYS.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">BPM (Tempo)</label>
              <input
                type="number"
                value={bpm || ''}
                onChange={e => setBpm(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="72"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Compás</label>
              <select
                value={timeSignature}
                onChange={e => setTimeSignature(e.target.value as TimeSignature)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {TIME_SIGNATURES.map(ts => (
                  <option key={ts} value={ts}>{ts}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enlace YouTube</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enlace Spotify</label>
              <input
                type="url"
                value={spotifyUrl}
                onChange={e => setSpotifyUrl(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Etiquetas (separadas por comas)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Adoración, Comunión, Pascua, Gratitud"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Letra / Estructura (Opcional)</label>
            <textarea
              rows={3}
              value={lyrics}
              onChange={e => setLyrics(e.target.value)}
              placeholder="[Verso 1]&#10;Te amo Dios...&#10;[Coro]&#10;Toda mi vida has sido fiel..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
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
              {loading ? 'Guardando...' : (initialSong ? 'Actualizar' : 'Guardar Canción')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
