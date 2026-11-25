# Hossna's Secret World

A cozy little 3D island adventure built with React, Three.js, and Vite. Explore a hand-built island, collect starlight, finish small quests, and uncover its secrets.

Everything in the world is generated in code — terrain, trees, flowers, sounds, and textures — so there are no external art assets to load.

## Quick start

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run typecheck` | Type-check the project without emitting files |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Preview the production build locally |

## Project structure

```
src/
├── components/        HUD, modals, journal, title screen, mobile controls
├── config/            Game text, collectibles, outfits, hair styles
├── game/
│   ├── store.ts       Zustand state, quests, badges, discovery banners, save/load
│   ├── Player.tsx     Movement, jumping, third-person camera target
│   ├── CameraRig.tsx  Orbit camera with obstacle avoidance
│   ├── Scene.tsx      Canvas, lighting mode, performance scaling
│   ├── terrain.ts     Analytic island height field shared by mesh + gameplay
│   └── world/         Island sets, cottage interior, props, critters, atmosphere
├── styles/            Global CSS (design tokens, HUD, modals, animations)
└── ui/                Responsive helpers
public/
├── icons/             App icons (SVG + PNG)
└── manifest.webmanifest
```

## How to play

1. Press **PLAY** on the title screen.
2. Follow the quest card and its compass arrow.
3. Read the welcome sign, visit the cottage, then let the island guide you onward.
4. Find all five shrine stars to wake the Star Shrine.
5. Fill the journal with treasures, secrets, places, and badges.

Progress is saved to `localStorage` in the current browser only. It is not synced across devices.

## Controls

**Keyboard**

- `WASD` / arrow keys — move
- `Shift` — run
- `Space` — jump
- `E` — interact
- `J` — journal
- `M` — mute / unmute
- `R` — recenter camera
- `Esc` — pause

**Touch**

- Left joystick — move
- Right buttons — jump, run, action
- Top bar — journal, sound, settings, pause

## Deployment

The build output is a fully static site in `dist/`. Any static host works.

### Vercel

`vercel.json` is included (Vite preset, SPA rewrite, and long-term caching for hashed assets). Import the repository and deploy — no environment variables are required.

### Netlify / Cloudflare Pages / GitHub Pages

- Build command: `npm run build`
- Output directory: `dist`
- If the host asks for a SPA fallback, rewrite all paths to `/index.html`.

## Notes

- Requires WebGL 2. The scene adapts resolution and particle counts on slower devices.
- Sound is synthesized with the Web Audio API and starts after the first user interaction.
- `prefers-reduced-motion` and the in-game motion setting both calm animations.
