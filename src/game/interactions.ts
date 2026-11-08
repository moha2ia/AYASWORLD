import {
  COLLECTIBLES,
  GAME_INFO,
  STAR_GOAL,
} from '../config/gameConfig';
import { audio } from './audio';
import { playerState } from './playerState';
import { starCount } from './quests';
import { useGameStore } from './store';
import type { InteractionDefinition } from './types';
import { LAYOUT } from './world/layout';const collectibleInteractions: InteractionDefinition[] = COLLECTIBLES.map((item) => ({
  id: item.id,
  kind: 'collectible',
  label: `Collect ${item.name}`,
  x: item.x,
  z: item.z,
  radius: 2.6,
  scene: 'island',
  collectibleType: item.type,
}));

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
    label: "Enter AYA's cottage",
    x: LAYOUT.cottage.x,
    z: LAYOUT.cottage.interactZ,
    radius: 3,
    scene: 'island',
  },
  {
    id: 'cottage-mailbox',
    kind: 'mailbox',
    label: 'Peek in the mailbox',
    x: LAYOUT.cottageMailbox.x,
    z: LAYOUT.cottageMailbox.z,
    radius: 2.3,
    scene: 'island',
  },
  {
    id: 'secret-gate',
    kind: 'gate',
    label: 'Open the old garden gate',
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
    x: 0,
    z: -3.1,
    radius: 2.3,
    scene: 'interior',
  },
  {
    id: 'cottage-fireplace',
    kind: 'bench',
    label: 'Warm your hands by the fire',
    x: 2.5,
    z: -2.6,
    radius: 2,
    scene: 'interior',
  },
  {
    id: 'dresser',
    kind: 'dresser',
    label: 'Change outfit at the dresser',
    x: -2.8,
    z: -2.2,
    radius: 2,
    scene: 'interior',
  },
  // Easter eggs
  {
    id: 'hidden-message',
    kind: 'note',
    label: 'Find the hidden message',
    x: -2.1,
    z: 26.5,
    radius: 2,
    scene: 'island',
  },
  {
    id: 'moonstone',
    kind: 'collectible',
    label: 'Touch the moon stone',
    x: 30.5,
    z: -12.3,
    radius: 2.5,
    scene: 'island',
    collectibleType: 'gift',
  },
  {
    id: 'whispering-willow',
    kind: 'sign',
    label: 'Listen to the whispering willow',
    x: -8.5,
    z: 28.5,
    radius: 3,
    scene: 'island',
  },
  ...collectibleInteractions,
];

const interactionMap = new Map(INTERACTIONS.map((item) => [item.id, item]));

export const getInteraction = (id: string | null) =>
  id ? interactionMap.get(id) ?? null : null;

export const isInteractionAvailable = (interaction: InteractionDefinition): boolean => {
  const state = useGameStore.getState();
  if (state.phase !== 'playing') return false;
  if (state.scene !== interaction.scene) return false;
  if (interaction.kind === 'collectible') return !state.collected[interaction.id];
  if (interaction.kind === 'gate') return !state.gateOpen;
  if (interaction.kind === 'dresser') return true;
  return true;
};

export const getInteractionLabel = (interaction: InteractionDefinition): string => {
  const state = useGameStore.getState();
  if (interaction.kind === 'shrine') {
    if (state.shrineUnlocked) return 'Visit the glowing Star Shrine';
    const stars = starCount(state.collected);
    return stars >= STAR_GOAL
      ? 'Awaken the Star Shrine'
      : `Star Shrine — ${stars} / ${STAR_GOAL} stars`;
  }
  return interaction.label;
};

/** Nearest interaction within its personal radius (XZ distance). */
export const findNearestInteraction = (): InteractionDefinition | null => {
  let nearest: InteractionDefinition | null = null;
  let best = Infinity;
  for (const interaction of INTERACTIONS) {
    if (!isInteractionAvailable(interaction)) continue;
    const distance = Math.hypot(
      playerState.x - interaction.x,
      playerState.z - interaction.z,
    );
    if (distance <= interaction.radius && distance < best) {
      best = distance;
      nearest = interaction;
    }
  }
  return nearest;
};

export const handleInteraction = (id: string): void => {
  const interaction = getInteraction(id);
  if (!interaction || !isInteractionAvailable(interaction)) return;
  const state = useGameStore.getState();

  if (interaction.id === 'hidden-message') {
    state.discoverSecretGarden();
    state.notify('A hidden message appears: "Your curiosity awakens the island."', 'quest');
    audio.play('discovery');
    return;
  }
  if (interaction.id === 'moonstone') {
    state.notify('The moon stone glows warmly. You feel a mystical connection.', 'magic');
    audio.play('collect');
    return;
  }
  if (interaction.id === 'whispering-willow') {
    state.notify('The willow whispers: "Secrets lie where the moonlight touches the water."', 'magic');
    audio.play('discovery');
    return;
  }

  switch (interaction.kind) {
    case 'collectible':
      state.collect(interaction.id);
      break;
    case 'sign':
      state.openModal('sign');
      break;
    case 'door':
      state.enterCottage();
      break;
    case 'exit':
      state.exitCottage();
      break;
    case 'gate':
      state.openGate();
      break;
    case 'note':
      state.openSecretNote();
      break;
    case 'shrine':
      state.unlockShrine();
      break;
    case 'mailbox':
      state.notify(GAME_INFO.mailboxMessage, 'magic');
      audio.play('discovery');
      break;
    case 'dresser':
      state.openModal('character');
      audio.play('ui');
      break;
  }
};

/** Used by the HUD's mobile action button and the E key. */
export const interactWithNearby = (): void => {
  const state = useGameStore.getState();
  if (state.phase !== 'playing' || !state.nearby) return;
  handleInteraction(state.nearby);
};
