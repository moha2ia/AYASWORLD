import type { SceneId } from './types';

/**
 * Mutable per-frame state. Kept outside React so movement does not re-render
 * the interface sixty times a second.
 */
export const playerState = {
  x: 0,
  y: 3,
  z: 16.8,
  yaw: Math.PI,
  speed: 0,
  grounded: true,
  scene: 'island' as SceneId,
};

/** Development-only hook used by browser smoke tests. */
export const teleportRequest: { pending: { x: number; z: number } | null } = {
  pending: null,
};
