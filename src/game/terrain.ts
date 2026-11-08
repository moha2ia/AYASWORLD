/**
 * Analytic island terrain.
 *
 * The same function is used by:
 *  - the terrain mesh (so what you see is what you stand on)
 *  - the player controller (ground height)
 *  - the camera (keeps it above the ground)
 *  - every placed prop / collectible
 *
 * Keeping it analytic (instead of using a height texture) makes placement
 * deterministic and cheap on mobile.
 */

export const ISLAND_SIZE = 120;
export const WATER_LEVEL = 0;
export const PLAY_RADIUS = 46;
export const WALKABLE_MIN_HEIGHT = 0.38;

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const gaussian = (dx: number, dz: number, radius: number) => {
  const d = Math.hypot(dx, dz) / radius;
  return Math.exp(-d * d * 2.2);
};

interface FlatArea {
  x: number;
  z: number;
  radius: number;
  height: number;
}

/** Level, comfortable plateaus for the main landmarks. */
const FLAT_AREAS: FlatArea[] = [
  { x: 0, z: 18, radius: 10.5, height: 2.55 }, // arrival meadow
  { x: -17, z: 2, radius: 10, height: 2.7 }, // cottage + garden
  { x: 15, z: 5, radius: 9, height: 2.62 }, // flower garden
  { x: -30, z: 20, radius: 8, height: 2.95 }, // secret garden
  { x: 8, z: -26, radius: 10, height: 4.15 }, // star shrine hill
  { x: 25, z: -5, radius: 6.5, height: 1.45 }, // lily pond hollow
];

export const terrainHeight = (x: number, z: number): number => {
  const distance = Math.hypot(x, z);

  // Gentle rolling hills.
  let height =
    2.5 +
    Math.sin(x * 0.085) * 0.5 +
    Math.cos(z * 0.095) * 0.42 +
    Math.sin((x + z) * 0.055) * 0.3 +
    Math.cos((x - z) * 0.07) * 0.22;

  // A soft hill beneath the Star Shrine.
  height += 2.1 * gaussian(x - 8, z + 27, 15);

  // Level the landmark clearings.
  for (const area of FLAT_AREAS) {
    const d = Math.hypot(x - area.x, z - area.z);
    const weight = 1 - smoothstep(area.radius * 0.42, area.radius, d);
    height = lerp(height, area.height, weight);
  }

  // The southern shore eases down into warm sand.
  const beach =
    smoothstep(27, 38, z) * (1 - smoothstep(19, 32, Math.abs(x)));
  height = lerp(height, 0.66, beach * 0.92);

  // Everything crumbles gently beneath the sea at the island rim.
  const rim = smoothstep(40.5, 50, distance);
  height = lerp(height, -2.4, rim);

  return height;
};

export type WeatherState = 'clear' | 'light-rain' | 'heavy-rain';

export const setWeather = (preset: WeatherState) => {
  (globalThis as unknown as { weatherPreset?: WeatherState }).weatherPreset = preset;
};

// Keep backward compatibility - just return height
export const terrainHeightLegacy = (x: number, z: number): number => terrainHeight(x, z);

export const terrainSlope = (x: number, z: number) => {
  const e = 0.6;
  const dx = terrainHeight(x + e, z) - terrainHeight(x - e, z);
  const dz = terrainHeight(x, z + e) - terrainHeight(x, z - e);
  return Math.hypot(dx, dz) / (e * 2);
};

/** True where the player may stand (above water and inside the island). */
export const isWalkable = (x: number, z: number): boolean =>
  Math.hypot(x, z) < PLAY_RADIUS && terrainHeight(x, z) > WALKABLE_MIN_HEIGHT;

/** Deterministic pseudo-random generator for repeatable world decoration. */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
