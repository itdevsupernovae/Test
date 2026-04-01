import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Timer } from '../../components/Timer';
import { storage } from '../../lib/storage';
import { generateRoutine, Exercise } from '../../lib/routine-generator';

export default function ExerciseScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lang = (i18n.language as 'en' | 'fr') ?? 'en';

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [resting, setResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(3);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [painBefore, setPainBefore] = useState<number>(5);

  useEffect(() => {
    (async () => {
      const [zones, duration, phase, lastIds, initialPain, haptics] = await Promise.all([
        storage.getPainZones(),
        storage.getDailyDuration(),
        storage.getCurrentPhase(),
        storage.getLastRoutineIds(),
        storage.getInitialPain(),
        storage.getHapticsEnabled(),
      ]);
      const routine = generateRoutine(zones, duration, phase, lastIds);
      setExercises(routine);
      setPainBefore(initialPain);
      setHapticsEnabled(haptics);
      setLoading(false);
    })();
  }, []);

  const handleExerciseComplete = useCallback(() => {
    if (currentIndex < exercises.length - 1) {
      // Show rest period
      setResting(true);
      setRestSeconds(3);
      const countdown = setInterval(() => {
        setRestSeconds((s) => {
          if (s <= 1) {
            clearInterval(countdown);
            setResting(false);
            setCurrentIndex((i) => i + 1);
            return 3;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      // All exercises done — navigate to pain check
      const ids = exercises.map((e) => e.id);
      storage.setLastRoutineIds(ids);
      router.push({
        pathname: '/routine/pain-check',
        params: {
          painBefore: String(painBefore),
          exerciseIds: ids.join(','),
          durations: exercises.map((e) => e.duration_seconds).join(','),
        },
      });
    }
  }, [currentIndex, exercises, painBefore, router]);

  const handlePause = () => {
    setPaused(true);
    setShowPauseModal(true);
  };

  const handleResume = () => {
    setShowPauseModal(false);
    setPaused(false);
  };

  const handleQuit = () => {
    setShowPauseModal(false);
    router.back();
  };

  if (loading || exercises.length === 0) {
    return (
      <View style={styles.loader}>
        <Text style={styles.loaderText}>{t('common.loading')}</Text>
      </View>
    );
  }

  const exercise = exercises[currentIndex];
  const progress = (currentIndex + 1) / exercises.length;

  // Build the lottie source path
  const lottiePath = `../../assets/animations/${exercise.lottie_file}`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.exerciseCounter}>
          {t('routine.exercise', { current: currentIndex + 1, total: exercises.length })}
        </Text>
        <TouchableOpacity onPress={handlePause} style={styles.pauseBtn}>
          <Text style={styles.pauseText}>{t('routine.pause')}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {resting ? (
          <View style={styles.restContainer}>
            <Text style={styles.restMessage}>{t('routine.restMessage')}</Text>
            <Text style={styles.restCountdown}>{restSeconds}</Text>
            <Text style={styles.restUnit}>{t('routine.restSeconds')}</Text>
          </View>
        ) : (
          <>
            {/* Animation */}
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../../assets/animations/neck-side-stretch.json')}
                autoPlay
                loop
                style={styles.animation}
              />
            </View>

            {/* Exercise info */}
            <Text style={styles.exerciseName}>{exercise.name[lang]}</Text>
            <Text style={styles.exerciseDesc}>{exercise.description[lang]}</Text>

            {/* Timer */}
            <Timer
              durationSeconds={exercise.duration_seconds}
              onComplete={handleExerciseComplete}
              paused={paused}
              hapticsEnabled={hapticsEnabled}
            />

            {/* Tip */}
            {exercise.tips[lang] ? (
              <Text style={styles.tip}>💡 {exercise.tips[lang]}</Text>
            ) : null}
          </>
        )}
      </View>

      {/* Pause modal */}
      <Modal visible={showPauseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('routine.pauseTitle')}</Text>
            <Text style={styles.modalMessage}>{t('routine.pauseMessage')}</Text>
            <TouchableOpacity style={styles.resumeBtn} onPress={handleResume}>
              <Text style={styles.resumeText}>{t('routine.resumeCta')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleQuit} style={styles.quitBtn}>
              <Text style={styles.quitText}>{t('routine.quitCta')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: { color: colors.textMuted, fontSize: fontSize.md },
  progressBar: {
    height: 4,
    flexDirection: 'row',
    backgroundColor: colors.surface,
  },
  progressFill: { backgroundColor: colors.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  exerciseCounter: { fontSize: fontSize.md, color: colors.textMuted, fontWeight: '600' },
  pauseBtn: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  pauseText: { fontSize: fontSize.sm, color: colors.textMuted },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  animationContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  animation: { width: 200, height: 200 },
  exerciseName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  exerciseDesc: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.6,
  },
  tip: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  restContainer: { alignItems: 'center', gap: spacing.sm },
  restMessage: { fontSize: fontSize.xl, fontWeight: '600', color: colors.textPrimary },
  restCountdown: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  restUnit: { fontSize: fontSize.md, color: colors.textMuted },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.textPrimary },
  modalMessage: { fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center' },
  resumeBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  resumeText: { fontSize: fontSize.md, fontWeight: '700', color: colors.black },
  quitBtn: { paddingVertical: spacing.sm },
  quitText: { fontSize: fontSize.md, color: colors.danger },
});
