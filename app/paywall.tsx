import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { fontSize } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { PaywallCard } from '../components/PaywallCard';
import { getOfferings, purchasePackage, restorePurchases } from '../lib/purchases';
import { usePainHistory } from '../hooks/usePainHistory';
import { useStreak } from '../hooks/useStreak';
import type { PurchasesPackage } from 'react-native-purchases';

const FEATURES = [
  'Unlimited daily routines',
  'Personalized program evolution',
  'Full progress analytics (30 days)',
  'Strict Mode reminders',
  'Morning + evening routines',
  'Phase-based progression',
];

const FEATURES_FR = [
  'Routines quotidiennes illimitées',
  'Programme personnalisé évolutif',
  'Analyses complètes (30 jours)',
  'Rappels en mode strict',
  'Routines matin + soir',
  'Progression par phases',
];

interface PricingOption {
  key: 'weekly' | 'monthly' | 'annual';
  label: string;
  price: string;
  period: string;
  badge?: string;
  pkg: PurchasesPackage | null;
}

export default function PaywallScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lang = (i18n.language as 'en' | 'fr') ?? 'en';

  const { reductionPercent, loading: histLoading } = usePainHistory();
  const { streak } = useStreak();
  const [selected, setSelected] = useState<'weekly' | 'monthly' | 'annual'>('weekly');
  const [options, setOptions] = useState<PricingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOfferings, setLoadingOfferings] = useState(true);

  useEffect(() => {
    (async () => {
      const pkgs = await getOfferings();
      const weekly = pkgs.find((p) => p.packageType === 'WEEKLY') ?? null;
      const monthly = pkgs.find((p) => p.packageType === 'MONTHLY') ?? null;
      const annual = pkgs.find((p) => p.packageType === 'ANNUAL') ?? null;

      setOptions([
        {
          key: 'weekly',
          label: t('paywall.weeklyLabel'),
          price: weekly?.product.priceString ?? '€2.99',
          period: 'week',
          pkg: weekly,
        },
        {
          key: 'monthly',
          label: t('paywall.monthlyLabel'),
          price: monthly?.product.priceString ?? '€5.99',
          period: 'month',
          pkg: monthly,
        },
        {
          key: 'annual',
          label: t('paywall.annualLabel'),
          price: annual?.product.priceString ?? '€29.99',
          period: 'year',
          badge: t('paywall.annualSave'),
          pkg: annual,
        },
      ]);
      setLoadingOfferings(false);
    })();
  }, [t]);

  const handlePurchase = async () => {
    const option = options.find((o) => o.key === selected);
    if (!option) return;

    setLoading(true);
    try {
      if (option.pkg) {
        const info = await purchasePackage(option.pkg);
        if (info) {
          Alert.alert('🎉 Welcome to Premium!', 'Your back will thank you.', [
            { text: 'Start', onPress: () => router.replace('/(tabs)') },
          ]);
        }
      } else {
        // No real RevenueCat configured — simulate for dev
        Alert.alert('Dev mode', 'RevenueCat not configured yet. Set up your API key.', [
          { text: 'OK' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const info = await restorePurchases();
    setLoading(false);
    if (info && typeof info.entitlements.active['premium'] !== 'undefined') {
      Alert.alert('Restored!', 'Your premium access has been restored.', [
        { text: 'Continue', onPress: () => router.replace('/(tabs)') },
      ]);
    } else {
      Alert.alert('No purchase found', 'No active subscription found for this account.');
    }
  };

  const features = lang === 'fr' ? FEATURES_FR : FEATURES;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* User's progress hook */}
        <View style={styles.hookSection}>
          <Text style={styles.hookTitle}>{t('paywall.title')}</Text>
          {reductionPercent > 0 && !histLoading && (
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                📉 {t('paywall.progressLabel', { percent: reductionPercent, days: streak.currentStreak })}
              </Text>
            </View>
          )}
          {streak.currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>
                🔥 {t('paywall.streakLabel', { streak: streak.currentStreak })}
              </Text>
            </View>
          )}
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>{t('paywall.featureTitle')}</Text>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Pricing */}
        {loadingOfferings ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.pricingRow}>
            {options.map((opt) => (
              <PaywallCard
                key={opt.key}
                label={opt.label}
                price={opt.price}
                period={opt.period}
                badge={opt.badge}
                selected={selected === opt.key}
                onPress={() => setSelected(opt.key)}
              />
            ))}
          </View>
        )}

        <Text style={styles.cancelNote}>{t('paywall.cancel')}</Text>
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cta}
          onPress={handlePurchase}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.black} />
          ) : (
            <Text style={styles.ctaText}>{t('paywall.cta')}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'flex-end' },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: colors.textMuted, fontSize: 16 },
  hookSection: { gap: spacing.sm, alignItems: 'center' },
  hookTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  progressBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary + '60',
  },
  progressBadgeText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  streakBadge: {
    backgroundColor: colors.accent + '20',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.accent + '60',
  },
  streakBadgeText: { fontSize: fontSize.sm, color: colors.accent, fontWeight: '600' },
  featuresSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  featuresTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featureCheck: { color: colors.primary, fontWeight: '700', fontSize: fontSize.md },
  featureText: { fontSize: fontSize.sm, color: colors.textPrimary },
  pricingRow: { flexDirection: 'row', gap: spacing.sm },
  cancelNote: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 54,
    justifyContent: 'center',
  },
  ctaText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.black },
  restoreBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  restoreText: { fontSize: fontSize.sm, color: colors.textMuted },
});
