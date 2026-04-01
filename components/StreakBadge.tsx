import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fontSize } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface StreakBadgeProps {
  count: number;
  size?: 'sm' | 'lg';
}

export function StreakBadge({ count, size = 'lg' }: StreakBadgeProps) {
  const isLarge = size === 'lg';
  return (
    <View style={[styles.container, isLarge ? styles.large : styles.small]}>
      <Text style={isLarge ? styles.fireLg : styles.fireSm}>🔥</Text>
      <Text style={[styles.count, isLarge ? styles.countLg : styles.countSm]}>
        {count}
      </Text>
      <Text style={[styles.label, isLarge ? styles.labelLg : styles.labelSm]}>
        {count === 1 ? 'day' : 'days'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  large: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: 4,
  },
  fireLg: { fontSize: 28 },
  fireSm: { fontSize: 16 },
  count: {
    fontWeight: '700',
    color: colors.accent,
  },
  countLg: { fontSize: fontSize['2xl'] },
  countSm: { fontSize: fontSize.md },
  label: {
    color: colors.textMuted,
  },
  labelLg: { fontSize: fontSize.md },
  labelSm: { fontSize: fontSize.xs },
});
