import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Household, Room, TaskCompletion } from '../lib/types';
import { Assignment } from '../lib/rotation';

// User service
export const userService = {
  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, uid: string): Promise<User> {
    const userRef = doc(db, 'users', uid);
    const userData = {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(userRef, userData);
    return { ...userData, id: uid } as User;
  },

  async getById(userId: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  },

  async update(userId: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },
};

// Household service
export const householdService = {
  async create(household: Omit<Household, 'id' | 'createdAt' | 'updatedAt'>): Promise<Household> {
    const householdRef = await addDoc(collection(db, 'households'), {
      ...household,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { ...household, id: householdRef.id } as Household;
  },

  async getById(householdId: string): Promise<Household | null> {
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);
    if (householdSnap.exists()) {
      return { id: householdSnap.id, ...householdSnap.data() } as Household;
    }
    return null;
  },

  async getByJoinCode(joinCode: string): Promise<Household | null> {
    const q = query(
      collection(db, 'households'),
      where('joinCode', '==', joinCode),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Household;
    }
    return null;
  },

  async update(householdId: string, updates: Partial<Household>): Promise<void> {
    const householdRef = doc(db, 'households', householdId);
    await updateDoc(householdRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(householdId: string): Promise<void> {
    const householdRef = doc(db, 'households', householdId);
    await deleteDoc(householdRef);
  },
};

// Room service
export const roomService = {
  async create(room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room> {
    const roomRef = await addDoc(collection(db, 'rooms'), {
      ...room,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { ...room, id: roomRef.id } as Room;
  },

  async getByHouseholdId(householdId: string): Promise<Room[]> {
    const q = query(
      collection(db, 'rooms'),
      where('householdId', '==', householdId),
      orderBy('createdAt')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Room);
  },

  async update(roomId: string, updates: Partial<Room>): Promise<void> {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(roomId: string): Promise<void> {
    const roomRef = doc(db, 'rooms', roomId);
    await deleteDoc(roomRef);
  },
};

// Assignment service
export const assignmentService = {
  async create(assignment: Assignment): Promise<void> {
    const assignmentRef = await addDoc(collection(db, 'assignments'), {
      ...assignment,
      createdAt: serverTimestamp(),
    });
  },

  async getByWeek(householdId: string, weekIndex: number): Promise<Assignment[]> {
    const q = query(
      collection(db, 'assignments'),
      where('householdId', '==', householdId),
      where('weekIndex', '==', weekIndex)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Assignment);
  },

  async getByUser(userId: string, weekIndex?: number): Promise<Assignment[]> {
    const constraints = [where('userId', '==', userId)];
    if (weekIndex !== undefined) {
      constraints.push(where('weekIndex', '==', weekIndex));
    }
    const q = query(collection(db, 'assignments'), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Assignment);
  },
};

// Completion service
export const completionService = {
  async create(completion: Omit<TaskCompletion, 'id' | 'createdAt'>): Promise<TaskCompletion> {
    const completionRef = await addDoc(collection(db, 'completions'), {
      ...completion,
      createdAt: serverTimestamp(),
    });
    return { ...completion, id: completionRef.id } as TaskCompletion;
  },

  async getByAssignment(assignmentId: string): Promise<TaskCompletion | null> {
    const q = query(
      collection(db, 'completions'),
      where('assignmentId', '==', assignmentId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as TaskCompletion;
    }
    return null;
  },

  async update(completionId: string, updates: Partial<TaskCompletion>): Promise<void> {
    const completionRef = doc(db, 'completions', completionId);
    await updateDoc(completionRef, updates);
  },
};

// Batch operations
export const batchService = {
  async createAssignments(assignments: Assignment[]): Promise<void> {
    const batch = writeBatch(db);
    assignments.forEach(assignment => {
      const assignmentRef = doc(collection(db, 'assignments'));
      batch.set(assignmentRef, {
        ...assignment,
        createdAt: serverTimestamp(),
      });
    });
    await batch.commit();
  },

  async deleteHouseholdData(householdId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Delete rooms
    const rooms = await roomService.getByHouseholdId(householdId);
    rooms.forEach(room => {
      const roomRef = doc(db, 'rooms', room.id);
      batch.delete(roomRef);
    });
    
    // Delete assignments
    const assignmentsQuery = query(
      collection(db, 'assignments'),
      where('householdId', '==', householdId)
    );
    const assignmentsSnap = await getDocs(assignmentsQuery);
    assignmentsSnap.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete household
    const householdRef = doc(db, 'households', householdId);
    batch.delete(householdRef);
    
    await batch.commit();
  },
};
