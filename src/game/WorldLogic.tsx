import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { findNearestInteraction } from './interactions';
import { playerState } from './playerState';
import { useGameStore } from './store';
import { LAYOUT } from './world/layout';

/** Publishes the nearest interaction to the HUD (only when it changes). */
export const InteractionManager = () => {
  const timer = useRef(0);

  useFrame((_, delta) => {
    timer.current += delta;
    if (timer.current < 0.1) return;
    timer.current = 0;
    const state = useGameStore.getState();
    if (state.phase !== 'playing' || state.modal) {
      if (state.nearby) state.setNearby(null);
      return;
    }
    const nearest = findNearestInteraction();
    state.setNearby(nearest?.id ?? null);
  });

  useEffect(() => () => useGameStore.getState().setNearby(null), []);
  return null;
};

/** Discovers areas by actual player movement. */
export const AreaTriggers = () => {
  const timer = useRef(0);

  useFrame((_, delta) => {
    timer.current += delta;
    if (timer.current < 0.4) return;
    timer.current = 0;
    const state = useGameStore.getState();
    if (state.phase !== 'playing' || state.scene !== 'island') return;

    const { x, z } = playerState;

    if (!state.visited.meadowView) {
      const distance = Math.hypot(x - LAYOUT.meadowArch.x, z - LAYOUT.meadowArch.z);
      if (distance < 4.2) state.triggerArea('meadowView');
    }

    if (!state.visited.beach && z > 33.2 && Math.abs(x) < 30) {
      state.triggerArea('beach');
    }

    if (!state.visited.flowerGarden) {
      const distance = Math.hypot(
        x - LAYOUT.flowerGarden.x,
        z - LAYOUT.flowerGarden.z,
      );
      if (distance < 7.5) state.triggerArea('flowerGarden');
    }

    if (!state.visited.shrine) {
      const distance = Math.hypot(x - LAYOUT.shrine.x, z - LAYOUT.shrine.z);
      if (distance < 9.5) state.triggerArea('shrine');
    }

    if (state.gateOpen && !state.quests.secret) {
      const distance = Math.hypot(
        x - LAYOUT.secretGarden.x,
        z - LAYOUT.secretGarden.z,
      );
      if (distance < 6.2) state.discoverSecretGarden();
    }
  });

  return null;
};
