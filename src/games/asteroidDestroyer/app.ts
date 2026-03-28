import "./style.css";
import { GameEngine } from "./game/engine";
import { PHYSICS, LASER } from "./config/physics";

export interface MountAsteroidDestroyerOptions {
  autoStart?: boolean;
  onMissionComplete?: () => void;
  onNextGame?: () => void;
  hasNextGame?: boolean;
}

export interface AsteroidDestroyerApp {
  destroy: () => void;
  engine: GameEngine;
  root: HTMLElement;
  start: () => void;
}

const template = `
  <div class="asteroid-destroyer">
    <canvas data-role="game-canvas"></canvas>
    <div class="asteroid-destroyer__ui">
      <section data-role="menu-screen" class="ad-screen visible">
        <div class="ad-hero">
          <span class="ad-badge">ARCADE DESTRUCTION</span>
          <h1>ASTEROID <br />DESTROYER</h1>
          <p>Pilot your craft. Destroy objects. Survive the cosmic storm.</p>
          <button data-role="start-btn" class="ad-primary-btn" type="button">INITIALIZE RUN</button>
          <div class="ad-controls-guide">
            <div class="ad-control-item"><span>W / ↑</span> Thrust</div>
            <div class="ad-control-item"><span>A / D / ← →</span> Rotate</div>
            <div class="ad-control-item"><span>SPACE</span> Fire</div>
          </div>
        </div>
      </section>

      <div data-role="hud" class="hidden ad-hud">
        <div class="ad-hud-top">
          <div class="ad-hud-stat">
            <span class="ad-label">SCORE</span>
            <span data-role="score-val" class="ad-value">00000</span>
          </div>
          <div class="ad-hud-stat">
            <span class="ad-label">LIVES</span>
            <div data-role="lives-container" class="ad-lives-indicator"></div>
          </div>
        </div>
      </div>

      <section data-role="game-over-screen" class="ad-screen hidden">
        <div class="ad-modal">
          <h2 class="ad-danger-text">U FAILED</h2>
          <div class="ad-final-stats">
            <div class="ad-stat"><span>FINAL SCORE</span> <strong data-role="final-score">0</strong></div>
          </div>
          <p class="ad-fail-msg">You were not strong enough to survive the storm.</p>
          <button data-role="restart-btn" class="ad-primary-btn" type="button">RETRY</button>
        </div>
      </section>

      <section data-role="congrats-screen" class="ad-screen hidden">
        <div class="ad-modal ad-congrats-modal">
          <div class="ad-congrats-header">
            <span class="ad-badge ad-golden">GOD PRACTICAL</span>
            <h1 class="ad-success-text ad-glow">COSMIC DESTROYER</h1>
          </div>
          <div class="ad-final-stats">
            <div class="ad-stat"><span>FINAL SCORE</span> <strong data-role="congrats-score">0</strong></div>
          </div>
          <div class="ad-congrats-body">
            <p class="ad-congrats-msg">Exceptional performance. You have ascended beyond the asteroid field and established your dominance in the galactic core.</p>
            <div class="ad-reward-card">
              <span class="ad-reward-label">MISSION REWARD</span>
              <strong class="ad-reward-item">BUZZER</strong>
              <p class="ad-reward-copy">A piezo buzzer has been unlocked for your circuit build.</p>
            </div>
            <button data-role="next-btn" class="ad-primary-btn ad-next-btn hidden" type="button">NEXT GAME</button>
            <div class="ad-congrats-icon">🏆</div>
          </div>
        </div>
      </section>

      <div data-role="toast-container" class="ad-toast-container"></div>
    </div>
  </div>
`;

function setVisibility(element: HTMLElement, visible: boolean) {
  element.classList.toggle("visible", visible);
  element.classList.toggle("hidden", !visible);
}

export function mountAsteroidDestroyer(
  container: HTMLElement,
  options: MountAsteroidDestroyerOptions = {},
): AsteroidDestroyerApp {
  container.innerHTML = template;

  const root = container.firstElementChild as HTMLElement;
  const canvas = root.querySelector('[data-role="game-canvas"]') as HTMLCanvasElement;
  const engine = new GameEngine(canvas, root);

  const menuScreen = root.querySelector('[data-role="menu-screen"]') as HTMLElement;
  const gameOverScreen = root.querySelector('[data-role="game-over-screen"]') as HTMLElement;
  const hud = root.querySelector('[data-role="hud"]') as HTMLElement;
  const scoreVal = root.querySelector('[data-role="score-val"]') as HTMLElement;
  const livesContainer = root.querySelector('[data-role="lives-container"]') as HTMLElement;
  const startBtn = root.querySelector('[data-role="start-btn"]') as HTMLButtonElement;
  const restartBtn = root.querySelector('[data-role="restart-btn"]') as HTMLButtonElement;
  const finalScore = root.querySelector('[data-role="final-score"]') as HTMLElement;
  const congratsScreen = root.querySelector('[data-role="congrats-screen"]') as HTMLElement;
  const congratsScore = root.querySelector('[data-role="congrats-score"]') as HTMLElement;
  const nextBtn = root.querySelector('[data-role="next-btn"]') as HTMLButtonElement | null;
  const toastContainer = root.querySelector('[data-role="toast-container"]') as HTMLElement;

  const keys: Record<string, boolean> = {};
  let animationFrameId = 0;
  let lastFireTime = 0;
  let lastFrameTime = 0;

  const showHud = () => {
    setVisibility(menuScreen, false);
    setVisibility(gameOverScreen, false);
    setVisibility(congratsScreen, false);
    setVisibility(hud, true);
  };

  const startGame = () => {
    showHud();
    engine.start();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    keys[event.code] = true;
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    keys[event.code] = false;
  };

  const timeNow = () => performance.now();
  const handleNextGame = () => options.onNextGame?.();

  const handleInput = (dt: number) => {
    if (engine.state.status !== "PLAYING" || !engine.state.ship) {
      return;
    }

    const ship = engine.state.ship;
    const shipState = ship.state;

    if (keys["KeyA"] || keys["ArrowLeft"]) {
      shipState.angle -= (PHYSICS.SHIP_ROTATION_DEG * Math.PI / 180) * dt;
    }
    if (keys["KeyD"] || keys["ArrowRight"]) {
      shipState.angle += (PHYSICS.SHIP_ROTATION_DEG * Math.PI / 180) * dt;
    }

    if (keys["KeyW"] || keys["ArrowUp"]) {
      ship.applyThrust(dt);
    } else {
      shipState.thrusting = false;
    }

    const cooldown = shipState.rapidFire ? LASER.COOLDOWN / 2 : LASER.COOLDOWN;
    if ((keys["Space"] || keys["KeyK"]) && timeNow() - lastFireTime > cooldown * 1000) {
      engine.fireLaser();
      lastFireTime = timeNow();
    }
  };

  const loop = (time: number) => {
    const dt = Math.min(0.1, (time - lastFrameTime) / 1000);
    lastFrameTime = time;

    handleInput(dt);
    engine.update(dt);
    engine.render();

    animationFrameId = window.requestAnimationFrame(loop);
  };

  const resizeObserver = new ResizeObserver(() => {
    engine.resize();
  });

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);
  nextBtn?.addEventListener("click", handleNextGame);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  resizeObserver.observe(root);

  engine.onScoreChange = (score) => {
    scoreVal.textContent = score.toString().padStart(5, "0");
  };

  engine.onLivesChange = (lives) => {
    livesContainer.innerHTML = "";
    for (let i = 0; i < 5; i += 1) {
      const pip = document.createElement("div");
      pip.className = `ad-life-pip ${i < lives ? "active" : ""}`;
      livesContainer.appendChild(pip);
    }
  };

  engine.onGameOver = (score) => {
    setVisibility(hud, false);
    if (score >= 2000) {
      options.onMissionComplete?.();
      setVisibility(congratsScreen, true);
      congratsScore.textContent = score.toString();
      if (nextBtn) {
        setVisibility(nextBtn, !!options.hasNextGame);
      }
      return;
    }

    setVisibility(gameOverScreen, true);
    finalScore.textContent = score.toString();
  };

  engine.onToast = (message) => {
    const toast = document.createElement("div");
    toast.className = "ad-toast";
    toast.textContent = message;
    toastContainer.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2000);
  };

  animationFrameId = window.requestAnimationFrame(loop);

  if (options.autoStart) {
    startGame();
  }

  return {
    destroy() {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      startBtn.removeEventListener("click", startGame);
      restartBtn.removeEventListener("click", startGame);
      nextBtn?.removeEventListener("click", handleNextGame);
      engine.destroy();
      container.innerHTML = "";
    },
    engine,
    root,
    start: startGame,
  };
}
