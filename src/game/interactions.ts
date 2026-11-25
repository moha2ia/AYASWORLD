import {
  COLLECTIBLES,
  CRYSTAL_GOAL,
  FLOWER_GOAL,
  STAR_GOAL,
} from '../config/gameConfig';
import { playerState } from './playerState';
import { countCollected, starCount } from './quests';
import { useGameStore } from './store';
import type { InteractionDefinition, SecretId } from './types';
import { INTERIOR, LAYOUT } from './world/layout';

const collectibleInteractions: InteractionDefinition[] = COLLECTIBLES.map((item) => ({
  id: item.id,
  kind: 'collectible',
  label: `Collect the ${item.name}`,
  x: item.x,
  z: item.z,
  radius: 2.6,
  scene: 'island',
  collectibleType: item.type,
}));

const secret = (
  secretId: SecretId,
  label: string,
  spot: { x: number; z: number },
  radius: number,
  scene: InteractionDefinition['scene'] = 'island',
): InteractionDefinition => ({
  id: `secret-${secretId}`,
  kind: 'secret',
  secretId,
  label,
  x: spot.x,
  z: spot.z,
  radius,
  scene,
});

export const INTERACTIONS: InteractionDefinition[] = [
  {
    id: 'welcome-sign',
    kind: 'sign',
    label: 'Read the welcome sign',
    x: LAYOUT.meadowSign.x,
    z: LAYOUT.meadowSign.z,
    radius: 3,
    scene: 'island',
  },
  {
    id: 'cottage-door',
    kind: 'door',
    label: "Enter Hossna's cottage",
    x: LAYOUT.cottage.x,
    z: LAYOUT.cottage.interactZ,
    radius: 3,
    scene: 'island',
  },
  {
    id: 'secret-gate',
    kind: 'gate',
    label: 'Unlock the old garden gate',
    x: LAYOUT.secretGarden.gate.x,
    z: LAYOUT.secretGarden.gate.z,
    radius: 3.1,
    scene: 'island',
  },
  {
    id: 'secret-note',
    kind: 'note',
    label: 'Read the secret note',
    x: LAYOUT.secretNote.x,
    z: LAYOUT.secretNote.z,
    radius: 2.4,
    scene: 'island',
  },
  {
    id: 'garden-fountain',
    kind: 'fountain',
    label: 'Visit the fountain',
    x: LAYOUT.flowerGarden.fountain.x,
    z: LAYOUT.flowerGarden.fountain.z,
    radius: 3.3,
    scene: 'island',
  },
  {
    id: 'star-shrine',
    kind: 'shrine',
    label: 'Awaken the Star Shrine',
    x: LAYOUT.shrine.interact.x,
    z: LAYOUT.shrine.interact.z,
    radius: 3.4,
    scene: 'island',
  },
  {
    id: 'cottage-exit',
    kind: 'exit',
    label: 'Step back outside',
    x: INTERIOR.exit.x,
    z: INTERIOR.exit.z,
    radius: 1.9,
    scene: 'interior',
  },
  {
    id: 'garden-key',
    kind: 'key',
    label: 'Pick up the old garden key',
    x: INTERIOR.key.x,
    z: INTERIOR.key.z,
    radius: 1.8,
    scene: 'interior',
  },
  {
    id: 'dresser',
    kind: 'dresser',
    label: 'Change outfit at the dresser',
    x: INTERIOR.dresser.x,
    z: INTERIOR.dresser.z,
    radius: 2,
    scene: 'interior',
  },
  secret('mailbox', 'Peek in the mailbox', LAYOUT.cottageMailbox, 2.3),
  secret('message', 'Read the carved stone', LAYOUT.messageStone, 2.1),
  secret('willow', 'Listen to the whispering willow', LAYOUT.willow, 2.6),
  secret('moonstone', 'Touch the moonstone', LAYOUT.moonstone, 2.4),
  secret('wish', 'Make a wish at the wishing tree', LAYOUT.wishingTree, 2.2),
  secret('cat', 'Pet the sleepy cat', INTERIOR.cat, 1.6, 'interior'),
  secret('fireplace', 'Warm your hands by the fire', INTERIOR.fireplace, 1.8, 'interior'),
  ...collectibleInteractions,
];

const interactionMap = new Map(INTERACTIONS.map((item) => [item.id, item]));

export const getInteraction = (id: string | null) =>
  id ? interactionMap.get(id) ?? null : null;

export const isInteractionAvailable = (interaction: InteractionDefinition): boolean => {
  const state = useGameStore.getState();
  if (state.phase !== 'playing') return false;
  if (state.scene !== interaction.scene) return false;
  switch (interaction.kind) {
    case 'collectible':
      return !state.collected[interaction.id];
    case 'gate':
      return !state.gateOpen;
    case 'note':
      return state.gateOpen;
    case 'key':
      return !state.quests.key;
    default:
      return true;
  }
};

export const getInteractionLabel = (interaction: InteractionDefinition): string => {
  const state = useGameStore.getState();
  if (interaction.kind === 'shrine') {
    if (state.shrineUnlocked) return 'Visit the glowing Star Shrine';
    const stars = starCount(state.collected);
    const crystals = countCollected(state.collected, 'crystal');
    return stars >= STAR_GOAL && crystals >= CRYSTAL_GOAL
      ? 'Awaken the Star Shrine'
      : `Star Shrine — ${stars}/${STAR_GOAL} stars · ${crystals}/${CRYSTAL_GOAL} crystals`;
  }
  if (interaction.kind === 'gate') {
    return state.quests.key ? 'Unlock the gate with the old key' : 'Try the old garden gate';
  }
  if (interaction.kind === 'fountain') {
    if (state.quests.flowers) return 'Make a wish at the fountain';
    const flowers = countCollected(state.collected, 'flower');
    return flowers >= FLOWER_GOAL
      ? 'Offer the magical flowers'
      : `Fountain — ${flowers}/${FLOWER_GOAL} magical flowers`;
  }
  return interaction.label;
};

/** Nearest interaction within its personal radius (XZ distance). */
export const findNearestInteraction = (): InteractionDefinition | null => {
  let nearest: InteractionDefinition | null = null;
  let best = Infinity;
  for (const interaction of INTERACTIONS) {
    if (!isInteractionAvailable(interaction)) continue;
    const distance = Math.hypot(playerState.x - interaction.x, playerState.z - interaction.z);
    // Collectibles and quest items win ties over scenery.
    const weighted = interaction.kind === 'secret' ? distance + 0.4 : distance;
    if (distance <= interaction.radius && weighted < best) {
      best = weighted;
      nearest = interaction;
    }
  }
  return nearest;
};

export const handleInteraction = (id: string): void => {
  const interaction = getInteraction(id);
  if (!interaction || !isInteractionAvailable(interaction)) return;
  const state = useGameStore.getState();

  switch (interaction.kind) {
    case 'collectible':
      state.collect(interaction.id);
      break;
    case 'sign':
      state.readSign();
      break;
    case 'door':
      state.enterCottage();
      break;
    case 'exit':
      state.exitCottage();
      break;
    case 'gate':
      state.tryGate();
      break;
    case 'note':
      state.openSecretNote();
      break;
    case 'fountain':
      state.offerFlowers();
      break;
    case 'shrine':
      state.unlockShrine();
      break;
    case 'key':
      state.takeKey();
      break;
    case 'dresser':
      state.openModal('character');
      break;
    case 'secret':
      if (interaction.secretId) state.findSecret(interaction.secretId);
      break;
  }
};

/** Used by the HUD's mobile action button and the E key. */
export const interactWithNearby = (): void => {
  const state = useGameStore.getState();
  if (state.phase !== 'playing' || !state.nearby) return;
  handleInteraction(state.nearby);
};
