/**
 * Avatar Component - Avatar moderne avec statut, badge, etc.
 */

import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, BorderRadius, Shadows } from '../../theme';

interface AvatarProps {
  imageUrl?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  badge?: React.ReactNode;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  name = '?',
  size = 'md',
  status,
  showStatus = false,
  badge,
  style,
}) => {
  const sizeValue = getSizeValue(size);
  const fontSize = getFontSize(size);
  const statusSize = getStatusSize(size);

  const containerStyle = [
    styles.container,
    {
      width: sizeValue,
      height: sizeValue,
      borderRadius: sizeValue / 2,
    },
    style,
  ];

  const initial = name.charAt(0).toUpperCase();

  return (
    <View style={{ position: 'relative' }}>
      <View style={containerStyle}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.image,
              {
                width: sizeValue,
                height: sizeValue,
                borderRadius: sizeValue / 2,
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              {
                width: sizeValue,
                height: sizeValue,
                borderRadius: sizeValue / 2,
              },
            ]}
          >
            <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
          </View>
        )}
      </View>

      {/* Status Indicator */}
      {showStatus && status && (
        <View
          style={[
            styles.statusDot,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: getStatusColor(status),
              right: size === 'xs' || size === 'sm' ? 0 : 2,
              bottom: size === 'xs' || size === 'sm' ? 0 : 2,
            },
          ]}
        />
      )}

      {/* Badge (e.g., verification, premium) */}
      {badge && (
        <View
          style={[
            styles.badge,
            {
              right: size === 'xs' || size === 'sm' ? -4 : -2,
              bottom: size === 'xs' || size === 'sm' ? -4 : -2,
            },
          ]}
        >
          {badge}
        </View>
      )}
    </View>
  );
};

// Avatar Group - Multiple avatars overlapping
interface AvatarGroupProps {
  avatars: Array<{ imageUrl?: string; name?: string }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  style?: ViewStyle;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
  style,
}) => {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;
  const sizeValue = getSizeValue(size);
  const overlap = sizeValue * 0.3;

  return (
    <View style={[styles.group, style]}>
      {displayAvatars.map((avatar, index) => (
        <View
          key={index}
          style={{
            marginLeft: index > 0 ? -overlap : 0,
            zIndex: displayAvatars.length - index,
          }}
        >
          <Avatar
            imageUrl={avatar.imageUrl}
            name={avatar.name}
            size={size}
            style={styles.groupAvatar}
          />
        </View>
      ))}

      {/* Remaining count */}
      {remaining > 0 && (
        <View
          style={[
            styles.remainingBadge,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
              marginLeft: -overlap,
            },
          ]}
        >
          <Text style={[styles.remainingText, { fontSize: getFontSize(size) }]}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
};

// Helper functions
function getSizeValue(size: string): number {
  const sizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
    '2xl': 96,
  };
  return (sizes as any)[size] || 40;
}

function getFontSize(size: string): number {
  const sizes = {
    xs: 10,
    sm: 12,
    md: 16,
    lg: 22,
    xl: 28,
    '2xl': 36,
  };
  return (sizes as any)[size] || 16;
}

function getStatusSize(size: string): number {
  const sizes = {
    xs: 6,
    sm: 8,
    md: 10,
    lg: 12,
    xl: 14,
    '2xl': 16,
  };
  return (sizes as any)[size] || 10;
}

function getStatusColor(status: string): string {
  const colors = {
    online: Colors.success,
    offline: Colors.gray[400],
    away: Colors.warning,
    busy: Colors.error,
  };
  return (colors as any)[status] || Colors.gray[400];
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.gray[100],
    ...Shadows.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: Colors.primary,
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badge: {
    position: 'absolute',
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatar: {
    borderWidth: 2,
    borderColor: Colors.white,
  },
  remainingBadge: {
    backgroundColor: Colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  remainingText: {
    color: Colors.gray[700],
    fontWeight: '700',
  },
});
