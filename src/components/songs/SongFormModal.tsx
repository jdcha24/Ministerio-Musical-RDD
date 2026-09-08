'use client';

import React, { useState, useEffect } from 'react';
import { Song, SongTempoType } from '@/types';
import { X, Music2, Zap, Heart } from 'lucide-react';
import { SongsService } from '@/lib/firebase/songs.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialSong?: Song | null;
}

export const SongFormModal: React.FC<Props> = ({ isOpen, onClose, onSaved, initialSong }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [tempoType, setTempoType] = useState<SongTempoType>('slow');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialSong) {
        setTitle(initialSong.title || '');
        setArtist(initialSong.artist || '');
        setTempoType(initialSong.tempoType || 'slow');
        setYoutubeUrl(initialSong.youtubeUrl || '');
        setSpotifyUrl(initialSong.spotifyUrl || '');
        setLyrics(initialSong.lyrics || '');
      } else {
        setTitle('');
        setArtist('');
        setTempoType('slow');
        setYoutubeUrl('');
        setSpotifyUrl('');
        setLyrics('');
      }
      setError(null);
    }
  }, [isOpen, initialSong]);

  if (!isOpen) return null;

  const normalizeUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      setError('El título y el artista son obligatorios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanData = {
        title: title.trim(),
        artist: artist.trim(),
        tempoType,
        youtubeUrl: normalizeUrl(youtubeUrl),
        spotifyUrl: normalizeUrl(spotifyUrl),
        lyrics: lyrics.trim() || undefined,
      };

      if (initialSong) {
        await SongsService.update(initialSong.id, cleanData);
      } else {
        await SongsService.create(cleanData);
      }
      
      // Limpiar formulario tras guardar con éxito
      setTitle('');
      setArtist('');
      setTempoType('slow');
      setYoutubeUrl('');
      setSpotifyUrl('');
      setLyrics('');
      
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
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate={false}>
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

          {/* Clasificación: Rápida vs Lenta */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tipo de Canción</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTempoType('fast')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  tempoType === 'fast'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400 fill-current" />
                <span>Rápida</span>
              </button>

              <button
                type="button"
                onClick={() => setTempoType('slow')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  tempoType === 'slow'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Heart className="w-4 h-4 text-indigo-400 fill-current" />
                <span>Lenta</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enlace YouTube (Opcional)</label>
              <input
                type="text"
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enlace Spotify (Opcional)</label>
              <input
                type="text"
                value={spotifyUrl}
                onChange={e => setSpotifyUrl(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
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
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {loading ? 'Guardando...' : (initialSong ? 'Actualizar' : 'Guardar Canción')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
