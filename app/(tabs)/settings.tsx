import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { storage } from '../../lib/storage';
import { scheduleAllNotifications, cancelAllNotifications } from '../../lib/notifications';
import { useSubscription } from '../../hooks/useSubscription';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isPremium } = useSubscription();

  const [notifTime, setNotifTime] = useState('09:00');
  const [lunch, setLunch] = useState(false);
  const [evening, setEvening] = useState(false);
  const [strictMode, setStrictMode] = useState(false);
  const [sounds, setSounds] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [lang, setLang] = useState<'en' | 'fr'>('en');

  const loadSettings = useCallback(async () => {
    const [time, l, e, strict, s, h, language] = await Promise.all([
      storage.getNotificationTime(),
      storage.getExtraLunch(),
      storage.getExtraEvening(),
      storage.getStrictMode(),
      storage.getSoundsEnabled(),
      storage.getHapticsEnabled(),
      storage.getLanguage(),
    ]);
    setNotifTime(time);
    setLunch(l);
    setEvening(e);
    setStrictMode(strict);
    setSounds(s);
    setHaptics(h);
    setLang(language);
  }, []);

  useFocusEffect(
    useCallback(() => { loadSettings(); }, [loadSettings]),
  );

  const handleToggleLunch = async (v: boolean) => {
    setLunch(v);
    await storage.setExtraLunch(v);
    await scheduleAllNotifications({ mainTime: notifTime, includeLunch: v, includeEvening: evening, lang });
  };

  const handleToggleEvening = async (v: boolean) => {
    setEvening(v);
    await storage.setExtraEvening(v);
    await scheduleAllNotifications({ mainTime: notifTime, includeLunch: lunch, includeEvening: v, lang });
  };

  const handleStrictMode = async (v: boolean) => {
    if (!isPremium && v) {
      router.push('/paywall');
      return;
    }
    setStrictMode(v);
    await storage.setStrictMode(v);
  };

  const handleSounds = async (v: boolean) => {
    setSounds(v);
    await storage.setSoundsEnabled(v);
  };

  const handleHaptics = async (v: boolean) => {
    setHaptics(v);
    await storage.setHapticsEnabled(v);
  };

  const handleLanguage = async () => {
    const next = lang === 'en' ? 'fr' : 'en';
    setLang(next);
    await storage.setLanguage(next);
    await i18n.changeLanguage(next);
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  function Row({
    label,
    right,
  }: {
    label: string;
    right: React.ReactNode;
  }) {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        {right}
      </View>
    );
  }

  function SectionHeader({ title }: { title: string }) {
    return <Text style={styles.sectionHeader}>{title}</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('settings.title')}</Text>

        {/* Notifications */}
        <SectionHeader title={t('settings.notifications')} />
        <View style={styles.card}>
          <Row
            label={t('settings.lunchReminder')}
            right={
              <Switch
                value={lunch}
                onValueChange={handleToggleLunch}
                trackColor={{ false: colors.surfaceHigh, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
          />
          <View style={styles.divider} />
          <Row
            label={t('settings.eveningReminder')}
            right={
              <Switch
                value={evening}
                onValueChange={handleToggleEvening}
                trackColor={{ false: colors.surfaceHigh, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
          />
          <View style={styles.divider} />
          <Row
            label={t('settings.strictMode')}
            right={
              <View style={styles.premiumToggleRow}>
                {!isPremium && (
                  <Text style={styles.premiumTag}>⭐ {t('settings.strictModePremium')}</Text>
                )}
                <Switch
                  value={strictMode}
                  onValueChange={handleStrictMode}
                  trackColor={{ false: colors.surfaceHigh, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            }
          />
        </View>

        {/* Preferences */}
        <SectionHeader title={t('settings.preferences')} />
        <View style={styles.card}>
          <Row
            label={t('settings.sounds')}
            right={
              <Switch
                value={sounds}
                onValueChange={handleSounds}
                trackColor={{ false: colors.surfaceHigh, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
          />
          <View style={styles.divider} />
          <Row
            label={t('settings.haptics')}
            right={
              <Switch
                value={haptics}
                onValueChange={handleHaptics}
                trackColor={{ false: colors.surfaceHigh, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
          />
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={handleLanguage} activeOpacity={0.7}>
            <Text style={styles.rowLabel}>{t('settings.language')}</Text>
            <Text style={styles.rowValue}>{lang === 'en' ? '🇬🇧 English' : '🇫🇷 Français'}</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription */}
        {isPremium && (
          <>
            <SectionHeader title={t('settings.subscription')} />
            <View style={styles.card}>
              <Row
                label={t('settings.manageSub')}
                right={<Text style={styles.chevron}>›</Text>}
              />
            </View>
          </>
        )}
        {!isPremium && (
          <>
            <SectionHeader title={t('settings.subscription')} />
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => router.push('/paywall')}
              activeOpacity={0.85}
            >
              <Text style={styles.upgradeBtnText}>⭐ {t('common.upgrade')}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* About */}
        <SectionHeader title={t('settings.about')} />
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert(t('disclaimer.title'), t('disclaimer.text'))}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>{t('settings.disclaimer')}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('https://posturefix.app/privacy')}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>{t('settings.privacy')}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('https://posturefix.app/terms')}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>{t('settings.terms')}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>{t('settings.version', { version })}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  title: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  sectionHeader: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    minHeight: 52,
  },
  rowLabel: { fontSize: fontSize.md, color: colors.textPrimary, flex: 1 },
  rowValue: { fontSize: fontSize.md, color: colors.textMuted },
  chevron: { fontSize: fontSize.xl, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  premiumToggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  premiumTag: { fontSize: fontSize.xs, color: colors.accent },
  upgradeBtn: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  upgradeBtnText: { fontSize: fontSize.md, fontWeight: '700', color: colors.white },
  version: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
