import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: tokens.borderRadius.md,
      backgroundColor: colors.dark.card,
    };

    const paddingStyles: Record<string, ViewStyle> = {
      sm: {
        padding: tokens.spacing.md,
      },
      md: {
        padding: tokens.spacing.lg,
      },
      lg: {
        padding: tokens.spacing.xl,
      },
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {},
      elevated: {
        ...tokens.shadows.md,
      },
      outlined: {
        borderWidth: 1,
        borderColor: colors.dark.border,
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...variantStyles[variant],
      ...style,
    };
  };

  return <View style={getCardStyle()}>{children}</View>;
};
