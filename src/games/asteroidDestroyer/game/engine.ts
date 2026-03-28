import { createInitialState } from "./state";
import type { GameState } from "./state";
import { Ship } from "../entities/ship";
import type { PowerUpType } from "../entities/ship";
import { Asteroid } from "../entities/asteroid";
import type { AsteroidSize } from "../entities/asteroid";
import { Laser } from "../entities/laser";
import { PowerUp } from "../entities/powerup";
import { Particle } from "../entities/particle";
import type { ParticleType } from "../entities/particle";
import { Vector2 } from "./vector";
import { ASTEROID, PHYSICS, POWER_UP } from "../config/physics";
import { audio } from "./audio";

export class GameEngine {
  state: GameState;
  canvas: HTMLCanvasElement;
  viewport: HTMLElement;
  ctx: CanvasRenderingContext2D;
  width: number = 0;
  height: number = 0;
  private readonly handleResize: () => void;
  
  // Callbacks for UI
  onScoreChange?: (score: number) => void;
  onWaveChange?: (wave: number) => void;
  onLivesChange?: (lives: number) => void;
  onGameOver?: (score: number, wave: number) => void;
  onToast?: (message: string) => void;

  constructor(canvas: HTMLCanvasElement, viewport: HTMLElement = canvas.parentElement ?? canvas) {
    this.canvas = canvas;
    this.viewport = viewport;
    this.ctx = canvas.getContext("2d")!;
    this.state = createInitialState();
    this.handleResize = () => this.resize();
    this.resize();
    window.addEventListener("resize", this.handleResize);
  }

  resize() {
    const rect = this.viewport.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(rect.width || window.innerWidth));
    this.height = Math.max(1, Math.floor(rect.height || window.innerHeight));
    const pixelRatio = window.devicePixelRatio || 1;
    this.canvas.width = this.width * pixelRatio;
    this.canvas.height = this.height * pixelRatio;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
  }

  start() {
    this.state = createInitialState();
    this.state.status = "PLAYING";
    this.state.ship = new Ship(this.width / 2, this.height / 2);
    for (let i = 0; i < 5; i++) {
        this.spawnAsteroid();
    }
    
    if (this.onScoreChange) this.onScoreChange(0);
    if (this.onWaveChange) this.onWaveChange(1);
    if (this.onLivesChange) this.onLivesChange(3);
  }

  spawnAsteroid() {
    let x, y;
    if (Math.random() > 0.5) {
        x = Math.random() > 0.5 ? -50 : this.width + 50;
        y = Math.random() * this.height;
    } else {
        x = Math.random() * this.width;
        y = Math.random() > 0.5 ? -50 : this.height + 50;
    }
    
    // Gradual difficulty based on time
    const speedMult = 1.0 + Math.min(2.0, this.state.time / 60); 
    const speed = (ASTEROID.LARGE.SPEED_MIN + Math.random() * (ASTEROID.LARGE.SPEED_MAX - ASTEROID.LARGE.SPEED_MIN)) * speedMult;
    const angle = Math.random() * Math.PI * 2;
    const vel = new Vector2(Math.cos(angle), Math.sin(angle)).mul(speed);
    
    this.state.asteroids.push(new Asteroid(new Vector2(x, y), vel, 'LARGE'));
  }

  update(dt: number) {
    if (this.state.status !== "PLAYING") return;

    this.state.time += dt;

    // Update Entities
    if (this.state.ship) {
        this.state.ship.update(dt, this.width, this.height);
        
        // Thrust particles
        if (this.state.ship.state.thrusting) {
            this.createParticle(this.state.ship.pos.clone(), this.state.ship.vel.clone().mul(-0.5).rotate((Math.random()-0.5)*0.5), '#4f7df3', 'THRUST', 0.5);
        }
    }

    this.state.asteroids.forEach(a => a.update(dt, this.width, this.height));
    this.state.lasers.forEach(l => l.update(dt, this.width, this.height));
    this.state.powerups.forEach(p => p.update(dt, this.width, this.height));
    this.state.particles.forEach(p => p.update(dt, this.width, this.height));

    // Cleanup inactive entities
    this.state.asteroids = this.state.asteroids.filter(a => a.active);
    this.state.lasers = this.state.lasers.filter(l => l.active);
    this.state.powerups = this.state.powerups.filter(p => p.active);
    this.state.particles = this.state.particles.filter(p => p.active);

    // Maintain asteroid count (continuous gameplay)
    const targetCount = 3 + Math.floor(this.state.time / 20); // More asteroids over time
    if (this.state.asteroids.length < targetCount) {
        this.spawnAsteroid();
    }

    // Collision Detection
    this.checkCollisions();
    
    // Screenshake decay
    if (this.state.screenshake > 0) {
        this.state.screenshake = Math.max(0, this.state.screenshake - dt * 4);
    }
  }

  checkCollisions() {
    if (!this.state.ship || !this.state.ship.active) return;
    const ship = this.state.ship;

    // 1. Ship - Asteroid
    if (!ship.state.invincible) {
        for (const asteroid of this.state.asteroids) {
            const dist = Vector2.dist(ship.pos, asteroid.pos);
            const rSum = (ship.radius * PHYSICS.SHIP_HITBOX_RATIO) + asteroid.radius;
            
            if (dist < rSum) {
                this.onShipHit(asteroid);
                break;
            }
        }
    }

    // 2. Laser - Asteroid
    for (const laser of this.state.lasers) {
        if (!laser.active) continue;
        for (const asteroid of this.state.asteroids) {
            const dist = Vector2.dist(laser.pos, asteroid.pos);
            if (dist < laser.radius + asteroid.radius) {
                laser.active = false;
                this.onAsteroidHit(asteroid);
                break;
            }
        }
    }

    // 3. Ship - PowerUp
    for (const pu of this.state.powerups) {
        const dist = Vector2.dist(ship.pos, pu.pos);
        if (dist < ship.radius + pu.radius) {
            this.collectPowerUp(pu);
            pu.active = false;
        }
    }
  }

  onShipHit(asteroid: Asteroid) {
    if (this.state.ship?.state.shield) {
        // Consume shield, destroy asteroid
        this.state.ship.state.shield = false;
        this.destroyAsteroid(asteroid);
        this.state.screenshake = 0.4;
        return;
    }

    // Normal hit
    const shipPos = this.state.ship?.pos.clone() || new Vector2(this.width/2, this.height/2);
    this.explode(shipPos, '#ffffff', 30);
    this.state.lives--;
    this.state.screenshake = 0.8;
    audio.playExplosion(2);
    if (this.onLivesChange) this.onLivesChange(this.state.lives);

    if (this.state.lives <= 0) {
        if (this.state.ship) this.state.ship.active = false;
        this.gameOver();
    } else {
        // Respawn / reset ship
        this.state.ship = new Ship(this.width / 2, this.height / 2);
        this.state.ship.state.invincible = true;
        this.state.ship.state.invTimer = PHYSICS.INVINCIBILITY_TIME;
    }
  }

  onAsteroidHit(asteroid: Asteroid) {
    asteroid.hp -= 1;
    this.createParticle(asteroid.pos.clone(), new Vector2(0,0), '#ffffff', 'LASER_HIT', 0.2);
    audio.playExplosion(0.3); // Minor noise for hit
    
    if (asteroid.hp <= 0) {
        this.destroyAsteroid(asteroid);
        this.addScore(ASTEROID[asteroid.size].SCORE);
    }
  }

  destroyAsteroid(asteroid: Asteroid) {
    asteroid.active = false;
    this.explode(asteroid.pos, '#b4b4c8', asteroid.size === 'LARGE' ? 20 : 10);
    
    // Split logic
    if (asteroid.size === 'LARGE' || asteroid.size === 'MEDIUM') {
        const nextSize: AsteroidSize = asteroid.size === 'LARGE' ? 'MEDIUM' : 'SMALL';
        this.splitAsteroid(asteroid, nextSize);
        this.rollPowerUp(asteroid.pos);
    }
  }

  splitAsteroid(parent: Asteroid, nextSize: AsteroidSize) {
      const cfg = ASTEROID[parent.size] as (typeof ASTEROID)["LARGE"] | (typeof ASTEROID)["MEDIUM"];
      const speed = parent.vel.mag() * (cfg.SPLIT_SPEED_MULT || 1.4);
      const baseAngle = parent.vel.toAngle();
      const spread = ((cfg.SPLIT_ANGLE || 30) * Math.PI) / 180;

      [baseAngle - spread, baseAngle + spread].forEach(angle => {
          const vel = new Vector2(Math.sin(angle), -Math.cos(angle)).mul(speed);
          this.state.asteroids.push(new Asteroid(parent.pos.clone(), vel, nextSize));
      });
  }

  rollPowerUp(pos: Vector2) {
      // Roll for each power-up type
      for (const type of POWER_UP.TYPES) {
          const chance = POWER_UP.CHANCES[type as keyof typeof POWER_UP.CHANCES];
          if (Math.random() * 100 < chance) {
              this.state.powerups.push(new PowerUp(pos.clone(), type as PowerUpType));
              break; // Only spawn one power-up per asteroid destruction
          }
      }
  }

  collectPowerUp(pu: PowerUp) {
      if (!this.state.ship) return;
      audio.playPowerUp();
      
      const s = this.state.ship.state;
      switch (pu.type) {
          case 'RAPID_FIRE':
              s.rapidFire = true;
              s.powerTimers['RAPID_FIRE'] = 8.0;
              if (this.onToast) this.onToast('RAPID FIRE');
              break;
          case 'SHIELD':
              s.shield = true;
              if (this.onToast) this.onToast('SHIELD ACTIVE');
              break;
          case 'TRIPLE_SHOT':
              s.tripleShot = true;
              s.powerTimers['TRIPLE_SHOT'] = 10.0;
              if (this.onToast) this.onToast('TRIPLE SHOT');
              break;
          case 'SCORE_MULTI':
              s.multiplier = 2;
              s.powerTimers['SCORE_MULTI'] = 12.0;
              if (this.onToast) this.onToast('SCORE MULTIPLIER X2');
              break;
          case 'EXTRA_LIFE':
              this.state.lives = Math.min(5, this.state.lives + 1);
              if (this.onLivesChange) this.onLivesChange(this.state.lives);
              if (this.onToast) this.onToast('EXTRA LIFE');
              break;
      }
  }

  addScore(pts: number) {
      const multi = this.state.ship?.state.multiplier || 1;
      this.state.score += Math.floor(pts * multi);
      if (this.onScoreChange) this.onScoreChange(this.state.score);
      
      // Auto-win/congrats at 2000+ (as per user request)
      if (this.state.score >= 2000 && this.state.status === 'PLAYING') {
          this.gameOver();
      }
  }

  createParticle(pos: Vector2, vel: Vector2, color: string, type: ParticleType, lifetime?: number) {
      this.state.particles.push(new Particle(pos, vel, color, type, lifetime));
  }

  explode(pos: Vector2, color: string, count: number) {
      for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 50 + Math.random() * 100;
          const vel = new Vector2(Math.cos(angle), Math.sin(angle)).mul(speed);
          this.createParticle(pos.clone(), vel, color, 'EXPLOSION', 0.5 + Math.random() * 0.5);
      }
  }

  fireLaser() {
      if (!this.state.ship || this.state.status !== 'PLAYING') return;
      const s = this.state.ship.state;
      const pos = this.state.ship.pos.clone();
      
      if (s.tripleShot) {
          this.state.lasers.push(new Laser(pos.clone(), s.angle - 0.25));
          this.state.lasers.push(new Laser(pos.clone(), s.angle));
          this.state.lasers.push(new Laser(pos.clone(), s.angle + 0.25));
          audio.playLaser();
      } else {
          this.state.lasers.push(new Laser(pos, s.angle));
          audio.playLaser();
      }
  }

  gameOver() {
      this.state.status = 'GAMEOVER';
      if (this.onGameOver) this.onGameOver(this.state.score, this.state.wave);
  }

  render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      ctx.save();
      // Screenshake
      if (this.state.screenshake > 0) {
          const sx = (Math.random() - 0.5) * this.state.screenshake * 30;
          const sy = (Math.random() - 0.5) * this.state.screenshake * 30;
          ctx.translate(sx, sy);
      }

      // Draw entities
      this.state.particles.forEach(p => p.draw(ctx));
      this.state.powerups.forEach(p => p.draw(ctx));
      this.state.lasers.forEach(l => l.draw(ctx));
      this.state.asteroids.forEach(a => a.draw(ctx));
      if (this.state.ship) this.state.ship.draw(ctx);

      ctx.restore();
  }
}
