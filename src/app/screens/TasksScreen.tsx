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

export const TasksScreen: React.FC = () => {
  const navigation = useNavigation();
  const { household, rooms, loading: householdLoading } = useHousehold();
  const { assignments, loading: assignmentsLoading, loadAssignments, completeTasks } = useAssignments();
  const [selectedView, setSelectedView] = useState<TaskView>('thisWeek');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Record<string, string[]>>({});

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

  const getFilteredAssignments = () => {
    switch (selectedView) {
      case 'thisWeek':
        return assignments.filter(a => a.weekIndex === Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24 * 7)));
      case 'upcoming':
        const currentWeek = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24 * 7));
        return assignments.filter(a => a.weekIndex > currentWeek);
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

  const handleCompleteTasks = async (assignmentId: string, allTasks: boolean = false) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

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

  const renderTaskItem = (assignment: AssignmentWithRoom, task: string, index: number) => {
    const isCompleted = assignment.completion?.completedTasks.includes(task) || false;
    const isSelected = selectedTasks[assignment.id]?.includes(task) || false;

    return (
      <TouchableOpacity
        key={`${assignment.id}-${index}`}
        style={[
          styles.taskItem,
          isCompleted && styles.taskItemCompleted,
          isSelected && styles.taskItemSelected,
        ]}
        onPress={() => toggleTaskSelection(assignment.id, task)}
        disabled={isCompleted}
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
              </View>
              <Text style={styles.dueDate}>
                Due: {dayjs(assignment.dueDate).format('MMM D, YYYY')}
              </Text>
            </View>
            
            <View style={styles.assignmentActions}>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${progressPercentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {completedCount}/{totalTasks}
                </Text>
              </View>
              
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.dark.textSecondary} 
              />
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.tasksContainer}>
              {roomTasks.map((task, index) => renderTaskItem(assignment, task, index))}
            </View>
            
            {!assignment.completion && (
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
          <Text style={styles.title}>Task Management</Text>
          <Text style={styles.subtitle}>
            {household.name} • {rooms.length} rooms
          </Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.completionRate}%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>
          </Card>
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </Card>
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={[styles.statNumber, { color: colors.dark.error }]}>{stats.overdue}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
          </Card>
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={[styles.statNumber, { color: colors.dark.warning }]}>{stats.dueToday}</Text>
              <Text style={styles.statLabel}>Due Today</Text>
            </View>
          </Card>
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

        {/* Assignments */}
        <View style={styles.assignmentsContainer}>
          {filteredAssignments.length === 0 ? (
            <EmptyState
              title="No Tasks Found"
              message={`You don't have any tasks for ${selectedView === 'thisWeek' ? 'this week' : selectedView === 'upcoming' ? 'upcoming weeks' : 'any time'}.`}
              icon="📋"
            />
          ) : (
            filteredAssignments.map(renderAssignmentCard)
          )}
        </View>
      </ScrollView>
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
    marginBottom: tokens.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: tokens.typography.sizes['2xl'],
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  subtitle: {
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.accent + '20',
  },
  statContent: {
    alignItems: 'center',
    padding: tokens.spacing.md,
  },
  statNumber: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.accent,
    marginBottom: tokens.spacing.xs,
  },
  statLabel: {
    fontSize: tokens.typography.sizes.xs,
    color: colors.dark.textSecondary,
    fontWeight: tokens.typography.weights.medium,
    textAlign: 'center',
  },
  viewSelectorContainer: {
    marginBottom: tokens.spacing.lg,
  },
  assignmentsContainer: {
    gap: tokens.spacing.md,
  },
  assignmentCard: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.border,
    marginBottom: 0,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacing.lg,
  },
  assignmentInfo: {
    flex: 1,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
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
  },
  priorityText: {
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.medium,
  },
  dueDate: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
  },
  assignmentActions: {
    alignItems: 'flex-end',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: colors.dark.border,
    borderRadius: 2,
    marginBottom: tokens.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.dark.accent,
    borderRadius: 2,
  },
  progressText: {
    fontSize: tokens.typography.sizes.xs,
    color: colors.dark.textSecondary,
    fontWeight: tokens.typography.weights.medium,
  },
  expandedContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
  },
  tasksContainer: {
    marginBottom: tokens.spacing.lg,
  },
  taskItem: {
    marginBottom: tokens.spacing.sm,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    backgroundColor: colors.dark.bg,
  },
  taskItemCompleted: {
    backgroundColor: colors.dark.success + '10',
  },
  taskItemSelected: {
    backgroundColor: colors.dark.accent + '20',
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
});
