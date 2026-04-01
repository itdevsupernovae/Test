import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { fontSize } from '../theme/typography';
import { spacing } from '../theme/spacing';

const EMOJIS = ['😊', '🙂', '😐', '😕', '😣', '😖', '😫', '😤', '😡', '🤯'];

interface PainSliderProps {
  value: number;
  onChange: (v: number) => void;
  hapticsEnabled?: boolean;
}

export function PainSlider({ value, onChange, hapticsEnabled = true }: PainSliderProps) {
  const lastValue = React.useRef(value);

  const handleChange = (v: number) => {
    const rounded = Math.round(v);
    if (rounded !== lastValue.current) {
      lastValue.current = rounded;
      if (hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    onChange(rounded);
  };

  const emoji = EMOJIS[Math.min(Math.round(value) - 1, 9)];

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.value}>{Math.round(value)}/10</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={value}
        onValueChange={handleChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.surface}
        thumbTintColor={colors.primary}
      />
      <View style={styles.labels}>
        <Text style={styles.labelText}>Mild</Text>
        <Text style={styles.labelText}>Severe</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  emoji: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.xs,
  },
  labelText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
