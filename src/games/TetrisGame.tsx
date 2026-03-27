import { useEffect, useRef, useState } from "react";
import {
  BENCHMARK_SCORE,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  TETROMINOS,
  checkCollision,
  createStage,
} from "./tetris/gameHelpers";
import { useInterval } from "./tetris/useInterval";
import { usePlayer } from "./tetris/usePlayer";
import { useStage } from "./tetris/useStage";

type TetrisGameProps = {
  onExit: () => void;
  onMissionComplete: () => void;
};

export default function TetrisGame({ onExit, onMissionComplete }: TetrisGameProps) {
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [floatingScores, setFloatingScores] = useState<
    { id: number; val: number }[]
  >([]);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const missionReportedRef = useRef(false);
  const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
  const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);

  useEffect(() => {
    gameAreaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (score >= BENCHMARK_SCORE && !hasWon) {
      setHasWon(true);
      setGameOver(true);
      setDropTime(null);
    }
  }, [hasWon, score]);

  useEffect(() => {
    if (hasWon && !missionReportedRef.current) {
      missionReportedRef.current = true;
      onMissionComplete();
    }
  }, [hasWon, onMissionComplete]);

  useEffect(() => {
    if (rowsCleared > 0) {
      const linePoints = [40, 100, 300, 1200];
      const addedPoints = linePoints[rowsCleared - 1] ?? 0;
      const newId = Date.now();

      setScore((prev) => prev + addedPoints);
      setLines((prev) => prev + rowsCleared);
      setFloatingScores((prev) => [...prev, { id: newId, val: addedPoints }]);

      const timeoutId = window.setTimeout(() => {
        setFloatingScores((prev) => prev.filter((entry) => entry.id !== newId));
      }, 1200);

      return () => window.clearTimeout(timeoutId);
    }
  }, [rowsCleared]);

  const startGame = () => {
    missionReportedRef.current = false;
    setStage(createStage());
    setDropTime(800);
    resetPlayer();
    setScore(0);
    setLines(0);
    setGameOver(false);
    setHasWon(false);
    window.setTimeout(() => gameAreaRef.current?.focus(), 0);
  };

  const drop = () => {
    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
      return;
    }

    if (player.pos.y < 1) {
      setGameOver(true);
      setDropTime(null);
    }

    updatePlayerPos({ x: 0, y: 0, collided: true });
  };

  const movePlayer = (dir: number) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const handleMove = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (gameOver) {
      return;
    }

    if ([" ", "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
    }

    if (event.key === "ArrowLeft") {
      movePlayer(-1);
      return;
    }

    if (event.key === "ArrowRight") {
      movePlayer(1);
      return;
    }

    if (event.key === "ArrowDown") {
      drop();
      return;
    }

    if (event.key === "ArrowUp") {
      playerRotate(stage, 1);
      return;
    }

    if (event.key === " ") {
      let potentialY = 0;

      while (!checkCollision(player, stage, { x: 0, y: potentialY + 1 })) {
        potentialY += 1;
      }

      updatePlayerPos({ x: 0, y: potentialY, collided: true });
    }
  };

  useInterval(() => drop(), dropTime);

  return (
    <div
      ref={gameAreaRef}
      tabIndex={0}
      onKeyDown={handleMove}
      className="rr-tetris-shell"
    >
      <style>{`
        .rr-tetris-shell {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background:
            radial-gradient(circle at top, rgba(0, 255, 255, 0.08), transparent 28%),
            linear-gradient(90deg, rgba(0, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(0deg, rgba(0, 255, 255, 0.02) 1px, transparent 1px),
            #02040a;
          background-size: auto, 40px 40px, 40px 40px, auto;
          outline: none;
          overflow: auto;
          padding: 32px 20px;
        }
        .rr-tetris-hud {
          background: rgba(5, 10, 20, 0.95);
          border: 1px solid rgba(0, 255, 255, 0.15);
          padding: 20px;
          backdrop-filter: blur(10px);
          min-width: 200px;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .rr-tetris-hud::before {
          content: "";
          position: absolute;
          top: -1px;
          left: -1px;
          width: 12px;
          height: 12px;
          border-top: 2px solid #00ffff;
          border-left: 2px solid #00ffff;
        }
        .rr-tetris-label {
          color: #00ffff;
          font-family: "Courier New", monospace;
          font-size: 0.7rem;
          letter-spacing: 2px;
          display: block;
          margin-bottom: 15px;
          text-transform: uppercase;
          opacity: 0.8;
        }
        .rr-tetris-value {
          color: #ffffff;
          font-size: 2.2rem;
        }
        .rr-tetris-key-row {
          display: flex;
          align-items: center;
          color: #ffffff;
          font-family: "Courier New", monospace;
          font-size: 0.8rem;
          margin-bottom: 12px;
          gap: 12px;
        }
        .rr-tetris-key {
          color: #00ffff;
          font-weight: bold;
          flex-basis: 70px;
          flex-shrink: 0;
        }
        .rr-tetris-row-clearing {
          animation: rrTetrisFlash 0.3s ease-out forwards;
        }
        .rr-tetris-floating-score {
          position: absolute;
          color: #ffffff;
          font-family: "Courier New", monospace;
          font-weight: 900;
          font-size: 2.5rem;
          pointer-events: none;
          animation: rrTetrisFloatUp 1.2s ease-out forwards;
          z-index: 100;
        }
        .rr-tetris-button {
          background: transparent;
          border: 1px solid #00ffff;
          color: #00ffff;
          padding: 12px 30px;
          cursor: pointer;
          letter-spacing: 4px;
          font-family: "Courier New", monospace;
          transition: 0.3s;
          text-transform: uppercase;
        }
        .rr-tetris-button.rr-tetris-retry {
          border-color: #ff1493;
          color: #ff1493;
          box-shadow: 0 0 8px rgba(255, 20, 147, 0.2);
        }
        .rr-tetris-reward {
          padding: 20px;
          border: 1px solid #00ffff;
          background: #050a14;
          max-width: 260px;
          text-align: center;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.1);
          font-family: "Courier New", monospace;
        }
        .rr-tetris-reward h3 {
          color: #00ffff;
          margin: 10px 0;
          font-size: 1.2rem;
        }
        .rr-tetris-reward-tag {
          padding: 10px;
          margin: 10px 0;
          color: rgb(11, 239, 49);
          font-weight: bold;
          font-size: 1rem;
        }
        .rr-tetris-reward-item {
          font-size: 1.1rem;
          font-weight: bold;
          color: rgb(205, 196, 104);
          margin: 10px 0;
          border: 2px solid rgb(174, 186, 3);
          background: rgba(0, 255, 255, 0.05);
          padding: 10px;
        }
        .rr-tetris-reward-copy {
          font-size: 0.7rem;
          line-height: 1.5;
          color: #a0aec0;
        }
        @keyframes rrTetrisFlash {
          0% { background-color: #ffffff; }
          100% { background-color: transparent; }
        }
        @keyframes rrTetrisFloatUp {
          0% { transform: translate(-50%, 0) scale(0.6); opacity: 0; }
          20% { transform: translate(-50%, -20px) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -100px) scale(1); opacity: 0; }
        }
        @media (max-width: 980px) {
          .rr-tetris-layout {
            flex-direction: column;
            gap: 20px;
          }
          .rr-tetris-hud {
            min-width: min(320px, 100%);
            width: 100%;
          }
        }
      `}</style>

      <div
        className="rr-tetris-layout"
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "32px",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "1100px",
        }}
      >
        <aside
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            minWidth: "180px",
          }}
        >
          <div className="rr-tetris-hud">
            <span className="rr-tetris-label">Target Score</span>
            <div className="rr-tetris-value" style={{ color: "#00ffff" }}>
              {BENCHMARK_SCORE}
            </div>
          </div>
          <div className="rr-tetris-hud">
            <span className="rr-tetris-label">Current Score</span>
            <div className="rr-tetris-value">{score}</div>
          </div>
          <div className="rr-tetris-hud">
            <span className="rr-tetris-label">Lines Cleared</span>
            <div className="rr-tetris-value">{lines}</div>
          </div>
        </aside>

        <div
          style={{
            position: "relative",
            border: "1px solid rgba(0, 255, 255, 0.2)",
            background: "#010101",
            padding: "30px 20px",
            boxShadow: "0 0 40px rgba(0, 255, 255, 0.08)",
          }}
        >
          <div style={cornerTopLeft} />
          <div style={cornerTopRight} />
          <div style={cornerBottomLeft} />
          <div style={cornerBottomRight} />

          {floatingScores.map((entry) => (
            <div
              key={entry.id}
              className="rr-tetris-floating-score"
              style={{ top: "45%", left: "50%" }}
            >
              +{entry.val}
            </div>
          ))}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${STAGE_WIDTH}, 25px)`,
              gridTemplateRows: `repeat(${STAGE_HEIGHT}, 25px)`,
            }}
          >
            {stage.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={
                    cell[1] === "clear" && rowsCleared > 0 ? "rr-tetris-row-clearing" : ""
                  }
                  style={{
                    width: "25px",
                    height: "25px",
                    border: "1px solid rgba(0, 255, 255, 0.1)",
                    background:
                      cell[0] === 0
                        ? "transparent"
                        : `rgba(${TETROMINOS[cell[0]].color}, 0.9)`,
                  }}
                />
              )),
            )}
          </div>

          {(gameOver || !dropTime) && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "rgba(2, 4, 10, 0.95)",
                zIndex: 50,
              }}
            >
              {hasWon ? (
                <div className="rr-tetris-reward">
                  <h3>CONGRATULATIONS !!</h3>
                  <h4 className="rr-tetris-reward-tag">YOU HAVE UNLOCKED</h4>
                  <div className="rr-tetris-reward-item">RGB LIGHTS</div>
                  <p className="rr-tetris-reward-copy">
                    Light-emitting diodes that combine red, green, and blue light to
                    produce a wide range of colors.
                  </p>
                  <button
                    onClick={startGame}
                    className="rr-tetris-button"
                    style={{ marginTop: "15px", width: "100%" }}
                  >
                    [ REPLAY ]
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <h2
                    style={{
                      fontSize: "1.8rem",
                      color: "#00ffff",
                      marginBottom: "10px",
                      fontFamily: "'Press Start 2P', monospace",
                    }}
                  >
                    TETRIS
                  </h2>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      marginBottom: "20px",
                      color: "#8899a6",
                      fontFamily: "monospace",
                    }}
                  >
                    Target Score: {BENCHMARK_SCORE}
                  </p>
                  <button
                    onClick={startGame}
                    className={`rr-tetris-button ${gameOver ? "rr-tetris-retry" : ""}`}
                  >
                    [ {gameOver ? "RETRY" : "START"} ]
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <aside
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            minWidth: "180px",
          }}
        >
          <div className="rr-tetris-hud">
            <span className="rr-tetris-label">Key Commands</span>
            <div className="rr-tetris-key-row">
              <span className="rr-tetris-key">LEFT</span>
              <span>MOVE LEFT</span>
            </div>
            <div className="rr-tetris-key-row">
              <span className="rr-tetris-key">RIGHT</span>
              <span>MOVE RIGHT</span>
            </div>
            <div className="rr-tetris-key-row">
              <span className="rr-tetris-key">UP</span>
              <span>ROTATE</span>
            </div>
            <div className="rr-tetris-key-row">
              <span className="rr-tetris-key">DOWN</span>
              <span>SOFT DROP</span>
            </div>
            <div className="rr-tetris-key-row" style={{ marginBottom: 0 }}>
              <span className="rr-tetris-key">SPACE</span>
              <span>HARD DROP</span>
            </div>
          </div>
          <div className="rr-tetris-hud">
            <span className="rr-tetris-label">Exit</span>
            <button
              onClick={onExit}
              className="rr-tetris-button"
              style={{ width: "100%", letterSpacing: 2 }}
            >
              BACK TO HUB
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

const cornerTopLeft: React.CSSProperties = {
  position: "absolute",
  top: 8,
  left: 8,
  width: 12,
  height: 12,
  borderTop: "2px solid #00ffff",
  borderLeft: "2px solid #00ffff",
};

const cornerTopRight: React.CSSProperties = {
  position: "absolute",
  top: 8,
  right: 8,
  width: 12,
  height: 12,
  borderTop: "2px solid #00ffff",
  borderRight: "2px solid #00ffff",
};

const cornerBottomLeft: React.CSSProperties = {
  position: "absolute",
  bottom: 8,
  left: 8,
  width: 12,
  height: 12,
  borderBottom: "2px solid #00ffff",
  borderLeft: "2px solid #00ffff",
};

const cornerBottomRight: React.CSSProperties = {
  position: "absolute",
  bottom: 8,
  right: 8,
  width: 12,
  height: 12,
  borderBottom: "2px solid #00ffff",
  borderRight: "2px solid #00ffff",
};
