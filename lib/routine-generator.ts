import exercisesData from '../data/exercises.json';
import type { PainZone } from './storage';

export interface Exercise {
  id: string;
  name: { fr: string; en: string };
  description: { fr: string; en: string };
  tips: { fr: string; en: string };
  duration_seconds: number;
  target_zones: PainZone[];
  difficulty: 'beginner' | 'intermediate';
  phase: 1 | 2 | 3 | 4;
  lottie_file: string;
}

const exercises = exercisesData as Exercise[];

const COMPLEMENTARY: Record<PainZone, PainZone[]> = {
  neck: ['shoulders', 'upper_back'],
  upper_back: ['shoulders', 'lower_back'],
  shoulders: ['neck', 'upper_back'],
  lower_back: ['upper_back', 'neck'],
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateRoutine(
  painZones: PainZone[],
  durationPreference: 3 | 5,
  currentPhase: 1 | 2 | 3 | 4,
  lastRoutineIds: string[],
): Exercise[] {
  const eligible = exercises.filter((e) => e.phase <= currentPhase);

  const primaryZone = painZones[0] ?? 'lower_back';
  const complementaryZones = COMPLEMENTARY[primaryZone];

  const primaryPool = shuffle(
    eligible.filter(
      (e) =>
        e.target_zones.includes(primaryZone) && !lastRoutineIds.includes(e.id),
    ),
  );

  const complementaryPool = shuffle(
    eligible.filter(
      (e) =>
        complementaryZones.some((z) => e.target_zones.includes(z)) &&
        !lastRoutineIds.includes(e.id) &&
        !primaryPool.slice(0, 2).some((p) => p.id === e.id),
    ),
  );

  const selected: Exercise[] = [
    ...(primaryPool.slice(0, 2).length === 2
      ? primaryPool.slice(0, 2)
      : [...primaryPool.slice(0, 2), ...eligible.filter((e) => e.target_zones.includes(primaryZone)).slice(0, 2 - primaryPool.length)]),
    complementaryPool[0] ?? eligible[0],
  ].filter(Boolean).slice(0, 3);

  // Adjust durations to fit time preference (seconds total target)
  const targetSeconds = durationPreference * 60 - 9; // subtract ~3s rest × 3
  const currentTotal = selected.reduce((s, e) => s + e.duration_seconds, 0);

  if (currentTotal > 0 && currentTotal !== targetSeconds) {
    const scale = targetSeconds / currentTotal;
    return selected.map((e) => ({
      ...e,
      duration_seconds: Math.round(e.duration_seconds * scale / 5) * 5, // round to 5s
    }));
  }

  return selected;
}
