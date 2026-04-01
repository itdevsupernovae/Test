import { useState, useEffect, useCallback } from 'react';
import { storage } from '../lib/storage';
import { generateRoutine, Exercise } from '../lib/routine-generator';

export function useRoutine() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [todayComplete, setTodayComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [zones, duration, phase, lastIds, todaySession] = await Promise.all([
      storage.getPainZones(),
      storage.getDailyDuration(),
      storage.getCurrentPhase(),
      storage.getLastRoutineIds(),
      storage.getTodaySession(),
    ]);

    const today = new Date().toISOString().split('T')[0];
    if (todaySession?.date === today && todaySession.completedAt) {
      setTodayComplete(true);
      setExercises(
        todaySession.exercises.map((e) => ({
          id: e.exerciseId,
          name: { en: e.exerciseId, fr: e.exerciseId },
          description: { en: '', fr: '' },
          tips: { en: '', fr: '' },
          duration_seconds: e.duration,
          target_zones: [],
          difficulty: 'beginner' as const,
          phase: 1 as const,
          lottie_file: `${e.exerciseId}.json`,
        })),
      );
    } else {
      const routine = generateRoutine(zones, duration, phase, lastIds);
      setExercises(routine);
      setTodayComplete(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { exercises, todayComplete, loading, reload: load };
}
