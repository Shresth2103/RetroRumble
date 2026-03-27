import type { HighScore } from '../types';

const STORAGE_KEY = 'pacman_leaderboard_v2';

export function saveScore(teamName: string, score: number): void {
  try {
    const leaderboard = getLeaderboard();
    const newEntry: HighScore = {
      teamName: teamName.toUpperCase(),
      score,
      date: new Date().toISOString()
    };

    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.splice(5); // Keep only top 5

    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
  } catch (error) {
    console.error('Failed to save score:', error);
  }
}

export function getLeaderboard(): HighScore[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    return [];
  }
}