import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../state/store';
import { useHousehold } from '../../hooks/useHousehold';
import { useAssignments } from '../../hooks/useAssignments';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Segmented } from '../../components/Tabs/Segmented';
import { colors } from '../../theme/colors';
import { tokens } from '../../theme/tokens';
import { TaskView } from '../../lib/types';

export const TasksScreen: React.FC = () => {
  const navigation = useNavigation();
  const { household, rooms, loading: householdLoading } = useHousehold();
  const { assignments, loading: assignmentsLoading, loadAssignments } = useAssignments();
  const [selectedView, setSelectedView] = useState<TaskView>('thisWeek');
  const [refreshing, setRefreshing] = useState(false);

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

  const renderAssignmentCard = (assignment: any) => (
    <TouchableOpacity
      key={assignment.id}
      onPress={() => navigation.navigate('TaskDetail' as any, { assignmentId: assignment.id })}
      activeOpacity={0.7}
    >
      <Card
        variant="elevated"
        style={{
          marginBottom: tokens.spacing.md,
          borderLeftWidth: 4,
          borderLeftColor: assignment.isOverdue ? colors.dark.error : colors.dark.success,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: tokens.typography.sizes.lg,
                fontWeight: tokens.typography.weights.semibold,
                color: colors.dark.textPrimary,
                marginBottom: tokens.spacing.xs,
              }}
            >
              {assignment.room?.name}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.sizes.sm,
                color: colors.dark.textSecondary,
                marginBottom: tokens.spacing.sm,
              }}
            >
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </Text>
            {assignment.completion && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.sm,
                    color: colors.dark.success,
                    fontWeight: tokens.typography.weights.medium,
                  }}
                >
                  ✓ Completed
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.sm,
                    color: colors.dark.textSecondary,
                    marginLeft: tokens.spacing.sm,
                  }}
                >
                  {assignment.completion.completedTasks.length} tasks
                </Text>
              </View>
            )}
          </View>
          {assignment.isOverdue && (
            <View
              style={{
                backgroundColor: colors.dark.error,
                paddingHorizontal: tokens.spacing.sm,
                paddingVertical: tokens.spacing.xs,
                borderRadius: tokens.borderRadius.sm,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  color: colors.dark.bg,
                  fontWeight: tokens.typography.weights.medium,
                }}
              >
                OVERDUE
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (!household) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.dark.bg, padding: tokens.spacing.lg }}>
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
      <View style={{ flex: 1, backgroundColor: colors.dark.bg, padding: tokens.spacing.lg }}>
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.dark.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: tokens.spacing.lg }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Household Info */}
        <Card variant="outlined" style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.xl,
              fontWeight: tokens.typography.weights.bold,
              color: colors.dark.textPrimary,
              marginBottom: tokens.spacing.xs,
            }}
          >
            {household.name}
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.sizes.sm,
              color: colors.dark.textSecondary,
            }}
          >
            {rooms.length} rooms • {household.members.length} members
          </Text>
        </Card>

        {/* View Selector */}
        <Segmented
          options={[
            { label: 'This Week', value: 'thisWeek' },
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'All', value: 'all' },
          ]}
          selectedValue={selectedView}
          onValueChange={handleViewChange}
          style={{ marginBottom: tokens.spacing.lg }}
        />

        {/* Assignments */}
        {filteredAssignments.length === 0 ? (
          <EmptyState
            title="No Tasks"
            message={`You don't have any tasks for ${selectedView === 'thisWeek' ? 'this week' : selectedView === 'upcoming' ? 'upcoming weeks' : 'any time'}.`}
          />
        ) : (
          filteredAssignments.map(renderAssignmentCard)
        )}
      </ScrollView>
    </View>
  );
};
