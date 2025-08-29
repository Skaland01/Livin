import { useState, useEffect } from 'react';
import { useAppStore } from '../state/store';
import { assignmentService, completionService } from '../services/firestore';
import { getDueDate, isOverdue } from '../lib/rotation';
import { AssignmentWithRoom, TaskCompletion } from '../lib/types';
import dayjs from '../config/dayjs';

export const useAssignments = () => {
  const { user, household, rooms } = useAppStore();
  const [assignments, setAssignments] = useState<AssignmentWithRoom[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAssignments = async (view: 'thisWeek' | 'upcoming' | 'all' = 'thisWeek') => {
    if (!user || !household) return;
    
    setLoading(true);
    try {
      let userAssignments;
      
      switch (view) {
        case 'thisWeek':
          const currentWeekIndex = Math.floor(dayjs().diff(dayjs('2024-01-01'), 'week'));
          userAssignments = await assignmentService.getByUser(user.id, currentWeekIndex);
          break;
        case 'upcoming':
          const currentWeek = Math.floor(dayjs().diff(dayjs('2024-01-01'), 'week'));
          userAssignments = await assignmentService.getByUser(user.id);
          userAssignments = userAssignments.filter(a => a.weekIndex > currentWeek);
          break;
        case 'all':
          userAssignments = await assignmentService.getByUser(user.id);
          break;
      }

      // Enrich assignments with room details and completion status
      const enrichedAssignments: AssignmentWithRoom[] = await Promise.all(
        userAssignments.map(async (assignment) => {
          const room = rooms.find(r => r.id === assignment.roomId);
          if (!room) return null;

          const dueDate = getDueDate(assignment.weekIndex, household.cleaningDay);
          const completion = await completionService.getByAssignment(assignment.id);

          return {
            ...assignment,
            room,
            dueDate: dueDate.toDate(),
            isOverdue: isOverdue(dueDate),
            completion,
          };
        })
      );

      setAssignments(enrichedAssignments.filter(Boolean) as AssignmentWithRoom[]);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTasks = async (assignmentId: string, completedTasks: string[]) => {
    if (!user) throw new Error('No user logged in');
    
    setLoading(true);
    try {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) throw new Error('Assignment not found');

      const completion: Omit<TaskCompletion, 'id' | 'createdAt'> = {
        assignmentId,
        userId: user.id,
        roomId: assignment.roomId,
        weekIndex: assignment.weekIndex,
        completedTasks,
        completedAt: new Date(),
      };

      await completionService.create(completion);
      
      // Update local state
      setAssignments(assignments.map(a => 
        a.id === assignmentId 
          ? { ...a, completion: { ...completion, id: '', createdAt: new Date() } }
          : a
      ));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCompletion = async (completionId: string, completedTasks: string[]) => {
    setLoading(true);
    try {
      await completionService.update(completionId, { completedTasks });
      
      // Update local state
      setAssignments(assignments.map(a => 
        a.completion?.id === completionId
          ? { ...a, completion: { ...a.completion!, completedTasks } }
          : a
      ));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRoomDetails = (roomId: string) => {
    return rooms.find(room => room.id === roomId);
  };

  const getCurrentWeekAssignments = () => {
    const currentWeekIndex = Math.floor(dayjs().diff(dayjs('2024-01-01'), 'week'));
    return assignments.filter(a => a.weekIndex === currentWeekIndex);
  };

  const getUpcomingAssignments = () => {
    const currentWeekIndex = Math.floor(dayjs().diff(dayjs('2024-01-01'), 'week'));
    return assignments.filter(a => a.weekIndex > currentWeekIndex);
  };

  return {
    assignments,
    loading,
    loadAssignments,
    completeTasks,
    updateCompletion,
    getRoomDetails,
    getCurrentWeekAssignments,
    getUpcomingAssignments,
  };
};
