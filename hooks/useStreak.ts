import { useState, useEffect, useCallback } from 'react';
import { getStreakData, getMissedYesterday } from '../lib/streak';
import type { StreakData } from '../lib/storage';

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
  });
  const [missedYesterday, setMissedYesterday] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [data, missed] = await Promise.all([getStreakData(), getMissedYesterday()]);
    setStreak(data);
    setMissedYesterday(missed);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { streak, missedYesterday, loading, reload: load };
}
