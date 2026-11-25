import { COLLECTIBLES, CRYSTAL_GOAL, FLOWER_GOAL, STAR_GOAL } from '../config/gameConfig';
import { countCollected, QUEST_ORDER, starCount, TOTAL_COLLECTIBLES, TOTAL_SECRETS } from './quests';
import type { BadgeId, ProgressData } from './types';

export type BadgeSnapshot = Pick<
  ProgressData,
  'collected' | 'quests' | 'visited' | 'secrets' | 'shrineUnlocked'
>;

export interface BadgeDefinition {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  isUnlocked: (snapshot: BadgeSnapshot) => boolean;
}

const secretCount = (snapshot: BadgeSnapshot) => Object.keys(snapshot.secrets).length;
const allStars = COLLECTIBLES.filter((item) => item.type === 'star').length;

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first-star',
    name: 'Wish Upon a Star',
    description: 'Find your first golden star.',
    icon: '⭐',
    isUnlocked: (snapshot) => starCount(snapshot.collected) >= 1,
  },
  {
    id: 'home-sweet-home',
    name: 'Home Sweet Home',
    description: "Step inside Hossna's cottage.",
    icon: '🏡',
    isUnlocked: (snapshot) => Boolean(snapshot.visited.cottage),
  },
  {
    id: 'key-keeper',
    name: 'Keeper of the Key',
    description: 'Find the old garden key.',
    icon: '🗝️',
    isUnlocked: (snapshot) => snapshot.quests.key,
  },
  {
    id: 'hedge-walker',
    name: 'Through the Hedge',
    description: 'Slip into the secret garden.',
    icon: '🌿',
    isUnlocked: (snapshot) => snapshot.quests.secret,
  },
  {
    id: 'green-thumb',
    name: 'Green Thumb',
    description: `Carry ${FLOWER_GOAL} magical flowers at once.`,
    icon: '🌸',
    isUnlocked: (snapshot) => countCollected(snapshot.collected, 'flower') >= FLOWER_GOAL,
  },
  {
    id: 'crystal-clear',
    name: 'Crystal Clear',
    description: `Collect all ${CRYSTAL_GOAL} pink crystals.`,
    icon: '💎',
    isUnlocked: (snapshot) => countCollected(snapshot.collected, 'crystal') >= CRYSTAL_GOAL,
  },
  {
    id: 'little-noticer',
    name: 'Little Noticer',
    description: 'Find your first hidden secret.',
    icon: '🍃',
    isUnlocked: (snapshot) => secretCount(snapshot) >= 1,
  },
  {
    id: 'starlight',
    name: 'Starlight Collector',
    description: `Gather the ${STAR_GOAL} stars the shrine is waiting for.`,
    icon: '🌟',
    isUnlocked: (snapshot) => starCount(snapshot.collected) >= STAR_GOAL,
  },
  {
    id: 'shrine-awakener',
    name: 'Shrine Awakener',
    description: 'Wake the Star Shrine on the hill.',
    icon: '✨',
    isUnlocked: (snapshot) => snapshot.shrineUnlocked,
  },
  {
    id: 'pocketful',
    name: 'Pocketful of Stars',
    description: `Find every golden star — all ${allStars} of them.`,
    icon: '🌠',
    isUnlocked: (snapshot) => starCount(snapshot.collected) >= allStars,
  },
  {
    id: 'island-sleuth',
    name: 'Island Sleuth',
    description: `Find all ${TOTAL_SECRETS} hidden secrets.`,
    icon: '🔍',
    isUnlocked: (snapshot) => secretCount(snapshot) >= TOTAL_SECRETS,
  },
  {
    id: 'whole-world',
    name: 'The Whole Little World',
    description: 'Complete every quest and find every treasure.',
    icon: '💗',
    isUnlocked: (snapshot) =>
      QUEST_ORDER.every((id) => snapshot.quests[id]) &&
      secretCount(snapshot) >= TOTAL_SECRETS &&
      Object.keys(snapshot.collected).length >= TOTAL_COLLECTIBLES,
  },
];

export const TOTAL_BADGES = BADGES.length;

export const getBadge = (id: BadgeId): BadgeDefinition =>
  BADGES.find((badge) => badge.id === id) ?? BADGES[0];

export const unlockedBadges = (snapshot: BadgeSnapshot): BadgeId[] =>
  BADGES.filter((badge) => badge.isUnlocked(snapshot)).map((badge) => badge.id);

export const badgeCount = (badges: ProgressData['badges']) =>
  BADGES.filter((badge) => badges[badge.id]).length;
