import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../../theme/colors';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { useHousehold } from '../../hooks/useHousehold';
import { RootStackParamList } from '../../lib/types';

type HouseholdNavigationProp = StackNavigationProp<RootStackParamList>;

export const HouseholdScreen: React.FC = () => {
  const navigation = useNavigation<HouseholdNavigationProp>();
  const { household, rooms } = useHousehold();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoomStats = () => {
    const totalTasks = rooms.reduce((acc, room) => {
      const taskCount = room.customTasks?.length || 0;
      return acc + taskCount;
    }, 0);
    
    return {
      totalRooms: rooms.length,
      totalTasks,
      averageTasksPerRoom: rooms.length > 0 ? Math.round(totalTasks / rooms.length) : 0,
    };
  };

  const stats = getRoomStats();

  if (!household) {
    return (
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
          <Text style={styles.title}>Welcome to Livin</Text>
          <Text style={styles.subtitle}>
            Your smart home cleaning companion
          </Text>
        </View>

        {/* Empty State */}
        <View style={styles.emptyStateContainer}>
          <Card variant="elevated" padding="lg" style={styles.emptyStateCard}>
            <View style={styles.emptyStateContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.emptyStateIcon}>🏠</Text>
              </View>
              <Text style={styles.emptyStateTitle}>
                Ready to get started?
              </Text>
              <Text style={styles.emptyStateDescription}>
                Create or join a household to begin organizing your cleaning tasks and managing your home together.
              </Text>
            </View>
          </Card>
        </View>

        {/* Action Cards */}
        <View style={styles.actionCardsContainer}>
          <TouchableOpacity
            onPress={() => {
              console.log('Create Household button pressed - navigating to CreateHousehold');
              navigation.navigate('CreateHousehold');
            }}
            style={styles.actionCard}
          >
            <View style={styles.actionCardContent}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>✨</Text>
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Create New Household</Text>
                <Text style={styles.actionDescription}>
                  Start fresh with your own household and invite family members
                </Text>
              </View>
              <View style={styles.actionArrow}>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              // TODO: Navigate to join household screen
              console.log('Join Household button pressed');
            }}
            style={styles.actionCard}
          >
            <View style={styles.actionCardContent}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>🤝</Text>
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Join Existing Household</Text>
                <Text style={styles.actionDescription}>
                  Enter a join code to connect with family or roommates
                </Text>
              </View>
              <View style={styles.actionArrow}>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>What you can do with Livin</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🧹</Text>
              <Text style={styles.featureTitle}>Smart Task Management</Text>
              <Text style={styles.featureDescription}>
                Organize cleaning tasks by room with preset templates
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>👥</Text>
              <Text style={styles.featureTitle}>Family Collaboration</Text>
              <Text style={styles.featureDescription}>
                Share responsibilities and track progress together
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📅</Text>
              <Text style={styles.featureTitle}>Automated Scheduling</Text>
              <Text style={styles.featureDescription}>
                Set cleaning frequencies and get automatic reminders
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureTitle}>Progress Tracking</Text>
              <Text style={styles.featureDescription}>
                Monitor completion rates and household cleanliness
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
        <Text style={styles.householdName}>{household.name}</Text>
        <Text style={styles.memberCount}>
          {household.members.length} member{household.members.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card variant="elevated" padding="lg" style={styles.statCard}>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{stats.totalRooms}</Text>
            <Text style={styles.statLabel}>Rooms</Text>
          </View>
        </Card>
        <Card variant="elevated" padding="lg" style={styles.statCard}>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{stats.totalTasks}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
        </Card>
        <Card variant="elevated" padding="lg" style={styles.statCard}>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{stats.averageTasksPerRoom}</Text>
            <Text style={styles.statLabel}>Avg/Room</Text>
          </View>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            onPress={() => navigation.navigate('RoomsEditor')}
            style={styles.quickActionCard}
          >
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionIcon}>🏠</Text>
              <Text style={styles.quickActionTitle}>Manage Rooms</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              // Navigate to Tasks tab
              navigation.navigate('Tasks' as any);
            }}
            style={styles.quickActionCard}
          >
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionIcon}>📋</Text>
              <Text style={styles.quickActionTitle}>View Tasks</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('HouseholdAdmin')}
            style={styles.quickActionCard}
          >
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionIcon}>⚙️</Text>
              <Text style={styles.quickActionTitle}>Settings</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              // TODO: Navigate to household members
              console.log('Members button pressed');
            }}
            style={styles.quickActionCard}
          >
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionIcon}>👥</Text>
              <Text style={styles.quickActionTitle}>Members</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card variant="outlined" padding="lg" style={styles.activityCard}>
          <View style={styles.activityContent}>
            <Text style={styles.activityIcon}>🎉</Text>
            <View style={styles.activityTextContainer}>
              <Text style={styles.activityTitle}>Welcome to your household!</Text>
              <Text style={styles.activityDescription}>
                Start by adding rooms and setting up your cleaning schedule
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Tips Section */}
      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>Pro Tips</Text>
        <Card variant="elevated" padding="lg" style={styles.tipsCard}>
          <View style={styles.tipContent}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipTextContainer}>
              <Text style={styles.tipTitle}>Get the most out of Livin</Text>
              <Text style={styles.tipDescription}>
                • Add all your rooms to get a complete overview{'\n'}
                • Set realistic cleaning frequencies{'\n'}
                • Invite family members to share responsibilities{'\n'}
                • Use custom tasks for specific needs
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  contentContainer: {
    padding: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl * 2,
  },
  header: {
    marginBottom: tokens.spacing.xl,
    alignItems: 'center',
  },
  greeting: {
    fontSize: tokens.typography.sizes.lg,
    color: colors.dark.textSecondary,
    marginBottom: tokens.spacing.sm,
  },
  title: {
    fontSize: tokens.typography.sizes['3xl'],
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  subtitle: {
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  householdName: {
    fontSize: tokens.typography.sizes['2xl'],
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  memberCount: {
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.accent,
    fontWeight: tokens.typography.weights.medium,
  },
  emptyStateContainer: {
    marginBottom: tokens.spacing.xl,
  },
  emptyStateCard: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.accent + '20',
  },
  emptyStateContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.dark.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  emptyStateIcon: {
    fontSize: 40,
  },
  emptyStateTitle: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionCardsContainer: {
    marginBottom: tokens.spacing.xl,
    gap: tokens.spacing.md,
  },
  actionCard: {
    backgroundColor: colors.dark.card,
    borderRadius: tokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    overflow: 'hidden',
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.lg,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.dark.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: tokens.typography.sizes.base,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  actionDescription: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
    lineHeight: 18,
  },
  actionArrow: {
    marginLeft: tokens.spacing.sm,
  },
  arrowIcon: {
    fontSize: tokens.typography.sizes.lg,
    color: colors.dark.accent,
    fontWeight: tokens.typography.weights.bold,
  },
  featuresContainer: {
    marginBottom: tokens.spacing.xl,
  },
  sectionTitle: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    marginBottom: tokens.spacing.lg,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.md,
  },
  featureItem: {
    width: '48%',
    backgroundColor: colors.dark.card,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: tokens.spacing.sm,
  },
  featureTitle: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    marginBottom: tokens.spacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: tokens.typography.sizes.xs,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.accent + '20',
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: tokens.typography.sizes['2xl'],
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.accent,
    marginBottom: tokens.spacing.xs,
  },
  statLabel: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
    fontWeight: tokens.typography.weights.medium,
  },
  quickActionsContainer: {
    marginBottom: tokens.spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.md,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: colors.dark.card,
    borderRadius: tokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    overflow: 'hidden',
  },
  quickActionContent: {
    padding: tokens.spacing.lg,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: tokens.spacing.sm,
  },
  quickActionTitle: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    textAlign: 'center',
  },
  recentActivityContainer: {
    marginBottom: tokens.spacing.xl,
  },
  activityCard: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.accent + '20',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIcon: {
    fontSize: 24,
    marginRight: tokens.spacing.md,
    marginTop: 2,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: tokens.typography.sizes.base,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  activityDescription: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
    lineHeight: 18,
  },
  tipsContainer: {
    marginBottom: tokens.spacing.xl,
  },
  tipsCard: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.accent + '20',
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 24,
    marginRight: tokens.spacing.md,
    marginTop: 2,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: tokens.typography.sizes.base,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    marginBottom: tokens.spacing.sm,
  },
  tipDescription: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
    lineHeight: 18,
  },
});
