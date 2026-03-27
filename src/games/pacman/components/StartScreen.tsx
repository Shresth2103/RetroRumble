interface StartScreenProps {
  onStart: (teamName: string) => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
  const handleStart = () => {
    onStart('PLAYER');
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 animate-fade-in w-full">
      <h1 className="text-6xl md:text-7xl text-yellow-400 font-bold tracking-widest text-shadow-retro pixel-font text-center leading-snug drop-shadow-[0_4px_8px_rgba(250,204,21,0.5)]">
        PAC-MAN<br/>GHOST HUNT
      </h1>
      
      <div className="bg-gray-800 p-10 md:p-14 rounded-xl border-8 border-blue-800 shadow-2xl w-full max-w-2xl">
        <div className="flex flex-col space-y-10">
          <button
            onClick={handleStart}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 px-8 rounded-lg pixel-font text-xl md:text-2xl transition-all hover:scale-105 shadow-lg"
          >
            INSERT COIN (START)
          </button>
        </div>
      </div>
      
      <div className="text-gray-400 text-sm md:text-lg mt-8 pixel-font text-center max-w-3xl leading-relaxed opacity-80">
        <span className="text-yellow-300">MISSION:</span> EAT POWER PELLETS TO HUNT GHOSTS.<br/>
        CLEAR THE ROUND BY ELIMINATING ALL GHOSTS!
      </div>
    </div>
  );
};

export default StartScreen;