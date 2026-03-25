import { useCallback, useState } from "react";
import {
  STAGE_WIDTH,
  TETROMINOS,
  checkCollision,
  randomTetromino,
} from "./gameHelpers";
import type { Player, Stage, TetrominoCell } from "./gameHelpers";

type PlayerMove = {
  x: number;
  y: number;
  collided: boolean;
};

function rotate(matrix: TetrominoCell[][], dir: number) {
  const rotatedTetromino = matrix.map((_, index) => matrix.map((column) => column[index]));

  if (dir > 0) {
    return rotatedTetromino.map((row) => row.reverse());
  }

  return rotatedTetromino.reverse();
}

export function usePlayer() {
  const [player, setPlayer] = useState<Player>({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS[0].shape,
    collided: false,
  });

  const updatePlayerPos = ({ x, y, collided }: PlayerMove) => {
    setPlayer((prev) => ({
      ...prev,
      pos: { x: prev.pos.x + x, y: prev.pos.y + y },
      collided,
    }));
  };

  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
      tetromino: randomTetromino().shape,
      collided: false,
    });
  }, []);

  const playerRotate = (stage: Stage, dir: number) => {
    const clonedPlayer: Player = {
      ...player,
      pos: { ...player.pos },
      tetromino: player.tetromino.map((row) => [...row]),
    };

    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

    const originalPosition = clonedPlayer.pos.x;
    let offset = 1;

    while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));

      if (offset > clonedPlayer.tetromino[0].length) {
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, -dir);
        clonedPlayer.pos.x = originalPosition;
        return;
      }
    }

    setPlayer(clonedPlayer);
  };

  return [player, updatePlayerPos, resetPlayer, playerRotate] as const;
}
