'use client';

import React, { useState, useEffect } from 'react';
import { 
  ServicePlan, 
  ROLE_LABELS, 
  SERVICE_TYPE_LABELS, 
  Song,
  MusicalRole 
} from '@/types';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Music, 
  MessageSquare, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { SongsService } from '@/lib/firebase/songs.service';

interface Props {
  isOpen: boolean;
  service: ServicePlan;
  initialTab?: 'team' | 'setlist';
  onClose: () => void;
}

const ROLE_EMOJIS: Record<MusicalRole, string> = {
  worship_leader: '🎤',
  lead_vocals: '🎙️',
  backing_vocals: '🗣️',
  acoustic_guitar: '🎸',
  electric_guitar: '⚡🎸',
  bass: '🎸',
  keys: '🎹',
  synth: '🎹',
  drums: '🥁',
  sound_engineer: '🎛️',
  media: '📽️',
};

export const ShareServiceModal: React.FC<Props> = ({
  isOpen,
  service,
  initialTab = 'team',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'team' | 'setlist'>(initialTab);
  const [songsMap, setSongsMap] = useState<Record<string, Song>>({});
  const [teamMessage, setTeamMessage] = useState('');
  const [setlistMessage, setSetlistMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Cargar catálogo de canciones para resolver links de YouTube y PDFs
  useEffect(() => {
    if (isOpen) {
      SongsService.getAll().then(songs => {
        const map: Record<string, Song> = {};
        songs.forEach(s => {
          map[s.id] = s;
        });
        setSongsMap(map);
      });
    }
  }, [isOpen]);

  // Formatear Fecha amigable
  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Generador Plantilla 1: Convocatoria de Equipo / Instrumentos
  const generateTeamTemplate = () => {
    const formattedDate = getFormattedDate(service.date);
    const serviceType = SERVICE_TYPE_LABELS[service.serviceType] || service.title;

    let text = `🙌 *MINISTERIO MUSICAL RÍO* 🙌\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🏛️ *${serviceType.toUpperCase()}*\n`;
    text += `🗓️ *Fecha:* ${formattedDate}\n`;
    text += `⏰ *Hora del Servicio:* ${service.time} hs\n`;

    if (service.rehearsalDateTime) {
      try {
        const rehearsalDate = new Date(service.rehearsalDateTime);
        const rehFormatted = rehearsalDate.toLocaleString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
        text += `🎼 *Hora de Ensayo:* ${rehFormatted} hs\n`;
      } catch {
        text += `🎼 *Hora de Ensayo:* ${service.rehearsalDateTime}\n`;
      }
    }

    text += `👤 *Líder a cargo:* ${service.leaderName || 'Por definir'}\n`;

    if (service.notes) {
      text += `📌 *Notas:* ${service.notes}\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👥 *EQUIPO / MÚSICOS ASIGNADOS:*\n\n`;

    if (service.team && service.team.length > 0) {
      service.team.forEach(member => {
        const emoji = ROLE_EMOJIS[member.role] || '🎵';
        const roleLabel = ROLE_LABELS[member.role] || member.role;
        text += `${emoji} *${roleLabel}:* ${member.userDisplayName}`;
        if (member.notes) {
          text += ` _(${member.notes})_`;
        }
        text += `\n`;
      });
    } else {
      text += `_Aún no se han asignado músicos para esta fecha._\n`;
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🙏 _"Alabadle con salterio y arpa; alabadle con címbalos de júbilo." (Salmos 150)_\n`;
    text += `⚠️ *Por favor confirmar asistencia en la plataforma web.*`;

    return text;
  };

  // Generador Plantilla 2: Setlist de Canciones con Enlaces
  const generateSetlistTemplate = () => {
    const formattedDate = getFormattedDate(service.date);
    const serviceType = SERVICE_TYPE_LABELS[service.serviceType] || service.title;

    let text = `🎵 *SETLIST - MINISTERIO MUSICAL RÍO* 🎵\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🏛️ *${serviceType.toUpperCase()}*\n`;
    text += `🗓️ *Fecha:* ${formattedDate} | ⏰ ${service.time} hs\n`;
    text += `👤 *Líder:* ${service.leaderName || 'Por definir'}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `🎶 *REPERTORIO DE ALABANZA (${service.setlist?.length || 0} CANCIONES):*\n\n`;

    if (service.setlist && service.setlist.length > 0) {
      service.setlist.forEach((item, index) => {
        const originalSong = songsMap[item.songId];
        const tempoLabel = item.tempoType === 'fast' ? '⚡ Rápida' : '❤️ Lenta';
        
        text += `${index + 1}. *${item.title.toUpperCase()}* - _${item.artist}_\n`;
        text += `   • Tipo: *${tempoLabel}* | Tono a tocar: *${item.keyToPlay}*\n`;

        if (item.notes) {
          text += `   • Arreglo/Nota: _${item.notes}_\n`;
        }

        // Link de PDF en Drive (o si la canción tiene adjunto en ese tono)
        const pdfUrl = item.attachmentUrlForKey || originalSong?.attachments?.find(a => a.key === item.keyToPlay)?.downloadURL;
        if (pdfUrl) {
          text += `   📄 Cifrado Drive: ${pdfUrl}\n`;
        }

        // Link de YouTube
        const youtubeUrl = item.youtubeUrl || originalSong?.youtubeUrl;
        if (youtubeUrl) {
          text += `   ▶️ YouTube: ${youtubeUrl}\n`;
        }

        // Link de Spotify
        const spotifyUrl = item.spotifyUrl || originalSong?.spotifyUrl;
        if (spotifyUrl) {
          text += `   🎧 Spotify: ${spotifyUrl}\n`;
        }

        text += `\n`;
      });
    } else {
      text += `_Aún no hay canciones añadidas al setlist._\n\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✨ _"Canten a Él cántico nuevo; háganlo bien, tañendo con júbilo." (Salmos 33:3)_`;

    return text;
  };

  // Sincronizar mensajes cuando cambia el servicio, tab o el mapa de canciones
  useEffect(() => {
    if (isOpen) {
      setTeamMessage(generateTeamTemplate());
      setSetlistMessage(generateSetlistTemplate());
    }
  }, [isOpen, service, songsMap]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const currentMessage = activeTab === 'team' ? teamMessage : setlistMessage;
  const setCurrentMessage = activeTab === 'team' ? setTeamMessage : setSetlistMessage;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(currentMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleResetTemplate = () => {
    if (activeTab === 'team') {
      setTeamMessage(generateTeamTemplate());
    } else {
      setSetlistMessage(generateSetlistTemplate());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Generador de Mensajes</h2>
              <p className="text-xs text-slate-400">Machotes formateados listos para enviar a WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Pestañas */}
        <div className="px-5 sm:px-6 pt-4 flex gap-2 border-b border-slate-800/60 pb-3">
          <button
            onClick={() => {
              setActiveTab('team');
              setCopied(false);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'team'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Convocatoria de Músicos</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('setlist');
              setCopied(false);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'setlist'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>2. Setlist con Enlaces</span>
          </button>
        </div>

        {/* Contenido / Área de Edición y Vista Previa */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              Vista previa del mensaje (puedes editar antes de enviar):
            </span>
            <button
              onClick={handleResetTemplate}
              className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-colors"
              title="Restaurar texto original"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              value={currentMessage}
              onChange={e => setCurrentMessage(e.target.value)}
              rows={12}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400 order-2 sm:order-1">
            {activeTab === 'team' 
              ? `${service.team?.length || 0} integrantes convocados`
              : `${service.setlist?.length || 0} canciones en el repertorio`
            }
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
            <button
              onClick={handleCopy}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                copied
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Mensaje</span>
                </>
              )}
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/25 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar a WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
