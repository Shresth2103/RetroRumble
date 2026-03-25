import { Vector2 } from "../game/vector";
import { LASER } from "../config/physics";
import type { Entity } from "./entity";

export class Laser implements Entity {
  pos: Vector2;
  vel: Vector2;
  radius: number = 2;
  active: boolean = true;
  lifetime: number = LASER.LIFETIME;

  constructor(pos: Vector2, angle: number) {
    this.pos = pos;
    this.vel = Vector2.fromAngle(angle).mul(LASER.SPEED);
  }

  update(dt: number, width: number, height: number) {
    if (!this.active) return;
    
    // Apply movement
    this.pos.add(Vector2.mul(this.vel, dt));
    
    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.active = false;
    }
    
    // Destroy on edge contact (per PRD: "Lasers - No Wrap")
    if (this.pos.x < -10 || this.pos.x > width + 10 || this.pos.y < -10 || this.pos.y > height + 10) {
      this.active = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    
    const angle = this.vel.toAngle();
    
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(angle);
    
    ctx.beginPath();
    ctx.moveTo(0, -LASER.LENGTH / 2);
    ctx.lineTo(0, LASER.LENGTH / 2);
    
    // Glowing laser effect
    ctx.strokeStyle = '#4f7df3';
    ctx.lineWidth = LASER.WIDTH;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Core of the laser
    ctx.beginPath();
    ctx.moveTo(0, -LASER.LENGTH / 2 + 2);
    ctx.lineTo(0, LASER.LENGTH / 2 - 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
  }
}
