'use client';

import React, { useState, useRef } from 'react';
import { Song, MusicalKey } from '@/types';
import { UploadCloud, X, Link as LinkIcon, FileText, CheckCircle, Info } from 'lucide-react';
import { SongsService } from '@/lib/firebase/songs.service';
import { useAuth } from '@/context/AuthContext';

const ALL_KEYS: MusicalKey[] = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 
  'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'
];

interface Props {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

export const PdfUploadModal: React.FC<Props> = ({ song, isOpen, onClose, onUploaded }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'drive' | 'file'>('drive');
  const [selectedKey, setSelectedKey] = useState<MusicalKey>(song?.originalKey || 'G');
  const [label, setLabel] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !song) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Por favor selecciona únicamente archivos en formato PDF.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type === 'application/pdf') {
        setFile(selected);
        setError(null);
      } else {
        setError('Por favor selecciona únicamente archivos en formato PDF.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUploading(true);
    setError(null);

    try {
      if (tab === 'drive') {
        if (!driveUrl.trim()) {
          setError('Por favor pega el enlace de tu archivo en Google Drive');
          setUploading(false);
          return;
        }

        await SongsService.addDriveAttachment(
          song.id,
          selectedKey,
          label || `Cifrado en ${selectedKey}`,
          driveUrl.trim(),
          user.uid
        );
      } else {
        if (!file) {
          setError('Debes seleccionar un archivo PDF');
          setUploading(false);
          return;
        }

        await SongsService.uploadAttachment(
          song.id,
          file,
          selectedKey,
          label || `Cifrado en ${selectedKey}`,
          user.uid
        );
      }

      onUploaded();
      onClose();
      setFile(null);
      setDriveUrl('');
      setLabel('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al vincular el cifrado');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100">Adjuntar Cifrado / Partitura</h3>
            <p className="text-xs text-slate-400 mt-0.5">{song.title} - {song.artist}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Método: Google Drive vs Archivo Local */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 my-4">
          <button
            type="button"
            onClick={() => setTab('drive')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'drive'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Enlace de Google Drive (Gratis)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('file')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'file'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Subir Archivo PDF</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tono del Cifrado</label>
              <select
                value={selectedKey}
                onChange={e => setSelectedKey(e.target.value as MusicalKey)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {ALL_KEYS.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Etiqueta / Nombre</label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder={`Ej: Cifrado en ${selectedKey}`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {tab === 'drive' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Enlace de Compartir de Google Drive *
                </label>
                <input
                  type="url"
                  required
                  value={driveUrl}
                  onChange={e => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/1XyZ.../view?usp=sharing"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-950/25 border border-indigo-800/30 rounded-xl text-[11px] text-indigo-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Cómo obtenerlo:</strong> En tu Google Drive, haz clic derecho sobre el PDF $\rightarrow$ <em>Compartir</em> $\rightarrow$ asegúrate de que esté en <em>"Cualquier persona con el enlace puede ver"</em> $\rightarrow$ copia y pega el enlace aquí.
                </span>
              </div>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-950/20' 
                  : file 
                    ? 'border-emerald-500/50 bg-emerald-950/10' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
              />

              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200 truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB • Clic para cambiar</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/15 text-indigo-400 flex items-center justify-center mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-200">
                    Arrastra tu archivo PDF aquí o <span className="text-indigo-400 font-semibold">explora</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Máximo 15 MB por archivo</p>
                </div>
              )}
            </div>
          )}

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
              disabled={uploading || (tab === 'drive' ? !driveUrl.trim() : !file)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              {uploading ? 'Guardando...' : (tab === 'drive' ? 'Vincular Google Drive' : 'Subir Archivo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
