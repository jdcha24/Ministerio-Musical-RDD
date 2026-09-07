'use client';

import React from 'react';
import { SongAttachment } from '@/types';
import { X, ExternalLink, Download, FileText, Maximize2 } from 'lucide-react';

interface Props {
  attachment: SongAttachment | null;
  songTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<Props> = ({ attachment, songTitle, isOpen, onClose }) => {
  if (!isOpen || !attachment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900 gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate max-w-[200px] sm:max-w-xs">
                    {songTitle || 'Cifrado'}
                  </h3>
                  <span className="text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-md shrink-0">
                    Tono {attachment.key}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{attachment.label}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="sm:hidden p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2">
            <a
              href={attachment.downloadURL}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Pantalla Completa</span>
            </a>
            <a
              href={attachment.downloadURL}
              download={attachment.fileName}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </a>
            <button
              onClick={onClose}
              className="hidden sm:block p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div className="flex-1 bg-slate-950 p-1 flex flex-col">
          <iframe
            src={`${attachment.downloadURL}#toolbar=1&navpanes=0`}
            title={attachment.label}
            className="w-full flex-1 rounded-xl border border-slate-800/80 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
