import { computeAssignments, calculateWeekIndex, generateWeekKey, getDueDate, isOverdue } from '../lib/rotation';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

// Extend dayjs with isoWeek plugin for tests
dayjs.extend(isoWeek);

describe('Rotation Algorithm', () => {
  describe('computeAssignments', () => {
    it('should return empty array for empty inputs', () => {
      const result = computeAssignments([], []);
      expect(result).toEqual([]);
    });

    it('should handle equal number of members and rooms', () => {
      const members = ['user1', 'user2', 'user3'];
      const rooms = ['kitchen', 'bathroom', 'living-room'];
      const weekIndex = 0;

      const result = computeAssignments(members, rooms, weekIndex);

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('userId');
      expect(result[0]).toHaveProperty('roomId');
      expect(result[0]).toHaveProperty('weekIndex');
      expect(result[0].weekIndex).toBe(0);
    });

    it('should handle more members than rooms', () => {
      const members = ['user1', 'user2', 'user3', 'user4', 'user5'];
      const rooms = ['kitchen', 'bathroom'];
      const weekIndex = 1;

      const result = computeAssignments(members, rooms, weekIndex);

      expect(result).toHaveLength(2);
      // Should assign rooms to different users each week
      const assignedUsers = result.map(a => a.userId);
      expect(new Set(assignedUsers).size).toBe(2);
    });

    it('should handle more rooms than members', () => {
      const members = ['user1', 'user2'];
      const rooms = ['kitchen', 'bathroom', 'living-room', 'bedroom'];
      const weekIndex = 2;

      const result = computeAssignments(members, rooms, weekIndex);

      expect(result).toHaveLength(4);
      // Each member should be assigned multiple rooms
      const user1Assignments = result.filter(a => a.userId === 'user1');
      const user2Assignments = result.filter(a => a.userId === 'user2');
      expect(user1Assignments.length).toBeGreaterThan(0);
      expect(user2Assignments.length).toBeGreaterThan(0);
    });

    it('should be deterministic for same inputs', () => {
      const members = ['user1', 'user2', 'user3'];
      const rooms = ['kitchen', 'bathroom', 'living-room'];
      const weekIndex = 5;

      const result1 = computeAssignments(members, rooms, weekIndex);
      const result2 = computeAssignments(members, rooms, weekIndex);

      expect(result1).toEqual(result2);
    });

    it('should rotate assignments across weeks', () => {
      const members = ['user1', 'user2'];
      const rooms = ['kitchen', 'bathroom'];
      
      const week0 = computeAssignments(members, rooms, 0);
      const week1 = computeAssignments(members, rooms, 1);

      // Should have different assignments in different weeks
      expect(week0).not.toEqual(week1);
    });
  });

  describe('calculateWeekIndex', () => {
    it('should calculate correct week index from date', () => {
      const date = dayjs('2024-01-07'); // First Sunday of 2024
      const result = calculateWeekIndex(date);
      expect(result).toBe(0);
    });

    it('should handle different dates in same week', () => {
      const monday = dayjs('2024-01-08');
      const tuesday = dayjs('2024-01-09');
      
      // Both dates should be in the same week
      expect(calculateWeekIndex(monday)).toBe(calculateWeekIndex(tuesday));
    });
  });

  describe('generateWeekKey', () => {
    it('should generate consistent week key', () => {
      const date = dayjs('2024-01-07');
      const result = generateWeekKey(date);
      expect(result).toMatch(/^\d{4}-W\d{2}$/);
    });
  });

  describe('getDueDate', () => {
    it('should return correct due date for Sunday cleaning day', () => {
      const weekIndex = 0;
      const cleaningDay = 0; // Sunday
      const result = getDueDate(weekIndex, cleaningDay);
      
      expect(result.day()).toBe(0); // Sunday
    });
  });

  describe('isOverdue', () => {
    it('should return true for overdue tasks', () => {
      const dueDate = dayjs().subtract(1, 'day');
      const result = isOverdue(dueDate);
      expect(result).toBe(true);
    });

    it('should return false for future tasks', () => {
      const dueDate = dayjs().add(1, 'day');
      const result = isOverdue(dueDate);
      expect(result).toBe(false);
    });
  });
});
