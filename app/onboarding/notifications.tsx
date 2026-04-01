import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { storage } from '../../lib/storage';
import { requestPermissions, scheduleAllNotifications } from '../../lib/notifications';

export default function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [time, setTime] = useState('09:00');
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [lunch, setLunch] = useState(false);
  const [evening, setEvening] = useState(false);

  const adjustHour = (delta: number) => {
    const next = (hour + delta + 24) % 24;
    setHour(next);
    setTime(`${String(next).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
  };

  const adjustMinute = (delta: number) => {
    const next = (minute + delta + 60) % 60;
    setMinute(next);
    setTime(`${String(hour).padStart(2, '0')}:${String(next).padStart(2, '0')}`);
  };

  const handleNext = async () => {
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    await storage.setNotificationTime(timeStr);
    await storage.setExtraLunch(lunch);
    await storage.setExtraEvening(evening);

    if (Platform.OS !== 'web') {
      const granted = await requestPermissions();
      if (granted) {
        await scheduleAllNotifications({
          mainTime: timeStr,
          includeLunch: lunch,
          includeEvening: evening,
          lang: (i18n.language as 'en' | 'fr') ?? 'en',
        });
      }
    }

    router.push('/onboarding/commit');
  };

  const handleSkip = () => {
    router.push('/onboarding/commit');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('onboarding.notifications.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.notifications.subtitle')}</Text>

        {/* Time picker */}
        <View style={styles.timePicker}>
          <View style={styles.timeUnit}>
            <TouchableOpacity onPress={() => adjustHour(1)} style={styles.arrow}>
              <Text style={styles.arrowText}>▲</Text>
            </TouchableOpacity>
            <Text style={styles.timeValue}>{String(hour).padStart(2, '0')}</Text>
            <TouchableOpacity onPress={() => adjustHour(-1)} style={styles.arrow}>
              <Text style={styles.arrowText}>▼</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.timeUnit}>
            <TouchableOpacity onPress={() => adjustMinute(15)} style={styles.arrow}>
              <Text style={styles.arrowText}>▲</Text>
            </TouchableOpacity>
            <Text style={styles.timeValue}>{String(minute).padStart(2, '0')}</Text>
            <TouchableOpacity onPress={() => adjustMinute(-15)} style={styles.arrow}>
              <Text style={styles.arrowText}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Extra reminders */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{t('onboarding.notifications.addLunch')}</Text>
          <Switch
            value={lunch}
            onValueChange={setLunch}
            trackColor={{ false: colors.surfaceHigh, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{t('onboarding.notifications.addEvening')}</Text>
          <Switch
            value={evening}
            onValueChange={setEvening}
            trackColor={{ false: colors.surfaceHigh, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{t('onboarding.notifications.cta')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip} style={styles.skip}>
          <Text style={styles.skipText}>{t('onboarding.notifications.skip')}</Text>
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
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  timeUnit: { alignItems: 'center', gap: spacing.sm },
  arrow: { padding: spacing.sm },
  arrowText: { fontSize: 20, color: colors.primary },
  timeValue: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    minWidth: 72,
    textAlign: 'center',
  },
  colon: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  toggleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  toggleLabel: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.md },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.black },
  skip: { alignItems: 'center', paddingVertical: spacing.sm },
  skipText: { fontSize: fontSize.md, color: colors.textMuted },
});
