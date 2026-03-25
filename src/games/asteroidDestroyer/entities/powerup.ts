import { Vector2 } from "../game/vector";
import { POWER_UP } from "../config/physics";
import type { Entity } from "./entity";
import type { PowerUpType } from "./ship";

export class PowerUp implements Entity {
  pos: Vector2;
  vel: Vector2;
  radius: number = POWER_UP.RADIUS;
  active: boolean = true;
  type: PowerUpType;
  lifetime: number = POWER_UP.LIFETIME_ON_FIELD;
  floatingTime: number = 0;

  constructor(pos: Vector2, type: PowerUpType) {
    this.pos = pos;
    // Slow random drift
    const angle = Math.random() * Math.PI * 2;
    this.vel = new Vector2(Math.cos(angle), Math.sin(angle)).mul(POWER_UP.DRIFT_SPEED);
    this.type = type;
  }

  update(dt: number, width: number, height: number) {
    if (!this.active) return;
    
    // Apply movement
    this.pos.add(Vector2.mul(this.vel, dt));
    
    this.lifetime -= dt;
    this.floatingTime += dt;
    if (this.lifetime <= 0) {
      this.active = false;
    }
    
    // Screen wrap
    if (this.pos.x + this.radius < 0) this.pos.x = width + this.radius;
    if (this.pos.x - this.radius > width) this.pos.x = -this.radius;
    if (this.pos.y + this.radius < 0) this.pos.y = height + this.radius;
    if (this.pos.y - this.radius > height) this.pos.y = -this.radius;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    
    // Blink when expiring
    if (this.lifetime < POWER_UP.BLINK_START && Math.floor(Date.now() / (1000 / POWER_UP.BLINK_FREQ)) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    
    // Core floating animation
    const offset = Math.sin(this.floatingTime * 4) * 5;
    ctx.translate(0, offset);
    
    // Circle background with aura
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.getColor();
    ctx.stroke();
    
    // Icon inner
    ctx.fillStyle = this.getColor();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px "JetBrains Mono"';
    ctx.fillText(this.getLabel(), 0, 0);
    
    // Glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.getColor();
    ctx.stroke();

    ctx.restore();
  }

  private getColor(): string {
    switch (this.type) {
      case 'RAPID_FIRE': return '#e05a5a'; // Red
      case 'SHIELD': return '#4dc98a';     // Cyan/Green
      case 'TRIPLE_SHOT': return '#d4914a';// Orange
      case 'SCORE_MULTI': return '#4f7df3';// Blue
      case 'EXTRA_LIFE': return '#e8e8f0'; // Gold/White
      default: return '#fff';
    }
  }

  private getLabel(): string {
    switch (this.type) {
      case 'RAPID_FIRE': return 'R';
      case 'SHIELD': return 'S';
      case 'TRIPLE_SHOT': return 'T';
      case 'SCORE_MULTI': return 'X2';
      case 'EXTRA_LIFE': return '♥';
      default: return '';
    }
  }
}
