import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { tokens } from '../../theme/tokens';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { useAppStore } from '../../state/store';
import { useHousehold } from '../../hooks/useHousehold';
import { UserProfileForm } from '../../lib/types';

export const ProfileScreen: React.FC = () => {
  const { user, updateProfile, signOut } = useAuth();
  const { theme, setTheme } = useAppStore();
  const { rooms, household } = useHousehold();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [profileForm, setProfileForm] = useState<UserProfileForm>({
    displayName: user?.displayName || '',
    notificationSettings: {
      weeklyReminder: user?.notificationSettings.weeklyReminder || true,
      lateDayNudge: user?.notificationSettings.lateDayNudge || true,
    },
  });

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        displayName: profileForm.displayName,
        notificationSettings: profileForm.notificationSettings,
      });
      setIsEditingProfile(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Unknown';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return 'Unknown';
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj);
    } catch (error) {
      return 'Unknown';
    }
  };

  const getUserStats = () => {
    const totalTasks = rooms.reduce((acc, room) => {
      const taskCount = room.customTasks?.length || 0;
      return acc + taskCount;
    }, 0);
    
    // Safely calculate days since joining
    let memberSince = 0;
    if (user?.createdAt) {
      const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
      if (!isNaN(createdAt.getTime())) {
        memberSince = Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
    
    return {
      totalRooms: rooms.length,
      totalTasks,
      averageTasksPerRoom: rooms.length > 0 ? Math.round(totalTasks / rooms.length) : 0,
      memberSince,
    };
  };

  const stats = getUserStats();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setIsEditingProfile(!isEditingProfile)}
                style={styles.headerActionButton}
              >
                <Ionicons 
                  name={isEditingProfile ? 'close' : 'pencil'} 
                  size={20} 
                  color={colors.dark.accent} 
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsSettingsModalVisible(true)}
                style={styles.headerActionButton}
              >
                <Ionicons name="settings" size={20} color={colors.dark.accent} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.profileImageContainer}>
            {user.photoURL ? (
              <Text style={styles.profileImageText}>🖼️</Text>
            ) : (
              <Text style={styles.profileImageText}>
                {getInitials(user.displayName)}
              </Text>
            )}
          </View>
          <Text style={styles.userName} numberOfLines={2} adjustsFontSizeToFit>
            {user.displayName}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1} adjustsFontSizeToFit>
            {user.email}
          </Text>
          <Text style={styles.memberSince}>
            Member since {formatDate(user.createdAt)}
          </Text>
        </View>

        {/* User Statistics */}
        <Card variant="elevated" padding="lg" style={styles.statsCard}>
          <Text style={styles.cardTitle}>Your Activity</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalRooms}</Text>
              <Text style={styles.statLabel}>Rooms</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalTasks}</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.averageTasksPerRoom}</Text>
              <Text style={styles.statLabel}>Avg/Room</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.memberSince}</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
        </Card>

        {/* Profile Actions */}
        <Card variant="elevated" padding="lg" style={styles.profileCard}>
          <Text style={styles.cardTitle}>Profile</Text>

          {isEditingProfile ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileForm.displayName}
                  onChangeText={(text) => setProfileForm({ ...profileForm, displayName: text })}
                  placeholder="Enter your display name"
                  placeholderTextColor={colors.dark.textSecondary}
                />
              </View>
              
              <View style={styles.buttonGroup}>
                <Button
                  title="Save Changes"
                  onPress={handleSaveProfile}
                  size="sm"
                  style={styles.saveButton}
                />
                <Button
                  title="Cancel"
                  onPress={() => {
                    setProfileForm({
                      displayName: user.displayName,
                      notificationSettings: user.notificationSettings,
                    });
                    setIsEditingProfile(false);
                  }}
                  variant="outlined"
                  size="sm"
                  style={styles.cancelButton}
                />
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={20} color={colors.dark.textSecondary} />
                <Text style={styles.infoLabel}>Display Name:</Text>
                <Text style={styles.infoValue} numberOfLines={2} adjustsFontSizeToFit>
                  {user.displayName}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={20} color={colors.dark.textSecondary} />
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit>
                  {user.email}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Household Information */}
        {household && (
          <Card variant="elevated" padding="lg" style={styles.householdCard}>
            <Text style={styles.cardTitle}>Household</Text>
            <View style={styles.householdInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="home" size={20} color={colors.dark.textSecondary} />
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit>
                  {household.name}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="people" size={20} color={colors.dark.textSecondary} />
                <Text style={styles.infoLabel}>Members:</Text>
                <Text style={styles.infoValue}>
                  {household.members.length} member{household.members.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color={colors.dark.textSecondary} />
                <Text style={styles.infoLabel}>Cleaning Day:</Text>
                <Text style={styles.infoValue}>
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][household.cleaningDay]}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Settings Section */}
        <Card variant="elevated" padding="lg" style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Settings</Text>

          <View style={styles.settingsPreview}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={20} color={colors.dark.textSecondary} />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Text style={styles.settingValue}>
                {user.notificationSettings.weeklyReminder && user.notificationSettings.lateDayNudge 
                  ? 'All enabled' 
                  : 'Custom'
                }
              </Text>
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="color-palette" size={20} color={colors.dark.textSecondary} />
                <Text style={styles.settingLabel}>Theme</Text>
              </View>
              <Text style={styles.settingValue}>{theme}</Text>
            </View>
          </View>
        </Card>

        {/* Achievements Section */}
        <Card variant="elevated" padding="lg" style={styles.achievementsCard}>
          <Text style={styles.cardTitle}>Achievements</Text>
          <View style={styles.achievementsList}>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>🏠</Text>
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Household Creator</Text>
                <Text style={styles.achievementDescription}>
                  Successfully created your household
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={colors.dark.accent} />
            </View>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>🧹</Text>
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Task Master</Text>
                <Text style={styles.achievementDescription}>
                  Added {stats.totalTasks} tasks to your rooms
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={colors.dark.accent} />
            </View>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>📅</Text>
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Loyal Member</Text>
                <Text style={styles.achievementDescription}>
                  Member for {stats.memberSince} days
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={colors.dark.accent} />
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card variant="elevated" padding="lg" style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsList}>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="help-circle" size={20} color={colors.dark.textSecondary} />
              <Text style={styles.actionLabel}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.dark.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="document-text" size={20} color={colors.dark.textSecondary} />
              <Text style={styles.actionLabel}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.dark.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="information-circle" size={20} color={colors.dark.textSecondary} />
              <Text style={styles.actionLabel}>About Livin</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.dark.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="star" size={20} color={colors.dark.textSecondary} />
              <Text style={styles.actionLabel}>Rate App</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.dark.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="share" size={20} color={colors.dark.textSecondary} />
              <Text style={styles.actionLabel}>Share with Friends</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.dark.textSecondary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out" size={20} color={colors.dark.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={isSettingsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <TouchableOpacity
              onPress={() => setIsSettingsModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.dark.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Notification Settings */}
            <Card variant="outlined" padding="lg" style={styles.modalCard}>
              <Text style={styles.modalCardTitle}>Notifications</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="calendar" size={20} color={colors.dark.textSecondary} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Weekly Reminders</Text>
                    <Text style={styles.settingDescription}>
                      Get notified about upcoming cleaning tasks
                    </Text>
                  </View>
                </View>
                <Switch
                  value={profileForm.notificationSettings.weeklyReminder}
                  onValueChange={(value) => 
                    setProfileForm({
                      ...profileForm,
                      notificationSettings: {
                        ...profileForm.notificationSettings,
                        weeklyReminder: value,
                      },
                    })
                  }
                  trackColor={{ false: colors.dark.border, true: colors.dark.accent + '40' }}
                  thumbColor={profileForm.notificationSettings.weeklyReminder ? colors.dark.accent : colors.dark.textSecondary}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="alert-circle" size={20} color={colors.dark.textSecondary} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Late Day Nudges</Text>
                    <Text style={styles.settingDescription}>
                      Reminders when tasks are overdue
                    </Text>
                  </View>
                </View>
                <Switch
                  value={profileForm.notificationSettings.lateDayNudge}
                  onValueChange={(value) => 
                    setProfileForm({
                      ...profileForm,
                      notificationSettings: {
                        ...profileForm.notificationSettings,
                        lateDayNudge: value,
                      },
                    })
                  }
                  trackColor={{ false: colors.dark.border, true: colors.dark.accent + '40' }}
                  thumbColor={profileForm.notificationSettings.lateDayNudge ? colors.dark.accent : colors.dark.textSecondary}
                />
              </View>
            </Card>

            {/* Theme Settings */}
            <Card variant="outlined" padding="lg" style={styles.modalCard}>
              <Text style={styles.modalCardTitle}>Appearance</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="color-palette" size={20} color={colors.dark.textSecondary} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Theme</Text>
                    <Text style={styles.settingDescription}>
                      Choose your preferred theme
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.themeButton}
                  onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  <Text style={styles.themeButtonText}>
                    {theme === 'dark' ? '🌙' : '☀️'} {theme}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Save Settings Button */}
            <Button
              title="Save Settings"
              onPress={async () => {
                try {
                  await updateProfile({
                    notificationSettings: profileForm.notificationSettings,
                  });
                  setIsSettingsModalVisible(false);
                  Alert.alert('Success', 'Settings saved successfully!');
                } catch (error) {
                  Alert.alert('Error', 'Failed to save settings. Please try again.');
                }
              }}
              style={styles.saveSettingsButton}
            />
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: tokens.spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dark.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.dark.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
    borderWidth: 3,
    borderColor: colors.dark.accent + '40',
  },
  profileImageText: {
    fontSize: 36,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.accent,
  },
  userName: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    marginBottom: tokens.spacing.xs,
    textAlign: 'center',
    maxWidth: '100%',
  },
  userEmail: {
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.textSecondary,
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
    maxWidth: '100%',
  },
  memberSince: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: tokens.spacing.lg,
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.accent + '20',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.accent,
    marginBottom: tokens.spacing.xs,
  },
  statLabel: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
    fontWeight: tokens.typography.weights.medium,
    textAlign: 'center',
  },
  profileCard: {
    marginBottom: tokens.spacing.lg,
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.accent + '20',
  },
  householdCard: {
    marginBottom: tokens.spacing.lg,
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.accent + '20',
  },
  settingsCard: {
    marginBottom: tokens.spacing.lg,
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.accent + '20',
  },
  achievementsCard: {
    marginBottom: tokens.spacing.lg,
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.accent + '20',
  },
  actionsCard: {
    marginBottom: tokens.spacing.lg,
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.accent + '20',
  },
  cardTitle: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    marginBottom: tokens.spacing.md,
  },
  profileInfo: {
    gap: tokens.spacing.md,
  },
  householdInfo: {
    gap: tokens.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.textSecondary,
    minWidth: 80,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.textPrimary,
    fontWeight: tokens.typography.weights.medium,
    flex: 1,
    flexWrap: 'wrap',
  },
  editForm: {
    gap: tokens.spacing.md,
  },
  inputGroup: {
    gap: tokens.spacing.xs,
  },
  inputLabel: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
    fontWeight: tokens.typography.weights.medium,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.md,
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.textPrimary,
    backgroundColor: colors.dark.bg,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  settingsPreview: {
    gap: tokens.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  settingLabel: {
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.textPrimary,
    fontWeight: tokens.typography.weights.medium,
  },
  settingValue: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
  },
  achievementsList: {
    gap: tokens.spacing.md,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dark.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: tokens.typography.sizes.base,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  achievementDescription: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
  },
  actionsList: {
    gap: tokens.spacing.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  actionLabel: {
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.textPrimary,
    flex: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.lg,
    backgroundColor: colors.dark.error + '10',
    borderRadius: tokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.dark.error + '30',
    gap: tokens.spacing.sm,
  },
  signOutText: {
    fontSize: tokens.typography.sizes.base,
    color: colors.dark.error,
    fontWeight: tokens.typography.weights.medium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  modalTitle: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
  },
  closeButton: {
    padding: tokens.spacing.xs,
  },
  modalContent: {
    flex: 1,
    padding: tokens.spacing.lg,
  },
  modalCard: {
    marginBottom: tokens.spacing.lg,
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.border,
  },
  modalCardTitle: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
    color: colors.dark.textPrimary,
    marginBottom: tokens.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
  },
  settingText: {
    flex: 1,
    marginLeft: tokens.spacing.sm,
  },
  settingDescription: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.textSecondary,
    marginTop: tokens.spacing.xs,
  },
  themeButton: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    backgroundColor: colors.dark.accent + '20',
    borderRadius: tokens.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.accent + '40',
  },
  themeButtonText: {
    fontSize: tokens.typography.sizes.sm,
    color: colors.dark.accent,
    fontWeight: tokens.typography.weights.medium,
  },
  saveSettingsButton: {
    marginTop: tokens.spacing.lg,
  },
  errorText: {
    fontSize: tokens.typography.sizes.lg,
    color: colors.dark.error,
    textAlign: 'center',
    marginTop: tokens.spacing.xl,
  },
});
