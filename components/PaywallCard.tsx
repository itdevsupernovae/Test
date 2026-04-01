import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fontSize } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface PaywallCardProps {
  label: string;
  price: string;
  period: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}

export function PaywallCard({
  label,
  price,
  period,
  badge,
  selected,
  onPress,
}: PaywallCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.price}>{price}</Text>
      <Text style={styles.period}>/{period}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selected: {
    borderColor: colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.black,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  price: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  period: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
