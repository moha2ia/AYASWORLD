import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { findNearestInteraction } from './interactions';
import { playerState } from './playerState';
import { useGameStore } from './store';
import { HEDGE, LAYOUT } from './world/layout';

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
    state.setNearby(findNearestInteraction()?.id ?? null);
  });

  useEffect(() => () => useGameStore.getState().setNearby(null), []);
  return null;
};

/** Discovers areas by actual player movement. */
export const AreaTriggers = () => {
  const timer = useRef(0);

  useFrame((_, delta) => {
    timer.current += delta;
    if (timer.current < 0.25) return;
    timer.current = 0;
    const state = useGameStore.getState();
    if (state.phase !== 'playing' || state.scene !== 'island') return;
    if (playerState.scene !== 'island') return;

    const { x, z } = playerState;

    if (!state.visited.meadowView) {
      // The arch spans the x axis between its posts, so you walk through it along z.
      const underArch =
        Math.abs(x - LAYOUT.meadowArch.x) < 1.5 && Math.abs(z - LAYOUT.meadowArch.z) < 1.1;
      if (underArch) state.triggerArea('meadowView');
    }

    if (!state.visited.beach && z > 33.2 && Math.abs(x) < 30) {
      state.triggerArea('beach');
    }

    if (!state.visited.flowerGarden) {
      const distance = Math.hypot(x - LAYOUT.flowerGarden.x, z - LAYOUT.flowerGarden.z);
      if (distance < 7.5) state.triggerArea('flowerGarden');
    }

    if (!state.visited.shrine) {
      const distance = Math.hypot(x - LAYOUT.shrine.x, z - LAYOUT.shrine.z);
      if (distance < 9.5) state.triggerArea('shrine');
    }

    if (state.gateOpen && !state.quests.secret) {
      const distance = Math.hypot(x - HEDGE.x, z - HEDGE.z);
      if (distance < HEDGE.radius - 1.4) state.enterSecretGarden();
    }
  });

  return null;
};

/** Counts time actually spent playing (not paused or on the title). */
export const PlayClock = () => {
  const pending = useRef(0);

  useFrame((_, delta) => {
    if (useGameStore.getState().phase !== 'playing') return;
    pending.current += Math.min(delta, 0.25);
    if (pending.current >= 5) {
      useGameStore.getState().addPlayTime(pending.current);
      pending.current = 0;
    }
  });

  useEffect(
    () => () => {
      if (pending.current > 0) useGameStore.getState().addPlayTime(pending.current);
    },
    [],
  );
  return null;
};
