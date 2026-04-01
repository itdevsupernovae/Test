import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { PainChart } from '../../components/PainChart';
import { StreakCalendar } from '../../components/StreakCalendar';
import { StreakBadge } from '../../components/StreakBadge';
import { useStreak } from '../../hooks/useStreak';
import { usePainHistory } from '../../hooks/usePainHistory';
import { useSubscription } from '../../hooks/useSubscription';
import { storage } from '../../lib/storage';

export default function ProgressScreen() {
  const { t } = useTranslation();
  const { streak, loading: streakLoading, reload: reloadStreak } = useStreak();
  const { history, backScore, reductionPercent, loading: histLoading, reload: reloadHist } = usePainHistory();
  const { isPremium } = useSubscription();

  useFocusEffect(
    useCallback(() => {
      reloadStreak();
      reloadHist();
    }, [reloadStreak, reloadHist]),
  );

  const loading = streakLoading || histLoading;

  const completedDates = history.map((h) => h.date);
  const totalSessions = completedDates.length;
  const totalMinutes = totalSessions * 3; // approximate

  const chartDays = isPremium ? 30 : 7;
  const visibleHistory = isPremium ? history : history.slice(-7);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => { reloadStreak(); reloadHist(); }} tintColor={colors.primary} />
        }
      >
        <Text style={styles.title}>{t('progress.title')}</Text>

        {/* Back Health Score */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreLabel}>{t('progress.backScore')}</Text>
            <Text style={styles.scoreDesc}>{t('progress.backScoreDesc')}</Text>
          </View>
          <View style={styles.scoreRight}>
            <Text style={styles.scoreValue}>{backScore}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
        </View>

        {/* Pain reduction */}
        {reductionPercent > 0 && (
          <View style={styles.reductionCard}>
            <Text style={styles.reductionText}>
              {t('progress.painReduced', { percent: reductionPercent })}
            </Text>
          </View>
        )}

        {/* Pain chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('progress.painChart')}</Text>
          {!isPremium && (
            <Text style={styles.premiumNote}>📈 Full 30-day chart unlocked with Premium</Text>
          )}
          <PainChart history={visibleHistory} days={chartDays} />
        </View>

        {/* Streak */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('progress.streak')}</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakStat}>
              <StreakBadge count={streak.currentStreak} size="sm" />
              <Text style={styles.streakStatLabel}>{t('progress.currentStreak')}</Text>
            </View>
            <View style={styles.streakStat}>
              <Text style={styles.streakLongest}>{streak.longestStreak}</Text>
              <Text style={styles.streakStatLabel}>{t('progress.longestStreak')}</Text>
            </View>
          </View>
          <StreakCalendar completedDates={completedDates} weeks={12} />
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('progress.stats')}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalSessions}</Text>
              <Text style={styles.statLabel}>{t('progress.totalSessions')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalMinutes}</Text>
              <Text style={styles.statLabel}>{t('progress.totalMinutes')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.textPrimary },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreLeft: { flex: 1, gap: spacing.xs },
  scoreLabel: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary },
  scoreDesc: { fontSize: fontSize.sm, color: colors.textMuted },
  scoreRight: { flexDirection: 'row', alignItems: 'baseline' },
  scoreValue: { fontSize: fontSize['3xl'], fontWeight: '700', color: colors.primary },
  scoreMax: { fontSize: fontSize.md, color: colors.textMuted, marginLeft: 2 },
  reductionCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  reductionText: { fontSize: fontSize.md, color: colors.primary, fontWeight: '600' },
  section: { gap: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  premiumNote: { fontSize: fontSize.sm, color: colors.textMuted, fontStyle: 'italic' },
  streakRow: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  streakStat: { flex: 1, alignItems: 'center', gap: spacing.xs },
  streakStatLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  streakLongest: { fontSize: fontSize.xl, fontWeight: '700', color: colors.accent },
  statsGrid: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },
});
