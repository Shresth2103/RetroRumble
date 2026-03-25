export const STAGE_WIDTH = 12;
export const STAGE_HEIGHT = 20;
export const BENCHMARK_SCORE = 300;

export type TetrominoKey = "I" | "J" | "L" | "O" | "S" | "T" | "Z";
export type TetrominoCell = 0 | TetrominoKey;
export type CellState = "clear" | "merged";
export type StageCell = [TetrominoCell, CellState];
export type Stage = StageCell[][];

export type Player = {
  pos: { x: number; y: number };
  tetromino: TetrominoCell[][];
  collided: boolean;
};

export const TETROMINOS: Record<TetrominoCell, { shape: TetrominoCell[][]; color: string }> = {
  0: { shape: [[0]], color: "0, 0, 0" },
  I: {
    shape: [
      [0, "I", 0, 0],
      [0, "I", 0, 0],
      [0, "I", 0, 0],
      [0, "I", 0, 0],
    ],
    color: "80, 227, 230",
  },
  J: {
    shape: [
      [0, "J", 0],
      [0, "J", 0],
      ["J", "J", 0],
    ],
    color: "36, 95, 223",
  },
  L: {
    shape: [
      [0, "L", 0],
      [0, "L", 0],
      [0, "L", "L"],
    ],
    color: "223, 173, 36",
  },
  O: {
    shape: [
      ["O", "O"],
      ["O", "O"],
    ],
    color: "223, 217, 36",
  },
  S: {
    shape: [
      [0, "S", "S"],
      ["S", "S", 0],
      [0, 0, 0],
    ],
    color: "48, 211, 56",
  },
  T: {
    shape: [
      [0, 0, 0],
      ["T", "T", "T"],
      [0, "T", 0],
    ],
    color: "132, 61, 198",
  },
  Z: {
    shape: [
      ["Z", "Z", 0],
      [0, "Z", "Z"],
      [0, 0, 0],
    ],
    color: "227, 78, 78",
  },
};

export function randomTetromino() {
  const tetrominos: TetrominoKey[] = ["I", "J", "L", "O", "S", "T", "Z"];
  const randomIndex = Math.floor(Math.random() * tetrominos.length);
  return TETROMINOS[tetrominos[randomIndex]];
}

export function createStage(): Stage {
  return Array.from({ length: STAGE_HEIGHT }, () =>
    Array.from({ length: STAGE_WIDTH }, (): StageCell => [0, "clear"]),
  );
}

export function checkCollision(
  player: Player,
  stage: Stage,
  move: { x: number; y: number },
) {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      if (player.tetromino[y][x] !== 0) {
        if (
          !stage[y + player.pos.y + move.y] ||
          !stage[y + player.pos.y + move.y][x + player.pos.x + move.x] ||
          stage[y + player.pos.y + move.y][x + player.pos.x + move.x][1] !== "clear"
        ) {
          return true;
        }
      }
    }
  }

  return false;
}
