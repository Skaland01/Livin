import { create } from 'zustand';
import { User, Household, Room, AssignmentWithRoom, Theme } from '../lib/types';

interface AppState {
  // Authentication
  user: User | null;
  isLoading: boolean;
  
  // Household data
  household: Household | null;
  rooms: Room[];
  currentAssignment: AssignmentWithRoom | null;
  
  // UI state
  theme: Theme;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHousehold: (household: Household | null) => void;
  setRooms: (rooms: Room[]) => void;
  setCurrentAssignment: (assignment: AssignmentWithRoom | null) => void;
  setTheme: (theme: Theme) => void;
  
  // Computed getters
  isAdmin: boolean;
  currentUserAssignment: AssignmentWithRoom | null;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isLoading: false,
  household: null,
  rooms: [],
  currentAssignment: null,
  theme: 'dark',
  
  // Actions
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  setHousehold: (household) => set({ household }),
  setRooms: (rooms) => set({ rooms }),
  setCurrentAssignment: (currentAssignment) => set({ currentAssignment }),
  setTheme: (theme) => set({ theme }),
  
  // Computed getters
  get isAdmin() {
    const { user, household } = get();
    return user && household ? user.id === household.adminId : false;
  },
  
  get currentUserAssignment() {
    const { user, currentAssignment } = get();
    return user && currentAssignment && currentAssignment.userId === user.id 
      ? currentAssignment 
      : null;
  },
}));
