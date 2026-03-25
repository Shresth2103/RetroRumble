import { Vector2 } from "../game/vector";
import { ASTEROID } from "../config/physics";
import type { Entity } from "./entity";

export type AsteroidSize = 'LARGE' | 'MEDIUM' | 'SMALL';

export class Asteroid implements Entity {
  pos: Vector2;
  vel: Vector2;
  radius: number;
  active: boolean = true;
  hp: number;
  size: AsteroidSize;
  
  // Custom visual shape
  private vertices: Vector2[] = [];
  private angle: number = 0;
  private rotationSpeed: number;

  constructor(pos: Vector2, vel: Vector2, size: AsteroidSize) {
    this.pos = pos;
    this.vel = vel;
    this.size = size;
    
    // Config properties
    const cfg = ASTEROID[size];
    this.radius = cfg.RADIUS;
    this.hp = cfg.HP;
    
    // Random visual properties
    this.rotationSpeed = (Math.random() - 0.5) * 2; // -1 to 1 rad/s
    this.generateShape();
  }

  private generateShape() {
    const vertexCount = 7 + Math.floor(Math.random() * 5); // 7 to 11 vertices
    for (let i = 0; i < vertexCount; i++) {
      const angle = (i / vertexCount) * Math.PI * 2;
      const variation = 0.7 + Math.random() * 0.4; // 70% to 110% of radius
      const r = this.radius * variation;
      this.vertices.push(new Vector2(Math.cos(angle) * r, Math.sin(angle) * r));
    }
  }

  update(dt: number, width: number, height: number) {
    if (!this.active) return;
    
    // Apply movement
    this.pos.add(Vector2.mul(this.vel, dt));
    
    // Apply rotation
    this.angle += this.rotationSpeed * dt;
    
    // Screen wrap
    if (this.pos.x + this.radius < 0) this.pos.x = width + this.radius;
    if (this.pos.x - this.radius > width) this.pos.x = -this.radius;
    if (this.pos.y + this.radius < 0) this.pos.y = height + this.radius;
    if (this.pos.y - this.radius > height) this.pos.y = -this.radius;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.angle);
    
    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (let i = 1; i < this.vertices.length; i++) {
      ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    ctx.closePath();
    
    ctx.strokeStyle = '#b4b4c8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.restore();
  }
}
