import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Button } from './Button';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';

interface EmptyStateProps {
  title: string;
  message: string;
  primaryAction?: {
    title: string;
    onPress: () => void;
  };
  secondaryAction?: {
    title: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  primaryAction,
  secondaryAction,
  style,
}) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: tokens.spacing.xl,
        ...style,
      }}
    >
      <Text
        style={{
          fontSize: tokens.typography.sizes.xl,
          fontWeight: tokens.typography.weights.bold,
          color: colors.dark.textPrimary,
          textAlign: 'center',
          marginBottom: tokens.spacing.md,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: tokens.typography.sizes.base,
          color: colors.dark.textSecondary,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: tokens.spacing.xl,
        }}
      >
        {message}
      </Text>
      
      {primaryAction && (
        <Button
          title={primaryAction.title}
          onPress={primaryAction.onPress}
          variant="primary"
          style={{ marginBottom: secondaryAction ? tokens.spacing.md : 0 }}
        />
      )}
      
      {secondaryAction && (
        <Button
          title={secondaryAction.title}
          onPress={secondaryAction.onPress}
          variant="outline"
        />
      )}
    </View>
  );
};
