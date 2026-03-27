import { Direction, TileType } from '../types';
import type { Position } from '../types';
import { MAP_WIDTH, MAP_HEIGHT, DIRECTIONS } from '../constants';

export function getNextGhostDirection(
  currentPos: Position,
  currentDirection: Direction,
  pacmanPos: Position,
  grid: number[][],
  round: number
): Direction {
  // Simple AI: try to move towards pacman, but avoid walls
  const possibleDirections = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];

  // Filter out directions that would hit walls
  const validDirections = possibleDirections.filter(dir => {
    const delta = DIRECTIONS[dir];
    const newX = Math.round(currentPos.x + delta.x);
    const newY = Math.round(currentPos.y + delta.y);

    // Check bounds
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
      return false;
    }

    // Check if it's a wall or out-of-bounds
    return grid[newY][newX] !== TileType.WALL && grid[newY][newX] !== TileType.GHOST_SPAWN;
  });

  if (validDirections.length === 0) {
    return currentDirection; // No valid moves, keep current direction
  }

  // Prefer not reversing unless forced
  const nonReverseOptions = validDirections.filter(dir => dir !== getOppositeDirection(currentDirection));
  const candidates = nonReverseOptions.length > 0 ? nonReverseOptions : validDirections;

  // Calculate distances to pacman for each candidate direction
  const directionScores = candidates.map(dir => {
    const delta = DIRECTIONS[dir];
    const newX = Math.round(currentPos.x + delta.x);
    const newY = Math.round(currentPos.y + delta.y);

    const distanceToPacman = Math.abs(newX - pacmanPos.x) + Math.abs(newY - pacmanPos.y);
    return { direction: dir, score: distanceToPacman };
  });

  directionScores.sort((a, b) => a.score - b.score);

  // On round 2, use a small random factor to avoid deterministic freeze behavior
  if (round === 2 && directionScores.length > 1) {
    if (Math.random() < 0.15) {
      return directionScores[1].direction;
    }
  }

  return directionScores[0].direction;
}

export function getOppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case Direction.UP: return Direction.DOWN;
    case Direction.DOWN: return Direction.UP;
    case Direction.LEFT: return Direction.RIGHT;
    case Direction.RIGHT: return Direction.LEFT;
    default: return direction;
  }
}