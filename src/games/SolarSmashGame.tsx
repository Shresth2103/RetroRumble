type SolarSmashGameProps = {
  onExit: () => void;
};

export default function SolarSmashGame({ onExit }: SolarSmashGameProps) {
  return (
    <div
      style={{
        minHeight: "100%",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(circle at top left, rgba(255,110,64,0.18), transparent 28%), radial-gradient(circle at 70% 30%, rgba(68,102,255,0.22), transparent 32%), #020810",
      }}
    >
      <div
        style={{
          width: "min(960px, 100%)",
          minHeight: 520,
          border: "1px solid #2c4469",
          borderRadius: 12,
          background: "rgba(5, 13, 26, 0.92)",
          boxShadow: "0 0 40px rgba(68, 102, 255, 0.18)",
          padding: 32,
          color: "#dce7f7",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 24, color: "#ff8844", letterSpacing: 2, marginBottom: 12 }}>
          SOLAR SMASH
        </div>
        <div style={{ color: "#91a0b5", lineHeight: 1.8, marginBottom: 24 }}>
          This file is the mounting point for your real Solar Smash game. Replace this placeholder UI with
          your existing game component, state, canvas, controls, and scoring logic.
        </div>

        <div
          style={{
            border: "1px dashed #3d5d8c",
            borderRadius: 10,
            padding: 24,
            background: "rgba(7, 17, 31, 0.85)",
            marginBottom: 20,
          }}
        >
          <div style={{ color: "#ffcc66", marginBottom: 10 }}>Where to paste your game</div>
          <div style={{ color: "#91a0b5", lineHeight: 1.7 }}>
            Keep the exported component name as <code>SolarSmashGame</code>. The launcher already imports this
            file from <code>src/RetroRumble.tsx</code> and passes an <code>onExit</code> callback you can use for
            an in-game back button if you want.
          </div>
        </div>

        <button
          onClick={onExit}
          style={{
            padding: "12px 16px",
            background: "#ff8844",
            color: "#081018",
            border: "none",
            borderRadius: 6,
            fontFamily: "monospace",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
