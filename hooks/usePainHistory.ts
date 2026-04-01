import { useState, useEffect, useCallback } from 'react';
import { storage } from '../lib/storage';
import { calcBackHealthScore, getPainReductionPercent } from '../lib/score';
import type { PainEntry } from '../lib/storage';

export function usePainHistory() {
  const [history, setHistory] = useState<PainEntry[]>([]);
  const [backScore, setBackScore] = useState(0);
  const [reductionPercent, setReductionPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [h, score, pct] = await Promise.all([
      storage.getPainHistory(),
      calcBackHealthScore(),
      getPainReductionPercent(),
    ]);
    setHistory(h);
    setBackScore(score);
    setReductionPercent(pct);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { history, backScore, reductionPercent, loading, reload: load };
}
