import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { storage } from '../../lib/storage';
import { PainSlider } from '../../components/PainSlider';

export default function PainLevelScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [pain, setPain] = useState(5);

  const handleNext = async () => {
    await storage.setInitialPain(pain);
    router.push('/onboarding/time-preference');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('onboarding.painLevel.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.painLevel.subtitle')}</Text>
        <PainSlider value={pain} onChange={setPain} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{t('onboarding.painLevel.cta')}</Text>
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
    marginBottom: spacing.xxl,
    lineHeight: fontSize.md * 1.5,
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
