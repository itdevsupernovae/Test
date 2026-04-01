import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { storage } from '../../lib/storage';

export default function CommitScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleCommit = async () => {
    await storage.setOnboardingComplete(true);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Medical disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerIcon}>⚕️</Text>
          <Text style={styles.disclaimerTitle}>{t('disclaimer.title')}</Text>
          <Text style={styles.disclaimerText}>{t('disclaimer.text')}</Text>
        </View>

        {/* Commit section */}
        <View style={styles.commitSection}>
          <Text style={styles.commitTitle}>{t('onboarding.commit.title')}</Text>
          <Text style={styles.commitText}>{t('onboarding.commit.commitText')}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={handleCommit} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{t('onboarding.commit.cta')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  disclaimer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    gap: spacing.sm,
  },
  disclaimerIcon: { fontSize: 28 },
  disclaimerTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  disclaimerText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: fontSize.sm * 1.6,
  },
  commitSection: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  commitTitle: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  commitText: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: fontSize.lg * 1.5,
    fontStyle: 'italic',
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
