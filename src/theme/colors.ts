export const colors = {
  dark: {
    bg: '#0F1115',
    card: '#151821',
    textPrimary: '#E7ECF3',
    textSecondary: '#A5B0C0',
    accent: '#6AA6FF',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#2A2F3A',
    input: '#1A1F2A',
  },
  light: {
    bg: '#FFFFFF',
    card: '#F6F7F9',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    accent: '#3B82F6',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#E5E7EB',
    input: '#F9FAFB',
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorKey = keyof typeof colors.dark;
