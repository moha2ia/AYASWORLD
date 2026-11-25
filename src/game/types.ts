import type { CollectibleType, HairId, OutfitId } from '../config/gameConfig';

export type QualitySetting = 'auto' | 'high' | 'low';
export type Phase = 'title' | 'playing' | 'paused';
export type SceneId = 'island' | 'interior';

export type QuestId =
  | 'sign'
  | 'meadow'
  | 'cottage'
  | 'key'
  | 'secret'
  | 'note'
  | 'flowers'
  | 'crystals'
  | 'stars'
  | 'shrine';

export type SecretId =
  | 'mailbox'
  | 'message'
  | 'willow'
  | 'moonstone'
  | 'wish'
  | 'cat'
  | 'fireplace';

export type BadgeId =
  | 'first-star'
  | 'starlight'
  | 'crystal-clear'
  | 'green-thumb'
  | 'key-keeper'
  | 'hedge-walker'
  | 'little-noticer'
  | 'island-sleuth'
  | 'home-sweet-home'
  | 'shrine-awakener'
  | 'pocketful'
  | 'whole-world';

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
  guide: boolean;
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
  secrets: Partial<Record<SecretId, true>>;
  badges: Partial<Record<BadgeId, true>>;
  gateOpen: boolean;
  shrineUnlocked: boolean;
  character: CharacterLook;
  settings: GameSettings;
  playSeconds: number;
}

export interface QuestTarget {
  x: number;
  z: number;
  scene: SceneId;
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
    | 'dresser'
    | 'key'
    | 'fountain'
    | 'secret';
  label: string;
  x: number;
  z: number;
  radius: number;
  scene: SceneId;
  collectibleType?: CollectibleType;
  secretId?: SecretId;
}
