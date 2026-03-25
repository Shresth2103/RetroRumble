import { useEffect, useRef } from "react";
import { mountAsteroidDestroyer } from "./asteroidDestroyer";

type AsteroidDestroyerGameProps = {
  onExit: () => void;
};

export default function AsteroidDestroyerGame({
  onExit,
}: AsteroidDestroyerGameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const app = mountAsteroidDestroyer(containerRef.current, {
      autoStart: false,
    });

    return () => {
      app.destroy();
    };
  }, []);

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        position: "relative",
        background:
          "radial-gradient(circle at top left, rgba(79,125,243,0.14), transparent 30%), radial-gradient(circle at 80% 25%, rgba(255,255,255,0.08), transparent 18%), #020810",
      }}
    >
      <button
        onClick={onExit}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 40,
          padding: "10px 14px",
          border: "1px solid rgba(79,125,243,0.45)",
          background: "rgba(5,13,26,0.88)",
          color: "#8fb1ff",
          borderRadius: 4,
          fontFamily: "monospace",
          letterSpacing: 1,
          cursor: "pointer",
        }}
      >
        BACK TO HUB
      </button>

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "calc(100vh - 69px)",
        }}
      />
    </div>
  );
}
