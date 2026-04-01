import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ONBOARDING_COMPLETE: 'posturefix:onboarding_complete',
  PAIN_ZONES: 'posturefix:pain_zones',
  INITIAL_PAIN: 'posturefix:initial_pain',
  DAILY_DURATION: 'posturefix:daily_duration',
  NOTIFICATION_TIME: 'posturefix:notification_time',
  EXTRA_LUNCH: 'posturefix:extra_lunch',
  EXTRA_EVENING: 'posturefix:extra_evening',
  STRICT_MODE: 'posturefix:strict_mode',
  SOUNDS_ENABLED: 'posturefix:sounds_enabled',
  HAPTICS_ENABLED: 'posturefix:haptics_enabled',
  LANGUAGE: 'posturefix:language',
  ACCOUNT_CREATED_AT: 'posturefix:account_created_at',
  CURRENT_PHASE: 'posturefix:current_phase',
  TODAY_SESSION: 'posturefix:today_session',
  SESSIONS_QUEUE: 'posturefix:sessions_queue',
  PAIN_HISTORY: 'posturefix:pain_history',
  STREAK_DATA: 'posturefix:streak_data',
  LAST_ROUTINE_IDS: 'posturefix:last_routine_ids',
} as const;

export type PainZone = 'neck' | 'upper_back' | 'shoulders' | 'lower_back';

export interface UserPreferences {
  painZones: PainZone[];
  initialPain: number;
  dailyDuration: 3 | 5;
  notificationTime: string; // "HH:MM"
  extraLunch: boolean;
  extraEvening: boolean;
  strictMode: boolean;
  soundsEnabled: boolean;
  hapticsEnabled: boolean;
  language: 'en' | 'fr';
  currentPhase: 1 | 2 | 3 | 4;
}

export interface PainEntry {
  date: string;
  painLevel: number;
  context: 'post_routine' | 'daily_check';
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export interface SessionRecord {
  id: string;
  date: string;
  exercises: { exerciseId: string; duration: number; completed: boolean }[];
  painBefore: number | null;
  painAfter: number | null;
  completedAt: string | null;
  synced: boolean;
}

async function get<T>(key: string, fallback: T): Promise<T> {
  try {
    const val = await AsyncStorage.getItem(key);
    return val != null ? (JSON.parse(val) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function set(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  isOnboardingComplete: () => get<boolean>(KEYS.ONBOARDING_COMPLETE, false),
  setOnboardingComplete: (v: boolean) => set(KEYS.ONBOARDING_COMPLETE, v),

  getPainZones: () => get<PainZone[]>(KEYS.PAIN_ZONES, []),
  setPainZones: (zones: PainZone[]) => set(KEYS.PAIN_ZONES, zones),

  getInitialPain: () => get<number>(KEYS.INITIAL_PAIN, 5),
  setInitialPain: (v: number) => set(KEYS.INITIAL_PAIN, v),

  getDailyDuration: () => get<3 | 5>(KEYS.DAILY_DURATION, 3),
  setDailyDuration: (v: 3 | 5) => set(KEYS.DAILY_DURATION, v),

  getNotificationTime: () => get<string>(KEYS.NOTIFICATION_TIME, '09:00'),
  setNotificationTime: (v: string) => set(KEYS.NOTIFICATION_TIME, v),

  getExtraLunch: () => get<boolean>(KEYS.EXTRA_LUNCH, false),
  setExtraLunch: (v: boolean) => set(KEYS.EXTRA_LUNCH, v),

  getExtraEvening: () => get<boolean>(KEYS.EXTRA_EVENING, false),
  setExtraEvening: (v: boolean) => set(KEYS.EXTRA_EVENING, v),

  getStrictMode: () => get<boolean>(KEYS.STRICT_MODE, false),
  setStrictMode: (v: boolean) => set(KEYS.STRICT_MODE, v),

  getSoundsEnabled: () => get<boolean>(KEYS.SOUNDS_ENABLED, false),
  setSoundsEnabled: (v: boolean) => set(KEYS.SOUNDS_ENABLED, v),

  getHapticsEnabled: () => get<boolean>(KEYS.HAPTICS_ENABLED, true),
  setHapticsEnabled: (v: boolean) => set(KEYS.HAPTICS_ENABLED, v),

  getLanguage: () => get<'en' | 'fr'>(KEYS.LANGUAGE, 'en'),
  setLanguage: (v: 'en' | 'fr') => set(KEYS.LANGUAGE, v),

  getAccountCreatedAt: () => get<string | null>(KEYS.ACCOUNT_CREATED_AT, null),
  setAccountCreatedAt: (v: string) => set(KEYS.ACCOUNT_CREATED_AT, v),

  getCurrentPhase: () => get<1 | 2 | 3 | 4>(KEYS.CURRENT_PHASE, 1),
  setCurrentPhase: (v: 1 | 2 | 3 | 4) => set(KEYS.CURRENT_PHASE, v),

  getTodaySession: () => get<SessionRecord | null>(KEYS.TODAY_SESSION, null),
  setTodaySession: (s: SessionRecord) => set(KEYS.TODAY_SESSION, s),

  getSessionsQueue: () => get<SessionRecord[]>(KEYS.SESSIONS_QUEUE, []),
  addToSessionsQueue: async (s: SessionRecord) => {
    const queue = await storage.getSessionsQueue();
    await set(KEYS.SESSIONS_QUEUE, [...queue, s]);
  },
  clearSessionsQueue: () => set(KEYS.SESSIONS_QUEUE, []),

  getPainHistory: () => get<PainEntry[]>(KEYS.PAIN_HISTORY, []),
  addPainEntry: async (entry: PainEntry) => {
    const history = await storage.getPainHistory();
    const updated = history.filter((h) => h.date !== entry.date);
    await set(KEYS.PAIN_HISTORY, [...updated, entry].sort((a, b) => a.date.localeCompare(b.date)));
  },

  getStreakData: () =>
    get<StreakData>(KEYS.STREAK_DATA, {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
    }),
  setStreakData: (v: StreakData) => set(KEYS.STREAK_DATA, v),

  getLastRoutineIds: () => get<string[]>(KEYS.LAST_ROUTINE_IDS, []),
  setLastRoutineIds: (ids: string[]) => set(KEYS.LAST_ROUTINE_IDS, ids),
};
