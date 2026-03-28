import { useEffect, useState } from 'react';
import type { HighScore } from '../types';
import { getLeaderboard } from '../utils/storage';

interface LeaderboardScreenProps {
  currentScore: number;
  teamName: string;
  onRestart: () => void;
  onNextGame: () => void;
  isGameOver: boolean; // Distinction between just viewing scores vs dying
  isVictory?: boolean;
  hasNextGame: boolean;
}

const LeaderboardScreen = ({ currentScore, teamName, onRestart, onNextGame, isGameOver, isVictory, hasNextGame }: LeaderboardScreenProps) => {
  const [scores, setScores] = useState<HighScore[]>([]);

  useEffect(() => {
    setScores(getLeaderboard());
  }, []);

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-3xl mx-auto space-y-6 animate-fade-in px-4 py-6">
      {isVictory && (
        <div className="text-center mb-4 w-full">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 pixel-font drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] text-green-400 leading-tight">
            MISSION COMPLETE
          </h2>
          <p className="text-sm sm:text-xl md:text-2xl text-yellow-300 mb-4 pixel-font animate-pulse tracking-wide leading-relaxed">
            ALL GHOSTS ELIMINATED!
          </p>
          <p className="text-lg sm:text-2xl md:text-3xl text-white pixel-font leading-relaxed">
            TEAM: <span className="text-yellow-400">{teamName}</span>
          </p>
          <p className="text-base sm:text-xl md:text-2xl text-white mt-3 pixel-font leading-relaxed">
            FINAL SCORE: <span className="text-green-400">{currentScore}</span>
          </p>
        </div>
      )}

      <div className="bg-gray-900 border-4 sm:border-8 border-blue-900 rounded-xl p-4 sm:p-8 w-full shadow-2xl">
        <h3 className="text-xl sm:text-2xl md:text-3xl text-blue-300 text-center mb-6 pixel-font underline decoration-4 underline-offset-8 drop-shadow-md leading-relaxed">
          TOP 5 TEAMS
        </h3>
        <div className="space-y-4 sm:space-y-6 overflow-x-auto">
          <div className="grid grid-cols-3 text-gray-400 text-[10px] sm:text-sm md:text-lg border-b-2 border-gray-700 pb-4 pixel-font tracking-wider min-w-[280px]">
            <span className="text-left">RANK</span>
            <span className="text-center">TEAM</span>
            <span className="text-right">SCORE</span>
          </div>
          {scores.map((s, idx) => (
            <div key={idx} className={`grid grid-cols-3 pixel-font text-sm sm:text-lg md:text-2xl py-2 min-w-[280px] ${s.teamName === teamName && s.score === currentScore && isGameOver ? 'text-yellow-300 animate-pulse font-bold' : 'text-white'}`}>
              <span className="text-left">#{idx + 1}</span>
              <span className="text-center">{s.teamName}</span>
              <span className="text-right">{s.score}</span>
            </div>
          ))}
          {scores.length === 0 && (
            <div className="text-center text-gray-500 py-6 pixel-font text-lg">NO SCORES YET</div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        {isVictory && hasNextGame && (
          <button
            onClick={onNextGame}
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-lg pixel-font text-sm sm:text-lg md:text-xl transition-transform active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
          >
            NEXT GAME
          </button>
        )}
        <button
          onClick={onRestart}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 sm:py-5 px-6 sm:px-10 rounded-lg pixel-font text-sm sm:text-lg md:text-2xl transition-transform active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.6)]"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
