interface BreadboardScreenProps {
  onContinue: () => void;
}

const BreadboardScreen = ({ onContinue }: BreadboardScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto space-y-8 animate-fade-in p-6">
      <div className="text-center mb-8 scale-110">
        <h2 className="text-6xl md:text-7xl font-bold mb-6 pixel-font drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] text-green-400">
          CONGRATULATIONS!
        </h2>
        <p className="text-4xl md:text-5xl text-yellow-300 mb-6 pixel-font animate-pulse tracking-wide">
          YOU HAVE UNLOCKED BREADBOARD
        </p>
      </div>

      <div className="bg-gray-900 border-8 border-green-600 rounded-xl p-8 w-full max-w-3xl shadow-2xl">
        <div className="text-center space-y-6">
          <h3 className="text-3xl md:text-4xl text-green-300 pixel-font underline decoration-4 underline-offset-8 drop-shadow-md">
            WHAT IS BREADBOARD?
          </h3>
          <div className="text-lg md:text-xl text-white pixel-font leading-relaxed space-y-4">
            <p>
              Breadboard is a powerful visual programming tool that allows you to create interactive applications
              without writing traditional code. It's like building with digital building blocks!
            </p>
            <p>
              With Breadboard, you can:
            </p>
            <ul className="text-left list-disc list-inside space-y-2 ml-8">
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
        className="mt-10 bg-green-600 hover:bg-green-500 text-white font-bold py-6 px-12 rounded-lg pixel-font text-xl md:text-2xl transition-transform active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
      >
        CONTINUE TO VICTORY
      </button>
    </div>
  );
};

export default BreadboardScreen;