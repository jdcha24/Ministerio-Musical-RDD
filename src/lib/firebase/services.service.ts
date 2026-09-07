import { db } from './config';
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
import { ServicePlan, SetlistItem, ServiceMemberAssignment, MemberConfirmationStatus } from '@/types';

const SERVICES_COLLECTION = 'services';

export const ServicePlanService = {
  async getAll(): Promise<ServicePlan[]> {
    const q = query(collection(db, SERVICES_COLLECTION), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServicePlan));
  },

  subscribeToServices(callback: (services: ServicePlan[]) => void) {
    const q = query(collection(db, SERVICES_COLLECTION), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServicePlan));
      callback(services);
    });
  },

  async getById(id: string): Promise<ServicePlan | null> {
    const docRef = doc(db, SERVICES_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as ServicePlan;
  },

  subscribeToServiceById(id: string, callback: (service: ServicePlan | null) => void) {
    const docRef = doc(db, SERVICES_COLLECTION, id);
    return onSnapshot(docRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
      } else {
        callback({ id: snapshot.id, ...snapshot.data() } as ServicePlan);
      }
    });
  },

  async create(serviceData: Omit<ServicePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, SERVICES_COLLECTION), {
      ...serviceData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async update(id: string, serviceData: Partial<ServicePlan>): Promise<void> {
    const docRef = doc(db, SERVICES_COLLECTION, id);
    await updateDoc(docRef, {
      ...serviceData,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, SERVICES_COLLECTION, id));
  },

  async updateSetlist(serviceId: string, setlist: SetlistItem[]): Promise<void> {
    const docRef = doc(db, SERVICES_COLLECTION, serviceId);
    await updateDoc(docRef, {
      setlist,
      updatedAt: new Date().toISOString()
    });
  },

  async updateTeam(serviceId: string, team: ServiceMemberAssignment[]): Promise<void> {
    const docRef = doc(db, SERVICES_COLLECTION, serviceId);
    await updateDoc(docRef, {
      team,
      updatedAt: new Date().toISOString()
    });
  },

  async respondAssignment(
    serviceId: string, 
    userId: string, 
    status: MemberConfirmationStatus
  ): Promise<void> {
    const docRef = doc(db, SERVICES_COLLECTION, serviceId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return;

    const service = snapshot.data() as ServicePlan;
    const updatedTeam = (service.team || []).map(member => 
      member.userId === userId ? { ...member, status } : member
    );

    await updateDoc(docRef, {
      team: updatedTeam,
      updatedAt: new Date().toISOString()
    });
  }
};
