import { useState, useEffect } from 'react';
import { useAppStore } from '../state/store';
import { householdService, roomService, batchService } from '../services/firestore';
import { computeAssignments, calculateWeekIndex } from '../lib/rotation';
import { Household, Room } from '../lib/types';
import dayjs from '../config/dayjs';

export const useHousehold = () => {
  const { user, household, rooms, setHousehold, setRooms } = useAppStore();
  const [loading, setLoading] = useState(false);

  // Load household and rooms data
  useEffect(() => {
    if (user && !household) {
      loadHouseholdData();
    }
  }, [user]);

  const loadHouseholdData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load household data (you might need to store householdId in user profile)
      // For now, we'll assume the user is part of one household
      // In a real app, you'd store the householdId in the user's profile
      
      // Load rooms for the household
      if (household) {
        const roomsData = await roomService.getByHouseholdId(household.id);
        setRooms(roomsData);
      }
    } catch (error) {
      console.error('Error loading household data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createHousehold = async (name: string, cleaningDay: number = 0) => {
    if (!user) throw new Error('No user logged in');
    
    setLoading(true);
    try {
      const joinCode = generateJoinCode();
      const newHousehold = await householdService.create({
        name,
        adminId: user.id,
        members: [user.id],
        joinCode,
        cleaningDay,
      });
      
      setHousehold(newHousehold);
      return newHousehold;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const joinHousehold = async (joinCode: string) => {
    if (!user) throw new Error('No user logged in');
    
    setLoading(true);
    try {
      const householdData = await householdService.getByJoinCode(joinCode);
      if (!householdData) {
        throw new Error('Invalid join code');
      }
      
      // Add user to household members
      const updatedMembers = [...householdData.members, user.id];
      await householdService.update(householdData.id, { members: updatedMembers });
      
      setHousehold({ ...householdData, members: updatedMembers });
      return householdData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const leaveHousehold = async () => {
    if (!user || !household) throw new Error('No household to leave');
    
    setLoading(true);
    try {
      const updatedMembers = household.members.filter(memberId => memberId !== user.id);
      
      if (updatedMembers.length === 0) {
        // Delete household if no members left
        await batchService.deleteHouseholdData(household.id);
        setHousehold(null);
        setRooms([]);
      } else {
        // Update household members
        await householdService.update(household.id, { members: updatedMembers });
        setHousehold({ ...household, members: updatedMembers });
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addRoom = async (name: string, preset: string, customTasks?: string[], cleaningFrequency?: string, customFrequency?: string) => {
    if (!household) throw new Error('No household selected');
    
    setLoading(true);
    try {
      // Prepare room data, only including defined values
      const roomData: any = {
        householdId: household.id,
        name,
        preset: preset as any,
      };

      // Only add customTasks if provided
      if (customTasks && customTasks.length > 0) {
        roomData.customTasks = customTasks;
      }

      // Only add cleaningFrequency if provided
      if (cleaningFrequency) {
        roomData.cleaningFrequency = cleaningFrequency as any;
      }

      // Only add customFrequency if provided and not empty
      if (customFrequency && customFrequency.trim()) {
        roomData.customFrequency = customFrequency;
      }

      const newRoom = await roomService.create(roomData);
      
      setRooms([...rooms, newRoom]);
      return newRoom;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateRoom = async (roomId: string, updates: Partial<Room>) => {
    setLoading(true);
    try {
      // Filter out undefined values before sending to Firestore
      const cleanUpdates: any = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanUpdates[key] = value;
        }
      });

      await roomService.update(roomId, cleanUpdates);
      setRooms(rooms.map(room => 
        room.id === roomId ? { ...room, ...cleanUpdates } : room
      ));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId: string) => {
    setLoading(true);
    try {
      await roomService.delete(roomId);
      setRooms(rooms.filter(room => room.id !== roomId));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateAssignments = async (weekIndex?: number) => {
    if (!household || !rooms.length) return;
    
    const targetWeekIndex = weekIndex ?? calculateWeekIndex(dayjs());
    const memberIds = household.members;
    const roomIds = rooms.map(room => room.id);
    
    const assignments = computeAssignments(memberIds, roomIds, targetWeekIndex);
    
    try {
      await batchService.createAssignments(assignments);
    } catch (error) {
      console.error('Error generating assignments:', error);
      throw error;
    }
  };

  const generateJoinCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  return {
    household,
    rooms,
    loading,
    createHousehold,
    joinHousehold,
    leaveHousehold,
    addRoom,
    updateRoom,
    deleteRoom,
    generateAssignments,
    loadHouseholdData,
  };
};
