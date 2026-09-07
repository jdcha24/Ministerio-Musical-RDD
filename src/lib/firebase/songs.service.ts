import { db, storage } from './config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Song, SongAttachment, MusicalKey } from '@/types';

const SONGS_COLLECTION = 'songs';

export const SongsService = {
  async getAll(): Promise<Song[]> {
    const q = query(collection(db, SONGS_COLLECTION), orderBy('title', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
  },

  subscribeToSongs(callback: (songs: Song[]) => void) {
    const q = query(collection(db, SONGS_COLLECTION), orderBy('title', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const songs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
      callback(songs);
    });
  },

  async getById(id: string): Promise<Song | null> {
    const docRef = doc(db, SONGS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Song;
  },

  async create(songData: Omit<Song, 'id' | 'attachments' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, SONGS_COLLECTION), {
      ...songData,
      attachments: [],
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async update(id: string, songData: Partial<Song>): Promise<void> {
    const docRef = doc(db, SONGS_COLLECTION, id);
    await updateDoc(docRef, {
      ...songData,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    const song = await this.getById(id);
    if (song && song.attachments?.length) {
      // Eliminar todos los adjuntos de Storage
      for (const att of song.attachments) {
        try {
          const fileRef = ref(storage, att.storagePath);
          await deleteObject(fileRef);
        } catch (e) {
          console.warn('No se pudo borrar archivo en storage:', att.storagePath);
        }
      }
    }
    await deleteDoc(doc(db, SONGS_COLLECTION, id));
  },

  async uploadAttachment(
    songId: string, 
    file: File, 
    key: MusicalKey, 
    label: string, 
    userId: string
  ): Promise<SongAttachment> {
    const attachmentId = crypto.randomUUID();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `songs/${songId}/${key}_${attachmentId}_${sanitizedFileName}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file, {
      contentType: 'application/pdf',
      customMetadata: { songId, key, uploadedBy: userId }
    });

    const downloadURL = await getDownloadURL(storageRef);

    const newAttachment: SongAttachment = {
      id: attachmentId,
      key,
      label: label.trim() || `Cifrado en ${key}`,
      storagePath,
      downloadURL,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId,
    };

    const songRef = doc(db, SONGS_COLLECTION, songId);
    const songDoc = await getDoc(songRef);
    if (songDoc.exists()) {
      const currentAttachments = (songDoc.data().attachments || []) as SongAttachment[];
      await updateDoc(songRef, {
        attachments: [...currentAttachments, newAttachment],
        updatedAt: new Date().toISOString()
      });
    }

    return newAttachment;
  },

  async uploadFileToDrive(
    songId: string,
    file: File,
    key: MusicalKey,
    label: string,
    userId: string
  ): Promise<SongAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('songId', songId);
    formData.append('key', key);
    formData.append('label', label);
    formData.append('userId', userId);

    const res = await fetch('/api/drive/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al subir archivo a Google Drive');
    }

    const newAttachment: SongAttachment = {
      id: crypto.randomUUID(),
      key,
      label: label.trim() || `Cifrado en ${key}`,
      downloadURL: data.previewUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      sourceType: 'drive',
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId,
    };

    const songRef = doc(db, SONGS_COLLECTION, songId);
    const songDoc = await getDoc(songRef);
    if (songDoc.exists()) {
      const currentAttachments = (songDoc.data().attachments || []) as SongAttachment[];
      await updateDoc(songRef, {
        attachments: [...currentAttachments, newAttachment],
        updatedAt: new Date().toISOString()
      });
    }

    return newAttachment;
  },

  async addDriveAttachment(
    songId: string,
    key: MusicalKey,
    label: string,
    driveUrl: string,
    userId: string
  ): Promise<SongAttachment> {
    const attachmentId = crypto.randomUUID();
    let finalUrl = driveUrl.trim();
    
    // Normalizar enlaces de Google Drive a /preview para iframe
    const driveMatch = finalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || finalUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      finalUrl = `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    const newAttachment: SongAttachment = {
      id: attachmentId,
      key,
      label: label.trim() || `Cifrado en ${key}`,
      downloadURL: finalUrl,
      fileName: `Google Drive (${key})`,
      sourceType: 'drive',
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId,
    };

    const songRef = doc(db, SONGS_COLLECTION, songId);
    const songDoc = await getDoc(songRef);
    if (songDoc.exists()) {
      const currentAttachments = (songDoc.data().attachments || []) as SongAttachment[];
      await updateDoc(songRef, {
        attachments: [...currentAttachments, newAttachment],
        updatedAt: new Date().toISOString()
      });
    }

    return newAttachment;
  },

  async deleteAttachment(songId: string, attachment: SongAttachment): Promise<void> {
    if (attachment.storagePath) {
      try {
        const storageRef = ref(storage, attachment.storagePath);
        await deleteObject(storageRef);
      } catch (error) {
        console.warn('El archivo no existía en Storage o ya fue eliminado');
      }
    }

    const songRef = doc(db, SONGS_COLLECTION, songId);
    const songDoc = await getDoc(songRef);
    if (songDoc.exists()) {
      const currentAttachments = (songDoc.data().attachments || []) as SongAttachment[];
      const filtered = currentAttachments.filter(a => a.id !== attachment.id);
      await updateDoc(songRef, {
        attachments: filtered,
        updatedAt: new Date().toISOString()
      });
    }
  }
};
