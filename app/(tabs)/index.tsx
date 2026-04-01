import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { StreakBadge } from '../../components/StreakBadge';
import { ExerciseCard } from '../../components/ExerciseCard';
import { useStreak } from '../../hooks/useStreak';
import { useRoutine } from '../../hooks/useRoutine';
import { useSubscription } from '../../hooks/useSubscription';
import { usePainHistory } from '../../hooks/usePainHistory';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lang = (i18n.language as 'en' | 'fr') ?? 'en';

  const { streak, missedYesterday, loading: streakLoading, reload: reloadStreak } = useStreak();
  const { exercises, todayComplete, loading: routineLoading, reload: reloadRoutine } = useRoutine();
  const { paywallRequired } = useSubscription();
  const { history } = usePainHistory();

  const loading = streakLoading || routineLoading;

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      reloadStreak();
      reloadRoutine();
    }, [reloadStreak, reloadRoutine]),
  );

  const handleStartRoutine = () => {
    if (paywallRequired) {
      router.push('/paywall');
      return;
    }
    router.push('/routine/exercise');
  };

  const lastSevenPainLevels = history.slice(-7).map((h) => h.painLevel);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => { reloadStreak(); reloadRoutine(); }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>PostureFix</Text>
          {streak.currentStreak > 0 && (
            <StreakBadge count={streak.currentStreak} size="sm" />
          )}
        </View>

        {/* Missed yesterday banner */}
        {missedYesterday && !todayComplete && (
          <View style={styles.missedBanner}>
            <Text style={styles.missedText}>{t('home.missedBanner')}</Text>
          </View>
        )}

        {/* Streak display */}
        <View style={styles.streakSection}>
          {streak.currentStreak > 0 ? (
            <>
              <Text style={styles.streakDay}>
                {t('home.greeting', { count: streak.currentStreak })} {t('home.greetingFire')}
              </Text>
            </>
          ) : (
            <Text style={styles.streakDay}>{t('home.noStreak')}</Text>
          )}
        </View>

        {/* Pain trend mini chart */}
        {lastSevenPainLevels.length > 0 && (
          <View style={styles.sparkCard}>
            <Text style={styles.sparkTitle}>{t('home.painTrend')}</Text>
            <View style={styles.sparkBars}>
              {lastSevenPainLevels.map((level, i) => (
                <View key={i} style={styles.sparkBarContainer}>
                  <View
                    style={[
                      styles.sparkBar,
                      { height: (level / 10) * 40 },
                      level <= 4 ? styles.sparkBarGood : level <= 6 ? styles.sparkBarMid : styles.sparkBarBad,
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Today's routine card */}
        <View style={styles.routineCard}>
          <View style={styles.routineHeader}>
            <Text style={styles.routineTitle}>{t('home.routineTitle')}</Text>
            {todayComplete && (
              <Text style={styles.completedBadge}>✓ Done</Text>
            )}
          </View>

          {exercises.slice(0, 3).map((ex, i) => (
            <ExerciseCard key={ex.id} exercise={ex} index={i} lang={lang} />
          ))}
        </View>

        {/* CTA */}
        {todayComplete ? (
          <View style={styles.completedState}>
            <Text style={styles.completedTitle}>{t('home.completedTitle')}</Text>
            <Text style={styles.completedSub}>{t('home.completedSubtext')}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleStartRoutine}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>{t('home.startCta')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  missedBanner: {
    backgroundColor: colors.danger + '22',
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  missedText: { fontSize: fontSize.sm, color: colors.danger, fontWeight: '600' },
  streakSection: { alignItems: 'center', paddingVertical: spacing.sm },
  streakDay: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sparkCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sparkTitle: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  sparkBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 44,
  },
  sparkBarContainer: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 40 },
  sparkBar: { width: '100%', borderRadius: 3, minHeight: 4 },
  sparkBarGood: { backgroundColor: colors.primary },
  sparkBarMid: { backgroundColor: colors.accent },
  sparkBarBad: { backgroundColor: colors.danger },
  routineCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.xs,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  routineTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  completedBadge: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '700',
  },
  completedState: {
    backgroundColor: colors.primary + '15',
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  completedTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  completedSub: { fontSize: fontSize.md, color: colors.textMuted },
  startBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.black,
  },
});
