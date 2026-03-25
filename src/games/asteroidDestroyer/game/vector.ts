export class Vector2 {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(v: Vector2): Vector2 {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vector2): Vector2 {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mul(s: number): Vector2 {
    this.x *= s;
    this.y *= s;
    return this;
  }

  static add(v1: Vector2, v2: Vector2): Vector2 {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
  }

  static sub(v1: Vector2, v2: Vector2): Vector2 {
    return new Vector2(v1.x - v2.x, v1.y - v2.y);
  }

  static mul(v: Vector2, s: number): Vector2 {
    return new Vector2(v.x * s, v.y * s);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  magSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vector2 {
    const m = this.mag();
    if (m > 0) this.mul(1 / m);
    return this;
  }

  static dist(v1: Vector2, v2: Vector2): number {
    return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
  }

  static distSq(v1: Vector2, v2: Vector2): number {
    return Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2);
  }

  static fromAngle(angleRad: number): Vector2 {
    // 0 is UP (-Y direction in canvas)
    return new Vector2(Math.sin(angleRad), -Math.cos(angleRad));
  }

  toAngle(): number {
    // Angle in radians from UP (0)
    return Math.atan2(this.x, -this.y);
  }

  rotate(angleRad: number): Vector2 {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    this.x = x;
    this.y = y;
    return this;
  }
}
