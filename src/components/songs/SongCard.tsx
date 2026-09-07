'use client';

import React from 'react';
import { Song, SongAttachment } from '@/types';
import { 
  FileText, 
  ExternalLink, 
  Plus, 
  Pencil, 
  Trash2, 
  Music, 
  Tag,
  Play
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

export const SongCard: React.FC<Props> = ({ 
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

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-indigo-950/20 flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
              {song.title}
            </h3>
            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{song.artist}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {song.originalKey && (
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold" title="Tono Original">
                {song.originalKey}
              </span>
            )}
            {song.bpm && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">
                {song.bpm} BPM
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {song.tags && song.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {song.tags.map((tag, i) => (
              <span key={i} className="text-[10px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700/50">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* PDFs por tono */}
        <div className="mt-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Cifrados / Partituras ({song.attachments?.length || 0})
            </span>
            {isLeader && (
              <button
                onClick={() => onAddPdf(song)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-medium hover:underline"
              >
                <Plus className="w-3 h-3" /> Subir PDF
              </button>
            )}
          </div>

          {song.attachments && song.attachments.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {song.attachments.map((att) => (
                <div
                  key={att.id}
                  onClick={() => onViewPdf(att, song.title)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-500/50 text-xs text-slate-200 cursor-pointer transition-colors"
                >
                  <span className="font-bold text-indigo-400">{att.key}</span>
                  <span className="text-[11px] text-slate-300 truncate max-w-[100px]">{att.label}</span>
                  {isLeader && (
                    <button
                      onClick={(e) => handleDeleteAttachment(e, att)}
                      title="Eliminar PDF"
                      className="text-slate-500 hover:text-rose-400 ml-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No hay cifrados adjuntos aún.</p>
          )}
        </div>
      </div>

      {/* Footer & Actions */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {song.youtubeUrl && (
            <a
              href={song.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
              title="Escuchar en YouTube"
            >
              <Play className="w-4 h-4 fill-current" />
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
              <ExternalLink className="w-4 h-4" />
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
