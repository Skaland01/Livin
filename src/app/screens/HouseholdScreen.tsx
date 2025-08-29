
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
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
  const { household, loading } = useHousehold();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.dark.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.dark.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  if (!household) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.dark.bg }}
        contentContainerStyle={{
          flexGrow: 1,
          padding: tokens.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: tokens.spacing.xl }}>
          <Text style={{
            color: colors.dark.textPrimary,
            fontSize: tokens.typography.sizes['2xl'],
            fontWeight: tokens.typography.weights.bold,
            marginBottom: tokens.spacing.sm,
          }}>
            Household
          </Text>
          
          <Text style={{
            color: colors.dark.textSecondary,
            fontSize: tokens.typography.sizes.base,
            lineHeight: 22,
          }}>
            Join or create a household to start managing cleaning tasks together.
          </Text>
        </View>

        {/* Empty State */}
        <EmptyState
          title="No Household Yet"
          message="You need to join or create a household to start managing cleaning tasks with your roommates or family."
          style={{ marginBottom: tokens.spacing.xl }}
        />

        {/* Action Cards */}
        <View style={{ gap: tokens.spacing.lg }}>
          {/* Create Household Card */}
          <Card variant="elevated" padding="lg">
            <View style={{ marginBottom: tokens.spacing.md }}>
              <Text style={{
                color: colors.dark.textPrimary,
                fontSize: tokens.typography.sizes.lg,
                fontWeight: tokens.typography.weights.bold,
                marginBottom: tokens.spacing.sm,
              }}>
                Create New Household
              </Text>
              
              <Text style={{
                color: colors.dark.textSecondary,
                fontSize: tokens.typography.sizes.sm,
                lineHeight: 18,
              }}>
                Start a new household and invite your roommates or family members to join.
              </Text>
            </View>

            <Button
              title="Create Household"
              onPress={() => {
                console.log('Create Household button pressed - navigating to CreateHousehold');
                navigation.navigate('CreateHousehold');
              }}
              size="md"
            />
          </Card>

          {/* Join Household Card */}
          <Card variant="outlined" padding="lg">
            <View style={{ marginBottom: tokens.spacing.md }}>
              <Text style={{
                color: colors.dark.textPrimary,
                fontSize: tokens.typography.sizes.lg,
                fontWeight: tokens.typography.weights.bold,
                marginBottom: tokens.spacing.sm,
              }}>
                Join Existing Household
              </Text>
              
              <Text style={{
                color: colors.dark.textSecondary,
                fontSize: tokens.typography.sizes.sm,
                lineHeight: 18,
              }}>
                Join an existing household using a join code provided by the household admin.
              </Text>
            </View>

            <Button
              title="Join Household"
              onPress={() => {/* TODO: Navigate to join household screen */}}
              variant="outline"
              size="md"
            />
          </Card>
        </View>

        {/* Info Section */}
        <Card variant="outlined" padding="md" style={{ marginTop: tokens.spacing.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: colors.dark.accent,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: tokens.spacing.sm,
              marginTop: 2,
            }}>
              <Text style={{ color: colors.dark.bg, fontSize: 12, fontWeight: 'bold' }}>💡</Text>
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{
                color: colors.dark.textPrimary,
                fontSize: tokens.typography.sizes.sm,
                fontWeight: tokens.typography.weights.medium,
                marginBottom: tokens.spacing.xs,
              }}>
                How it works
              </Text>
              
              <Text style={{
                color: colors.dark.textSecondary,
                fontSize: tokens.typography.sizes.sm,
                lineHeight: 18,
              }}>
                Households help you organize cleaning tasks among roommates or family members. The household admin can add rooms and manage members.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    );
  }

  // User has a household - show household info
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.dark.bg }}
      contentContainerStyle={{
        padding: tokens.spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ marginBottom: tokens.spacing.xl }}>
        <Text style={{
          color: colors.dark.textPrimary,
          fontSize: tokens.typography.sizes['2xl'],
          fontWeight: tokens.typography.weights.bold,
          marginBottom: tokens.spacing.sm,
        }}>
          {household.name}
        </Text>
        
        <Text style={{
          color: colors.dark.textSecondary,
          fontSize: tokens.typography.sizes.base,
        }}>
          {household.members.length} member{household.members.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Household Info Card */}
      <Card variant="elevated" padding="lg" style={{ marginBottom: tokens.spacing.lg }}>
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text style={{
            color: colors.dark.textPrimary,
            fontSize: tokens.typography.sizes.lg,
            fontWeight: tokens.typography.weights.bold,
            marginBottom: tokens.spacing.md,
          }}>
            Household Details
          </Text>

          <View style={{ gap: tokens.spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.dark.textSecondary, fontSize: tokens.typography.sizes.sm }}>
                Cleaning Day
              </Text>
              <Text style={{ color: colors.dark.textPrimary, fontSize: tokens.typography.sizes.sm, fontWeight: tokens.typography.weights.medium }}>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][household.cleaningDay]}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.dark.textSecondary, fontSize: tokens.typography.sizes.sm }}>
                Join Code
              </Text>
              <Text style={{ color: colors.dark.accent, fontSize: tokens.typography.sizes.sm, fontWeight: tokens.typography.weights.bold }}>
                {household.joinCode}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.dark.textSecondary, fontSize: tokens.typography.sizes.sm }}>
                Created
              </Text>
              <Text style={{ color: colors.dark.textPrimary, fontSize: tokens.typography.sizes.sm }}>
                {new Date(household.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <Button
          title="Manage Household"
          onPress={() => navigation.navigate('HouseholdAdmin')}
          variant="outline"
          size="md"
        />
      </Card>

      {/* Quick Actions */}
      <Card variant="outlined" padding="lg">
        <Text style={{
          color: colors.dark.textPrimary,
          fontSize: tokens.typography.sizes.lg,
          fontWeight: tokens.typography.weights.bold,
          marginBottom: tokens.spacing.md,
        }}>
          Quick Actions
        </Text>

        <View style={{ gap: tokens.spacing.sm }}>
          <Button
            title="Add Rooms"
            onPress={() => navigation.navigate('RoomsEditor')}
            variant="ghost"
            size="md"
          />
          
          <Button
            title="View Tasks"
            onPress={() => {/* Navigate to tasks */}}
            variant="ghost"
            size="md"
          />
        </View>
      </Card>
    </ScrollView>
  );
};
