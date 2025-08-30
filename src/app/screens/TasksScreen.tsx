import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../state/store';
import { useHousehold } from '../../hooks/useHousehold';
import { useAssignments } from '../../hooks/useAssignments';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Segmented } from '../../components/Tabs/Segmented';
import { colors } from '../../theme/colors';
import { tokens } from '../../theme/tokens';
import { TaskView, AssignmentWithRoom } from '../../lib/types';
import dayjs from '../../config/dayjs';
import { computeAssignments, calculateWeekIndex, getDueDate } from '../../lib/rotation';
import { batchService } from '../../services/firestore';

type TimeRange = '1week' | '2weeks' | '1month' | '3months' | '6months';

interface TimeRangeOption {
  label: string;
  value: TimeRange;
  weeks: number;
}

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { label: '1 Week', value: '1week', weeks: 1 },
  { label: '2 Weeks', value: '2weeks', weeks: 2 },
  { label: '1 Month', value: '1month', weeks: 4 },
  { label: '3 Months', value: '3months', weeks: 12 },
  { label: '6 Months', value: '6months', weeks: 24 },
];

export const TasksScreen: React.FC = () => {
  const navigation = useNavigation();
  const { household, rooms, loading: householdLoading } = useHousehold();
  const { assignments, loading: assignmentsLoading, loadAssignments, completeTasks } = useAssignments();
  const [selectedView, setSelectedView] = useState<TaskView>('thisWeek');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('2weeks');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Record<string, string[]>>({});
  const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);

  useEffect(() => {
    if (household) {
      loadAssignments(selectedView);
    }
  }, [household, selectedView]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAssignments(selectedView);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewChange = (view: TaskView) => {
    setSelectedView(view);
  };

  const getCurrentTimeRangeOption = () => {
    return TIME_RANGE_OPTIONS.find(option => option.value === selectedTimeRange) || TIME_RANGE_OPTIONS[1];
  };

  // Get current week's assignments (including overdue tasks from previous weeks)
  const getCurrentWeekAssignments = () => {
    if (!household || !rooms.length) return [];
    
    const currentWeekIndex = calculateWeekIndex(dayjs());
    const currentUser = useAppStore.getState().user;
    if (!currentUser) return [];
    
    // Get existing assignments for current week
    const existingAssignments = assignments.filter(a => a.weekIndex === currentWeekIndex);
    
    // Get overdue assignments from previous weeks (not completed)
    const overdueAssignments = assignments.filter(a => {
      const dueDate = getDueDate(a.weekIndex, household.cleaningDay);
      const isOverdue = dayjs().isAfter(dueDate, 'day');
      const isNotCompleted = !a.completion;
      return isOverdue && isNotCompleted && a.userId === currentUser.id;
    }).map(assignment => {
      const room = rooms.find(r => r.id === assignment.roomId);
      if (!room) return null;
      
      const dueDate = getDueDate(assignment.weekIndex, household.cleaningDay);
      
      return {
        ...assignment,
        room,
        dueDate: dueDate.toDate(),
        isOverdue: true,
      };
    }).filter(Boolean) as AssignmentWithRoom[];
    
    // If we have existing assignments for current week, return them with overdue tasks
    if (existingAssignments.length > 0) {
      return [...overdueAssignments, ...existingAssignments];
    }
    
    // Otherwise, compute what the assignments should be for this week
    // For current week, we don't mark them as computed since the week has started
    const computedAssignments = computeAssignments(
      household.members,
      rooms.map(r => r.id),
      currentWeekIndex
    );
    
    const userAssignments = computedAssignments.filter(a => a.userId === currentUser.id);
    
    // Convert to AssignmentWithRoom format
    const currentWeekWithRooms = userAssignments.map(assignment => {
      const room = rooms.find(r => r.id === assignment.roomId);
      if (!room) return null;
      
      const dueDate = getDueDate(assignment.weekIndex, household.cleaningDay);
      
      return {
        ...assignment,
        id: `current-${assignment.roomId}-${assignment.weekIndex}`, // Mark as current week (not computed)
        room,
        dueDate: dueDate.toDate(),
        isOverdue: false,
        completion: undefined,
      };
    }).filter(Boolean) as AssignmentWithRoom[];
    
    return [...overdueAssignments, ...currentWeekWithRooms];
  };

  // Get upcoming assignments (including computed ones for future weeks)
  const getUpcomingAssignments = () => {
    if (!household || !rooms.length) return [];
    
    const currentWeek = calculateWeekIndex(dayjs());
    const timeRangeOption = getCurrentTimeRangeOption();
    const maxWeekIndex = currentWeek + timeRangeOption.weeks;
    
    // Get existing assignments in the time range
    const existingAssignments = assignments.filter(a => 
      a.weekIndex > currentWeek && a.weekIndex <= maxWeekIndex
    );
    
    // Compute assignments for all weeks in the time range
    const computedAssignments: AssignmentWithRoom[] = [];
    const currentUser = useAppStore.getState().user;
    if (!currentUser) return existingAssignments;
    
    // Generate assignments for each week in the range
    for (let weekIndex = currentWeek + 1; weekIndex <= maxWeekIndex; weekIndex++) {
      const weekAssignments = computeAssignments(
        household.members,
        rooms.map(r => r.id),
        weekIndex
      );
      
      // Find assignments for current user
      const userAssignments = weekAssignments.filter(a => a.userId === currentUser.id);
      
      // Convert to AssignmentWithRoom format
      const enrichedAssignments = userAssignments.map(assignment => {
        const room = rooms.find(r => r.id === assignment.roomId);
        if (!room) return null;
        
        // Calculate due date based on household cleaning day
        const dueDate = getDueDate(assignment.weekIndex, household.cleaningDay);
        
        return {
          ...assignment,
          id: `computed-${assignment.roomId}-${assignment.weekIndex}`,
          room,
          dueDate: dueDate.toDate(),
          isOverdue: false,
          completion: undefined,
        };
      }).filter(Boolean) as AssignmentWithRoom[];
      
      computedAssignments.push(...enrichedAssignments);
    }
    
    // Merge existing and computed assignments, prioritizing existing ones
    const existingIds = new Set(existingAssignments.map(a => `${a.roomId}-${a.weekIndex}`));
    const uniqueComputedAssignments = computedAssignments.filter(a => 
      !existingIds.has(`${a.roomId}-${a.weekIndex}`)
    );
    
    return [...existingAssignments, ...uniqueComputedAssignments];
  };

  const getFilteredAssignments = () => {
    switch (selectedView) {
      case 'thisWeek':
        return getCurrentWeekAssignments();
      case 'upcoming':
        return getUpcomingAssignments();
      case 'all':
        return assignments;
      default:
        return assignments;
    }
  };

  const getTaskStats = () => {
    const filteredAssignments = getFilteredAssignments();
    const totalTasks = filteredAssignments.reduce((acc, assignment) => {
      const roomTasks = assignment.room.customTasks || [];
      return acc + roomTasks.length;
    }, 0);
    
    const completedTasks = filteredAssignments.reduce((acc, assignment) => {
      return acc + (assignment.completion?.completedTasks.length || 0);
    }, 0);

    const overdueTasks = filteredAssignments.filter(a => a.isOverdue).length;
    const dueToday = filteredAssignments.filter(a => 
      dayjs(a.dueDate).isSame(dayjs(), 'day')
    ).length;

    return {
      total: totalTasks,
      completed: completedTasks,
      overdue: overdueTasks,
      dueToday,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  };

  const getRoomTasks = (assignment: AssignmentWithRoom) => {
    return assignment.room.customTasks || [];
  };

  const toggleAssignmentExpansion = (assignmentId: string) => {
    setExpandedAssignment(expandedAssignment === assignmentId ? null : assignmentId);
  };

  const toggleTaskSelection = (assignmentId: string, task: string) => {
    const currentSelected = selectedTasks[assignmentId] || [];
    const isSelected = currentSelected.includes(task);
    
    const newSelected = isSelected 
      ? currentSelected.filter(t => t !== task)
      : [...currentSelected, task];
    
    setSelectedTasks({
      ...selectedTasks,
      [assignmentId]: newSelected,
    });
  };

  const createCurrentWeekAssignments = async () => {
    if (!household || !rooms.length) return;
    
    try {
      const currentWeekIndex = calculateWeekIndex(dayjs());
      const allAssignments = computeAssignments(
        household.members,
        rooms.map(r => r.id),
        currentWeekIndex
      );
      
      // Add householdId to assignments
      const assignmentsWithHousehold = allAssignments.map(assignment => ({
        ...assignment,
        householdId: household.id,
      }));
      
      await batchService.createAssignments(assignmentsWithHousehold);
      Alert.alert('Success', 'Assignments created for this week!');
      
      // Reload assignments
      await loadAssignments(selectedView);
    } catch (error) {
      Alert.alert('Error', 'Failed to create assignments. Please try again.');
    }
  };

  const handleCompleteTasks = async (assignmentId: string, allTasks: boolean = false) => {
    // For computed assignments (future weeks), we can't complete them since they don't exist in DB yet
    if (assignmentId.startsWith('computed-')) {
      Alert.alert(
        'Cannot Complete Yet', 
        'This assignment hasn\'t been created yet. Would you like to create assignments for this week?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Assignments', onPress: createCurrentWeekAssignments },
        ]
      );
      return;
    }

    // For current week assignments that don't exist in DB yet, create them first
    if (assignmentId.startsWith('current-')) {
      try {
        await createCurrentWeekAssignments();
        return;
      } catch (error) {
        Alert.alert('Error', 'Failed to create assignments. Please try again.');
        return;
      }
    }

    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      Alert.alert('Error', 'Assignment not found.');
      return;
    }

    let selectedTaskList: string[];
    
    if (allTasks) {
      selectedTaskList = assignment.room.customTasks || [];
    } else {
      selectedTaskList = selectedTasks[assignmentId] || [];
      if (selectedTaskList.length === 0) {
        Alert.alert('No Tasks Selected', 'Please select at least one task to mark as complete.');
        return;
      }
    }

    try {
      await completeTasks(assignmentId, selectedTaskList);
      setSelectedTasks({
        ...selectedTasks,
        [assignmentId]: [],
      });
      setExpandedAssignment(null);
      Alert.alert('Success', 'Tasks marked as complete!');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete tasks. Please try again.');
    }
  };

  const getPriorityColor = (assignment: AssignmentWithRoom) => {
    if (assignment.isOverdue) return colors.dark.error;
    if (dayjs(assignment.dueDate).isSame(dayjs(), 'day')) return colors.dark.warning;
    if (dayjs(assignment.dueDate).isBefore(dayjs().add(3, 'day'))) return colors.dark.accent;
    return colors.dark.success;
  };

  const getPriorityLabel = (assignment: AssignmentWithRoom) => {
    if (assignment.isOverdue) return 'OVERDUE';
    if (dayjs(assignment.dueDate).isSame(dayjs(), 'day')) return 'DUE TODAY';
    if (dayjs(assignment.dueDate).isBefore(dayjs().add(3, 'day'))) return 'DUE SOON';
    return 'UPCOMING';
  };

  const getOverdueMessage = (assignment: AssignmentWithRoom) => {
    if (!assignment.isOverdue) return null;
    
    const dueDate = dayjs(assignment.dueDate);
    const daysOverdue = dayjs().diff(dueDate, 'day');
    
    if (daysOverdue === 1) {
      return 'Overdue by 1 day';
    } else if (daysOverdue < 7) {
      return `Overdue by ${daysOverdue} days`;
    } else {
      const weeksOverdue = Math.floor(daysOverdue / 7);
      return `Overdue by ${weeksOverdue} week${weeksOverdue > 1 ? 's' : ''}`;
    }
  };

  const renderTaskItem = (assignment: AssignmentWithRoom, task: string, index: number) => {
    const isCompleted = assignment.completion?.completedTasks.includes(task) || false;
    const isSelected = selectedTasks[assignment.id]?.includes(task) || false;
    const isComputed = assignment.id?.startsWith('computed-');
    const isCurrentWeek = assignment.id?.startsWith('current-');

         return (
       <TouchableOpacity
         key={`${assignment.id}-${task}-${index}`}
         style={[
           styles.taskItem,
           isCompleted && styles.taskItemCompleted,
           isSelected && styles.taskItemSelected,
           isComputed && styles.taskItemComputed,
         ]}
         onPress={() => toggleTaskSelection(assignment.id, task)}
         disabled={isCompleted || isComputed}
       >
        <View style={styles.taskItemContent}>
          <View style={styles.taskCheckbox}>
            {isCompleted ? (
              <Ionicons name="checkmark-circle" size={20} color={colors.dark.success} />
            ) : isSelected ? (
              <Ionicons name="checkmark-circle" size={20} color={colors.dark.accent} />
            ) : (
              <Ionicons name="ellipse-outline" size={20} color={colors.dark.textSecondary} />
            )}
          </View>
          <Text style={[
            styles.taskText,
            isCompleted && styles.taskTextCompleted,
          ]}>
            {task}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAssignmentCard = (assignment: AssignmentWithRoom) => {
    const isExpanded = expandedAssignment === assignment.id;
    const roomTasks = getRoomTasks(assignment);
    const completedCount = assignment.completion?.completedTasks.length || 0;
    const totalTasks = roomTasks.length;
    const progressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
    const hasSelectedTasks = (selectedTasks[assignment.id] || []).length > 0;
    const isComputed = assignment.id.startsWith('computed-');
    const isCurrentWeek = assignment.id.startsWith('current-');
    
    // Calculate week number relative to current week
    const currentWeek = calculateWeekIndex(dayjs());
    const weekNumber = assignment.weekIndex - currentWeek;
    const weekLabel = weekNumber === 0 ? 'This Week' : 
                     weekNumber === 1 ? 'Next Week' : 
                     `Week ${weekNumber}`;

    return (
      <Card
        key={assignment.id}
        variant="elevated"
        style={[
          styles.assignmentCard,
          {
            borderLeftWidth: 4,
            borderLeftColor: getPriorityColor(assignment),
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => toggleAssignmentExpansion(assignment.id)}
          activeOpacity={0.7}
        >
          <View style={styles.assignmentHeader}>
            <View style={styles.assignmentInfo}>
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{assignment.room.name}</Text>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(assignment) + '20' }
                ]}>
                  <Text style={[
                    styles.priorityText,
                    { color: getPriorityColor(assignment) }
                  ]}>
                    {getPriorityLabel(assignment)}
                  </Text>
                </View>
                {isComputed && (
                  <View style={styles.computedBadge}>
                    <Text style={styles.computedText}>NEW</Text>
                  </View>
                )}
              </View>
                             <View style={styles.dateInfo}>
                 <Text style={styles.weekLabel}>{weekLabel}</Text>
                 <Text style={styles.dueDate}>
                   Due: {dayjs(assignment.dueDate).format('MMM D, YYYY')}
                 </Text>
                 {assignment.isOverdue && (
                   <Text style={styles.overdueMessage}>
                     {getOverdueMessage(assignment)}
                   </Text>
                 )}
               </View>
            </View>
            
                         <View style={styles.assignmentActions}>
               <View style={styles.progressContainer}>
                 <View style={styles.progressHeader}>
                   <Text style={styles.progressLabel}>Progress</Text>
                   <Text style={styles.progressText}>
                     {completedCount}/{totalTasks}
                   </Text>
                 </View>
                 <View style={styles.progressBar}>
                   <View 
                     style={[
                       styles.progressFill,
                       { width: `${progressPercentage}%` }
                     ]} 
                   />
                 </View>
               </View>
               
               <View style={styles.expandButton}>
                 <Ionicons 
                   name={isExpanded ? "chevron-up" : "chevron-down"} 
                   size={18} 
                   color={colors.dark.textSecondary} 
                 />
               </View>
             </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.tasksContainer}>
              {roomTasks.length > 0 ? (
                roomTasks.map((task, index) => renderTaskItem(assignment, task, index))
              ) : (
                <View style={styles.noTasksContainer}>
                  <Text style={styles.noTasksText}>No tasks configured for this room</Text>
                  <Button
                    title="Add Tasks"
                    onPress={() => navigation.navigate('RoomsEditor' as any)}
                    variant="outline"
                    size="sm"
                  />
                </View>
              )}
            </View>
            
                         {!assignment.completion && roomTasks.length > 0 && !isComputed && !isCurrentWeek && (
               <View style={styles.actionButtons}>
                 <Button
                   title="Mark Selected Complete"
                   onPress={() => handleCompleteTasks(assignment.id, false)}
                   disabled={!hasSelectedTasks}
                   variant={hasSelectedTasks ? "primary" : "secondary"}
                   style={styles.completeButton}
                 />
                 <Button
                   title="Mark All Complete"
                   onPress={() => handleCompleteTasks(assignment.id, true)}
                   variant="outline"
                   style={styles.completeAllButton}
                 />
               </View>
             )}
             
             {!assignment.completion && roomTasks.length > 0 && isCurrentWeek && (
               <View style={styles.actionButtons}>
                 <Button
                   title="Mark Selected Complete"
                   onPress={() => handleCompleteTasks(assignment.id, false)}
                   disabled={!hasSelectedTasks}
                   variant={hasSelectedTasks ? "primary" : "secondary"}
                   style={styles.completeButton}
                 />
                 <Button
                   title="Mark All Complete"
                   onPress={() => handleCompleteTasks(assignment.id, true)}
                   variant="outline"
                   style={styles.completeAllButton}
                 />
               </View>
             )}
             
             {!assignment.completion && roomTasks.length > 0 && isComputed && (
               <View style={styles.computedNotice}>
                 <Text style={styles.computedNoticeText}>
                   This assignment will be available for completion once the week starts.
                 </Text>
               </View>
             )}
            
            {assignment.completion && (
              <View style={styles.completionInfo}>
                <View style={styles.completionHeader}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.dark.success} />
                  <Text style={styles.completionTitle}>Completed</Text>
                </View>
                <Text style={styles.completionDate}>
                  {dayjs(assignment.completion.completedAt).format('MMM D, YYYY [at] h:mm A')}
                </Text>
              </View>
            )}
          </View>
        )}
      </Card>
    );
  };

  const renderTimeRangeModal = () => (
    <Modal
      visible={showTimeRangeModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowTimeRangeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Time Range</Text>
            <TouchableOpacity
              onPress={() => setShowTimeRangeModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.dark.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.timeRangeOptions}>
            {TIME_RANGE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.timeRangeOption,
                  selectedTimeRange === option.value && styles.timeRangeOptionSelected,
                ]}
                onPress={() => {
                  setSelectedTimeRange(option.value);
                  setShowTimeRangeModal(false);
                }}
              >
                <Text style={[
                  styles.timeRangeOptionText,
                  selectedTimeRange === option.value && styles.timeRangeOptionTextSelected,
                ]}>
                  {option.label}
                </Text>
                {selectedTimeRange === option.value && (
                  <Ionicons name="checkmark" size={20} color={colors.dark.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!household) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="No Household"
          message="You need to create or join a household to get started with cleaning tasks."
          primaryAction={{
            title: 'Create Household',
            onPress: () => navigation.navigate('HouseholdAdmin' as any),
          }}
          secondaryAction={{
            title: 'Join Household',
            onPress: () => navigation.navigate('HouseholdAdmin' as any),
          }}
        />
      </View>
    );
  }

  if (rooms.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="No Rooms Configured"
          message="Add some rooms to your household to start getting cleaning assignments."
          primaryAction={{
            title: 'Add Rooms',
            onPress: () => navigation.navigate('RoomsEditor' as any),
          }}
        />
      </View>
    );
  }

  const filteredAssignments = getFilteredAssignments();
  const stats = getTaskStats();
  const currentTimeRange = getCurrentTimeRangeOption();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>My Tasks</Text>
          <Text style={styles.subtitle}>
            {household.name} • {rooms.length} rooms
          </Text>
          <Text style={styles.currentDate}>
            {dayjs().format('dddd, MMMM D, YYYY')}
          </Text>
        </View>

                 {/* Stats Overview */}
         <View style={styles.statsContainer}>
           <View style={styles.statsRow}>
             <View style={styles.statItem}>
               <Text style={styles.statNumber}>{stats.completionRate}%</Text>
               <Text style={styles.statLabel}>Completion</Text>
             </View>
             <View style={styles.statDivider} />
             <View style={styles.statItem}>
               <Text style={styles.statNumber}>{stats.completed}</Text>
               <Text style={styles.statLabel}>Completed</Text>
             </View>
             <View style={styles.statDivider} />
             <View style={styles.statItem}>
               <Text style={[styles.statNumber, { color: colors.dark.error }]}>{stats.overdue}</Text>
               <Text style={styles.statLabel}>Overdue</Text>
             </View>
             <View style={styles.statDivider} />
             <View style={styles.statItem}>
               <Text style={[styles.statNumber, { color: colors.dark.warning }]}>{stats.dueToday}</Text>
               <Text style={styles.statLabel}>Due Today</Text>
             </View>
           </View>
         </View>

        {/* View Selector */}
        <View style={styles.viewSelectorContainer}>
          <Segmented
            options={[
              { label: 'This Week', value: 'thisWeek' },
              { label: 'Upcoming', value: 'upcoming' },
              { label: 'All', value: 'all' },
            ]}
            selectedValue={selectedView}
            onValueChange={handleViewChange}
          />
        </View>

        {/* Time Range Selector for Upcoming */}
        {selectedView === 'upcoming' && (
          <View style={styles.timeRangeContainer}>
            <TouchableOpacity
              style={styles.timeRangeSelector}
              onPress={() => setShowTimeRangeModal(true)}
            >
              <Text style={styles.timeRangeLabel}>Time Range:</Text>
              <Text style={styles.timeRangeValue}>{currentTimeRange.label}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.dark.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

                 {/* Assignments */}
         <View style={styles.assignmentsContainer}>
           {filteredAssignments.length === 0 ? (
             <EmptyState
               title="No Tasks Found"
               message={
                 selectedView === 'thisWeek' 
                   ? "You don't have any tasks for this week. Create assignments to get started!"
                   : selectedView === 'upcoming'
                   ? `You don't have any tasks in the next ${currentTimeRange.label.toLowerCase()}.`
                   : "You don't have any tasks."
               }
               icon="📋"
               primaryAction={
                 selectedView === 'thisWeek' ? {
                   title: 'Create This Week\'s Assignments',
                   onPress: createCurrentWeekAssignments,
                 } : undefined
               }
             />
           ) : (
             filteredAssignments.map(renderAssignmentCard)
           )}
         </View>
      </ScrollView>

      {renderTimeRangeModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl * 2,
  },
  header: {
    marginBottom: tokens.spacing.lg,
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.sm,
  },
  title: {
    fontSize: tokens.typography.sizes['2xl'],
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    marginBottom: tokens.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xs,
  },
  currentDate: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
    fontWeight: tokens.typography.weights.medium,
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.card,
    borderRadius: tokens.borderRadius.lg,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.border,
    shadowColor: colors.dark.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.dark.border,
    marginHorizontal: tokens.spacing.xs,
  },
  statNumber: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.accent,
    marginBottom: tokens.spacing.xs,
  },
  statLabel: {
    fontSize: tokens.typography.sizes.xs,
    color: colors.dark.textSecondary,
    fontWeight: tokens.typography.weights.medium,
    textAlign: 'center',
    lineHeight: 14,
  },
  viewSelectorContainer: {
    marginBottom: tokens.spacing.lg,
  },
  timeRangeContainer: {
    marginBottom: tokens.spacing.lg,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.card,
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    shadowColor: colors.dark.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeRangeLabel: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
    marginRight: tokens.spacing.sm,
  },
  timeRangeValue: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textPrimary,
    fontWeight: tokens.typography.weights.medium,
    flex: 1,
  },
  assignmentsContainer: {
    gap: tokens.spacing.md,
  },
  assignmentCard: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.border,
    borderWidth: 1,
    borderRadius: tokens.borderRadius.lg,
    marginBottom: 0,
    shadowColor: colors.dark.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  assignmentInfo: {
    flex: 1,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
    flexWrap: 'wrap',
  },
  roomName: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semibold,
    color: colors.dark.textPrimary,
    marginRight: tokens.spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.borderRadius.sm,
    marginRight: tokens.spacing.sm,
  },
  priorityText: {
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.medium,
  },
  computedBadge: {
    backgroundColor: colors.dark.accent + '20',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.borderRadius.sm,
  },
  computedText: {
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.medium,
    color: colors.dark.accent,
  },
  dueDate: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
  },
  dateInfo: {
    marginTop: tokens.spacing.xs,
  },
  weekLabel: {
    fontSize: tokens.typography.sizes.xs,
    color: colors.dark.accent,
    fontWeight: tokens.typography.weights.medium,
    marginBottom: tokens.spacing.xs,
  },
  overdueMessage: {
    fontSize: tokens.typography.sizes.xs,
    color: colors.dark.error,
    fontWeight: tokens.typography.weights.medium,
    marginTop: tokens.spacing.xs,
  },
  assignmentActions: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginRight: tokens.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  progressLabel: {
    fontSize: tokens.typography.sizes.xs,
    color: colors.dark.textSecondary,
    fontWeight: tokens.typography.weights.medium,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.dark.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.dark.accent,
    borderRadius: 3,
    shadowColor: colors.dark.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  progressText: {
    fontSize: tokens.typography.sizes.xs,
    color: colors.dark.textPrimary,
    fontWeight: tokens.typography.weights.semibold,
  },
  expandButton: {
    padding: tokens.spacing.xs,
    borderRadius: tokens.borderRadius.sm,
    backgroundColor: colors.dark.bg,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  expandedContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
  },
  tasksContainer: {
    marginBottom: tokens.spacing.lg,
  },
  taskItem: {
    marginBottom: tokens.spacing.xs,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    backgroundColor: colors.dark.bg,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  taskItemCompleted: {
    backgroundColor: colors.dark.success + '10',
  },
  taskItemSelected: {
    backgroundColor: colors.dark.accent + '20',
  },
  taskItemComputed: {
    backgroundColor: colors.dark.accent + '10',
    opacity: 0.7,
  },
  taskItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCheckbox: {
    marginRight: tokens.spacing.sm,
  },
  taskText: {
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.textPrimary,
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.dark.textSecondary,
  },
  noTasksContainer: {
    alignItems: 'center',
    padding: tokens.spacing.lg,
  },
  noTasksText: {
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.textSecondary,
    marginBottom: tokens.spacing.md,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  completeButton: {
    flex: 1,
  },
  completeAllButton: {
    flex: 1,
  },
  computedNotice: {
    backgroundColor: colors.dark.accent + '10',
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.accent + '30',
    alignItems: 'center',
  },
  computedNoticeText: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.accent,
    textAlign: 'center',
    fontWeight: tokens.typography.weights.medium,
  },
  completionInfo: {
    backgroundColor: colors.dark.success + '10',
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.success + '30',
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  completionTitle: {
    fontSize: tokens.typography.sizes.base,
    fontWeight: tokens.typography.weights.semibold,
    color: colors.dark.success,
    marginLeft: tokens.spacing.xs,
  },
  completionDate: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.dark.card,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
    width: '80%',
    maxWidth: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  modalTitle: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
  },
  closeButton: {
    padding: tokens.spacing.xs,
  },
  timeRangeOptions: {
    gap: tokens.spacing.sm,
  },
  timeRangeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    backgroundColor: colors.dark.bg,
  },
  timeRangeOptionSelected: {
    backgroundColor: colors.dark.accent + '20',
    borderWidth: 1,
    borderColor: colors.dark.accent,
  },
  timeRangeOptionText: {
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.textPrimary,
  },
  timeRangeOptionTextSelected: {
    color: colors.dark.accent,
    fontWeight: tokens.typography.weights.medium,
  },
});
