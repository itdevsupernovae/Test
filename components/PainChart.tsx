import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../theme/colors';
import { fontSize } from '../theme/typography';
import { spacing } from '../theme/spacing';
import type { PainEntry } from '../lib/storage';

const { width } = Dimensions.get('window');

interface PainChartProps {
  history: PainEntry[];
  days?: number;
}

export function PainChart({ history, days = 30 }: PainChartProps) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const filtered = history
    .filter((h) => new Date(h.date) >= cutoff)
    .slice(-days);

  if (filtered.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Complete a few routines to see your pain trend.
        </Text>
      </View>
    );
  }

  const labels = filtered.map((h) => {
    const d = new Date(h.date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  // Show at most 6 labels to avoid crowding
  const step = Math.max(1, Math.floor(labels.length / 6));
  const sparseLabels = labels.map((l, i) => (i % step === 0 ? l : ''));

  const data = {
    labels: sparseLabels,
    datasets: [{ data: filtered.map((h) => h.painLevel) }],
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={data}
        width={width - spacing.md * 2}
        height={180}
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`,
          labelColor: () => colors.textMuted,
          style: { borderRadius: 12 },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: colors.primary,
          },
        }}
        bezier
        style={styles.chart}
        fromZero={false}
        yAxisSuffix=""
        yAxisInterval={2}
        segments={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  empty: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
