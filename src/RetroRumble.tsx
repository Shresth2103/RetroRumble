import { useState, useEffect } from "react";
import SolarSmashGame from "./games/SolarSmashGame";
import AsteroidDestroyerGame from "./games/AsteroidDestroyerGame";
import TetrisGame from "./games/TetrisGame";
import FlappyDroneGame from "./games/FlappyDroneGame";
import PacmanGame from "./games/PacmanGame";

// ─── Pixel Art Previews ───────────────────────────────────────────────────────

function FlappyPreview() {
  const [birdY, setBirdY] = useState(50);
  useEffect(() => {
    let t = 0;
    const id = setInterval(() => {
      t += 0.05;
      setBirdY(50 + Math.sin(t) * 18);
    }, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <svg viewBox="0 0 180 100" width="100%" style={{ display: "block" }}>
      <rect width="180" height="100" fill="#0a1628" />
      {([[20,10],[60,5],[100,15],[150,8],[30,80],[140,70]] as number[][]).map(([x,y],i)=>(
        <rect key={i} x={x} y={y} width="2" height="2" fill="#fff" opacity={0.6}/>
      ))}
      <rect x="130" y="0" width="18" height="35" fill="#00aa33" />
      <rect x="127" y="30" width="24" height="8" fill="#00cc44" />
      <rect x="130" y="62" width="18" height="38" fill="#00aa33" />
      <rect x="127" y="60" width="24" height="8" fill="#00cc44" />
      <rect x="0" y="92" width="180" height="8" fill="#1a3a1a" />
      <rect x="30" y={birdY-6} width="22" height="10" fill="#00CFFF" rx="2"/>
      <rect x="26" y={birdY-4} width="6" height="2" fill="#0088aa"/>
      <rect x="50" y={birdY-4} width="6" height="2" fill="#0088aa"/>
      <rect x="22" y={birdY-8} width="12" height="2" fill="#ffffff" opacity={0.8} rx="1"/>
      <rect x="48" y={birdY-8} width="12" height="2" fill="#ffffff" opacity={0.8} rx="1"/>
      <rect x="49" y={birdY-4} width="3" height="3" fill="#001122" rx="1"/>
      <rect x="50" y={birdY-3} width="1" height="1" fill="#fff"/>
      <text x="10" y="20" fill="#00CFFF" fontSize="8" fontFamily="monospace">SCORE: 42</text>
    </svg>
  );
}

function PacmanPreview() {
  const [mouth, setMouth] = useState(0.3);
  const [dir, setDir] = useState(1);
  useEffect(() => {
    const id = setInterval(() => {
      setMouth(m => {
        if (m >= 0.45) { setDir(-1); return m - 0.05; }
        if (m <= 0.05) { setDir(1); return m + 0.05; }
        return m + dir * 0.05;
      });
    }, 50);
    return () => clearInterval(id);
  }, [dir]);

  const r = 18, cx = 55, cy = 50;
  const startAngle = mouth * Math.PI;
  const endAngle = (2 - mouth) * Math.PI;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);

  return (
    <svg viewBox="0 0 180 100" width="100%" style={{ display: "block" }}>
      <rect width="180" height="100" fill="#000" />
      {[85,100,115,130,145,160].map((x,i) => (
        <circle key={i} cx={x} cy={50} r="3" fill="#FFD700" opacity={0.9} />
      ))}
      {[90,105,120,135,150].map((x,i) => (
        <circle key={i} cx={x} cy={65} r="1.5" fill="#FFD700" opacity={0.5} />
      ))}
      <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 1,1 ${x2},${y2} Z`} fill="#FFD700" />
      <ellipse cx="150" cy="38" rx="10" ry="11" fill="#FF4444" />
      <rect x="140" y="38" width="20" height="10" fill="#FF4444" />
      <rect x="140" y="46" width="4" height="4" fill="#000" rx="1"/>
      <rect x="148" y="46" width="4" height="4" fill="#000" rx="1"/>
      <rect x="156" y="46" width="4" height="4" fill="#000" rx="1"/>
      <circle cx="147" cy="36" r="3" fill="#fff" />
      <circle cx="154" cy="36" r="3" fill="#fff" />
      <circle cx="148" cy="36" r="1.5" fill="#00f" />
      <circle cx="155" cy="36" r="1.5" fill="#00f" />
      <text x="8" y="20" fill="#FFD700" fontSize="8" fontFamily="monospace">SCORE: ---</text>
    </svg>
  );
}

function TetrisPreview() {
  const blocks: { x: number; y: number; color: string }[] = [
    {x:5,y:0,color:"#FF00FF"},{x:6,y:0,color:"#FF00FF"},{x:6,y:1,color:"#FF00FF"},{x:7,y:1,color:"#FF00FF"},
    {x:3,y:2,color:"#00FFFF"},{x:4,y:2,color:"#00FFFF"},{x:5,y:2,color:"#00FFFF"},{x:6,y:2,color:"#00FFFF"},
    {x:2,y:4,color:"#FF4400"},{x:3,y:4,color:"#FFAA00"},{x:4,y:4,color:"#00FF41"},{x:5,y:4,color:"#FF00FF"},
    {x:6,y:4,color:"#00FFFF"},{x:7,y:4,color:"#FF4400"},{x:8,y:4,color:"#FFAA00"},
    {x:1,y:5,color:"#00FF41"},{x:2,y:5,color:"#FF4400"},{x:3,y:5,color:"#FFAA00"},{x:4,y:5,color:"#FF00FF"},
    {x:5,y:5,color:"#00FFFF"},{x:6,y:5,color:"#FF4400"},{x:7,y:5,color:"#00FF41"},{x:8,y:5,color:"#FFAA00"},{x:9,y:5,color:"#FF4400"},
  ];
  const S = 12;
  return (
    <svg viewBox="0 0 180 100" width="100%" style={{ display: "block" }}>
      <rect width="180" height="100" fill="#000" />
      <rect x="42" y="5" width={S*10+2} height={S*6+2} fill="none" stroke="#333" strokeWidth="1"/>
      {blocks.map((b,i) => (
        <rect key={i} x={42+b.x*S+1} y={5+b.y*S+1} width={S-1} height={S-1} fill={b.color} rx="1"/>
      ))}
      <text x="8" y="20" fill="#00FF41" fontSize="8" fontFamily="monospace">SCORE: ---</text>
    </svg>
  );
}

function SolarPreview() {
  const [pulse, setPulse] = useState(1);
  useEffect(() => {
    let t = 0;
    const id = setInterval(() => { t += 0.08; setPulse(1 + Math.sin(t) * 0.08); }, 40);
    return () => clearInterval(id);
  }, []);
  return (
    <svg viewBox="0 0 180 100" width="100%" style={{ display: "block" }}>
      <defs>
        <radialGradient id="planet" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#4466ff"/>
          <stop offset="60%" stopColor="#1133aa"/>
          <stop offset="100%" stopColor="#000055"/>
        </radialGradient>
        <radialGradient id="star" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffdd00"/>
          <stop offset="100%" stopColor="#ff6600"/>
        </radialGradient>
      </defs>
      <rect width="180" height="100" fill="#000010"/>
      {([[15,12],[40,8],[80,20],[120,5],[160,18],[170,60],[10,75],[50,85],[130,90]] as number[][]).map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%3===0?1.5:1} fill="#fff" opacity={0.5}/>
      ))}
      <circle cx="30" cy="50" r={14*pulse} fill="url(#star)" />
      <circle cx="30" cy="50" r={10*pulse} fill="#ffee44" />
      <circle cx="110" cy="50" r="28" fill="url(#planet)" />
      <ellipse cx="110" cy="50" rx="42" ry="10" fill="none" stroke="#7799ff" strokeWidth="2" opacity={0.5}/>
      <line x1="95" y1="30" x2="125" y2="70" stroke="#FF4444" strokeWidth="2" opacity={0.8}/>
      <line x1="100" y1="25" x2="90" y2="60" stroke="#FF6600" strokeWidth="1.5" opacity={0.7}/>
      <text x="8" y="20" fill="#FF4444" fontSize="8" fontFamily="monospace">SCORE: ---</text>
    </svg>
  );
}

function AsteroidPreview() {
  const [shipX, setShipX] = useState(34);

  useEffect(() => {
    let direction = 1;
    const id = setInterval(() => {
      setShipX((value) => {
        if (value >= 54) {
          direction = -1;
        } else if (value <= 30) {
          direction = 1;
        }

        return value + direction * 1.5;
      });
    }, 40);

    return () => clearInterval(id);
  }, []);

  return (
    <svg viewBox="0 0 180 100" width="100%" style={{ display: "block" }}>
      <rect width="180" height="100" fill="#050914" />
      {([[18,14],[38,10],[68,18],[104,12],[142,16],[162,26],[28,72],[82,86],[144,74]] as number[][]).map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.6 : 1} fill="#fff" opacity={0.7}/>
      ))}
      <circle cx="118" cy="42" r="18" fill="#8b8fa7" />
      <circle cx="142" cy="64" r="10" fill="#6d7388" />
      <circle cx="96" cy="68" r="8" fill="#9ca3bd" />
      <path d={`M${shipX} 52 L${shipX + 10} 46 L${shipX + 6} 52 L${shipX + 10} 58 Z`} fill="#4f7df3" />
      <rect x={shipX + 8} y="51" width="42" height="2" fill="#9ac0ff" opacity="0.8" />
      <text x="10" y="18" fill="#8fb1ff" fontSize="8" fontFamily="monospace">SCORE: 2000</text>
    </svg>
  );
}

// ─── Game Data (no JSX here) ──────────────────────────────────────────────────

interface Game {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  glowColor: string;
  borderColor: string;
  locked: boolean;
  completed?: boolean;
  goal: string;
  reward: string;
  rewardIcon: string;
  completionCriteria: string;
  description: string;
  implemented?: boolean;
}

const MISSION_PROGRESS_STORAGE_KEY = "rr-mission-progress-v1";

const GAMES: Game[] = [
  {
    id: "pacman",
    title: "PAC-MAN",
    subtitle: "MISSION 01",
    color: "#FFD700",
    glowColor: "#FFD700",
    borderColor: "#FFD700",
    locked: false,
    goal: "CLEAR ROUND 2",
    reward: "Breadboard",
    rewardIcon: "🔲",
    completionCriteria: "Level clearance",
    description: "Clear both Pac-Man rounds to unlock the breadboard and open the next mission.",
    implemented: true,
  },
  {
    id: "flappy",
    title: "FLAPPY DRONE",
    subtitle: "MISSION 02",
    color: "#00CFFF",
    glowColor: "#00CFFF",
    borderColor: "#00CFFF",
    locked: false,
    goal: "15 POINTS",
    reward: "Jumper Wires + Resistor",
    rewardIcon: "〰️",
    completionCriteria: "Predefined score",
    description: "Navigate the drone through obstacles and reach 15 points to unlock the next mission.",
    implemented: true,
  },
  {
    id: "tetris",
    title: "TETRIS",
    subtitle: "MISSION 03",
    color: "#00FF41",
    glowColor: "#00FF41",
    borderColor: "#00FF41",
    locked: false,
    goal: "300 POINTS",
    reward: "RGB LED",
    rewardIcon: "💡",
    completionCriteria: "Predefined score",
    description: "Stack the blocks and clear lines. Reach 300 points to unlock the RGB LED reward.",
    implemented: true,
  },
  {
    id: "asteroid",
    title: "ASTEROID DESTROYER",
    subtitle: "MISSION 04",
    color: "#4F7DF3",
    glowColor: "#4F7DF3",
    borderColor: "#4F7DF3",
    locked: false,
    goal: "2000 POINTS",
    reward: "Buzzer",
    rewardIcon: "🔔",
    completionCriteria: "Predefined score",
    description: "Current slot 4 implementation: reach 2000 points in Asteroid Destroyer to claim the buzzer.",
    implemented: true,
  },
];

type MissionProgress = Record<string, boolean>;

function readMissionProgress(): MissionProgress {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(MISSION_PROGRESS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MissionProgress) : {};
  } catch {
    return {};
  }
}

function writeMissionProgress(progress: MissionProgress) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MISSION_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

function buildGames(progress: MissionProgress) {
  return GAMES.map((game, index) => {
    const previousGame = GAMES[index - 1];
    const completed = !!progress[game.id];
    const locked = index > 0 && !progress[previousGame.id];

    return {
      ...game,
      completed,
      locked,
    };
  });
}

// ─── Preview lookup (JSX lives here, separate from data) ─────────────────────

const PREVIEWS: Record<string, React.ReactElement> = { 
  flappy: <FlappyPreview />,
  pacman: <PacmanPreview />,
  tetris: <TetrisPreview />,
  solar:  <SolarPreview />,
  asteroid: <AsteroidPreview />,
};

type PlayableGameProps = {
  onExit: () => void;
  onMissionComplete: () => void;
};

const GAME_COMPONENTS: Partial<Record<string, (props: PlayableGameProps) => React.ReactElement>> = {
  flappy: FlappyDroneGame,
  pacman: PacmanGame,
  tetris: TetrisGame,
  asteroid: AsteroidDestroyerGame,
};

// ─── Lock Overlay ─────────────────────────────────────────────────────────────

function LockOverlay({ reward, rewardIcon }: { reward: string; rewardIcon: string }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "rgba(2,6,12,0.92)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      zIndex: 2,
    }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
      <div style={{ color: "#8cb6c8", fontFamily: "'Press Start 2P', monospace", fontSize: 10, lineHeight: 1.6, letterSpacing: 1, textAlign: "center", padding: "0 12px" }}>
        COMPLETE PREVIOUS MISSION
      </div>
      <div style={{
        marginTop: 14, padding: "8px 14px",
        border: "2px solid #38576b",
        color: "#7ef3ff", fontFamily: "monospace", fontSize: 10,
        letterSpacing: 1, textAlign: "center",
        background: "#08131f",
      }}>
        REWARD: {rewardIcon} {reward.toUpperCase()}
      </div>
    </div>
  );
}

// ─── Game Card ────────────────────────────────────────────────────────────────

function GameCard({ game, onSelect, isActive }: { game: Game; onSelect: (g: Game) => void; isActive: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => !game.locked && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !game.locked && onSelect(game)}
      style={{
        position: "relative",
        border: `2px solid ${game.locked ? "#333" : hovered ? game.color : game.borderColor}`,
        borderRadius: 0,
        background: game.locked
          ? "#0c1117"
          : "#08131f",
        overflow: "hidden",
        cursor: game.locked ? "not-allowed" : "pointer",
        boxShadow: game.locked ? "none" : hovered
          ? `6px 6px 0 #02060d, 0 0 0 2px ${game.color}22 inset`
          : "6px 6px 0 #02060d",
        transform: hovered && !game.locked ? "translate(-2px, -2px)" : "translate(0, 0)",
        transition: "transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease",
        filter: game.locked ? "brightness(0.55)" : "brightness(1)",
        animation: !game.locked && isActive ? "borderPulse 1.5s ease-in-out infinite" : "none",
      }}
    >
      {/* Title bar */}
      <div style={{
        padding: "10px 16px",
        background: game.locked
          ? "#111"
          : `${game.color}22`,
        borderBottom: `2px solid ${game.locked ? "#222" : game.color}55`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 11,
          color: game.locked ? "#444" : game.color,
          letterSpacing: 2,
        }}>{game.title}</span>
        <span style={{
          fontFamily: "monospace",
          fontSize: 9,
          color: game.locked ? "#333" : `${game.color}99`,
          letterSpacing: 1,
        }}>{game.completed ? "COMPLETE" : game.subtitle}</span>
      </div>

      {/* Preview */}
      <div style={{ position: "relative", height: 120, background: "#020810" }}>
        {PREVIEWS[game.id]}
        {!game.locked && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(0deg, rgba(0,0,0,0.18), rgba(0,0,0,0.18)), repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 10px), repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 10px)",
              pointerEvents: "none",
            }}
          />
        )}
        {game.locked && <LockOverlay reward={game.reward} rewardIcon={game.rewardIcon} />}
      </div>

      {/* Footer */}
      <div style={{
        padding: "8px 16px",
        background: "#050d1a",
        borderTop: `2px solid ${game.locked ? "#1a1a1a" : game.color}22`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 1, color: game.locked ? "#333" : "#777" }}>
          GOAL: {game.goal}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 1, color: game.locked ? "#333" : `${game.color}cc` }}>
          {game.rewardIcon} {game.reward}
        </span>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function GameModal({
  game,
  onClose,
  onPlay,
}: {
  game: Game | null;
  onClose: () => void;
  onPlay: (game: Game) => void;
}) {
  if (!game) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#07111f",
          border: `2px solid ${game.color}`,
          boxShadow: `0 0 40px ${game.color}66`,
          borderRadius: 8,
          padding: 32,
          maxWidth: 480,
          width: "90%",
          fontFamily: "monospace",
        }}
      >
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          color: game.color,
          fontSize: 18,
          letterSpacing: 3,
          marginBottom: 6,
          textShadow: `0 0 20px ${game.color}`,
        }}>{game.title}</div>
        <div style={{ color: `${game.color}88`, fontSize: 10, letterSpacing: 2, marginBottom: 20 }}>
          {game.subtitle} — STATUS: {game.completed ? "COMPLETED" : "UNLOCKED"}
        </div>

        <div style={{ height: 180, border: `1px solid ${game.color}33`, borderRadius: 4, marginBottom: 20, overflow: "hidden" }}>
          {PREVIEWS[game.id]}
        </div>

        <p style={{ color: "#8899aa", fontSize: 12, lineHeight: 1.7, marginBottom: 20 }}>
          {game.description}
        </p>

        <div style={{
          background: `${game.color}11`,
          border: `1px solid ${game.color}44`,
          borderRadius: 4, padding: "12px 16px",
          marginBottom: 24,
        }}>
          <div style={{ color: "#556", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>COMPLETION REWARD</div>
          <div style={{ color: game.color, fontSize: 13, letterSpacing: 1 }}>
            {game.rewardIcon} {game.reward}
          </div>
          <div style={{ color: "#556", fontSize: 10, marginTop: 4 }}>
            Criteria: {game.completionCriteria} • Goal: {game.goal}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{
              flex: 1, padding: "12px 0",
              background: game.implemented ? game.color : "transparent",
              color: game.implemented ? "#000" : "#667788",
              border: game.implemented ? "none" : "1px solid #334455", borderRadius: 4,
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 9, letterSpacing: 1,
              cursor: game.implemented ? "pointer" : "not-allowed",
            }}
            onClick={() => game.implemented && onPlay(game)}
          >
            {game.implemented ? "PLAY GAME" : "COMING SOON"}
          </button>
          <button
            style={{
              padding: "12px 16px",
              background: "transparent",
              color: "#556",
              border: "1px solid #223",
              borderRadius: 4,
              fontFamily: "monospace", fontSize: 11,
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

function GamePlayer({
  game,
  onExit,
  onMissionComplete,
}: {
  game: Game | null;
  onExit: () => void;
  onMissionComplete: (gameId: string) => void;
}) {
  if (!game) return null;

  const GameComponent = GAME_COMPONENTS[game.id];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 200,
      background: "#020810",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: `1px solid ${game.color}44`,
        background: "#050d1a",
        boxShadow: `0 10px 30px ${game.color}22`,
      }}>
        <div>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 12,
            color: game.color,
            letterSpacing: 2,
            marginBottom: 6,
          }}>
            {game.title}
          </div>
          <div style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "#7f8ea3",
            letterSpacing: 1,
          }}>
            GOAL: {game.goal} | REWARD: {game.reward}
          </div>
        </div>

        <button
          onClick={onExit}
          style={{
            padding: "10px 14px",
            border: `1px solid ${game.color}55`,
            background: "transparent",
            color: game.color,
            borderRadius: 4,
            fontFamily: "monospace",
            letterSpacing: 1,
            cursor: "pointer",
          }}
        >
          EXIT GAME
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {GameComponent ? (
          <GameComponent
            onExit={onExit}
            onMissionComplete={() => onMissionComplete(game.id)}
          />
        ) : (
          <div style={{
            height: "100%",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}>
            <div style={{
              maxWidth: 560,
              textAlign: "center",
              border: "1px solid #22354d",
              background: "#07111f",
              padding: 24,
              borderRadius: 8,
              fontFamily: "monospace",
            }}>
              <div style={{
                color: game.color,
                fontSize: 14,
                letterSpacing: 2,
                marginBottom: 12,
              }}>
                GAME NOT WIRED YET
              </div>
              <div style={{ color: "#91a0b5", fontSize: 12, lineHeight: 1.7 }}>
                Add the React game component for {game.title} to the launcher map and it will render here.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Circuit Progress Bar ─────────────────────────────────────────────────────

function CircuitProgress({ completedCount, totalCount }: { completedCount: number; totalCount: number }) {
  const value = Math.round((completedCount / totalCount) * 100);

  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: 32,
        background: "#08131f",
        border: "2px solid #12425a",
        borderRadius: 0,
        boxShadow: "8px 8px 0 #02060d",
        padding: "24px 20px 18px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(255,255,255,0.03) 11px, rgba(255,255,255,0.03) 12px), repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(255,255,255,0.03) 11px, rgba(255,255,255,0.03) 12px)",
          pointerEvents: "none",
        }}
      />
      <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 4, color: "#00FF41", marginBottom: 10, position: "relative" }}>
        CIRCUIT PROGRESS
      </div>
      <div style={{
        position: "relative",
        height: 24, width: "100%", maxWidth: 420, margin: "0 auto",
        background: "#0a1a0a",
        border: "2px solid #00FF4144",
        borderRadius: 0,
        overflow: "hidden",
      }}>
        <div style={{
          width: `${value}%`,
          height: "100%",
          background: "repeating-linear-gradient(90deg, #00aa22 0 14px, #00FF41 14px 28px)",
          transition: "width 0.6s ease",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)",
          }}/>
        </div>
        <span style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "monospace", fontSize: 11, color: "#fff",
          letterSpacing: 2, mixBlendMode: "difference",
        }}>{value}%</span>
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 9, color: "#446", marginTop: 8, letterSpacing: 2, position: "relative" }}>
        {completedCount} / {totalCount} MISSIONS COMPLETE
      </div>
    </div>
  );
}

// ─── Scanlines ────────────────────────────────────────────────────────────────

function Scanlines() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50,
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px)",
    }} />
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────

const STAR_DATA = Array.from({ length: 60 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() < 0.2 ? 2 : 1,
  op: 0.2 + Math.random() * 0.6,
}));

function Stars() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {STAR_DATA.map((s, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size * 2, height: s.size * 2,
          background: "#fff",
          opacity: s.op,
        }} />
      ))}
    </div>
  );
}

function CircuitDecor() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        opacity: 0.42,
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="rr-wire-a" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00CFFF" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#7ef3ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00FF41" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="rr-wire-b" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00FF41" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#00CFFF" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        <path
          d="M-20 140 C 220 140, 260 280, 470 280 L 720 280 C 820 280, 860 210, 940 210 L 1260 210"
          stroke="url(#rr-wire-a)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="square"
        />
        <path
          d="M1210 -20 L1210 180 C1210 260, 1110 260, 1110 340 L1110 540 C1110 650, 1290 650, 1290 790 L1290 1020"
          stroke="url(#rr-wire-b)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="square"
        />
        <path
          d="M180 1020 L180 760 C180 650, 340 650, 340 560 L340 470 C340 370, 520 370, 520 310"
          stroke="url(#rr-wire-b)"
          strokeWidth="7"
          fill="none"
          strokeLinecap="square"
        />
        <path
          d="M680 1020 L680 820 C680 760, 760 760, 760 700 L760 620 C760 560, 880 560, 880 490"
          stroke="url(#rr-wire-a)"
          strokeWidth="7"
          fill="none"
          strokeLinecap="square"
        />

        {[
          { x: 500, y: 250, rot: 0 },
          { x: 1100, y: 570, rot: -90 },
          { x: 270, y: 620, rot: 90 },
          { x: 860, y: 470, rot: 0 },
        ].map((resistor, index) => (
          <g
            key={index}
            transform={`translate(${resistor.x} ${resistor.y}) rotate(${resistor.rot})`}
            opacity="0.65"
          >
            <line x1="-56" y1="0" x2="-24" y2="0" stroke="#7ef3ff" strokeWidth="4" strokeLinecap="round" />
            <line x1="24" y1="0" x2="56" y2="0" stroke="#7ef3ff" strokeWidth="4" strokeLinecap="round" />
            <rect
              x="-24"
              y="-12"
              width="48"
              height="24"
              shapeRendering="crispEdges"
              fill="#d7c089"
              fillOpacity="0.28"
              stroke="#ffd700"
              strokeOpacity="0.65"
              strokeWidth="2"
            />
            <line x1="-12" y1="-12" x2="-12" y2="12" stroke="#ff7a00" strokeWidth="4" />
            <line x1="0" y1="-12" x2="0" y2="12" stroke="#8b5cf6" strokeWidth="4" />
            <line x1="12" y1="-12" x2="12" y2="12" stroke="#00FF41" strokeWidth="4" />
          </g>
        ))}

        {[
          { cx: 470, cy: 280, color: "#00FF41" },
          { cx: 940, cy: 210, color: "#00CFFF" },
          { cx: 1110, cy: 340, color: "#7ef3ff" },
          { cx: 340, cy: 560, color: "#00FF41" },
          { cx: 760, cy: 700, color: "#00CFFF" },
        ].map((node, index) => (
          <g key={index}>
            <circle cx={node.cx} cy={node.cy} r="8" fill={node.color} fillOpacity="0.3" />
            <circle cx={node.cx} cy={node.cy} r="3" fill={node.color} fillOpacity="0.8" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function CabinetFrame() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 14,
          background: "repeating-linear-gradient(90deg, #003346 0 24px, #00CFFF 24px 48px, #7ef3ff 48px 72px, #00CFFF 72px 96px)",
          boxShadow: "0 4px 0 #02060d",
          zIndex: 60,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: "14px 12px 12px",
          border: "2px solid rgba(0,207,255,0.22)",
          boxShadow: "inset 0 0 0 1px rgba(126,243,255,0.06)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    </>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function RetroRumble() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [missionProgress, setMissionProgress] = useState<MissionProgress>(() => readMissionProgress());

  const games = buildGames(missionProgress);
  const completedCount = games.filter((game) => game.completed).length;
  const activeMission = games.find((game) => !game.completed);

  const handleMissionComplete = (gameId: string) => {
    setMissionProgress((current) => {
      if (current[gameId]) {
        return current;
      }

      const next = { ...current, [gameId]: true };
      writeMissionProgress(next);
      return next;
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #020810; min-height: 100vh; }
        body {
          background: #020810;
          color: #dffaff;
          image-rendering: pixelated;
        }
        @keyframes borderPulse {
          0%, 100% { box-shadow: 6px 6px 0 #02060d; }
          50% { box-shadow: 6px 6px 0 #02060d, 0 0 0 2px #00CFFF66 inset; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
        ::-webkit-scrollbar { width: 6px; background: #020810; }
        ::-webkit-scrollbar-thumb { background: #0a2a0a; }
      `}</style>

      <CabinetFrame />
      <Scanlines />
      <Stars />
      <CircuitDecor />

      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", padding: "24px 0 40px" }}>

        {/* Header */}
        <div style={{
          padding: "8px 24px 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          minHeight: 72,
          position: "relative",
        }}>
          <div style={{ width: 70 }} />
          <div style={{ flex: 1, padding: "0 18px", position: "relative" }}>
            <h1 style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "clamp(12px, 2.2vw, 20px)",
              color: "#dffaff",
              letterSpacing: 3,
              textAlign: "center",
              textShadow: "2px 2px 0 #003346",
            }}>
              RETRO RUMBLE.EXE
            </h1>
            <div style={{ color: "#00CFFF", fontFamily: "monospace", fontSize: 10, letterSpacing: 2, paddingTop: 10, textAlign: "center" }}>
              HIGH SCORE ARCADE // BUILD THE CIRCUIT
            </div>
          </div>
          <div
            style={{
              width: 70,
              textAlign: "right",
              fontFamily: "monospace",
              color: "#7ef3ff",
              fontSize: 10,
              letterSpacing: 2,
              lineHeight: 1.6,
              position: "relative",
            }}
          >
            <div />
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "36px 20px 0",
          }}
        >

          <CircuitProgress completedCount={completedCount} totalCount={games.length} />

          {/* Active mission banner */}
          <div style={{
            border: `2px solid ${(activeMission?.color ?? "#00FF41")}55`,
            background: "#08131f",
            borderRadius: 0,
            padding: "16px 20px",
            marginBottom: 28,
            display: "flex", alignItems: "center", gap: 12,
            fontFamily: "monospace",
            boxShadow: "8px 8px 0 #02060d",
          }}>
            <span style={{ color: activeMission?.color ?? "#00FF41", fontSize: 13, animation: "blink 1.2s step-end infinite" }}>▶</span>
            <div>
              <span style={{ color: activeMission?.color ?? "#00FF41", fontSize: 10, letterSpacing: 2 }}>ACTIVE MISSION: </span>
              <span style={{ color: "#fff", fontSize: 11, letterSpacing: 1 }}>
                {activeMission
                  ? `${activeMission.title} — ${activeMission.completionCriteria}: ${activeMission.goal}`
                  : "ALL MISSIONS COMPLETE — Circuit build is fully unlocked"}
              </span>
            </div>
          </div>

          {/* Game grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}>
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelect={setSelectedGame}
                isActive={activeMission?.id === game.id}
              />
            ))}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 40, textAlign: "center",
            fontFamily: "monospace", fontSize: 9,
            color: "#223", letterSpacing: 2,
          }}>
            ACM SIGBED © 2026 — INSERT COIN TO CONTINUE
          </div>
        </div>
      </div>

      <GameModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onPlay={(game) => {
          setSelectedGame(null);
          setActiveGame(game);
        }}
      />
      <GamePlayer
        game={activeGame}
        onExit={() => setActiveGame(null)}
        onMissionComplete={handleMissionComplete}
      />
    </>
  );
}
