import { db } from './config';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { UserProfile, UserRole, MusicalRole } from '@/types';

const USERS_COLLECTION = 'users';

export const UsersService = {
  async syncUserProfile(firebaseUser: User): Promise<UserProfile> {
    const docRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as UserProfile;
    }

    // Primer usuario registrado puede ser admin o member por defecto
    const allUsersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const isFirstUser = allUsersSnapshot.empty;

    const newProfile: UserProfile = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || 'Músico',
      photoURL: firebaseUser.photoURL || undefined,
      role: isFirstUser ? 'admin' : 'member',
      skills: ['worship_leader'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, newProfile);
    return newProfile;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as UserProfile;
  },

  async getAll(): Promise<UserProfile[]> {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
  },

  async updateRole(userId: string, role: UserRole): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, { role, updatedAt: new Date().toISOString() });
  },

  async updateSkills(userId: string, skills: MusicalRole[]): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, { skills, updatedAt: new Date().toISOString() });
  }
};
