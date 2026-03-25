import type { Vector2 } from "../game/vector";

export interface Entity {
  pos: Vector2;
  vel: Vector2;
  radius: number;
  active: boolean;
  update(dt: number, width: number, height: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
  onCollision?(other: Entity): void;
}
