import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { storage, PainZone } from '../../lib/storage';

const ZONES: { id: PainZone; emoji: string; key: string }[] = [
  { id: 'neck', emoji: '🦒', key: 'onboarding.painZones.neck' },
  { id: 'upper_back', emoji: '🔙', key: 'onboarding.painZones.upperBack' },
  { id: 'shoulders', emoji: '💪', key: 'onboarding.painZones.shoulders' },
  { id: 'lower_back', emoji: '🪑', key: 'onboarding.painZones.lowerBack' },
];

export default function PainZonesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<PainZone>>(new Set());

  const toggle = (zone: PainZone) => {
    const next = new Set(selected);
    if (next.has(zone)) next.delete(zone);
    else next.add(zone);
    setSelected(next);
  };

  const handleNext = async () => {
    if (selected.size === 0) {
      Alert.alert('', t('onboarding.painZones.error'));
      return;
    }
    await storage.setPainZones(Array.from(selected));
    router.push('/onboarding/pain-level');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('onboarding.painZones.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.painZones.subtitle')}</Text>

        <View style={styles.grid}>
          {ZONES.map((zone) => {
            const active = selected.has(zone.id);
            return (
              <TouchableOpacity
                key={zone.id}
                style={[styles.zoneCard, active && styles.zoneCardActive]}
                onPress={() => toggle(zone.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.zoneEmoji}>{zone.emoji}</Text>
                <Text style={[styles.zoneLabel, active && styles.zoneLabelActive]}>
                  {t(zone.key)}
                </Text>
                {active && <View style={styles.checkmark}><Text style={styles.checkmarkText}>✓</Text></View>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, selected.size === 0 && styles.ctaDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{t('onboarding.painZones.cta')}</Text>
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
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  zoneCard: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  zoneCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  zoneEmoji: { fontSize: 40, marginBottom: spacing.sm },
  zoneLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  zoneLabelActive: { color: colors.primary },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: { color: colors.black, fontSize: 12, fontWeight: '700' },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.black },
});
