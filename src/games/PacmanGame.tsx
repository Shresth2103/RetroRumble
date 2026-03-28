import { useEffect, useState } from 'react';
import StartScreen from './pacman/components/StartScreen';
import GameScreen from './pacman/screens/GameScreen';
import LeaderboardScreen from './pacman/components/LeaderboardScreen';
import BreadboardScreen from './pacman/components/BreadboardScreen';
import type { GameStatus } from './pacman/types';
import './pacman/pacman.css';

type PacmanGameProps = {
  onExit: () => void;
  onMissionComplete: () => void;
  onNextGame: () => void;
  hasNextGame: boolean;
};

function ensureTailwindLoaded() {
  if (typeof document === 'undefined') {
    return;
  }

  if (!document.getElementById('rr-tailwind-cdn')) {
    const configScript = document.createElement('script');
    configScript.id = 'rr-tailwind-config';
    configScript.text = `
      window.tailwind = window.tailwind || {};
      window.tailwind.config = {
        corePlugins: { preflight: false }
      };
    `;
    document.head.appendChild(configScript);

    const tailwindScript = document.createElement('script');
    tailwindScript.id = 'rr-tailwind-cdn';
    tailwindScript.src = 'https://cdn.tailwindcss.com';
    tailwindScript.async = true;
    document.head.appendChild(tailwindScript);
  }
}

export default function PacmanGame({ onExit: _onExit, onMissionComplete, onNextGame, hasNextGame }: PacmanGameProps) {
  const [status, setStatus] = useState<GameStatus>('START');
  const [teamName, setTeamName] = useState('PLAYER');
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    ensureTailwindLoaded();
  }, []);

  const handleStartGame = (name: string) => {
    setTeamName(name);
    setStatus('PLAYING');
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setStatus('LEADERBOARD');
  };

  const handleGameWin = (score: number) => {
    setFinalScore(score);
    onMissionComplete();
    setStatus('BREADBOARD');
  };

  const handleBreadboardContinue = () => {
    setStatus('VICTORY');
  };

  const handleRestart = () => {
    setStatus('START');
    setFinalScore(0);
  };

  return (
    <div className="rr-pacman-root">
      <div className="rr-pacman-shell">
        {status === 'START' && <StartScreen onStart={handleStartGame} />}

        {status === 'PLAYING' && (
          <GameScreen
            teamName={teamName}
            onGameOver={handleGameOver}
            onGameWin={handleGameWin}
          />
        )}

        {status === 'BREADBOARD' && (
          <BreadboardScreen onContinue={handleBreadboardContinue} />
        )}

        {(status === 'VICTORY' || status === 'LEADERBOARD') && (
          <LeaderboardScreen
            currentScore={finalScore}
            teamName={teamName}
            onRestart={handleRestart}
            onNextGame={onNextGame}
            isGameOver={status === 'LEADERBOARD'}
            isVictory={status === 'VICTORY'}
            hasNextGame={hasNextGame}
          />
        )}
      </div>
    </div>
  );
}
