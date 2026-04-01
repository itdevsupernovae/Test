import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { StreakBadge } from '../../components/StreakBadge';

export default function CompleteScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    streak: string;
    painBefore: string;
    painAfter: string;
  }>();

  const streak = Number(params.streak ?? '1');
  const painBefore = Number(params.painBefore ?? '5');
  const painAfter = Number(params.painAfter ?? '5');

  const getMotivation = () => {
    if (painAfter < painBefore) return t('complete.improved');
    if (painAfter === painBefore) return t('complete.same');
    return t('complete.worse');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🔥 ${streak} day streak on PostureFix! My back is getting better, 3 minutes at a time.`,
      });
    } catch {
      // Sharing not available
    }
  };

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Checkmark */}
        <View style={styles.checkCircle}>
          <Text style={styles.checkEmoji}>✓</Text>
        </View>

        <Text style={styles.title}>{t('complete.title')}</Text>

        {/* Streak */}
        <StreakBadge count={streak} size="lg" />
        <Text style={styles.streakLabel}>{t('complete.streak', { count: streak })}</Text>

        {/* Pain comparison */}
        <View style={styles.painRow}>
          <View style={styles.painBox}>
            <Text style={styles.painLabel}>Before</Text>
            <Text style={styles.painValue}>{painBefore}/10</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.painBox}>
            <Text style={styles.painLabel}>After</Text>
            <Text style={[styles.painValue, painAfter < painBefore && styles.painImproved]}>
              {painAfter}/10
            </Text>
          </View>
        </View>

        <Text style={styles.motivation}>{getMotivation()}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
          <Text style={styles.shareText}>📤 {t('complete.share')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.85}>
          <Text style={styles.doneBtnText}>{t('complete.done')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkEmoji: { fontSize: 48, color: colors.primary },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  streakLabel: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  painRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  painBox: { alignItems: 'center', gap: spacing.xs },
  painLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  painValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  painImproved: { color: colors.primary },
  arrow: { fontSize: fontSize.xl, color: colors.textMuted },
  motivation: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  shareBtn: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  shareText: { fontSize: fontSize.md, color: colors.textPrimary, fontWeight: '600' },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  doneBtnText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.black },
});
