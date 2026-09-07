'use client';

import React from 'react';
import { SongAttachment } from '@/types';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

interface Props {
  attachment: SongAttachment | null;
  songTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<Props> = ({ attachment, songTitle, isOpen, onClose }) => {
  if (!isOpen || !attachment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-100">{songTitle || 'Cifrado'}</h3>
                <span className="text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-md">
                  Tono {attachment.key}
                </span>
              </div>
              <p className="text-xs text-slate-400">{attachment.label} • {attachment.fileName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={attachment.downloadURL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Abrir pestaña</span>
            </a>
            <a
              href={attachment.downloadURL}
              download={attachment.fileName}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div className="flex-1 bg-slate-950 p-1">
          <iframe
            src={`${attachment.downloadURL}#toolbar=1&navpanes=0`}
            title={attachment.label}
            className="w-full h-full rounded-xl border border-slate-800/80 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
