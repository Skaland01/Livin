import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: tokens.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    const sizeStyles: Record<string, ViewStyle> = {
      sm: {
        paddingHorizontal: tokens.spacing.md,
        paddingVertical: tokens.spacing.sm,
        minHeight: 36,
      },
      md: {
        paddingHorizontal: tokens.spacing.lg,
        paddingVertical: tokens.spacing.md,
        minHeight: 44,
      },
      lg: {
        paddingHorizontal: tokens.spacing.xl,
        paddingVertical: tokens.spacing.lg,
        minHeight: 52,
      },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: colors.dark.accent,
      },
      secondary: {
        backgroundColor: colors.dark.card,
        borderWidth: 1,
        borderColor: colors.dark.border,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.dark.accent,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled || loading ? 0.6 : 1,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: tokens.typography.weights.medium,
    };

    const sizeStyles: Record<string, TextStyle> = {
      sm: {
        fontSize: tokens.typography.sizes.sm,
      },
      md: {
        fontSize: tokens.typography.sizes.base,
      },
      lg: {
        fontSize: tokens.typography.sizes.lg,
      },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: {
        color: colors.dark.bg,
      },
      secondary: {
        color: colors.dark.textPrimary,
      },
      outline: {
        color: colors.dark.accent,
      },
      ghost: {
        color: colors.dark.accent,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.dark.bg : colors.dark.accent}
          style={{ marginRight: tokens.spacing.sm }}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};
