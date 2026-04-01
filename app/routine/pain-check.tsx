import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { PainSlider } from '../../components/PainSlider';
import { storage, SessionRecord, PainEntry } from '../../lib/storage';
import { updateStreakOnCompletion } from '../../lib/streak';

export default function PainCheckScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    painBefore: string;
    exerciseIds: string;
    durations: string;
  }>();

  const painBefore = Number(params.painBefore ?? '5');
  const exerciseIds = (params.exerciseIds ?? '').split(',').filter(Boolean);
  const durations = (params.durations ?? '').split(',').map(Number).filter(Boolean);

  const [painAfter, setPainAfter] = useState(painBefore);

  const handleContinue = async () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Save pain entry
    const painEntry: PainEntry = {
      date: today,
      painLevel: painAfter,
      context: 'post_routine',
    };
    await storage.addPainEntry(painEntry);

    // Save session
    const session: SessionRecord = {
      id: `${Date.now()}`,
      date: today,
      exercises: exerciseIds.map((id, i) => ({
        exerciseId: id,
        duration: durations[i] ?? 45,
        completed: true,
      })),
      painBefore,
      painAfter,
      completedAt: now,
      synced: false,
    };
    await storage.setTodaySession(session);
    await storage.addToSessionsQueue(session);

    // Update streak
    const streak = await updateStreakOnCompletion();

    router.replace({
      pathname: '/routine/complete',
      params: {
        streak: String(streak.currentStreak),
        painBefore: String(painBefore),
        painAfter: String(painAfter),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('painCheck.title')}</Text>
        <Text style={styles.subtitle}>{t('painCheck.subtitle')}</Text>
        <PainSlider value={painAfter} onChange={setPainAfter} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{t('painCheck.cta')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.black },
});
