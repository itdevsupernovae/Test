import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import type { PainEntry } from '../lib/storage';

interface StreakCalendarProps {
  completedDates: string[];
  weeks?: number;
}

export function StreakCalendar({ completedDates, weeks = 12 }: StreakCalendarProps) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - weeks * 7 + 1);

  const dateSet = new Set(completedDates);
  const cells: { date: string; type: 'completed' | 'missed' | 'future' }[] = [];

  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    if (dateStr > todayStr) {
      cells.push({ date: dateStr, type: 'future' });
    } else if (dateSet.has(dateStr)) {
      cells.push({ date: dateStr, type: 'completed' });
    } else {
      cells.push({ date: dateStr, type: 'missed' });
    }
  }

  const rows: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((cell, ci) => (
            <View
              key={ci}
              style={[
                styles.cell,
                cell.type === 'completed' && styles.completed,
                cell.type === 'missed' && styles.missed,
                cell.type === 'future' && styles.future,
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 3,
  },
  row: {
    flexDirection: 'row',
    gap: 3,
  },
  cell: {
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  completed: {
    backgroundColor: colors.primary,
  },
  missed: {
    backgroundColor: colors.danger + '66',
  },
  future: {
    backgroundColor: colors.surface,
  },
});
