import { useState, useEffect, useRef, useCallback } from "react";
import type { CSSProperties, ReactNode } from "react";

type TetrisGameProps = {
  onExit: () => void;
  onMissionComplete: () => void;
  onNextGame: () => void;
  hasNextGame: boolean;
};

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const COLS = 10, ROWS = 20, BLOCK = 30;
const CANVAS_W = COLS * BLOCK, CANVAS_H = ROWS * BLOCK;

const COLORS = {
  I: { fill: '#00f5ff', stroke: '#006680', glow: 'rgba(0,245,255,0.6)' },
  O: { fill: '#ffe600', stroke: '#887a00', glow: 'rgba(255,230,0,0.6)' },
  T: { fill: '#cc00ff', stroke: '#660080', glow: 'rgba(204,0,255,0.6)' },
  S: { fill: '#00ff44', stroke: '#007722', glow: 'rgba(0,255,68,0.6)' },
  Z: { fill: '#ff003c', stroke: '#800020', glow: 'rgba(255,0,60,0.6)' },
  J: { fill: '#0055ff', stroke: '#002280', glow: 'rgba(0,85,255,0.6)' },
  L: { fill: '#ff8800', stroke: '#804400', glow: 'rgba(255,136,0,0.6)' },
};

const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
};

type PieceType = keyof typeof SHAPES;
type Matrix = number[][];
type BoardCell = PieceType | null;
type Board = BoardCell[][];

type Piece = {
  type: PieceType;
  shape: Matrix;
  x: number;
  y: number;
};

type HeldPiece = Omit<Piece, "x" | "y">;

type ClearAnim = {
  rows: number[];
  flash: number;
};

type GamePhase = "idle" | "playing" | "paused" | "over";

type MutableGameState = {
  board: Board;
  current: Piece | null;
  next: Piece;
  held: HeldPiece | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  hiScore: number;
  gameState: GamePhase;
  clearAnim: ClearAnim | null;
  rgbUnlocked: boolean;
  lastDrop: number;
  rafId: number | null;
  DAS_timer: ReturnType<typeof setTimeout> | null;
  DAS_interval: ReturnType<typeof setInterval> | null;
};

type UiState = {
  score: number;
  lines: number;
  level: number;
  hiScore: number;
  linesInLevel: number;
  gameState: GamePhase;
  overlayTitle: string;
  overlaySub: string;
  showButton: boolean;
  buttonLabel: string;
  rgbVisible: boolean;
};

const PIECE_TYPES = Object.keys(SHAPES);
const LINE_SCORES = [0, 100, 300, 500, 800];
const RGB_UNLOCK_SCORE = 2000;

// ─── PURE HELPERS ─────────────────────────────────────────────────────────────
function cloneShape(shape: Matrix): Matrix {
  return shape.map((row) => [...row]);
}

function randomPiece(): Piece {
  const t = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)] as PieceType;
  return { type: t, shape: SHAPES[t].map(r => [...r]), x: 0, y: 0 };
}

function collides(board: Board, shape: Matrix, ox: number, oy: number) {
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c, ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  return false;
}

function rotatePiece(shape: Matrix): Matrix {
  const N = shape.length, M = shape[0].length;
  const out = Array.from({ length: M }, () => Array(N).fill(0));
  for (let r = 0; r < N; r++)
    for (let c = 0; c < M; c++)
      out[c][N - 1 - r] = shape[r][c];
  return out;
}

function calcGhost(board: Board, current: Piece) {
  let gy = current.y;
  while (!collides(board, current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function getDropDelay(level: number) {
  return Math.max(80, 800 - (level - 1) * 70);
}

// ─── CANVAS DRAW HELPERS ───────────────────────────────────────────────────────
function drawBlock(c2d: CanvasRenderingContext2D, x: number, y: number, type: PieceType | null, size = BLOCK, alpha = 1) {
  if (!type) return;
  const col = COLORS[type];
  c2d.save();
  c2d.globalAlpha = alpha;
  c2d.shadowColor = col.glow; c2d.shadowBlur = 8;
  c2d.fillStyle = col.fill;
  c2d.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  const g = c2d.createLinearGradient(x*size+1, y*size+1, x*size+size, y*size+size);
  g.addColorStop(0, 'rgba(255,255,255,0.35)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.05)');
  g.addColorStop(1, 'rgba(0,0,0,0.3)');
  c2d.fillStyle = g;
  c2d.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  c2d.shadowBlur = 0;
  c2d.strokeStyle = col.stroke; c2d.lineWidth = 1.5;
  c2d.strokeRect(x*size+1.75, y*size+1.75, size-3.5, size-3.5);
  c2d.restore();
}

function drawGrid(c2d: CanvasRenderingContext2D) {
  c2d.save();
  c2d.strokeStyle = 'rgba(0,255,204,0.04)'; c2d.lineWidth = 0.5;
  for (let r = 0; r <= ROWS; r++) { c2d.beginPath(); c2d.moveTo(0, r*BLOCK); c2d.lineTo(CANVAS_W, r*BLOCK); c2d.stroke(); }
  for (let c = 0; c <= COLS; c++) { c2d.beginPath(); c2d.moveTo(c*BLOCK, 0); c2d.lineTo(c*BLOCK, CANVAS_H); c2d.stroke(); }
  c2d.restore();
}

function drawPreview(c2d: CanvasRenderingContext2D, piece: HeldPiece | Piece | null, w: number, h: number, dimmed = false) {
  c2d.fillStyle = '#050508';
  c2d.fillRect(0, 0, w, h);
  if (!piece) return;
  const size = 22;
  const shape = piece.shape;
  const ox = Math.floor((w - shape[0].length * size) / size / 2);
  const oy = Math.floor((h - shape.length * size) / size / 2);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const col = COLORS[piece.type];
      c2d.save();
      c2d.globalAlpha = dimmed ? 0.3 : 1;
      c2d.shadowColor = col.glow; c2d.shadowBlur = 6;
      c2d.fillStyle = col.fill;
      c2d.fillRect((ox+c)*size+1, (oy+r)*size+1, size-2, size-2);
      const g2 = c2d.createLinearGradient((ox+c)*size+1,(oy+r)*size+1,(ox+c)*size+size,(oy+r)*size+size);
      g2.addColorStop(0, 'rgba(255,255,255,0.35)');
      g2.addColorStop(1, 'rgba(0,0,0,0.3)');
      c2d.fillStyle = g2;
      c2d.fillRect((ox+c)*size+1, (oy+r)*size+1, size-2, size-2);
      c2d.shadowBlur = 0;
      c2d.strokeStyle = col.stroke; c2d.lineWidth = 1.5;
      c2d.strokeRect((ox+c)*size+1.75,(oy+r)*size+1.75,size-3.5,size-3.5);
      c2d.restore();
    }
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a0f;
    color: #00ffcc;
    font-family: 'Press Start 2P', monospace;
    min-height: 100vh;
    overflow: hidden;
  }

  /* CRT scanlines */
  body::before {
    content: '';
    position: fixed; inset: 0;
    background: repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0.25) 4px);
    pointer-events: none; z-index: 999;
  }
  /* CRT vignette */
  body::after {
    content: '';
    position: fixed; inset: 0;
    background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%);
    pointer-events: none; z-index: 998;
  }

  @keyframes flicker {
    0%, 95%, 100% { opacity: 1; }
    96% { opacity: 0.8; } 97% { opacity: 1; }
    98% { opacity: 0.6; } 99% { opacity: 1; }
  }
  @keyframes pulse {
    from { opacity: 0.7; } to { opacity: 1; }
  }
  @keyframes led-cycle {
    0%   { background:#ff0040; box-shadow:0 0 4px #ff0040; }
    16%  { background:#ff8800; box-shadow:0 0 4px #ff8800; }
    33%  { background:#ffff00; box-shadow:0 0 4px #ffff00; }
    50%  { background:#00ff44; box-shadow:0 0 4px #00ff44; }
    66%  { background:#00aaff; box-shadow:0 0 4px #00aaff; }
    83%  { background:#cc00ff; box-shadow:0 0 4px #cc00ff; }
    100% { background:#ff0040; box-shadow:0 0 4px #ff0040; }
  }
`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function RgbModal({
  visible,
  onPlayAgain,
  onNextGame,
  hasNextGame,
}: {
  visible: boolean;
  onPlayAgain: () => void;
  onNextGame: () => void;
  hasNextGame: boolean;
}) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.92)',
    }}>
      <div style={{
        background: '#08080f', border: '1px solid #333',
        padding: '30px 28px 24px', maxWidth: 340, width: '90%',
        textAlign: 'center', boxShadow: '0 0 40px rgba(0,0,0,0.6)',
      }}>
        <div style={{ fontSize: 7, letterSpacing: 3, marginBottom: 14, color: '#555', fontFamily: "'Press Start 2P', monospace" }}>
          ★ CONGRATULATIONS ★
        </div>
        <div style={{ fontSize: 11, color: '#eee', letterSpacing: 2, marginBottom: 18, lineHeight: 1.6, fontFamily: "'Press Start 2P', monospace" }}>
          YOU HAVE UNLOCKED<br />RGB LED!
        </div>
        {/* LED strip */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, margin: '16px 0' }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%', background: '#222',
              animation: `led-cycle 3s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }} />
          ))}
        </div>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: 18, color: '#666', lineHeight: 1.5, margin: '14px 0 22px', textAlign: 'left' }}>
          <span style={{ color: '#bbb' }}>RGB LED</span> stands for <span style={{ color: '#bbb' }}>Red, Green, Blue</span> Light-Emitting Diode — a single LED that packs three tiny diodes inside one housing.<br /><br />
          By mixing those three channels at different intensities, it can produce <span style={{ color: '#bbb' }}>16 million+ colours</span>. Used in gaming setups, smart lighting, wearables, and electronics projects, RGB LEDs are controlled via PWM signals — the same tech that makes your screen glow.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          {hasNextGame && (
            <button onClick={onNextGame} style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 8,
              padding: '10px 22px', background: 'rgba(0,255,204,0.12)',
              border: '1px solid #00ffcc', color: '#00ffcc', cursor: 'pointer',
              letterSpacing: 2, transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,204,0.22)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,204,0.12)'; }}
            >
              NEXT GAME
            </button>
          )}
          <button onClick={onPlayAgain} style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            padding: '10px 22px', background: 'transparent',
            border: '1px solid #444', color: '#888', cursor: 'pointer',
            letterSpacing: 2, transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#888'; e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent'; }}
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}

function Panel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: '#0f0f1a',
      border: '2px solid #005544',
      boxShadow: '0 0 10px rgba(0,255,204,0.15), inset 0 0 20px rgba(0,255,204,0.03)',
      padding: 14, width: 160, ...style,
    }}>
      {children}
    </div>
  );
}

function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 7, color: '#007755', letterSpacing: 2, marginBottom: 10, borderBottom: '1px solid #005544', paddingBottom: 6 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function PanelValue({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontFamily: "'VT323', monospace", fontSize: 28, color: '#00ffcc', textShadow: '0 0 8px #00ffcc' }}>
      {children}
    </div>
  );
}

// ─── MAIN GAME ────────────────────────────────────────────────────────────────
export default function TetrisGame({ onExit: _onExit, onMissionComplete, onNextGame, hasNextGame }: TetrisGameProps) {
  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const nextRef    = useRef<HTMLCanvasElement | null>(null);
  const holdRef    = useRef<HTMLCanvasElement | null>(null);

  // All mutable game state lives in a ref so RAF callbacks always see fresh values
  const gs = useRef<MutableGameState>({
    board: emptyBoard(),
    current: null,
    next: randomPiece(),
    held: null,
    canHold: true,
    score: 0, lines: 0, level: 1,
    hiScore: parseInt(localStorage.getItem('tetris_hi') || '0'),
    gameState: 'idle',
    clearAnim: null,
    rgbUnlocked: false,
    lastDrop: 0,
    rafId: null,
    DAS_timer: null,
    DAS_interval: null,
  });

  // React state for UI re-renders
  const [ui, setUi] = useState<UiState>({
    score: 0, lines: 0, level: 1,
    hiScore: parseInt(localStorage.getItem('tetris_hi') || '0'),
    linesInLevel: 0,
    gameState: 'idle',
    overlayTitle: 'TETRIS',
    overlaySub: 'CLASSIC ARCADE\nEDITION',
    showButton: true,
    buttonLabel: 'START GAME',
    rgbVisible: false,
  });

  const syncUi = useCallback(() => {
    const g = gs.current;
    const linesInLevel = g.lines % 10;
    setUi(prev => ({
      ...prev,
      score: g.score, lines: g.lines, level: g.level,
      hiScore: g.hiScore, linesInLevel,
      gameState: g.gameState,
    }));
  }, []);

  // ── DRAW ──
  const drawAll = useCallback(() => {
    const g = gs.current;
    const canvas = canvasRef.current;
    const nextCvs = nextRef.current;
    const holdCvs = holdRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawGrid(ctx);

    for (let r = 0; r < ROWS; r++) {
      if (g.clearAnim && g.clearAnim.rows.includes(r)) {
        if (g.clearAnim.flash % 2 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fillRect(0, r * BLOCK, CANVAS_W, BLOCK);
        }
        continue;
      }
      for (let c = 0; c < COLS; c++) {
        if (g.board[r][c]) drawBlock(ctx, c, r, g.board[r][c]);
      }
    }

    if (g.current && g.gameState === 'playing') {
      // Ghost
      const gy = calcGhost(g.board, g.current);
      for (let r = 0; r < g.current.shape.length; r++)
        for (let c = 0; c < g.current.shape[r].length; c++) {
          if (!g.current.shape[r][c]) continue;
          ctx.save();
          ctx.globalAlpha = 0.2;
          ctx.strokeStyle = COLORS[g.current.type].fill;
          ctx.lineWidth = 2;
          ctx.shadowColor = COLORS[g.current.type].glow;
          ctx.shadowBlur = 4;
          ctx.strokeRect((g.current.x+c)*BLOCK+2, (gy+r)*BLOCK+2, BLOCK-4, BLOCK-4);
          ctx.restore();
        }
      // Current
      for (let r = 0; r < g.current.shape.length; r++)
        for (let c = 0; c < g.current.shape[r].length; c++) {
          if (!g.current.shape[r][c]) continue;
          drawBlock(ctx, g.current.x + c, g.current.y + r, g.current.type);
        }
    }

    const nextCtx = nextCvs?.getContext('2d');
    const holdCtx = holdCvs?.getContext('2d');
    if (nextCtx) drawPreview(nextCtx, g.next, 120, 100, false);
    if (holdCtx) drawPreview(holdCtx, g.held, 120, 100, !g.canHold);
  }, []);

  // ── GAME LOGIC ──
  const spawnPiece = useCallback(() => {
    const g = gs.current;
    g.current = g.next;
    g.next = randomPiece();
    g.current.x = Math.floor((COLS - g.current.shape[0].length) / 2);
    g.current.y = 0;
    g.canHold = true;
    if (collides(g.board, g.current.shape, g.current.x, g.current.y)) {
      doGameOver();
    }
  }, []);

  const triggerRgb = useCallback(() => {
    const g = gs.current;
    g.rgbUnlocked = true;
    g.gameState = 'over';
    if (g.rafId) cancelAnimationFrame(g.rafId);
    onMissionComplete();
    setUi(prev => ({ ...prev, gameState: 'over', rgbVisible: true }));
  }, [onMissionComplete]);

  const checkRgb = useCallback(() => {
    const g = gs.current;
    if (!g.rgbUnlocked && g.score >= RGB_UNLOCK_SCORE && g.gameState === 'playing') {
      triggerRgb();
      return true;
    }
    return false;
  }, [triggerRgb]);

  const checkLines = useCallback(() => {
    const g = gs.current;
    const full: number[] = [];
    for (let r = 0; r < ROWS; r++)
      if (g.board[r].every(c => c !== null)) full.push(r);

    if (full.length === 0) { spawnPiece(); return; }

    let flash = 0;
    g.clearAnim = { rows: full, flash: 0 };

    const flashInterval = setInterval(() => {
      if (g.clearAnim) {
        g.clearAnim.flash = ++flash;
      }
      drawAll();
      if (flash >= 6) {
        clearInterval(flashInterval);
        g.clearAnim = null;
        for (const r of full.slice().reverse()) g.board.splice(r, 1);
        while (g.board.length < ROWS) g.board.unshift(Array(COLS).fill(null));
        const cleared = full.length;
        g.lines += cleared;
        g.score += LINE_SCORES[cleared] * g.level;
        g.level = Math.floor(g.lines / 10) + 1;
        if (g.score > g.hiScore) { g.hiScore = g.score; localStorage.setItem('tetris_hi', String(g.hiScore)); }
        syncUi();
        if (!checkRgb()) spawnPiece();
      }
    }, 60);
  }, [spawnPiece, drawAll, syncUi, checkRgb]);

  const lockPiece = useCallback(() => {
    const g = gs.current;
    if (!g.current) return;
    for (let r = 0; r < g.current.shape.length; r++)
      for (let c = 0; c < g.current.shape[r].length; c++) {
        if (!g.current.shape[r][c]) continue;
        const ny = g.current.y + r;
        if (ny < 0) { doGameOver(); return; }
        g.board[ny][g.current.x + c] = g.current.type;
      }
    checkLines();
  }, [checkLines]);

  const doGameOver = useCallback(() => {
    const g = gs.current;
    g.gameState = 'over';
    if (g.rafId) cancelAnimationFrame(g.rafId);
    setUi(prev => ({
      ...prev, gameState: 'over',
      overlayTitle: 'GAME OVER',
      overlaySub: `SCORE: ${String(g.score).padStart(6,'0')}\nHIGH: ${String(g.hiScore).padStart(6,'0')}`,
      showButton: true, buttonLabel: 'PLAY AGAIN',
    }));
  }, []);

  // ── TICK ──
  const tick = useCallback((now: number) => {
    const g = gs.current;
    if (g.gameState !== 'playing') return;
    if (g.clearAnim) { g.rafId = requestAnimationFrame(tick); return; }
    if (!g.current) return;
    if (now - g.lastDrop > getDropDelay(g.level)) {
      if (!collides(g.board, g.current.shape, g.current.x, g.current.y + 1)) {
        g.current.y++;
      } else {
        lockPiece();
      }
      g.lastDrop = now;
    }
    drawAll();
    g.rafId = requestAnimationFrame(tick);
  }, [lockPiece, drawAll]);

  // ── INIT / START ──
  const startGame = useCallback(() => {
    const g = gs.current;
    if (g.rafId) cancelAnimationFrame(g.rafId);
    g.board = emptyBoard();
    g.score = 0; g.lines = 0; g.level = 1;
    g.hiScore = parseInt(localStorage.getItem('tetris_hi') || '0', 10);
    g.canHold = true; g.held = null;
    g.clearAnim = null; g.rgbUnlocked = false;
    g.next = randomPiece();
    g.gameState = 'playing';
    setUi(prev => ({
      ...prev, score: 0, lines: 0, level: 1, linesInLevel: 0,
      hiScore: g.hiScore, gameState: 'playing',
      overlayTitle: 'TETRIS', overlaySub: 'CLASSIC ARCADE\nEDITION',
      showButton: true, buttonLabel: 'START GAME', rgbVisible: false,
    }));
    spawnPiece();
    g.lastDrop = performance.now();
    g.rafId = requestAnimationFrame(tick);
  }, [spawnPiece, tick]);

  // ── MOVES ──
  const moveLeft = useCallback(() => {
    const g = gs.current;
    if (!g.current) return;
    if (!collides(g.board, g.current.shape, g.current.x - 1, g.current.y)) { g.current.x--; drawAll(); }
  }, [drawAll]);

  const moveRight = useCallback(() => {
    const g = gs.current;
    if (!g.current) return;
    if (!collides(g.board, g.current.shape, g.current.x + 1, g.current.y)) { g.current.x++; drawAll(); }
  }, [drawAll]);

  const softDrop = useCallback(() => {
    const g = gs.current;
    if (!g.current) return;
    if (!collides(g.board, g.current.shape, g.current.x, g.current.y + 1)) {
      g.current.y++; g.score += 1; syncUi();
      if (checkRgb()) return;
    } else { lockPiece(); }
    g.lastDrop = performance.now();
    drawAll();
  }, [lockPiece, drawAll, syncUi, checkRgb]);

  const hardDrop = useCallback(() => {
    const g = gs.current;
    if (!g.current) return;
    let dropped = 0;
    while (!collides(g.board, g.current.shape, g.current.x, g.current.y + 1)) { g.current.y++; dropped++; }
    g.score += dropped * 2;
    if (checkRgb()) { lockPiece(); return; }
    lockPiece();
    drawAll();
  }, [lockPiece, drawAll, checkRgb]);

  const tryRotate = useCallback(() => {
    const g = gs.current;
    if (!g.current) return;
    const rotated = rotatePiece(g.current.shape);
    for (const kick of [0, 1, -1, 2, -2]) {
      if (!collides(g.board, rotated, g.current.x + kick, g.current.y)) {
        g.current.shape = rotated; g.current.x += kick; drawAll(); return;
      }
    }
  }, [drawAll]);

  const holdPiece = useCallback(() => {
    const g = gs.current;
    if (!g.canHold || !g.current) return;
    g.canHold = false;
    if (!g.held) {
      g.held = { type: g.current.type, shape: cloneShape(SHAPES[g.current.type]) };
      spawnPiece();
    } else {
      const tmp = g.held;
      g.held = { type: g.current.type, shape: cloneShape(SHAPES[g.current.type]) };
      g.current = { ...tmp, x: 0, y: 0 };
      g.current.x = Math.floor((COLS - g.current.shape[0].length) / 2);
      g.current.y = 0;
    }
    drawAll();
  }, [spawnPiece, drawAll]);

  const pauseGame = useCallback(() => {
    const g = gs.current;
    if (g.gameState === 'playing') {
      g.gameState = 'paused';
      if (g.rafId) cancelAnimationFrame(g.rafId);
      setUi(prev => ({
        ...prev, gameState: 'paused',
        overlayTitle: 'PAUSED', overlaySub: 'PRESS P TO RESUME',
        showButton: false,
      }));
    } else if (g.gameState === 'paused') {
      g.gameState = 'playing';
      g.lastDrop = performance.now();
      g.rafId = requestAnimationFrame(tick);
      setUi(prev => ({ ...prev, gameState: 'playing' }));
    }
  }, [tick]);

  // ── KEYBOARD ──
  useEffect(() => {
    const g = gs.current;
    const DAS_DELAY = 170, DAS_REPEAT = 50;

    const onKeyDown = (e: KeyboardEvent) => {
      if (g.gameState === 'idle') { if (e.code === 'Enter' || e.code === 'Space') startGame(); return; }
      if (e.code === 'KeyP') { pauseGame(); return; }
      if (g.gameState !== 'playing') return;
      if (g.clearAnim) return;

      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          if (g.DAS_timer !== null) clearTimeout(g.DAS_timer);
          if (g.DAS_interval !== null) clearInterval(g.DAS_interval);
          g.DAS_timer = setTimeout(() => { g.DAS_interval = setInterval(moveLeft, DAS_REPEAT); }, DAS_DELAY);
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          if (g.DAS_timer !== null) clearTimeout(g.DAS_timer);
          if (g.DAS_interval !== null) clearInterval(g.DAS_interval);
          g.DAS_timer = setTimeout(() => { g.DAS_interval = setInterval(moveRight, DAS_REPEAT); }, DAS_DELAY);
          break;
        case 'ArrowDown': e.preventDefault(); softDrop(); break;
        case 'ArrowUp': e.preventDefault(); tryRotate(); break;
        case 'Space': e.preventDefault(); hardDrop(); break;
        case 'KeyC': holdPiece(); break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        if (g.DAS_timer !== null) clearTimeout(g.DAS_timer);
        if (g.DAS_interval !== null) clearInterval(g.DAS_interval);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, [startGame, pauseGame, moveLeft, moveRight, softDrop, hardDrop, tryRotate, holdPiece]);

  // Initial canvas draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawGrid(ctx);
    if (nextRef.current) {
      const c = nextRef.current.getContext('2d');
      if (!c) return;
      c.fillStyle = '#050508'; c.fillRect(0, 0, 120, 100);
    }
    if (holdRef.current) {
      const c = holdRef.current.getContext('2d');
      if (!c) return;
      c.fillStyle = '#050508'; c.fillRect(0, 0, 120, 100);
    }
  }, []);

  const showOverlay = ui.gameState === 'idle' || ui.gameState === 'paused' || ui.gameState === 'over';
  const isPaused = ui.gameState === 'paused';

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#0a0a0f',
      }}>
        {/* Title */}
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 'clamp(18px, 3vw, 32px)',
          color: '#00ffcc',
          textShadow: '0 0 10px #00ffcc, 0 0 20px #00ffcc, 0 0 40px #00ffcc',
          letterSpacing: 12, marginBottom: 20,
          animation: 'flicker 6s infinite',
        }}>TETRIS</div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>

          {/* LEFT PANEL */}
          <Panel>
            <PanelSection title="SCORE"><PanelValue>{String(ui.score).padStart(6,'0')}</PanelValue></PanelSection>
            <PanelSection title="LEVEL">
              <PanelValue>{String(ui.level).padStart(2,'0')}</PanelValue>
              <div style={{ marginTop: 8, height: 6, background: '#005544', width: '100%' }}>
                <div style={{ height: '100%', background: '#00ffcc', boxShadow: '0 0 6px #00ffcc', width: `${ui.linesInLevel * 10}%`, transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: 6, color: '#007755', marginTop: 4 }}>{ui.linesInLevel}/10</div>
            </PanelSection>
            <PanelSection title="LINES"><PanelValue>{String(ui.lines).padStart(3,'0')}</PanelValue></PanelSection>
            <PanelSection title="HIGH SCORE"><PanelValue>{String(ui.hiScore).padStart(6,'0')}</PanelValue></PanelSection>
          </Panel>

          {/* GAME CANVAS */}
          <div style={{
            position: 'relative',
            border: '2px solid #00ffcc',
            boxShadow: '0 0 20px rgba(0,255,204,0.4), 0 0 40px rgba(0,255,204,0.15), inset 0 0 30px rgba(0,255,204,0.05)',
          }}>
            <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
              style={{ display: 'block', background: '#050508', imageRendering: 'pixelated' }} />

            {/* Overlay */}
            {showOverlay && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(5,5,8,0.88)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 20, zIndex: 10,
              }}>
                <div style={{
                  fontSize: 14, color: '#ff003c',
                  textShadow: '0 0 10px #ff003c, 0 0 30px #ff003c',
                  fontFamily: "'Press Start 2P', monospace",
                  animation: 'pulse 1s ease-in-out infinite alternate',
                }}>
                  {isPaused ? 'PAUSED' : ui.overlayTitle}
                </div>
                <div style={{ fontSize: 7, color: '#007755', letterSpacing: 1, textAlign: 'center', lineHeight: 2, fontFamily: "'Press Start 2P', monospace", whiteSpace: 'pre-line' }}>
                  {isPaused ? 'PRESS P TO RESUME' : ui.overlaySub}
                </div>
                {!isPaused && (
                  <button onClick={startGame} style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                    padding: '10px 20px', background: 'transparent',
                    border: '2px solid #00ffcc', color: '#00ffcc', cursor: 'pointer',
                    letterSpacing: 2, textShadow: '0 0 6px #00ffcc',
                    boxShadow: '0 0 10px rgba(0,255,204,0.15)', transition: 'all 0.1s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,204,0.15)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,204,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = '0 0 10px rgba(0,255,204,0.15)'; }}
                  >
                    {ui.gameState === 'idle' ? 'START GAME' : 'PLAY AGAIN'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <Panel>
            <PanelSection title="NEXT">
              <canvas ref={nextRef} width={120} height={100}
                style={{ display: 'block', margin: '6px auto 0', imageRendering: 'pixelated' }} />
            </PanelSection>
            <PanelSection title="HOLD">
              <canvas ref={holdRef} width={120} height={100}
                style={{ display: 'block', margin: '6px auto 0', imageRendering: 'pixelated' }} />
            </PanelSection>
            <div style={{ marginTop: 14, fontSize: 9, color: '#007755', lineHeight: 2.4, letterSpacing: 1 }}>
              <span style={{ color: '#00ffcc', textShadow: '0 0 4px #00ffcc' }}>←→</span> MOVE<br />
              <span style={{ color: '#00ffcc', textShadow: '0 0 4px #00ffcc' }}>↑</span> ROTATE<br />
              <span style={{ color: '#00ffcc', textShadow: '0 0 4px #00ffcc' }}>↓</span> SOFT DROP<br />
              <span style={{ color: '#00ffcc', textShadow: '0 0 4px #00ffcc' }}>SPACE</span> HARD DROP<br />
              <span style={{ color: '#00ffcc', textShadow: '0 0 4px #00ffcc' }}>C</span> HOLD<br />
              <span style={{ color: '#00ffcc', textShadow: '0 0 4px #00ffcc' }}>P</span> PAUSE
            </div>
          </Panel>
        </div>
      </div>

      {/* RGB Modal */}
      <RgbModal
        visible={ui.rgbVisible}
        onPlayAgain={startGame}
        onNextGame={onNextGame}
        hasNextGame={hasNextGame}
      />
    </>
  );
}
