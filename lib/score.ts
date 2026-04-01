import { storage } from './storage';

export async function calcBackHealthScore(): Promise<number> {
  const [painHistory, streakData, initialPain] = await Promise.all([
    storage.getPainHistory(),
    storage.getStreakData(),
    storage.getInitialPain(),
  ]);

  const last30 = painHistory.filter((p) => {
    const days = (Date.now() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 30;
  });

  const consistency30d = Math.min((last30.length / 30) * 100, 100);

  let painImprovement = 0;
  if (last30.length > 0) {
    const recentPains = last30.slice(-7);
    const avgRecent = recentPains.reduce((s, p) => s + p.painLevel, 0) / recentPains.length;
    painImprovement = Math.max(
      0,
      Math.min(100, ((initialPain - avgRecent) / initialPain) * 100),
    );
  }

  const streakBonus = Math.min(streakData.currentStreak / 30, 1) * 100;

  const score = consistency30d * 0.4 + painImprovement * 0.3 + streakBonus * 0.3;
  return Math.round(Math.min(100, Math.max(0, score)));
}

export async function getPainReductionPercent(): Promise<number> {
  const [painHistory, initialPain] = await Promise.all([
    storage.getPainHistory(),
    storage.getInitialPain(),
  ]);

  if (painHistory.length === 0) return 0;

  const recent = painHistory.slice(-5);
  const avgRecent = recent.reduce((s, p) => s + p.painLevel, 0) / recent.length;
  const reduction = ((initialPain - avgRecent) / initialPain) * 100;
  return Math.round(Math.max(0, Math.min(100, reduction)));
}
