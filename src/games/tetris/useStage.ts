import { useEffect, useState } from "react";
import { createStage } from "./gameHelpers";
import type { Player, Stage } from "./gameHelpers";

export function useStage(player: Player, resetPlayer: () => void) {
  const [stage, setStage] = useState<Stage>(createStage());
  const [rowsCleared, setRowsCleared] = useState(0);

  useEffect(() => {
    setRowsCleared(0);

    const sweepRows = (newStage: Stage): Stage =>
      newStage.reduce<Stage>((accumulator, row) => {
        if (row.findIndex((cell) => cell[0] === 0) === -1) {
          setRowsCleared((prev) => prev + 1);
          accumulator.unshift(
            Array.from({ length: newStage[0].length }, () => [0, "clear"]),
          );
          return accumulator;
        }

        accumulator.push(row);
        return accumulator;
      }, []);

    const nextStage = stage.map((row) =>
      row.map((cell) => (cell[1] === "merged" ? cell : [0, "clear"])),
    ) as Stage;

    player.tetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          nextStage[y + player.pos.y][x + player.pos.x] = [
            value,
            player.collided ? "merged" : "clear",
          ];
        }
      });
    });

    if (player.collided) {
      resetPlayer();
      setStage(sweepRows(nextStage));
      return;
    }

    setStage(nextStage);
  }, [player, resetPlayer]);

  return [stage, setStage, rowsCleared] as const;
}
