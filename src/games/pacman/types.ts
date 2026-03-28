export const Direction = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  NONE: 'NONE',
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

export interface Position {
  x: number;
  y: number;
}

export const TileType = {
  WALL: 0,
  PELLET: 1,
  EMPTY: 2,
  POWER_PELLET: 3,
  PACMAN_SPAWN: 9,
  GHOST_SPAWN: 8,
} as const;

export type TileType = (typeof TileType)[keyof typeof TileType];

export const GhostStatus = {
  NORMAL: 'NORMAL',
  VULNERABLE: 'VULNERABLE',
  EATEN: 'EATEN',
} as const;

export type GhostStatus = (typeof GhostStatus)[keyof typeof GhostStatus];

export interface GhostEntity {
  id: number;
  pos: Position;
  color: string;
  startPos: Position;
  direction: Direction;
  status: GhostStatus;
}

export interface HighScore {
  teamName: string;
  score: number;
  date: string;
}

export type GameStatus = 'START' | 'PLAYING' | 'GAME_OVER' | 'VICTORY' | 'LEADERBOARD' | 'BREADBOARD';

export interface GameConfig {
  round: number;
  speed: number; // ms per move (lower is faster)
  ghostCount: number;
}
