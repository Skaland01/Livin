import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

// Extend dayjs with isoWeek plugin
dayjs.extend(isoWeek);

export interface Assignment {
  id?: string;
  userId: string;
  roomId: string;
  weekIndex: number;
}

/**
 * Computes cleaning assignments for a given week
 * Uses a deterministic algorithm that rotates fairly among members
 */
export function computeAssignments(
  members: string[],
  rooms: string[],
  weekIndex: number = 0
): Assignment[] {
  if (members.length === 0 || rooms.length === 0) {
    return [];
  }

  const assignments: Assignment[] = [];
  
  // For each room, assign it to a member using a deterministic rotation
  rooms.forEach((roomId, roomIndex) => {
    // Use a combination of week index and room index to determine assignment
    // This ensures fair rotation and handles cases where N != M
    const memberIndex = (weekIndex + roomIndex) % members.length;
    const userId = members[memberIndex];
    
    assignments.push({
      userId,
      roomId,
      weekIndex,
    });
  });

  return assignments;
}

/**
 * Calculates the week index from a given date
 * Week index represents the number of weeks since the start of 2024
 */
export function calculateWeekIndex(date: dayjs.Dayjs): number {
  const startOf2024 = dayjs('2024-01-01');
  const weekDiff = date.diff(startOf2024, 'week');
  return Math.max(0, weekDiff);
}

/**
 * Generates a consistent week key for database storage
 * Format: YYYY-WNN (e.g., "2024-W01")
 */
export function generateWeekKey(date: dayjs.Dayjs): string {
  const year = date.year();
  const week = date.isoWeek();
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * Gets the due date for a given week index and cleaning day
 * @param weekIndex - The week index
 * @param cleaningDay - Day of week (0 = Sunday, 1 = Monday, etc.)
 */
export function getDueDate(weekIndex: number, cleaningDay: number = 0): dayjs.Dayjs {
  const startOf2024 = dayjs('2024-01-01');
  const weekStart = startOf2024.add(weekIndex, 'week');
  
  // The due date is the cleaning day of that specific week
  // cleaningDay: 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  // We need to convert this to dayjs day format
  // Since dayjs with weekStart=1 uses 1=Monday, 2=Tuesday, ..., 7=Sunday
  let dayjsDay: number;
  if (cleaningDay === 0) {
    dayjsDay = 7; // Sunday in dayjs format
  } else {
    dayjsDay = cleaningDay; // Monday=1, Tuesday=2, etc. already match
  }
  
  const mondayOfWeek = weekStart.startOf('week');
  return mondayOfWeek.day(dayjsDay);
}

/**
 * Checks if a task is overdue
 */
export function isOverdue(dueDate: dayjs.Dayjs): boolean {
  return dayjs().isAfter(dueDate, 'day');
}

/**
 * Gets the next cleaning day based on the configured cleaning day
 */
export function getNextCleaningDay(cleaningDay: number = 0): dayjs.Dayjs {
  const today = dayjs();
  let nextCleaning = today.day(cleaningDay);
  
  // If today is the cleaning day, return today
  if (today.day() === cleaningDay) {
    return today;
  }
  
  // If the cleaning day has already passed this week, move to next week
  if (nextCleaning.isBefore(today, 'day')) {
    nextCleaning = nextCleaning.add(1, 'week');
  }
  
  return nextCleaning;
}
