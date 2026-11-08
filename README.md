# Aya's Secret World

A cozy 3D island adventure browser game built with React, Three.js, and Vite.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser at http://localhost:5174 (or the port shown in terminal)
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |

## Project Structure

- `src/` - Source code
  - `game/` - Three.js scene, player, camera, world generation
  - `ui/` - React UI components
  - `components/` - Reusable UI elements
  - `config/` - Game configuration and types
  - `store/` - Zustand game state management
- `vite.config.ts` - Vite configuration with Three.js
- `package.json` - Dependencies and scripts

## Build

The project uses TypeScript with `tsc -b` for incremental builds and `vite build` for production output. The built output goes to `dist/`.

## How to Play

1. Start the dev server with `npm run dev`
2. Click "PLAY" on the title screen to begin
3. Use WASD/joystick to move, Space to jump, E to interact
4. Collect stars and crystals, discover secrets
5. Find all 5 stars to unlock the Star Shrine
6. Explore the cottage, beach, secret garden, and shrine

## Controls

**Keyboard:**
- WASD or Arrow keys: Move
- Shift: Run
- Space: Jump
- E: Interact
- M: Toggle sound
- R: Recenter camera
- Esc: Pause/Exit menu

**Mobile:**
- Left joystick: Move
- Right buttons: Jump, Run, Interact
- Top buttons: Sound, Map, Pause