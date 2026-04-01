import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Illustration placeholder */}
        <View style={styles.illustration}>
          <Text style={styles.illustrationEmoji}>🦴</Text>
        </View>

        <Text style={styles.headline}>{t('onboarding.welcome.headline')}</Text>
        <Text style={styles.subtext}>{t('onboarding.welcome.subtext')}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push('/onboarding/pain-zones')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{t('onboarding.welcome.cta')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  illustration: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  illustrationEmoji: {
    fontSize: 72,
  },
  headline: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: fontSize['2xl'] * 1.3,
    marginBottom: spacing.md,
  },
  subtext: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.black,
  },
});
