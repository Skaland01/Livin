import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppStore } from '../../state/store';
import { useAuth } from '../../hooks/useAuth';
import { RootStackParamList } from '../../lib/types';

// Auth screens
import { SignInScreen } from '../screens/AuthScreens/SignInScreen';
import { SignUpScreen } from '../screens/AuthScreens/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/AuthScreens/ForgotPasswordScreen';

// Main app screens
import { TabNavigator } from './TabNavigator';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { HouseholdAdminScreen } from '../screens/HouseholdAdminScreen';
import { RoomsEditorScreen } from '../screens/RoomsEditorScreen';
import { CreateHouseholdScreen } from '../screens/CreateHouseholdScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const { theme } = useAppStore();

  if (loading) {
    // You could add a loading screen here
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        // Authenticated stack
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          <Stack.Screen name="HouseholdAdmin" component={HouseholdAdminScreen} />
          <Stack.Screen name="RoomsEditor" component={RoomsEditorScreen} />
          <Stack.Screen name="CreateHousehold" component={CreateHouseholdScreen} />
        </>
      ) : (
        // Auth stack
        <>
          <Stack.Screen name="Auth" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
