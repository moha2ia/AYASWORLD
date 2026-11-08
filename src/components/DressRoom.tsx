import { useGameStore } from '../game/store';

export const DressRoom = () => {
  const phase = useGameStore((state) => state.phase);
  const scene = useGameStore((state) => state.scene);

  if (phase !== 'playing' || scene !== 'interior') return null;

  return null;
};