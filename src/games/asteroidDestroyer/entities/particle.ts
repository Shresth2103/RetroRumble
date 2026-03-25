import { Vector2 } from "../game/vector";
import type { Entity } from "./entity";

export type ParticleType = 'EXPLOSION' | 'THRUST' | 'LASER_HIT' | 'DASH' | 'WAVE_CLEAR';

export class Particle implements Entity {
  pos: Vector2;
  vel: Vector2;
  radius: number;
  active: boolean = true;
  lifetime: number;
  maxLifetime: number;
  color: string;
  type: ParticleType;
  
  // Custom properties
  friction: number;
  shrink: boolean;

  constructor(pos: Vector2, vel: Vector2, color: string, type: ParticleType, lifetime: number = 1.0) {
    this.pos = pos;
    this.vel = vel;
    this.color = color;
    this.type = type;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.radius = 1 + Math.random() * 2;
    
    // Customize based on particle type
    switch (type) {
      case 'EXPLOSION':
        this.friction = 0.95;
        this.shrink = true;
        break;
      case 'THRUST':
        this.friction = 0.92;
        this.shrink = true;
        this.radius = 1.5;
        break;
      case 'DASH':
        this.friction = 0.98;
        this.shrink = true;
        this.radius = 1.2;
        break;
      case 'LASER_HIT':
        this.friction = 0.94;
        this.shrink = true;
        break;
      default:
        this.friction = 0.99;
        this.shrink = false;
        break;
    }
  }

  update(dt: number, width: number, height: number) {
    if (!this.active) return;
    
    // Apply movement
    this.pos.add(Vector2.mul(this.vel, dt));
    
    // Apply friction (resolution independent)
    this.vel.mul(Math.pow(this.friction, dt * 60));
    
    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.active = false;
    }
    
    // Particle wrapping isn't usually needed, but good to have a simple check
    if (this.pos.x < -10 || this.pos.x > width + 10 || this.pos.y < -10 || this.pos.y > height + 10) {
      this.active = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    
    const alpha = this.lifetime / this.maxLifetime;
    const r = this.shrink ? this.radius * alpha : this.radius;

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, r, 0, Math.PI * 2);
    
    // Set opacity based on lifetime
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fill();
    
    ctx.restore();
  }
}
