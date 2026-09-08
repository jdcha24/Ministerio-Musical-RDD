'use client';

import React from 'react';
import { Song, SongAttachment } from '@/types';
import { 
  FileText, 
  ExternalLink, 
  Plus, 
  Pencil, 
  Trash2, 
  Play,
  Zap,
  Heart
} from 'lucide-react';
import { SongsService } from '@/lib/firebase/songs.service';

interface Props {
  song: Song;
  isLeader: boolean;
  onEdit: (song: Song) => void;
  onAddPdf: (song: Song) => void;
  onViewPdf: (attachment: SongAttachment, songTitle: string) => void;
  onDeleted: () => void;
}

export const SongListItem: React.FC<Props> = ({
  song,
  isLeader,
  onEdit,
  onAddPdf,
  onViewPdf,
  onDeleted
}) => {
  const handleDelete = async () => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${song.title}"?`)) {
      await SongsService.delete(song.id);
      onDeleted();
    }
  };

  const handleDeleteAttachment = async (e: React.MouseEvent, att: SongAttachment) => {
    e.stopPropagation();
    if (confirm(`¿Eliminar cifrado en tono ${att.key}?`)) {
      await SongsService.deleteAttachment(song.id, att);
      onDeleted();
    }
  };

  const isFast = song.tempoType === 'fast';

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl p-3 sm:px-4 sm:py-3 transition-all hover:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3 group">
      {/* Título, Artista y Tempo */}
      <div className="flex items-center gap-3 min-w-0 md:w-5/12">
        <div className="shrink-0">
          {isFast ? (
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300" title="Rápida">
              <Zap className="w-4 h-4 fill-current" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300" title="Lenta">
              <Heart className="w-4 h-4 fill-current" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
              {song.title}
            </h3>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isFast 
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
            }`}>
              {isFast ? 'Rápida' : 'Lenta'}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium truncate">{song.artist}</p>
        </div>
      </div>

      {/* Cifrados / Partituras en Drive */}
      <div className="flex items-center gap-1.5 flex-wrap min-w-0 md:w-4/12">
        {song.attachments && song.attachments.length > 0 ? (
          song.attachments.map((att) => (
            <div
              key={att.id}
              onClick={() => onViewPdf(att, song.title)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-indigo-950/70 border border-slate-700/80 hover:border-indigo-500/50 text-[11px] text-slate-200 cursor-pointer transition-colors"
              title={`Ver PDF: ${att.label} (${att.key})`}
            >
              <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="font-bold text-indigo-300">{att.key}</span>
              <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{att.label}</span>
              {isLeader && (
                <button
                  onClick={(e) => handleDeleteAttachment(e, att)}
                  title="Eliminar PDF"
                  className="text-slate-500 hover:text-rose-400 ml-0.5"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))
        ) : (
          <span className="text-[11px] text-slate-500 italic">Sin PDF</span>
        )}

        {isLeader && (
          <button
            onClick={() => onAddPdf(song)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded hover:bg-indigo-600/10 transition-colors"
            title="Subir nuevo PDF a Google Drive"
          >
            <Plus className="w-3 h-3" /> PDF
          </button>
        )}
      </div>

      {/* Media Links y Acciones */}
      <div className="flex items-center justify-between md:justify-end gap-2 md:w-3/12 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
        <div className="flex items-center gap-1.5">
          {song.youtubeUrl && (
            <a
              href={song.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
              title="Escuchar en YouTube"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </a>
          )}
          {song.spotifyUrl && (
            <a
              href={song.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              title="Escuchar en Spotify"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {isLeader && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(song)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Editar"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
