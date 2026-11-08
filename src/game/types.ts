import type { CollectibleType, HairId, OutfitId } from '../config/gameConfig';

export type QualitySetting = 'auto' | 'high' | 'low';
export type Phase = 'title' | 'playing' | 'paused';
export type SceneId = 'island' | 'interior';

export type QuestId = 'meadow' | 'stars' | 'secret' | 'cottage' | 'shrine';

export type ModalId =
  | 'howto'
  | 'settings'
  | 'character'
  | 'note'
  | 'sign'
  | 'finale'
  | 'journal'
  | null;

export type AreaId = 'meadowView' | 'beach' | 'flowerGarden' | 'shrine';

export interface CharacterLook {
  outfit: OutfitId;
  hair: HairId;
}

export interface GameSettings {
  sound: boolean;
  reducedMotion: boolean;
  quality: QualitySetting;
  sensitivity: number;
}

export interface Toast {
  id: number;
  message: string;
  tone: 'magic' | 'quest' | 'info';
}

export interface PickupFx {
  id: number;
  x: number;
  z: number;
  color: string;
}

export type CollectedMap = Record<string, true>;

export interface ProgressData {
  version: number;
  collected: CollectedMap;
  quests: Record<QuestId, boolean>;
  visited: Record<string, boolean>;
  gateOpen: boolean;
  shrineUnlocked: boolean;
  character: CharacterLook;
  settings: GameSettings;
  discovered: Record<string, boolean>;
}

export interface QuestDefinition {
  id: QuestId;
  title: string;
  hint: string;
  icon: string;
}

export interface InteractionDefinition {
  id: string;
  kind:
    | 'collectible'
    | 'sign'
    | 'door'
    | 'exit'
    | 'gate'
    | 'note'
    | 'shrine'
    | 'mailbox'
    | 'bench'
    | 'dresser';
  label: string;
  x: number;
  z: number;
  radius: number;
  scene: SceneId;
  /** Optional collectible type when kind === 'collectible'. */
  collectibleType?: CollectibleType;
}
