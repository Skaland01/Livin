import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  disabled = false,
  size = 'md',
  style,
}) => {
  const getCheckboxStyle = (): ViewStyle => {
    const sizeStyles: Record<string, ViewStyle> = {
      sm: {
        width: 16,
        height: 16,
        borderRadius: tokens.borderRadius.sm,
      },
      md: {
        width: 20,
        height: 20,
        borderRadius: tokens.borderRadius.sm,
      },
      lg: {
        width: 24,
        height: 24,
        borderRadius: tokens.borderRadius.md,
      },
    };

    const baseStyle: ViewStyle = {
      borderWidth: 2,
      borderColor: checked ? colors.dark.accent : colors.dark.border,
      backgroundColor: checked ? colors.dark.accent : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.5 : 1,
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...style,
    };
  };

  const getCheckmarkStyle = (): ViewStyle => {
    const sizeStyles: Record<string, ViewStyle> = {
      sm: {
        width: 6,
        height: 6,
        borderRadius: 3,
      },
      md: {
        width: 8,
        height: 8,
        borderRadius: 4,
      },
      lg: {
        width: 10,
        height: 10,
        borderRadius: 5,
      },
    };

    return {
      backgroundColor: colors.dark.bg,
      ...sizeStyles[size],
    };
  };

  return (
    <TouchableOpacity
      style={getCheckboxStyle()}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {checked && <View style={getCheckmarkStyle()} />}
    </TouchableOpacity>
  );
};
