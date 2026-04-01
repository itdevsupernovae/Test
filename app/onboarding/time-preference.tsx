import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { storage } from '../../lib/storage';

export default function TimePreferenceScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selected, setSelected] = useState<3 | 5>(3);

  const handleNext = async () => {
    await storage.setDailyDuration(selected);
    router.push('/onboarding/notifications');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('onboarding.timePreference.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.timePreference.subtitle')}</Text>

        <View style={styles.options}>
          {([3, 5] as const).map((mins) => {
            const isSelected = selected === mins;
            return (
              <TouchableOpacity
                key={mins}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => setSelected(mins)}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionTime, isSelected && styles.optionTimeSelected]}>
                  {mins} min
                </Text>
                <Text style={styles.optionDesc}>
                  {t(`onboarding.timePreference.option${mins}desc`)}
                </Text>
                {isSelected && (
                  <View style={styles.check}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{t('onboarding.timePreference.cta')}</Text>
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
    paddingTop: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  options: {
    width: '100%',
    gap: spacing.md,
  },
  option: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  optionTime: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  optionTimeSelected: { color: colors.primary },
  optionDesc: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  check: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: colors.black, fontWeight: '700', fontSize: 13 },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.black },
});
