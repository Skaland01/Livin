import React from 'react';
import { View, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { tokens } from '../../theme/tokens';

interface SegmentedOption {
  label: string;
  value: string;
}

interface SegmentedProps {
  options: SegmentedOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
}

export const Segmented: React.FC<SegmentedProps> = ({
  options,
  selectedValue,
  onValueChange,
  style,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.dark.input,
        borderRadius: tokens.borderRadius.md,
        padding: tokens.spacing.xs,
        ...style,
      }}
    >
      {options.map((option, index) => {
        const isSelected = option.value === selectedValue;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <TouchableOpacity
            key={option.value}
            style={{
              flex: 1,
              backgroundColor: isSelected ? colors.dark.accent : 'transparent',
              paddingVertical: tokens.spacing.sm,
              paddingHorizontal: tokens.spacing.md,
              borderRadius: tokens.borderRadius.sm,
              marginLeft: isFirst ? 0 : tokens.spacing.xs,
              marginRight: isLast ? 0 : tokens.spacing.xs,
            }}
            onPress={() => onValueChange(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: tokens.typography.sizes.sm,
                fontWeight: isSelected ? tokens.typography.weights.semibold : tokens.typography.weights.normal,
                color: isSelected ? colors.dark.bg : colors.dark.textSecondary,
                textAlign: 'center',
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
