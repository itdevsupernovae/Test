import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function parseTime(timeStr: string): { hour: number; minute: number } {
  const [h, m] = timeStr.split(':').map(Number);
  return { hour: h, minute: m };
}

export async function scheduleDailyReminder(
  timeStr: string,
  titleKey: string,
  bodyKey: string,
): Promise<string> {
  const { hour, minute } = parseTime(timeStr);
  return Notifications.scheduleNotificationAsync({
    content: {
      title: titleKey,
      body: bodyKey,
      data: { type: 'daily_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function scheduleMissedReminder(
  baseTimeStr: string,
  titleKey: string,
  bodyKey: string,
): Promise<string> {
  const { hour, minute } = parseTime(baseTimeStr);
  const triggerHour = (hour + 3) % 24;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: titleKey,
      body: bodyKey,
      data: { type: 'missed_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: triggerHour,
      minute,
    },
  });
}

export async function scheduleEndOfDayReminder(
  titleKey: string,
  bodyKey: string,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: titleKey,
      body: bodyKey,
      data: { type: 'end_of_day' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleAllNotifications(opts: {
  mainTime: string;
  includeLunch: boolean;
  includeEvening: boolean;
  lang: 'en' | 'fr';
}): Promise<void> {
  await cancelAllNotifications();

  const titles = {
    en: {
      daily: 'Time to stretch.',
      missed: "You haven't done your routine yet.",
      eod: 'Last chance.',
      lunch: 'Lunchtime stretch.',
      evening: 'Evening routine.',
    },
    fr: {
      daily: "C'est l'heure.",
      missed: "Tu n'as toujours pas fait ta routine.",
      eod: 'Dernière chance.',
      lunch: 'Étirement de midi.',
      evening: 'Routine du soir.',
    },
  };

  const bodies = {
    en: {
      daily: '3 minutes for your back.',
      missed: 'Your back is waiting.',
      eod: "Your back won't improve on its own.",
      lunch: '3 minutes before the afternoon.',
      evening: "Don't end the day without it.",
    },
    fr: {
      daily: '3 minutes pour ton dos.',
      missed: 'Ton dos attend.',
      eod: "Ton dos ne va pas s'améliorer tout seul.",
      lunch: '3 minutes avant cet après-midi.',
      evening: "Ne termine pas la journée sans ta routine.",
    },
  };

  const t = titles[opts.lang];
  const b = bodies[opts.lang];

  await scheduleDailyReminder(opts.mainTime, t.daily, b.daily);
  await scheduleMissedReminder(opts.mainTime, t.missed, b.missed);
  await scheduleEndOfDayReminder(t.eod, b.eod);

  if (opts.includeLunch) {
    await scheduleDailyReminder('13:00', t.lunch, b.lunch);
  }
  if (opts.includeEvening) {
    await scheduleDailyReminder('21:00', t.evening, b.evening);
  }
}
