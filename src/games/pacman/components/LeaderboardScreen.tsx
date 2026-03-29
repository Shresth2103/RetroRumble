interface LeaderboardScreenProps {
  currentScore: number;
  teamName: string;
  onRestart: () => void;
  onNextGame: () => void;
  isGameOver: boolean; // Distinction between just viewing scores vs dying
  isVictory?: boolean;
  hasNextGame: boolean;
  nextGameLabel: string | null;
}

const LeaderboardScreen = ({ currentScore, teamName, onRestart, onNextGame, isGameOver, isVictory, hasNextGame, nextGameLabel }: LeaderboardScreenProps) => {
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

      <div className="bg-gray-900 border-4 sm:border-8 border-blue-900 rounded-xl px-6 py-5 sm:px-10 sm:py-8 w-full max-w-xl shadow-2xl text-center">
        <h3 className="text-xl sm:text-2xl md:text-3xl text-blue-300 pixel-font underline decoration-4 underline-offset-8 drop-shadow-md leading-relaxed">
          MISSION STATUS
        </h3>
        <p className="text-sm sm:text-lg md:text-xl text-white pixel-font mt-6 leading-relaxed">
          TEAM: <span className="text-yellow-400">{teamName}</span>
        </p>
        <p className="text-sm sm:text-lg md:text-xl text-white pixel-font mt-4 leading-relaxed">
          FINAL SCORE: <span className="text-green-400">{currentScore}</span>
        </p>
        {isGameOver && (
          <p className="text-xs sm:text-sm md:text-base text-red-300 pixel-font mt-5 leading-relaxed">
            TRY AGAIN TO CLEAR ROUND 2
          </p>
        )}
        {isVictory && (
          <p className="text-xs sm:text-sm md:text-base text-green-300 pixel-font mt-5 leading-relaxed">
            BREADBOARD UNLOCKED
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        {isVictory && hasNextGame && (
          <div className="flex flex-col items-center gap-2">
            <div className="pixel-font text-[10px] sm:text-sm text-green-300 tracking-wider">
              NEXT: {nextGameLabel ?? 'NEXT GAME'}
            </div>
            <button
              onClick={onNextGame}
              className="bg-green-500 hover:bg-green-400 text-black font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-lg pixel-font text-sm sm:text-lg md:text-xl transition-transform active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
            >
              {nextGameLabel ? `PLAY ${nextGameLabel}` : 'NEXT GAME'}
            </button>
          </div>
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
