import { useEffect, useState } from 'react';
import { useGameStore } from './store';

const readCoarsePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse)').matches;

export const useCoarsePointer = () => {
  const [coarse, setCoarse] = useState(readCoarsePointer);
  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)');
    const onChange = () => setCoarse(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return coarse;
};

export const useQuality = () => {
  const setting = useGameStore((state) => state.settings.quality);
  const reducedMotion = useGameStore((state) => state.settings.reducedMotion);
  const coarse = useCoarsePointer();

  const shadows =
    setting === 'high' || (setting === 'auto' && !coarse);
  const low = setting === 'low' || (setting === 'auto' && coarse);
  const dpr: number | [number, number] = low
    ? coarse
      ? 1
      : 1.15
    : setting === 'high'
      ? [1, 2]
      : [1, 1.6];

  return {
    setting,
    coarse,
    shadows,
    low,
    reducedMotion,
    dpr,
    shadowMapSize: shadows ? (coarse ? 512 : 1024) : 256,
    particleScale: low ? 0.55 : 1,
  };
};
