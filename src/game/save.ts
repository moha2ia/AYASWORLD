import {
  COLLECTIBLES,
  DEFAULT_CHARACTER,
  HAIR_STYLES,
  OUTFITS,
  SECRETS,
} from '../config/gameConfig';
import { BADGES } from './achievements';
import type {
  BadgeId,
  CharacterLook,
  CollectedMap,
  GameSettings,
  ProgressData,
  QuestId,
  SecretId,
} from './types';

const STORAGE_KEY = 'hossnas-secret-world:save:v2';
export const SAVE_VERSION = 2;

export const DEFAULT_QUESTS: Record<QuestId, boolean> = {
  sign: false,
  meadow: false,
  cottage: false,
  key: false,
  secret: false,
  note: false,
  flowers: false,
  crystals: false,
  stars: false,
  shrine: false,
};

export const DEFAULT_SETTINGS: GameSettings = {
  sound: true,
  reducedMotion: false,
  quality: 'auto',
  sensitivity: 1,
  guide: true,
};

export const defaultProgress = (): ProgressData => ({
  version: SAVE_VERSION,
  collected: {},
  quests: { ...DEFAULT_QUESTS },
  visited: {},
  secrets: {},
  badges: {},
  gateOpen: false,
  shrineUnlocked: false,
  character: { ...DEFAULT_CHARACTER },
  settings: { ...DEFAULT_SETTINGS },
  playSeconds: 0,
});

const knownCollectibleIds = new Set(COLLECTIBLES.map((item) => item.id));
const knownSecretIds = new Set<string>(SECRETS.map((item) => item.id));
const knownBadgeIds = new Set<string>(BADGES.map((badge) => badge.id));
const outfitIds = new Set<string>(OUTFITS.map((item) => item.id));
const hairIds = new Set<string>(HAIR_STYLES.map((item) => item.id));

const validObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const sanitizeCharacter = (value: unknown): CharacterLook => {
  if (!validObject(value)) return { ...DEFAULT_CHARACTER };
  return {
    outfit:
      typeof value.outfit === 'string' && outfitIds.has(value.outfit)
        ? (value.outfit as CharacterLook['outfit'])
        : DEFAULT_CHARACTER.outfit,
    hair:
      typeof value.hair === 'string' && hairIds.has(value.hair)
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
    guide: typeof value.guide === 'boolean' ? value.guide : true,
  };
};

const trueFlags = (value: unknown, accept: (id: string) => boolean) => {
  const result: Record<string, true> = {};
  if (!validObject(value)) return result;
  for (const [id, flag] of Object.entries(value)) {
    if (flag === true && accept(id)) result[id] = true;
  }
  return result;
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

    const collected: CollectedMap = trueFlags(parsed.collected, (id) => knownCollectibleIds.has(id));

    const quests = { ...DEFAULT_QUESTS };
    if (validObject(parsed.quests)) {
      for (const id of Object.keys(quests) as QuestId[]) {
        if (parsed.quests[id] === true) quests[id] = true;
      }
    }

    const playSeconds =
      typeof parsed.playSeconds === 'number' && Number.isFinite(parsed.playSeconds)
        ? Math.max(0, parsed.playSeconds)
        : 0;

    return {
      version: SAVE_VERSION,
      collected,
      quests,
      visited: trueFlags(parsed.visited, (id) => id.length < 40),
      secrets: trueFlags(parsed.secrets, (id) => knownSecretIds.has(id)) as Partial<
        Record<SecretId, true>
      >,
      badges: trueFlags(parsed.badges, (id) => knownBadgeIds.has(id)) as Partial<
        Record<BadgeId, true>
      >,
      gateOpen: parsed.gateOpen === true,
      shrineUnlocked: parsed.shrineUnlocked === true,
      character: sanitizeCharacter(parsed.character),
      settings: sanitizeSettings(parsed.settings),
      playSeconds,
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
