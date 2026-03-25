/* --- PHYSICS & GAMEPLAY CONFIG --- */

export const PHYSICS = {
  SHIP_THRUST: 360,        // px/s^2 (slightly higher for snappier feel)
  SHIP_MAX_SPEED: 420,     // px/s
  SHIP_DRAG: 0.985,        // applied each frame (higher = slides more)
  SHIP_ROTATION_DEG: 210,  // deg/s
  SHIP_DASH_MULT: 2.5,     // velocity multiplier
  SHIP_DASH_DURATION: 0.35, // seconds
  SHIP_DASH_COOLDOWN: 3.0,  // seconds
  INVINCIBILITY_TIME: 2.5,  // seconds after respawn (per PRD)
  SHIP_HITBOX_RATIO: 0.75,  // 75% of visual radius
} as const;

export const LASER = {
  SPEED: 820,     // px/s
  LIFETIME: 1.2,  // seconds
  COOLDOWN: 0.16, // seconds between shots
  DAMAGE: 1,      // HP per hit
  POOL_SIZE: 40,  // pre-allocated instances
  WIDTH: 2.5,     // px
  LENGTH: 20,     // px
} as const;

export const ASTEROID = {
  LARGE: {
    RADIUS: 46,
    HP: 3,
    SPEED_MIN: 30,
    SPEED_MAX: 60,
    SCORE: 20,
    SPLIT_SPEED_MULT: 1.4,
    SPLIT_ANGLE: 30, // degrees
  },
  MEDIUM: {
    RADIUS: 24,
    HP: 2,
    SPEED_MIN: 70,
    SPEED_MAX: 120,
    SCORE: 50,
    SPLIT_SPEED_MULT: 1.4,
    SPLIT_ANGLE: 30,
  },
  SMALL: {
    RADIUS: 12,
    HP: 1,
    SPEED_MIN: 130,
    SPEED_MAX: 220,
    SCORE: 100,
  }
} as const;

export const POWER_UP = {
  TYPES: ['RAPID_FIRE', 'SHIELD', 'TRIPLE_SHOT', 'SCORE_MULTI', 'EXTRA_LIFE'] as const,
  LIFETIME_ON_FIELD: 8.0, // seconds
  BLINK_START: 2.0,       // seconds remaining when starting to blink
  BLINK_FREQ: 6,         // Hz
  DRIFT_SPEED: 25,       // px/s
  RADIUS: 16,
  CHANCES: {
    RAPID_FIRE: 12,
    SHIELD: 10,
    TRIPLE_SHOT: 8,
    SCORE_MULTI: 7,
    EXTRA_LIFE: 3,
  }
} as const;

export const SCORE_TABLE = {
  LARGE_ASTEROID: 20,
  MEDIUM_ASTEROID: 50,
  SMALL_ASTEROID: 100,
  WAVE_CLEAR_BASE: 500, // wave 5+
  WAVE_CLEAR_MULTI: 1.2, // per additional wave
} as const;
