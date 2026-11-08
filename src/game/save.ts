import {
  COLLECTIBLES,
  DEFAULT_CHARACTER,
  HAIR_STYLES,
  OUTFITS,
} from '../config/gameConfig';
import type {
  CharacterLook,
  CollectedMap,
  GameSettings,
  ProgressData,
  QuestId,
} from './types';

const STORAGE_KEY = 'ayas-secret-world:save:v1';
const SAVE_VERSION = 1;

export const DEFAULT_QUESTS: Record<QuestId, boolean> = {
  meadow: false,
  stars: false,
  secret: false,
  cottage: false,
  shrine: false,
};

export const DEFAULT_SETTINGS: GameSettings = {
  sound: true,
  reducedMotion: false,
  quality: 'auto',
  sensitivity: 1,
};

export const defaultProgress = (): ProgressData => ({
  version: SAVE_VERSION,
  collected: {},
  quests: { ...DEFAULT_QUESTS },
  visited: {},
  gateOpen: false,
  shrineUnlocked: false,
  character: { ...DEFAULT_CHARACTER },
  settings: { ...DEFAULT_SETTINGS },
  discovered: {},
});

const knownCollectibleIds = new Set(COLLECTIBLES.map((item) => item.id));
const outfitIds = new Set(OUTFITS.map((item) => item.id));
const hairIds = new Set(HAIR_STYLES.map((item) => item.id));

const validObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const sanitizeCharacter = (value: unknown): CharacterLook => {
  if (!validObject(value)) return { ...DEFAULT_CHARACTER };
  return {
    outfit: outfitIds.has(value.outfit as never)
      ? (value.outfit as CharacterLook['outfit'])
      : DEFAULT_CHARACTER.outfit,
    hair: hairIds.has(value.hair as never)
      ? (value.hair as CharacterLook['hair'])
      : DEFAULT_CHARACTER.hair,
  };
};

const sanitizeSettings = (value: unknown): GameSettings => {
  if (!validObject(value)) return { ...DEFAULT_SETTINGS };
  const quality =
    value.quality === 'high' || value.quality === 'low' || value.quality === 'auto'
      ? value.quality
      : 'auto';
  const sensitivity =
    typeof value.sensitivity === 'number' && Number.isFinite(value.sensitivity)
      ? Math.min(2, Math.max(0.4, value.sensitivity))
      : 1;
  return {
    sound: typeof value.sound === 'boolean' ? value.sound : true,
    reducedMotion: typeof value.reducedMotion === 'boolean' ? value.reducedMotion : false,
    quality,
    sensitivity,
  };
};

/**
 * Loads progress defensively. Corrupted, outdated or hand-edited data falls
 * back to a clean game instead of crashing the island.
 */
export const loadProgress = (): ProgressData => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed: unknown = JSON.parse(raw);
    if (!validObject(parsed) || parsed.version !== SAVE_VERSION) {
      return defaultProgress();
    }

    const collected: CollectedMap = {};
    if (validObject(parsed.collected)) {
      for (const [id, value] of Object.entries(parsed.collected)) {
        if (value === true && knownCollectibleIds.has(id)) collected[id] = true;
      }
    }

    const quests = { ...DEFAULT_QUESTS };
    if (validObject(parsed.quests)) {
      for (const id of Object.keys(quests) as QuestId[]) {
        if (parsed.quests[id] === true) quests[id] = true;
      }
    }

    const visited: Record<string, boolean> = {};
    if (validObject(parsed.visited)) {
      for (const [id, value] of Object.entries(parsed.visited)) {
        if (value === true && id.length < 40) visited[id] = true;
      }
    }

    const discovered: Record<string, boolean> = {};
    if (validObject(parsed.discovered)) {
      for (const [id, value] of Object.entries(parsed.discovered)) {
        if (value === true && id.length < 40) discovered[id] = true;
      }
    }

    return {
      version: SAVE_VERSION,
      collected,
      quests,
      visited,
      gateOpen: parsed.gateOpen === true,
      shrineUnlocked: parsed.shrineUnlocked === true,
      character: sanitizeCharacter(parsed.character),
      settings: sanitizeSettings(parsed.settings),
      discovered,
    };
  } catch {
    return defaultProgress();
  }
};

export const saveProgress = (progress: ProgressData): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Private browsing or a full quota should never stop the game.
  }
};

export const clearProgress = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
};
