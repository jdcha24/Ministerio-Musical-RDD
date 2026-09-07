// ==========================================
// ROLES Y USUARIOS
// ==========================================
export type UserRole = 'admin' | 'leader' | 'member';

export type MusicalRole = 
  | 'worship_leader'
  | 'lead_vocals'
  | 'backing_vocals'
  | 'acoustic_guitar'
  | 'electric_guitar'
  | 'bass'
  | 'keys'
  | 'synth'
  | 'drums'
  | 'sound_engineer'
  | 'media';

export interface UserProfile {
  id: string; // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  skills: MusicalRole[];
  phone?: string;
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

// ==========================================
// CANCIONES Y RECURSOS
// ==========================================
export type MusicalKey = 
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' 
  | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B'
  | 'Cm' | 'C#m' | 'Dbm' | 'Dm' | 'D#m' | 'Ebm' | 'Em' | 'Fm' 
  | 'F#m' | 'Gbm' | 'Gm' | 'G#m' | 'Abm' | 'Am' | 'A#m' | 'Bbm' | 'Bm';

export type TimeSignature = '4/4' | '3/4' | '6/8' | '2/4' | '12/8';

export interface SongAttachment {
  id: string;
  key: MusicalKey;
  label: string; // Ej: "Cifrado Principal", "Partitura Piano", "Lead Sheet"
  storagePath?: string;
  downloadURL: string; // URL de Drive o archivo
  fileName: string;
  fileSize?: number;
  sourceType?: 'drive' | 'upload';
  uploadedAt: string;
  uploadedBy: string; // userId
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey?: MusicalKey;
  bpm?: number;
  timeSignature?: TimeSignature;
  youtubeUrl?: string;
  spotifyUrl?: string;
  ccliNumber?: string;
  lyrics?: string;
  tags?: string[];
  attachments: SongAttachment[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// SERVICIOS, LINEUP Y SETLIST
// ==========================================
export type MemberConfirmationStatus = 'pending' | 'confirmed' | 'declined';

export interface ServiceMemberAssignment {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  role: MusicalRole;
  status: MemberConfirmationStatus;
  notes?: string;
}

export interface SetlistItem {
  id: string;
  songId: string;
  order: number;
  title: string;
  artist: string;
  keyToPlay: MusicalKey;
  bpm?: number;
  timeSignature?: TimeSignature;
  notes?: string;
  attachmentUrlForKey?: string;
}

export type ServiceType = 'sunday_morning' | 'sunday_evening' | 'midweek' | 'special_event' | 'rehearsal';

export interface ServicePlan {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  serviceType: ServiceType;
  leaderId: string;
  leaderName: string;
  rehearsalDateTime?: string;
  notes?: string;
  team: ServiceMemberAssignment[];
  setlist: SetlistItem[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ROLE_LABELS: Record<MusicalRole, string> = {
  worship_leader: 'Líder de Alabanza',
  lead_vocals: 'Voz Principal',
  backing_vocals: 'Coros / Voces',
  acoustic_guitar: 'Guitarra Acústica',
  electric_guitar: 'Guitarra Eléctrica',
  bass: 'Bajo',
  keys: 'Piano / Teclado',
  synth: 'Sintetizador',
  drums: 'Batería',
  sound_engineer: 'Sonido',
  media: 'Multimedia / Proyección',
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  sunday_morning: 'Servicio Dominical - Mañana',
  sunday_evening: 'Servicio Dominical - Tarde/Noche',
  midweek: 'Servicio Entre Semana',
  special_event: 'Evento Especial / Conferencia',
  rehearsal: 'Ensayo General',
};
