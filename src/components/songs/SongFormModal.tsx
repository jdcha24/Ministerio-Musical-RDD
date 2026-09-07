'use client';

import React, { useState } from 'react';
import { Song } from '@/types';
import { X, Music2 } from 'lucide-react';
import { SongsService } from '@/lib/firebase/songs.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialSong?: Song | null;
}

export const SongFormModal: React.FC<Props> = ({ isOpen, onClose, onSaved, initialSong }) => {
  const [title, setTitle] = useState(initialSong?.title || '');
  const [artist, setArtist] = useState(initialSong?.artist || '');
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
          youtubeUrl: youtubeUrl.trim() || undefined,
          spotifyUrl: spotifyUrl.trim() || undefined,
          lyrics: lyrics.trim() || undefined,
          tags,
        });
      } else {
        await SongsService.create({
          title: title.trim(),
          artist: artist.trim(),
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Music2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              {initialSong ? 'Editar Canción' : 'Registrar Canción'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Título de la Canción *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: La Bondad de Dios"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enlace YouTube (Opcional)</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enlace Spotify (Opcional)</label>
              <input
                type="url"
                value={spotifyUrl}
                onChange={e => setSpotifyUrl(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Etiquetas (separadas por comas)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Adoración, Gracia, Pascua, Gratitud"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Letra / Estructura (Opcional)</label>
            <textarea
              rows={3}
              value={lyrics}
              onChange={e => setLyrics(e.target.value)}
              placeholder="[Verso 1]&#10;Te amo Dios...&#10;[Coro]&#10;Toda mi vida has sido fiel..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
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
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              {loading ? 'Guardando...' : (initialSong ? 'Actualizar' : 'Guardar Canción')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
