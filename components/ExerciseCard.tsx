import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fontSize } from '../theme/typography';
import { spacing } from '../theme/spacing';
import type { Exercise } from '../lib/routine-generator';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  lang: 'en' | 'fr';
}

const ZONE_ICONS: Record<string, string> = {
  neck: '🦒',
  upper_back: '🔙',
  shoulders: '💪',
  lower_back: '🪑',
};

export function ExerciseCard({ exercise, index, lang }: ExerciseCardProps) {
  const icon = ZONE_ICONS[exercise.target_zones[0]] ?? '🧘';
  const name = exercise.name[lang];
  const duration = exercise.duration_seconds;

  return (
    <View style={styles.card}>
      <View style={styles.indexBadge}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.duration}>{duration}s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    flex: 1,
  },
  duration: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
});
