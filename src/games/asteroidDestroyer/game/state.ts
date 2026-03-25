import type { Ship } from "../entities/ship";
import type { Asteroid } from "../entities/asteroid";
import type { Laser } from "../entities/laser";
import type { PowerUp } from "../entities/powerup";
import type { Particle } from "../entities/particle";

export type GameStatus = "MENU" | "PLAYING" | "GAMEOVER" | "PAUSED";

export interface GameState {
  status: GameStatus;
  score: number;
  wave: number;
  lives: number;
  
  ship: Ship | null;
  asteroids: Asteroid[];
  lasers: Laser[];
  powerups: PowerUp[];
  particles: Particle[];
  
  screenshake: number; // intensity (0-1)
  time: number;       // total elapsed time (s)
  lastTime: number;   // last frame timestamp (ms)
}

export function createInitialState(): GameState {
  return {
    status: "MENU",
    score: 0,
    wave: 1,
    lives: 3,
    ship: null,
    asteroids: [],
    lasers: [],
    powerups: [],
    particles: [],
    screenshake: 0,
    time: 0,
    lastTime: 0,
  };
}
