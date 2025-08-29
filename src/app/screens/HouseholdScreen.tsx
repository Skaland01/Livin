import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { tokens } from '../../theme/tokens';

export const HouseholdScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: colors.dark.bg, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.dark.textPrimary, fontSize: tokens.typography.sizes.xl }}>
        Household Screen
      </Text>
      <Text style={{ color: colors.dark.textSecondary, fontSize: tokens.typography.sizes.base, marginTop: tokens.spacing.md }}>
        Coming soon...
      </Text>
    </View>
  );
};
