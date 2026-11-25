import {
  COLLECTIBLES,
  CRYSTAL_GOAL,
  FLOWER_GOAL,
  SECRETS,
  STAR_GOAL,
  type CollectibleDefinition,
  type CollectibleType,
} from '../config/gameConfig';
import type { CollectedMap, ProgressData, QuestId, QuestTarget, SceneId } from './types';
import { HEDGE, INTERIOR, LAYOUT } from './world/layout';

export interface QuestDefinition {
  id: QuestId;
  title: string;
  hint: string;
  icon: string;
}

export const QUESTS: QuestDefinition[] = [
  {
    id: 'sign',
    title: 'Read the welcome sign',
    hint: 'The wooden sign in the meadow has a message for you.',
    icon: '🪧',
  },
  {
    id: 'meadow',
    title: 'Walk through the flower arch',
    hint: 'The arch of flowers stands just west of the sign.',
    icon: '🌼',
  },
  {
    id: 'cottage',
    title: "Visit Hossna's cottage",
    hint: 'Follow the stone path west to the lavender-roofed cottage.',
    icon: '🏡',
  },
  {
    id: 'key',
    title: 'Find the old garden key',
    hint: 'Look around inside the cottage — something glints on the tea table.',
    icon: '🔑',
  },
  {
    id: 'secret',
    title: 'Unlock the secret garden',
    hint: 'Bring the key to the old gate in the west, then step inside the hedge.',
    icon: '🗝️',
  },
  {
    id: 'note',
    title: 'Read the secret note',
    hint: 'A little note waits on a stand inside the secret garden.',
    icon: '💌',
  },
  {
    id: 'flowers',
    title: 'Bring 2 magical flowers to the fountain',
    hint: 'One blooms by the cottage mailbox, one by the lily pond. Then visit the fountain.',
    icon: '🌸',
  },
  {
    id: 'crystals',
    title: `Collect ${CRYSTAL_GOAL} pink crystals`,
    hint: 'Crystals hide east of the flower garden, on the beach and on the shrine hill.',
    icon: '💎',
  },
  {
    id: 'stars',
    title: `Collect ${STAR_GOAL} golden stars`,
    hint: 'Golden stars glow all over the island — even in the secret garden.',
    icon: '⭐',
  },
  {
    id: 'shrine',
    title: 'Awaken the Star Shrine',
    hint: 'Bring your stars and crystals to the shrine on the northern hill.',
    icon: '✨',
  },
];

export const QUEST_ORDER: QuestId[] = QUESTS.map((quest) => quest.id);

export const getQuest = (id: QuestId) => QUESTS.find((quest) => quest.id === id)!;

export const countCollected = (collected: CollectedMap, type: CollectibleType) =>
  COLLECTIBLES.filter((item) => item.type === type && collected[item.id]).length;

export const starCount = (collected: CollectedMap) => countCollected(collected, 'star');

export type QuestSnapshot = Pick<
  ProgressData,
  'collected' | 'quests' | 'gateOpen' | 'shrineUnlocked' | 'secrets'
>;

export interface QuestProgress {
  current: number;
  target: number;
  text: string;
}

export const questProgress = (id: QuestId, state: QuestSnapshot): QuestProgress | null => {
  const done = state.quests[id];
  if (id === 'flowers') {
    if (done) return { current: FLOWER_GOAL, target: FLOWER_GOAL, text: 'Offered' };
    const current = Math.min(countCollected(state.collected, 'flower'), FLOWER_GOAL);
    return {
      current,
      target: FLOWER_GOAL,
      text:
        current >= FLOWER_GOAL
          ? 'Take them to the fountain'
          : `${current} / ${FLOWER_GOAL} flowers`,
    };
  }
  if (id === 'crystals') {
    const current = Math.min(countCollected(state.collected, 'crystal'), CRYSTAL_GOAL);
    return { current, target: CRYSTAL_GOAL, text: `${current} / ${CRYSTAL_GOAL} crystals` };
  }
  if (id === 'stars') {
    const current = Math.min(starCount(state.collected), STAR_GOAL);
    return { current, target: STAR_GOAL, text: `${current} / ${STAR_GOAL} stars` };
  }
  if (id === 'shrine') {
    if (done) return { current: 1, target: 1, text: 'Awakened' };
    const stars = Math.min(starCount(state.collected), STAR_GOAL);
    const crystals = Math.min(countCollected(state.collected, 'crystal'), CRYSTAL_GOAL);
    return {
      current: stars + crystals,
      target: STAR_GOAL + CRYSTAL_GOAL,
      text: `${stars}/${STAR_GOAL} stars · ${crystals}/${CRYSTAL_GOAL} crystals`,
    };
  }
  return null;
};

export const currentQuestId = (quests: Record<QuestId, boolean>): QuestId | null =>
  QUEST_ORDER.find((id) => !quests[id]) ?? null;

export const allQuestsComplete = (quests: Record<QuestId, boolean>) =>
  QUEST_ORDER.every((id) => quests[id]);

export const insideSecretGarden = (x: number, z: number) =>
  Math.hypot(x - HEDGE.x, z - HEDGE.z) < HEDGE.radius;

const isReachable = (item: CollectibleDefinition, state: QuestSnapshot) =>
  state.gateOpen || !insideSecretGarden(item.x, item.z);

const nearestUncollected = (
  type: CollectibleType,
  state: QuestSnapshot,
  from: { x: number; z: number },
): QuestTarget | null => {
  let best: CollectibleDefinition | null = null;
  let bestDistance = Infinity;
  for (const item of COLLECTIBLES) {
    if (item.type !== type || state.collected[item.id] || !isReachable(item, state)) continue;
    const distance = Math.hypot(item.x - from.x, item.z - from.z);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = item;
    }
  }
  return best ? { x: best.x, z: best.z, scene: 'island' } : null;
};

const COTTAGE_DOOR: QuestTarget = {
  x: LAYOUT.cottage.x,
  z: LAYOUT.cottage.interactZ,
  scene: 'island',
};

/** Where the quest wants the player to go, in the scene it lives in. */
export const questTarget = (
  id: QuestId,
  state: QuestSnapshot,
  from: { x: number; z: number; scene: SceneId },
): QuestTarget | null => {
  const islandFrom = from.scene === 'island' ? from : COTTAGE_DOOR;
  switch (id) {
    case 'sign':
      return { ...LAYOUT.meadowSign, scene: 'island' };
    case 'meadow':
      return { ...LAYOUT.meadowArch, scene: 'island' };
    case 'cottage':
      return COTTAGE_DOOR;
    case 'key':
      return { ...INTERIOR.key, scene: 'interior' };
    case 'secret':
      return state.gateOpen
        ? { x: HEDGE.x, z: HEDGE.z, scene: 'island' }
        : { ...LAYOUT.secretGarden.gate, scene: 'island' };
    case 'note':
      return { ...LAYOUT.secretNote, scene: 'island' };
    case 'flowers':
      return countCollected(state.collected, 'flower') >= FLOWER_GOAL
        ? { ...LAYOUT.flowerGarden.fountain, scene: 'island' }
        : nearestUncollected('flower', state, islandFrom);
    case 'crystals':
      return nearestUncollected('crystal', state, islandFrom);
    case 'stars':
      return nearestUncollected('star', state, islandFrom);
    case 'shrine':
      return { ...LAYOUT.shrine.interact, scene: 'island' };
  }
};

/** Converts a target in another scene into the door that leads there. */
export const routeTarget = (target: QuestTarget, scene: SceneId): QuestTarget => {
  if (target.scene === scene) return target;
  return scene === 'interior' ? { ...INTERIOR.exit, scene: 'interior' } : COTTAGE_DOOR;
};

export const TOTAL_QUESTS = QUESTS.length;
export const TOTAL_SECRETS = SECRETS.length;
export const TOTAL_COLLECTIBLES = COLLECTIBLES.length;

export const completionPercent = (state: QuestSnapshot) => {
  const quests = QUEST_ORDER.filter((id) => state.quests[id]).length;
  const secrets = Object.keys(state.secrets).length;
  const collected = COLLECTIBLES.filter((item) => state.collected[item.id]).length;
  const total = TOTAL_QUESTS + TOTAL_SECRETS + TOTAL_COLLECTIBLES;
  return Math.round(((quests + secrets + collected) / total) * 100);
};

export const formatPlayTime = (seconds: number) => {
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  return `${minutes}m ${String(secs).padStart(2, '0')}s`;
};
