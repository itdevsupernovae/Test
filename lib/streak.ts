import { storage, StreakData } from './storage';

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export async function updateStreakOnCompletion(): Promise<StreakData> {
  const streak = await storage.getStreakData();
  const todayStr = today();

  // Already completed today
  if (streak.lastCompletedDate === todayStr) return streak;

  let newCurrent: number;
  if (streak.lastCompletedDate === yesterday()) {
    newCurrent = streak.currentStreak + 1;
  } else {
    newCurrent = 1;
  }

  const updated: StreakData = {
    currentStreak: newCurrent,
    longestStreak: Math.max(streak.longestStreak, newCurrent),
    lastCompletedDate: todayStr,
  };

  await storage.setStreakData(updated);
  return updated;
}

export async function getMissedYesterday(): Promise<boolean> {
  const streak = await storage.getStreakData();
  if (!streak.lastCompletedDate) return false;
  return streak.lastCompletedDate < yesterday();
}

export async function getStreakData(): Promise<StreakData> {
  return storage.getStreakData();
}
