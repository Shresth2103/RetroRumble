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
  nextGameLabel: string | null;
};

function ensureTailwindLoaded(onReady: () => void) {
  if (typeof document === 'undefined') {
    onReady();
    return;
  }

  const existingScript = document.getElementById('rr-tailwind-cdn') as HTMLScriptElement | null;
  if (existingScript?.dataset.ready === 'true') {
    onReady();
    return;
  }

  const handleReady = () => {
    const script = document.getElementById('rr-tailwind-cdn') as HTMLScriptElement | null;
    if (script) {
      script.dataset.ready = 'true';
    }
    onReady();
  };

  if (existingScript) {
    existingScript.addEventListener('load', handleReady, { once: true });
    return;
  }

  if (!document.getElementById('rr-tailwind-config')) {
    const configScript = document.createElement('script');
    configScript.id = 'rr-tailwind-config';
    configScript.text = `
      window.tailwind = window.tailwind || {};
      window.tailwind.config = {
        corePlugins: { preflight: false }
      };
    `;
    document.head.appendChild(configScript);
  }

  const tailwindScript = document.createElement('script');
  tailwindScript.id = 'rr-tailwind-cdn';
  tailwindScript.src = 'https://cdn.tailwindcss.com';
  tailwindScript.async = true;
  tailwindScript.addEventListener('load', handleReady, { once: true });
  document.head.appendChild(tailwindScript);
}

export default function PacmanGame({ onMissionComplete, onNextGame, hasNextGame, nextGameLabel }: PacmanGameProps) {
  const [status, setStatus] = useState<GameStatus>('START');
  const [teamName, setTeamName] = useState('PLAYER');
  const [finalScore, setFinalScore] = useState(0);
  const [tailwindReady, setTailwindReady] = useState(false);

  useEffect(() => {
    ensureTailwindLoaded(() => setTailwindReady(true));
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
        {!tailwindReady && (
          <div className="rr-pacman-loading pixel-font">
            LOADING PAC-MAN UI...
          </div>
        )}

        {tailwindReady && status === 'START' && <StartScreen onStart={handleStartGame} />}

        {tailwindReady && status === 'PLAYING' && (
          <GameScreen
            teamName={teamName}
            onGameOver={handleGameOver}
            onGameWin={handleGameWin}
          />
        )}

        {tailwindReady && status === 'BREADBOARD' && (
          <BreadboardScreen onContinue={handleBreadboardContinue} />
        )}

        {tailwindReady && (status === 'VICTORY' || status === 'LEADERBOARD') && (
          <LeaderboardScreen
            currentScore={finalScore}
            teamName={teamName}
            onRestart={handleRestart}
            onNextGame={onNextGame}
            isGameOver={status === 'LEADERBOARD'}
            isVictory={status === 'VICTORY'}
            hasNextGame={hasNextGame}
            nextGameLabel={nextGameLabel}
          />
        )}
      </div>
    </div>
  );
}
