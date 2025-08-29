import { z } from 'zod';

// Authentication schemas
export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
});

// Household schemas
export const createHouseholdSchema = z.object({
  name: z.string().min(2, 'Household name must be at least 2 characters'),
  cleaningDay: z.number().min(0).max(6, 'Cleaning day must be between 0-6'),
});

export const joinHouseholdSchema = z.object({
  joinCode: z.string().min(6, 'Join code must be at least 6 characters'),
});

// Room schemas
export const roomSchema = z.object({
  name: z.string().min(2, 'Room name must be at least 2 characters'),
  preset: z.enum(['Bathroom', 'Kitchen', 'LivingRoom', 'Hallway', 'Custom']),
  customTasks: z.array(z.string()).optional(),
  cleaningFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'custom']).optional(),
  customFrequency: z.string().optional(),
});

// User profile schema
export const userProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  notificationSettings: z.object({
    weeklyReminder: z.boolean(),
    lateDayNudge: z.boolean(),
  }),
});

// Task completion schema
export const taskCompletionSchema = z.object({
  completedTasks: z.array(z.string()).min(1, 'At least one task must be completed'),
});

// Export inferred types
export type SignInForm = z.infer<typeof signInSchema>;
export type SignUpForm = z.infer<typeof signUpSchema>;
export type CreateHouseholdForm = z.infer<typeof createHouseholdSchema>;
export type JoinHouseholdForm = z.infer<typeof joinHouseholdSchema>;
export type RoomForm = z.infer<typeof roomSchema>;
export type UserProfileForm = z.infer<typeof userProfileSchema>;
export type TaskCompletionForm = z.infer<typeof taskCompletionSchema>;
