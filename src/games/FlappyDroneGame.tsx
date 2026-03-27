import { useCallback, useEffect, useRef, useState } from "react";

type FlappyDroneGameProps = {
  onExit: () => void;
};

const W = 480;
const H = 640;
const GROUND = H - 52;
const GAP = 130;
const BUILDING_SPEED = 2.5;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  r: number;
  type: "thrust" | "death";
  color?: string;
};

type Drone = {
  x: number;
  y: number;
  vy: number;
  tilt: number;
};

type Building = {
  x: number;
  w: number;
  th: number;
  bY: number;
  bH: number;
  scored: boolean;
};

type Car = {
  x: number;
  lane: number;
  color: string;
  roof: string;
  speed: number;
  type: "sedan" | "van";
};

type BakedWindow = {
  wx: number;
  wy: number;
  lit: boolean;
  bright: boolean;
};

type BackgroundBuilding = {
  x: number;
  w: number;
  h: number;
  color: string;
  windows?: BakedWindow[];
};

type GameState = "idle" | "playing" | "dead" | "won";

type UiState = {
  show: boolean;
  phase: GameState;
  score: number;
  best: number;
};

type InternalState = {
  gameState: GameState;
  score: number;
  best: number;
  frame: number;
  propSpin: number;
  drone: Drone;
  particles: Particle[];
  buildings: Building[];
  cars: Car[];
  groundOffset: number;
};

function makeBuilding() {
  const minTop = 55;
  const maxTop = GROUND - GAP - 55;
  const topHeight = Math.random() * (maxTop - minTop) + minTop;
  const bottomY = topHeight + GAP;
  const bottomHeight = GROUND - bottomY;

  return {
    x: W + 30,
    w: 52,
    th: topHeight,
    bY: bottomY,
    bH: bottomHeight,
    scored: false,
  };
}

const BG_FAR: BackgroundBuilding[] = [
  { x: 0, w: 44, h: 180, color: "#1a0035" },
  { x: 50, w: 36, h: 140, color: "#1d003a" },
  { x: 92, w: 48, h: 200, color: "#180030" },
  { x: 146, w: 40, h: 160, color: "#200040" },
  { x: 192, w: 36, h: 110, color: "#1a0035" },
  { x: 234, w: 52, h: 190, color: "#1d003a" },
  { x: 292, w: 38, h: 150, color: "#180030" },
  { x: 336, w: 46, h: 175, color: "#200040" },
  { x: 388, w: 42, h: 130, color: "#1a0035" },
  { x: 436, w: 50, h: 170, color: "#1d003a" },
];

const BG_MID: BackgroundBuilding[] = [
  { x: 0, w: 56, h: 220, color: "#28005a" },
  { x: 62, w: 44, h: 180, color: "#2e0068" },
  { x: 112, w: 52, h: 240, color: "#24004e" },
  { x: 170, w: 48, h: 200, color: "#300070" },
  { x: 224, w: 60, h: 260, color: "#28005a" },
  { x: 290, w: 44, h: 190, color: "#2e0068" },
  { x: 340, w: 56, h: 230, color: "#24004e" },
  { x: 402, w: 50, h: 210, color: "#300070" },
  { x: 458, w: 40, h: 180, color: "#28005a" },
];

function bakeWindows(layer: BackgroundBuilding[]) {
  layer.forEach((building) => {
    building.windows = [];

    for (let wy = H - building.h - 40; wy < H - 58; wy += 14) {
      for (let wx = building.x + 5; wx < building.x + building.w - 8; wx += 10) {
        const lit = (Math.round(wx * 7 + wy * 3)) % 3 !== 0;
        const bright = (Math.round(wx + wy)) % 11 === 0;
        building.windows.push({ wx, wy, lit, bright });
      }
    }
  });
}

bakeWindows(BG_FAR);
bakeWindows(BG_MID);

const CLOUDS = [
  { x: 20, y: 38, w: 100, alpha: 0.22 },
  { x: 160, y: 55, w: 80, alpha: 0.18 },
  { x: 290, y: 32, w: 120, alpha: 0.2 },
  { x: 390, y: 60, w: 70, alpha: 0.16 },
  { x: 60, y: 80, w: 90, alpha: 0.14 },
  { x: 340, y: 85, w: 75, alpha: 0.17 },
];

const LANE_Y_ABS = [H - 46, H - 34];

function makeCars(): Car[] {
  return [
    { x: 30, lane: 0, color: "#ff3cac", roof: "#c0186a", speed: 1.3, type: "sedan" },
    { x: 180, lane: 0, color: "#ffe94e", roof: "#c0a000", speed: 0.9, type: "van" },
    { x: 310, lane: 1, color: "#00ffe1", roof: "#007a70", speed: 1.6, type: "sedan" },
    { x: 430, lane: 1, color: "#ff6b35", roof: "#b03a00", speed: 1, type: "sedan" },
    { x: 100, lane: 1, color: "#a78bfa", roof: "#5b21b6", speed: 1.2, type: "van" },
  ];
}

export default function FlappyDroneGame({ onExit }: FlappyDroneGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef<InternalState>({
    gameState: "idle",
    score: 0,
    best: 0,
    frame: 0,
    propSpin: 0,
    drone: { x: 110, y: H / 2, vy: 0, tilt: 0 },
    particles: [],
    buildings: [],
    cars: makeCars(),
    groundOffset: 0,
  });

  const [uiState, setUiState] = useState<UiState>({
    show: true,
    phase: "idle",
    score: 0,
    best: 0,
  });

  const resetGame = useCallback(() => {
    const state = stateRef.current;
    state.drone = { x: 110, y: H / 2, vy: 0, tilt: 0 };
    state.score = 0;
    state.buildings = [makeBuilding()];
    state.frame = 0;
    state.particles = [];
    state.cars = makeCars();
    state.groundOffset = 0;
  }, []);

  const flap = useCallback(() => {
    const state = stateRef.current;

    if (state.gameState === "idle" || state.gameState === "dead") {
      state.gameState = "playing";
      resetGame();
      setUiState((current) => ({ ...current, show: false, phase: "playing", score: 0 }));
      return;
    }

    if (state.gameState === "playing") {
      state.drone.vy = -6.5;
    }
  }, [resetGame]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        flap();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const maybeCtx = canvas.getContext("2d");
    if (!maybeCtx) {
      return;
    }
    const ctx: CanvasRenderingContext2D = maybeCtx;

    function spawnThrust(x: number, y: number) {
      const state = stateRef.current;

      for (let i = 0; i < 2; i += 1) {
        state.particles.push({
          x: x + (Math.random() - 0.5) * 16,
          y: y + 14,
          vx: (Math.random() - 0.5) * 0.8 - 0.3,
          vy: Math.random() * 1.4 + 0.6,
          life: 1,
          decay: 0.06 + Math.random() * 0.04,
          r: Math.random() * 4 + 2,
          type: "thrust",
        });
      }
    }

    function spawnDeathParticles(x: number, y: number) {
      const state = stateRef.current;
      const colors = ["#00ffe1", "#ff6ef7", "#ffe94e", "#ff3cac"];

      for (let i = 0; i < 22; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        state.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 1,
          decay: 0.025 + Math.random() * 0.02,
          r: 3 + Math.random() * 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: "death",
        });
      }
    }

    function drawSky() {
      const gradient = ctx.createLinearGradient(0, 0, 0, H * 0.72);
      gradient.addColorStop(0, "#0d0025");
      gradient.addColorStop(0.35, "#1a0040");
      gradient.addColorStop(0.7, "#3a0060");
      gradient.addColorStop(1, "#6b007a");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
    }

    function drawClouds() {
      CLOUDS.forEach((cloud) => {
        ctx.save();
        ctx.globalAlpha = cloud.alpha;
        ctx.fillStyle = "#c06aff";
        const blockWidth = 8;
        const shape = [
          [1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
        ];
        const offsets = [Math.round(cloud.w * 0.15), 0, Math.round(cloud.w * 0.08)];

        shape.forEach((row, rowIndex) => {
          row.forEach((_, columnIndex) => {
            ctx.fillRect(
              Math.round(cloud.x + offsets[rowIndex] + columnIndex * blockWidth),
              Math.round(cloud.y + rowIndex * blockWidth),
              blockWidth - 1,
              blockWidth - 1,
            );
          });
        });
        ctx.restore();
      });
    }

    function drawBackgroundBuildings() {
      [BG_FAR, BG_MID].forEach((layer) => {
        layer.forEach((building) => {
          ctx.fillStyle = building.color;
          ctx.fillRect(building.x, H - building.h - 50, building.w - 2, building.h);

          building.windows?.forEach(({ wx, wy, lit, bright }) => {
            if (!lit) {
              return;
            }

            ctx.fillStyle = bright ? "#ffe94e" : "rgba(100,60,200,0.55)";
            ctx.fillRect(Math.round(wx), Math.round(wy), 5, 7);
          });
        });
      });
    }

    function drawPixelCar(x: number, y: number, color: string, roofColor: string, type: Car["type"]) {
      const roundedX = Math.round(x);
      const isVan = type === "van";
      const carWidth = isVan ? 36 : 30;
      const carHeight = isVan ? 14 : 12;

      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(roundedX + 2, y + carHeight - 1, carWidth - 2, 3);

      ctx.fillStyle = color;
      ctx.fillRect(roundedX, y + 4, carWidth, carHeight - 4);

      ctx.fillStyle = roofColor;
      if (isVan) {
        ctx.fillRect(roundedX + 2, y, carWidth - 4, 8);
      } else {
        ctx.fillRect(roundedX + 6, y, carWidth - 12, 7);
      }

      ctx.fillStyle = "rgba(150,220,255,0.7)";
      if (isVan) {
        ctx.fillRect(roundedX + carWidth - 8, y + 1, 6, 5);
      } else {
        ctx.fillRect(roundedX + carWidth - 9, y + 1, 5, 5);
      }

      ctx.fillStyle = "rgba(100,160,200,0.6)";
      if (isVan) {
        ctx.fillRect(roundedX + 2, y + 1, 5, 5);
      } else {
        ctx.fillRect(roundedX + 4, y + 1, 4, 5);
      }

      ctx.fillStyle = "#fffbe6";
      ctx.fillRect(roundedX + carWidth - 3, y + 5, 3, 4);
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#fffbe6";
      ctx.fillRect(roundedX + carWidth, y + 4, 5, 6);
      ctx.restore();

      ctx.fillStyle = "#ff2200";
      ctx.fillRect(roundedX, y + 5, 3, 4);
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "#ff2200";
      ctx.fillRect(roundedX - 4, y + 4, 5, 6);
      ctx.restore();

      const wheelPositions = isVan ? [6, 26] : [5, 21];
      wheelPositions.forEach((wheelX) => {
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(roundedX + wheelX, y + carHeight - 3, 8, 6);
        ctx.fillStyle = "#888";
        ctx.fillRect(roundedX + wheelX + 2, y + carHeight - 2, 4, 4);
        ctx.fillStyle = "#ccc";
        ctx.fillRect(roundedX + wheelX + 3, y + carHeight - 1, 2, 2);
      });

      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(roundedX + 2, y + 5, carWidth - 4, 2);
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = color;
      ctx.fillRect(roundedX + 2, y + carHeight + 1, carWidth - 4, 3);
      ctx.restore();
    }

    function drawGround() {
      const state = stateRef.current;

      ctx.fillStyle = "#1a0030";
      ctx.fillRect(0, H - 56, W, 4);
      ctx.fillStyle = "#0e0018";
      ctx.fillRect(0, H - 52, W, 52);
      ctx.fillStyle = "#2a0050";
      ctx.fillRect(0, H - 52, W, 2);

      ctx.fillStyle = "#ffe94e";
      for (let i = 0; i < 10; i += 1) {
        const laneX = ((i * 60 - state.groundOffset) % W + W) % W;
        ctx.fillRect(Math.round(laneX), H - 35, 34, 3);
      }

      ctx.fillStyle = "rgba(0,255,180,0.07)";
      ctx.fillRect(0, H - 54, W, 3);
      ctx.fillStyle = "#220040";
      ctx.fillRect(0, H - 4, W, 4);

      state.cars.forEach((car) => {
        const y = LANE_Y_ABS[car.lane] - 14;
        drawPixelCar(car.x, y, car.color, car.roof, car.type);

        if (state.gameState === "playing") {
          car.x -= car.speed;
          if (car.x + 40 < 0) {
            car.x = W + 10;
          }
        }
      });

      if (state.gameState === "playing") {
        state.groundOffset = (state.groundOffset + BUILDING_SPEED) % W;
      }
    }

    function drawTower(x: number, y: number, width: number, height: number, isTop: boolean) {
      if (height <= 0) {
        return;
      }

      const state = stateRef.current;
      const baseX = Math.round(x);

      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(baseX, Math.round(y), width, height);

      ctx.fillStyle = "#2d2d5a";
      ctx.fillRect(baseX + 4, Math.round(y), 6, height);
      ctx.fillRect(baseX + width - 10, Math.round(y), 6, height);

      ctx.strokeStyle = "#2d2d5a";
      ctx.lineWidth = 2;
      const braceHeight = 28;
      for (let braceY = y; braceY < y + height; braceY += braceHeight) {
        ctx.beginPath();
        ctx.moveTo(baseX + 4, braceY);
        ctx.lineTo(baseX + width - 4, Math.min(y + height, braceY + braceHeight));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(baseX + width - 4, braceY);
        ctx.lineTo(baseX + 4, Math.min(y + height, braceY + braceHeight));
        ctx.stroke();
      }

      ctx.fillStyle = "#00ffe1";
      ctx.fillRect(baseX, Math.round(y), 2, height);
      ctx.fillRect(baseX + width - 2, Math.round(y), 2, height);

      for (let lightY = y + 10; lightY < y + height - 10; lightY += 32) {
        const on = (state.frame + Math.round(lightY)) % 60 < 30;
        ctx.fillStyle = on ? "#ff3030" : "#600000";
        ctx.fillRect(baseX + width / 2 - 3, Math.round(lightY), 6, 4);

        if (on) {
          ctx.save();
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = "#ff3030";
          ctx.fillRect(baseX + width / 2 - 7, Math.round(lightY) - 2, 14, 8);
          ctx.restore();
        }
      }

      const capY = isTop ? Math.round(y + height - 10) : Math.round(y);
      ctx.fillStyle = "#0d0d1f";
      ctx.fillRect(baseX - 6, capY, width + 12, 10);
      ctx.fillStyle = "#00ffe1";
      ctx.fillRect(baseX - 6, capY, width + 12, 2);
      ctx.fillRect(baseX - 6, capY + 8, width + 12, 2);

      if (height > 80) {
        const signY = isTop ? Math.round(y + height * 0.4) : Math.round(y + height * 0.3);
        ctx.save();
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillStyle = "#ffe94e";
        ctx.shadowColor = "#ffe94e";
        ctx.shadowBlur = 6;
        ctx.fillText("NK", baseX + 14, signY);
        ctx.restore();
      }
    }

    function drawBuildings() {
      const state = stateRef.current;

      state.buildings.forEach((building) => {
        drawTower(building.x, 0, building.w, building.th, true);
        drawTower(building.x, building.bY, building.w, building.bH, false);

        ctx.save();
        ctx.strokeStyle = "#ff335544";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(building.x, building.th);
        ctx.lineTo(building.x + building.w, building.th);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(building.x, building.bY);
        ctx.lineTo(building.x + building.w, building.bY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      });
    }

    function drawDrone(x: number, y: number, tilt: number, propSpin: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tilt);

      const bodyGradient = ctx.createLinearGradient(-20, -12, 20, 12);
      bodyGradient.addColorStop(0, "#ffd85a");
      bodyGradient.addColorStop(0.5, "#ffbf2f");
      bodyGradient.addColorStop(1, "#d99b00");

      ctx.beginPath();
      ctx.roundRect(-18, -10, 36, 20, 8);
      ctx.fillStyle = bodyGradient;
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(-14, -9, 28, 4);

      ctx.save();
      ctx.translate(0, 2);
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1f2a";
      ctx.fill();

      const lensGradient = ctx.createRadialGradient(0, 0, 1, 0, 0, 6);
      lensGradient.addColorStop(0, "#6fd3ff");
      lensGradient.addColorStop(1, "#001020");
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = lensGradient;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-1.5, -1.5, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fill();
      ctx.restore();

      const arms = [
        [-32, -10],
        [32, -10],
        [-32, 10],
        [32, 10],
      ];

      arms.forEach(([armX, armY]) => {
        ctx.strokeStyle = "#2b2f38";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(armX, armY);
        ctx.stroke();
      });

      arms.forEach(([armX, armY]) => {
        ctx.save();
        ctx.translate(armX, armY);

        const motorGradient = ctx.createRadialGradient(0, 0, 2, 0, 0, 10);
        motorGradient.addColorStop(0, "#444a55");
        motorGradient.addColorStop(1, "#11151c");
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fillStyle = motorGradient;
        ctx.fill();

        const discGradient = ctx.createRadialGradient(0, 0, 4, 0, 0, 22);
        discGradient.addColorStop(0, "rgba(200,220,255,0.25)");
        discGradient.addColorStop(0.5, "rgba(200,220,255,0.12)");
        discGradient.addColorStop(1, "rgba(200,220,255,0)");
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fillStyle = discGradient;
        ctx.fill();

        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 2; i += 1) {
          ctx.rotate(propSpin * 0.25);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(16, 0);
          ctx.stroke();
        }

        ctx.restore();
      });

      ctx.beginPath();
      ctx.arc(-10, -2, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#00eaff";
      ctx.shadowColor = "#00eaff";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(10, -2, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#00eaff";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function drawParticles() {
      const state = stateRef.current;

      state.particles.forEach((particle) => {
        ctx.save();

        if (particle.type === "thrust") {
          const alpha = particle.life * 0.55;
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.r * 2,
          );
          gradient.addColorStop(0, `rgba(0,210,255,${alpha})`);
          gradient.addColorStop(1, "rgba(0,80,200,0)");
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.r * 2, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        } else {
          ctx.globalAlpha = Math.max(0, particle.life);
          ctx.fillStyle = particle.color ?? "#ffffff";
          ctx.shadowColor = particle.color ?? "#ffffff";
          ctx.shadowBlur = 6;
          ctx.fillRect(
            Math.round(particle.x - particle.r / 2),
            Math.round(particle.y - particle.r / 2),
            particle.r,
            particle.r,
          );
        }

        ctx.restore();
      });
    }

    function drawScanlines() {
      ctx.fillStyle = "rgba(0,0,0,0.055)";
      for (let y = 0; y < H; y += 3) {
        ctx.fillRect(0, y, W, 1);
      }

      const chroma = ctx.createLinearGradient(0, 0, W, 0);
      chroma.addColorStop(0, "rgba(255,0,60,0.022)");
      chroma.addColorStop(0.5, "transparent");
      chroma.addColorStop(1, "rgba(0,200,255,0.022)");
      ctx.fillStyle = chroma;
      ctx.fillRect(0, 0, W, H);
    }

    function markDead() {
      const state = stateRef.current;
      if (state.gameState !== "playing") {
        return;
      }

      state.gameState = "dead";
      spawnDeathParticles(state.drone.x, state.drone.y);
      setUiState((current) => ({
        ...current,
        show: true,
        phase: "dead",
        score: state.score,
        best: state.best,
      }));
    }

    function loop() {
      const state = stateRef.current;
      state.propSpin += state.gameState === "playing" ? 0.35 : 0.12;
      state.frame += 1;

      if (state.gameState === "playing") {
        state.drone.vy += 0.5;
        state.drone.vy *= 0.97;
        state.drone.y += state.drone.vy;
        state.drone.tilt = Math.max(-0.35, Math.min(0.45, state.drone.vy * 0.048));
        spawnThrust(state.drone.x, state.drone.y);

        state.particles.forEach((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life -= particle.decay;
          if (particle.type === "death") {
            particle.vy += 0.15;
          } else {
            particle.r *= 0.94;
          }
        });
        state.particles = state.particles.filter((particle) => particle.life > 0);

        state.buildings.forEach((building) => {
          building.x -= BUILDING_SPEED;

          if (!building.scored && building.x + building.w < state.drone.x) {
            building.scored = true;
            state.score += 1;

            if (state.score > state.best) {
              state.best = state.score;
            }

            if (state.score === 15) {
              state.gameState = "won";
              setUiState((current) => ({
                ...current,
                show: true,
                phase: "won",
                score: state.score,
                best: state.best,
              }));
            } else {
              setUiState((current) => ({
                ...current,
                score: state.score,
                best: state.best,
              }));
            }
          }
        });

        if (!state.buildings.length || state.buildings[state.buildings.length - 1].x < W - 210) {
          state.buildings.push(makeBuilding());
        }
        state.buildings = state.buildings.filter((building) => building.x + building.w > -20);

        const hitboxX = 32;
        const hitboxY = 10;
        if (state.drone.y - hitboxY < 0 || state.drone.y + hitboxY > GROUND) {
          markDead();
        }

        for (const building of state.buildings) {
          if (state.drone.x + hitboxX < building.x || state.drone.x - hitboxX > building.x + building.w) {
            continue;
          }

          if (state.drone.y - hitboxY < building.th || state.drone.y + hitboxY > building.bY) {
            markDead();
            break;
          }
        }
      } else {
        state.particles.forEach((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life -= particle.decay;
          if (particle.type === "death") {
            particle.vy += 0.15;
          } else {
            particle.r *= 0.94;
          }
        });
        state.particles = state.particles.filter((particle) => particle.life > 0);
      }

      drawSky();
      drawClouds();
      drawBackgroundBuildings();
      drawBuildings();
      drawGround();
      drawParticles();
      drawDrone(state.drone.x, state.drone.y, state.drone.tilt, state.propSpin);
      drawScanlines();

      const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        background:
          "radial-gradient(circle at top, rgba(0,255,225,0.08), transparent 30%), radial-gradient(circle at 80% 20%, rgba(123,47,255,0.12), transparent 24%), #04000a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px 32px",
        overflow: "auto",
      }}
    >
      <style>{`
        @keyframes rrFlappyBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .rr-flappy-cta {
          animation: rrFlappyBlink 0.9s step-end infinite;
        }
      `}</style>

      <div style={{ position: "relative", width: W, maxWidth: "100%" }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onClick={flap}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            aspectRatio: `${W} / ${H}`,
            imageRendering: "pixelated",
            border: "3px solid #00ffe1",
            boxShadow: "0 0 30px #00ffe1, 0 0 60px #7b2fff, inset 0 0 30px rgba(0,255,225,0.05)",
            cursor: "pointer",
            background: "#0a0010",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 10,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            padding: "0 14px",
            pointerEvents: "none",
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 9,
            color: "#fff",
            textShadow: "0 0 8px #00ffe1, 2px 2px 0 #000",
            letterSpacing: 1,
          }}
        >
          <span>SCORE: {String(uiState.score).padStart(4, "0")}</span>
          <span>BEST: {String(uiState.best).padStart(4, "0")}</span>
        </div>

        {uiState.show && uiState.phase !== "won" && (
          <div
            onClick={flap}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              background: "rgba(5,0,20,0.82)",
              gap: 18,
              cursor: "pointer",
              padding: 24,
            }}
          >
            {uiState.phase === "idle" ? (
              <>
                <div
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 22,
                    color: "#00ffe1",
                    textShadow: "0 0 16px #00ffe1, 3px 3px 0 #7b2fff",
                    textAlign: "center",
                    lineHeight: 1.6,
                    animation: "rrFlappyBlink 1.1s step-end infinite",
                  }}
                >
                  DRONE GO!
                </div>
                <div
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 8,
                    color: "#ff6ef7",
                    textShadow: "0 0 8px #ff6ef7",
                    textAlign: "center",
                    lineHeight: 2,
                  }}
                >
                  Navigate through the cyberpunk city
                  <br />
                  Avoid the signal towers!
                </div>
                <div
                  className="rr-flappy-cta"
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 7,
                    color: "#aaa",
                  }}
                >
                  [ CLICK / SPACE TO START ]
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 22,
                    color: "#00ffe1",
                    textShadow: "0 0 16px #00ffe1, 3px 3px 0 #7b2fff",
                    animation: "rrFlappyBlink 1.1s step-end infinite",
                    textAlign: "center",
                  }}
                >
                  SIGNAL LOST
                </div>
                <div
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 10,
                    color: "#ffe94e",
                    textShadow: "0 0 10px #ffe94e",
                  }}
                >
                  SCORE: {String(uiState.score).padStart(4, "0")}
                </div>
                <div
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 10,
                    color: "#ff6ef7",
                    textShadow: "0 0 10px #ff6ef7",
                  }}
                >
                  BEST: {String(uiState.best).padStart(4, "0")}
                </div>
                <div
                  className="rr-flappy-cta"
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 7,
                    color: "#aaa",
                    marginTop: 8,
                  }}
                >
                  [ CLICK / SPACE TO RESTART ]
                </div>
              </>
            )}
          </div>
        )}

        {uiState.show && uiState.phase === "won" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(2,6,18,0.82)",
              backdropFilter: "blur(3px)",
              padding: 20,
            }}
          >
            <div
              style={{
                width: "min(390px, 100%)",
                background: "rgba(4,8,22,0.97)",
                border: "1px solid #00ffcc55",
                borderRadius: 12,
                padding: "28px 30px 24px",
                textAlign: "center",
                boxShadow: "0 0 60px #00ffcc22, 0 0 120px #00ffcc0a",
                fontFamily: '"Share Tech Mono", monospace',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 6 }}>TROPHY</div>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#00ffcc99", marginBottom: 4 }}>
                MISSION COMPLETE · SCORE 15
              </div>
              <h2
                style={{
                  fontSize: 20,
                  letterSpacing: 3,
                  color: "#00ffcc",
                  textShadow: "0 0 18px #00ffccaa",
                  margin: "0 0 4px",
                  fontFamily: '"Share Tech Mono", monospace',
                }}
              >
                CONGRATULATIONS!
              </h2>
              <div style={{ fontSize: 12, color: "#ffffff55", letterSpacing: 2, marginBottom: 20 }}>
                YOU HAVE UNLOCKED
              </div>
              <div
                style={{
                  background: "rgba(0,255,204,0.07)",
                  border: "1px solid #00ffcc33",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 22,
                  letterSpacing: 2,
                  color: "#00ffccdd",
                  fontSize: 13,
                }}
              >
                JUMPER WIRES &amp; RESISTORS
              </div>
              <button
                onClick={onExit}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  background: "linear-gradient(90deg,#00ccaa,#00aaff)",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: '"Share Tech Mono", monospace',
                  fontSize: 12,
                  letterSpacing: 3,
                  color: "#020e18",
                  fontWeight: 700,
                  boxShadow: "0 0 20px #00ffcc55, 0 4px 16px #00aaff33",
                }}
              >
                RETURN TO HUB
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
