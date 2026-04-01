import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { fontSize } from '../theme/typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 80;
const STROKE_WIDTH = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = (RADIUS + STROKE_WIDTH) * 2;

interface TimerProps {
  durationSeconds: number;
  onComplete: () => void;
  paused: boolean;
  hapticsEnabled: boolean;
}

export function Timer({ durationSeconds, onComplete, paused, hapticsEnabled }: TimerProps) {
  const progress = useSharedValue(1);
  const secondsLeft = useSharedValue(durationSeconds);
  const lastHapticSecond = useSharedValue(-1);
  const completed = useSharedValue(false);

  const triggerHaptic = useCallback(
    (heavy: boolean) => {
      if (!hapticsEnabled) return;
      if (heavy) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [hapticsEnabled],
  );

  useEffect(() => {
    if (paused || completed.value) return;

    const interval = setInterval(() => {
      secondsLeft.value = secondsLeft.value - 1;
      progress.value = secondsLeft.value / durationSeconds;

      // Haptic tick every 10 seconds
      const sec = secondsLeft.value;
      if (sec % 10 === 0 && sec !== lastHapticSecond.value && sec > 0) {
        lastHapticSecond.value = sec;
        runOnJS(triggerHaptic)(false);
      }

      if (sec <= 0) {
        completed.value = true;
        clearInterval(interval);
        runOnJS(triggerHaptic)(true);
        runOnJS(onComplete)();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paused, durationSeconds, onComplete, triggerHaptic]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progress.value))),
  }));

  const isLastFive = secondsLeft.value <= 5 && secondsLeft.value > 0;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        {/* Background track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.surface}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={isLastFive ? colors.primary : colors.accent}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={styles.timeText}>
          {Math.max(0, Math.ceil(secondsLeft.value))}
        </Text>
        <Text style={styles.unitText}>s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  timeText: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  unitText: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    marginTop: 8,
    marginLeft: 2,
  },
});
