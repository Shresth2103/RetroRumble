import { Vector2 } from "../game/vector";
import { PHYSICS } from "../config/physics";
import type { Entity } from "./entity";

export type PowerUpType = 'RAPID_FIRE' | 'SHIELD' | 'TRIPLE_SHOT' | 'SCORE_MULTI' | 'EXTRA_LIFE';

export interface ShipState {
  pos: Vector2;
  vel: Vector2;
  angle: number; // radians, 0 = up
  lives: number;
  invincible: boolean;
  invTimer: number;
  shield: boolean;
  rapidFire: boolean;
  tripleShot: boolean;
  multiplier: number;
  powerTimers: Record<string, number>;
  thrusting: boolean;
}

export class Ship implements Entity {
  pos: Vector2;
  vel: Vector2;
  radius: number = 16;
  active: boolean = true;
  
  // Internal animation state
  thrustAlpha: number = 0;
  private _state: ShipState;

  constructor(x: number, y: number) {
    this.pos = new Vector2(x, y);
    this.vel = new Vector2(0, 0);
    this._state = {
      pos: this.pos,
      vel: this.vel,
      angle: 0,
      lives: 3,
      invincible: true,
      invTimer: PHYSICS.INVINCIBILITY_TIME,
      shield: false,
      rapidFire: false,
      tripleShot: false,
      multiplier: 1,
      powerTimers: {},
      thrusting: false,
    };
  }

  get state() { return this._state; }

  update(dt: number, width: number, height: number) {
    if (!this.active) return;

    // Apply drag
    this.vel.mul(Math.pow(PHYSICS.SHIP_DRAG, dt * 60)); // Resolution independent drag


    // Apply movement
    this.pos.add(Vector2.mul(this.vel, dt));

    // Screen wrap
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;

    // Handle invincibility
    if (this._state.invincible) {
      this._state.invTimer -= dt;
      if (this._state.invTimer <= 0) {
        this._state.invincible = false;
      }
    }

    // Update power-up timers
    for (const key in this._state.powerTimers) {
      this._state.powerTimers[key] -= dt;
      if (this._state.powerTimers[key] <= 0) {
        delete this._state.powerTimers[key];
        // Reset flags
        if (key === 'RAPID_FIRE') this._state.rapidFire = false;
        if (key === 'TRIPLE_SHOT') this._state.tripleShot = false;
        if (key === 'SCORE_MULTI') this._state.multiplier = 1;
      }
    }
    
    // Smooth thrust alpha for visuals
    if (this._state.thrusting) {
        this.thrustAlpha = Math.min(1, this.thrustAlpha + dt * 10);
    } else {
        this.thrustAlpha = Math.max(0, this.thrustAlpha - dt * 10);
    }
  }

  applyThrust(dt: number) {
    if (!this.active) return;
    const force = Vector2.fromAngle(this._state.angle).mul(PHYSICS.SHIP_THRUST * dt);
    this.vel.add(force);
    
    // Cap speed
    const speed = this.vel.mag();
    if (speed > PHYSICS.SHIP_MAX_SPEED) {
      this.vel.normalize().mul(PHYSICS.SHIP_MAX_SPEED);
    }
    this._state.thrusting = true;
  }


  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    
    // Flicker during invincibility
    if (this._state.invincible && Math.floor(Date.now() / 100) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this._state.angle);

    // Thrust effect
    if (this.thrustAlpha > 0) {
        ctx.beginPath();
        ctx.moveTo(-6, 8);
        ctx.lineTo(0, 8 + 12 * this.thrustAlpha * (0.8 + Math.random() * 0.4));
        ctx.lineTo(6, 8);
        ctx.strokeStyle = '#4f7df3';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-4, 8);
        ctx.lineTo(0, 8 + 6 * this.thrustAlpha);
        ctx.lineTo(4, 8);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Ship body
    ctx.beginPath();
    ctx.moveTo(0, -12); // Tip
    ctx.lineTo(10, 10); // Bottom-right
    ctx.lineTo(0, 6);   // In-cut
    ctx.lineTo(-10, 10);// Bottom-left
    ctx.closePath();


    ctx.strokeStyle = '#e8e8f0';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Shield overlay
    if (this._state.shield) {
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.strokeStyle = '#4dc98a';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]); // Pulsing/Dashed effect
        ctx.stroke();
    }

    ctx.restore();
  }
}
