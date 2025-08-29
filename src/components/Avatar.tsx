import React from 'react';
import { View, Text, Image, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';

interface AvatarProps {
  photoURL?: string;
  displayName: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  photoURL,
  displayName,
  size = 'md',
  style,
}) => {
  const getAvatarStyle = (): ViewStyle => {
    const sizeStyles: Record<string, ViewStyle> = {
      sm: {
        width: 32,
        height: 32,
        borderRadius: 16,
      },
      md: {
        width: 40,
        height: 40,
        borderRadius: 20,
      },
      lg: {
        width: 56,
        height: 56,
        borderRadius: 28,
      },
    };

    const baseStyle: ViewStyle = {
      backgroundColor: colors.dark.accent,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...style,
    };
  };

  const getInitialsStyle = (): ViewStyle => {
    const sizeStyles: Record<string, ViewStyle> = {
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

    return {
      color: colors.dark.bg,
      fontWeight: tokens.typography.weights.semibold,
      ...sizeStyles[size],
    };
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (photoURL) {
    return (
      <View style={getAvatarStyle()}>
        <Image
          source={{ uri: photoURL }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={getAvatarStyle()}>
      <Text style={getInitialsStyle()}>{getInitials(displayName)}</Text>
    </View>
  );
};
