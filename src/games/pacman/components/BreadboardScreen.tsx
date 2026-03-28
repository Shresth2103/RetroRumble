interface BreadboardScreenProps {
  onContinue: () => void;
}

const BreadboardScreen = ({ onContinue }: BreadboardScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-start w-full max-w-4xl mx-auto space-y-6 animate-fade-in px-4 py-6">
      <div className="text-center mb-2 w-full">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 pixel-font drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] text-green-400 leading-tight">
          CONGRATULATIONS!
        </h2>
        <p className="text-xl sm:text-2xl md:text-3xl text-yellow-300 mb-4 pixel-font animate-pulse tracking-wide leading-relaxed">
          YOU HAVE UNLOCKED BREADBOARD
        </p>
      </div>

      <div className="bg-gray-900 border-4 sm:border-8 border-green-600 rounded-xl p-4 sm:p-6 w-full max-w-3xl shadow-2xl">
        <div className="text-center space-y-4 sm:space-y-6">
          <h3 className="text-xl sm:text-2xl md:text-3xl text-green-300 pixel-font underline decoration-4 underline-offset-8 drop-shadow-md leading-relaxed">
            WHAT IS BREADBOARD?
          </h3>
          <div className="text-xs sm:text-sm md:text-base text-white pixel-font leading-7 sm:leading-8 space-y-4">
            <p>
              Breadboard is a powerful visual programming tool that allows you to create interactive applications
              without writing traditional code. It's like building with digital building blocks!
            </p>
            <p>
              With Breadboard, you can:
            </p>
            <ul className="text-left list-disc list-inside space-y-2 ml-2 sm:ml-6">
              <li>Design user interfaces by dragging and dropping components</li>
              <li>Connect different parts of your app with visual wires</li>
              <li>Test and prototype ideas quickly</li>
              <li>Build complex applications without coding knowledge</li>
            </ul>
            <p className="text-yellow-300 font-bold">
              Perfect for rapid prototyping and bringing your creative ideas to life!
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="mt-4 bg-green-600 hover:bg-green-500 text-white font-bold py-4 sm:py-5 px-6 sm:px-10 rounded-lg pixel-font text-sm sm:text-lg md:text-xl transition-transform active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.6)] text-center"
      >
        CONTINUE TO VICTORY
      </button>
    </div>
  );
};

export default BreadboardScreen;
