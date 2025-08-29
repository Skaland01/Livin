import { Assignment } from './rotation';

// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  notificationSettings: {
    weeklyReminder: boolean;
    lateDayNudge: boolean;
  };
}

// Household types
export interface Household {
  id: string;
  name: string;
  adminId: string;
  members: string[];
  joinCode: string;
  cleaningDay: number; // 0 = Sunday, 1 = Monday, etc.
  createdAt: Date;
  updatedAt: Date;
}

// Room types
export interface Room {
  id: string;
  householdId: string;
  name: string;
  preset: RoomPreset;
  customTasks?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type RoomPreset = 'Bathroom' | 'Kitchen' | 'LivingRoom' | 'Hallway' | 'Custom';

// Task completion types
export interface TaskCompletion {
  id: string;
  assignmentId: string;
  userId: string;
  roomId: string;
  weekIndex: number;
  completedTasks: string[];
  completedAt: Date;
  createdAt: Date;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  TaskDetail: { assignmentId: string };
  HouseholdAdmin: undefined;
  RoomsEditor: undefined;
};

export type TabParamList = {
  Tasks: undefined;
  Shopping: undefined;
  Household: undefined;
  Profile: undefined;
};

// Form types
export interface SignInForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  email: string;
  password: string;
  displayName: string;
}

export interface CreateHouseholdForm {
  name: string;
  cleaningDay: number;
}

export interface JoinHouseholdForm {
  joinCode: string;
}

export interface RoomForm {
  name: string;
  preset: RoomPreset;
  customTasks?: string[];
}

export interface UserProfileForm {
  displayName: string;
  notificationSettings: {
    weeklyReminder: boolean;
    lateDayNudge: boolean;
  };
}

export interface TaskCompletionForm {
  completedTasks: string[];
}

// UI types
export type Theme = 'dark' | 'light';

export type TaskView = 'thisWeek' | 'upcoming' | 'all';

// Extended assignment type with room details
export interface AssignmentWithRoom extends Assignment {
  room: Room;
  dueDate: Date;
  isOverdue: boolean;
  completion?: TaskCompletion;
}
