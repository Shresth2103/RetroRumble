🎮 ACM SIGBED — RETRO RUMBLE.EXE
A retro pixel-art arcade dashboard for the ACM SIGBED Retro Rumble event. Players complete 4 mini-games and collect electronic components as rewards.

📁 Project Structure

retro-rumble/
├── public/
├── src/
│   ├── App.jsx          ← Main dashboard component
│   ├── App.css          ← Global styles
│   └── main.jsx         ← React entry point
├── index.html
├── package.json
└── vite.config.js
🚀 Getting Started
1. Install dependencies

bash
npm install
2. Start the dev server

bash
npm run dev
3. Build for production

bash
npm run build
🎮 The 4 Games
Card	Game	Reward Component
Top Left	Pac-Man	Breadboard
Top Right	Tetris	Resistors
Bottom Left	Flappy Bird	Jumper Wires
Bottom Right	Solar Smash	LED Kit
🔧 How to Hook Up a Game (for team members)
Each game card has an onClick handler. Find the handleGameClick function in App.jsx and add your route:


jsx
const handleGameClick = (game) => {
  // Replace with your game routing
  const gameRoutes = {
    pacman:  '/games/pacman',
    tetris:  '/games/tetris',
    flappy:  '/games/flappy',
    solar:   '/games/solar',
  };
  navigate(gameRoutes[game]); // if using React Router
  // or
  window.location.href = gameRoutes[game];
};
If you're using React Router, install it first:


bash
npm install react-router-dom
✏️ Customisation
What	Where
Event name / date / venue	Bottom section in App.jsx
Progress bar percentage	progressValue state in App.jsx
Reward component names	rewardLabel prop on each GameCard
Color palette	CSS variables in App.css under :root
Game card click behaviour	handleGameClick() in App.jsx
🎨 Tech Stack
Vite + React — fast dev server and build tool
Canvas API — all 4 game preview scenes drawn via useEffect + useRef
Google Fonts — Press Start 2P (pixel font)
CSS animations — starfield, progress bar pulse, floating components, card hover glow
No UI library — fully custom styled
📦 Dependencies

json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
Font is loaded via CDN in index.html:


html
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
Requires internet connection to load the font. For fully offline use, install it locally:


bash
npm install @fontsource/press-start-2p
Then import in main.jsx:


js
import '@fontsource/press-start-2p';
👥 Team
Built for ACM SIGBED — Retro Rumble

Role	Name
Dashboard	[your name]
Pac-Man	[team member]
Tetris	[team member]
Flappy Bird	[team member]
Solar Smash	[team member]
