import { COLLECTIBLES, STAR_GOAL } from '../config/gameConfig';
import type { CollectedMap, QuestDefinition, QuestId } from './types';

export const QUESTS: QuestDefinition[] = [
  {
    id: 'meadow',
    title: 'Explore the arrival meadow',
    hint: 'Wander to the flower arch near the welcome sign.',
    icon: '🌼',
  },
  {
    id: 'stars',
    title: 'Collect five golden stars',
    hint: 'Stars glow softly all over the island.',
    icon: '⭐',
  },
  {
    id: 'secret',
    title: 'Find the secret garden',
    hint: 'Something is hidden behind the trees to the west.',
    icon: '🗝️',
  },
  {
    id: 'cottage',
    title: "Visit AYA's cottage",
    hint: 'The lavender-roofed cottage has a warm welcome inside.',
    icon: '🏡',
  },
  {
    id: 'shrine',
    title: 'Unlock the Star Shrine',
    hint: 'Bring five golden stars to the shrine on the northern hill.',
    icon: '✨',
  },
];

export const QUEST_ORDER: QuestId[] = QUESTS.map((quest) => quest.id);

export const countCollected = (collected: CollectedMap, type: 'star' | 'crystal' | 'flower' | 'gift') =>
  COLLECTIBLES.filter((item) => item.type === type && collected[item.id]).length;

export const starCount = (collected: CollectedMap) => countCollected(collected, 'star');

export interface QuestProgress {
  current: number;
  target: number;
  text: string;
}

export const questProgress = (
  id: QuestId,
  state: { collected: CollectedMap; shrineUnlocked: boolean },
): QuestProgress => {
  if (id === 'stars') {
    const current = Math.min(starCount(state.collected), STAR_GOAL);
    return { current, target: STAR_GOAL, text: `${current} / ${STAR_GOAL} stars` };
  }
  if (id === 'shrine') {
    return {
      current: state.shrineUnlocked ? 1 : 0,
      target: 1,
      text: state.shrineUnlocked ? 'Awakened' : 'Sleeping',
    };
  }
  return { current: 0, target: 1, text: '' };
};

export const allQuestsComplete = (quests: Record<QuestId, boolean>) =>
  QUEST_ORDER.every((id) => quests[id]);
