import { create } from 'zustand';
import {
  COLLECTIBLES,
  CRYSTAL_GOAL,
  DEFAULT_CHARACTER,
  FLOWER_GOAL,
  GAME_INFO,
  SECRETS,
  STAR_GOAL,
} from '../config/gameConfig';
import { getBadge, unlockedBadges } from './achievements';
import { audio } from './audio';
import {
  allQuestsComplete,
  countCollected,
  currentQuestId,
  getQuest,
  starCount,
  TOTAL_SECRETS,
} from './quests';
import {
  clearProgress,
  DEFAULT_QUESTS,
  loadProgress,
  SAVE_VERSION,
  saveProgress,
} from './save';
import type {
  AreaId,
  CharacterLook,
  CollectedMap,
  GameSettings,
  ModalId,
  Phase,
  PickupFx,
  ProgressData,
  QuestId,
  SceneId,
  SecretId,
  Toast,
} from './types';
import { INTERIOR, LAYOUT } from './world/layout';

const saved = loadProgress();

export interface Discovery {
  id: number;
  title: string;
  subtitle: string;
}

interface GameState extends ProgressData {
  phase: Phase;
  scene: SceneId;
  nearby: string | null;
  modal: ModalId;
  modalReturnPhase: Phase;
  toasts: Toast[];
  pickupFx: PickupFx | null;
  spawn: { x: number; z: number };
  discovery: Discovery | null;
}

interface GameActions {
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  returnToTitle: () => void;
  openModal: (modal: Exclude<ModalId, null>) => void;
  closeModal: () => void;
  toggleSound: () => void;
  updateSettings: (partial: Partial<GameSettings>) => void;
  setCharacter: (partial: Partial<CharacterLook>) => void;
  notify: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;
  setNearby: (id: string | null) => void;
  setSpawn: (x: number, z: number) => void;
  discover: (title: string, subtitle: string) => void;
  clearDiscovery: (id: number) => void;
  collect: (id: string) => void;
  readSign: () => void;
  triggerArea: (area: AreaId) => void;
  enterSecretGarden: () => void;
  enterCottage: () => void;
  exitCottage: () => void;
  takeKey: () => void;
  tryGate: () => void;
  openSecretNote: () => void;
  offerFlowers: () => void;
  unlockShrine: () => void;
  findSecret: (id: SecretId) => void;
  addPlayTime: (seconds: number) => void;
  resetProgress: () => void;
  saveNow: () => void;
}

export type GameStore = GameState & GameActions;

const progressFrom = (state: GameState): ProgressData => ({
  version: SAVE_VERSION,
  collected: state.collected,
  quests: state.quests,
  visited: state.visited,
  secrets: state.secrets,
  badges: state.badges,
  gateOpen: state.gateOpen,
  shrineUnlocked: state.shrineUnlocked,
  character: state.character,
  settings: state.settings,
  playSeconds: state.playSeconds,
});

const persist = (state: GameState) => saveProgress(progressFrom(state));

let toastCounter = 0;
let pickupCounter = 0;
let discoveryCounter = 0;
let discoveryTimer: ReturnType<typeof setTimeout> | null = null;
let finaleTimer: ReturnType<typeof setTimeout> | null = null;
const toastTimers = new Map<number, ReturnType<typeof setTimeout>>();

export const useGameStore = create<GameStore>()((set, get) => {
  const scheduleFinale = () => {
    if (finaleTimer) clearTimeout(finaleTimer);
    finaleTimer = setTimeout(() => {
      finaleTimer = null;
      const state = get();
      if (state.visited.finale || state.phase === 'title') return;
      if (!allQuestsComplete(state.quests)) return;
      audio.play('finale');
      set({
        modal: 'finale',
        // Keep whatever phase an already-open modal was going to return to.
        modalReturnPhase: state.modal ? state.modalReturnPhase : state.phase,
        phase: state.phase === 'playing' ? 'paused' : state.phase,
        nearby: null,
        visited: { ...state.visited, finale: true },
      });
      persist(get());
    }, 1600);
  };

  /** Grants any badges the player has just earned. */
  const syncBadges = () => {
    const state = get();
    const fresh = unlockedBadges(state).filter((id) => !state.badges[id]);
    if (fresh.length === 0) return;
    const badges = { ...state.badges };
    for (const id of fresh) badges[id] = true;
    set({ badges });
    fresh.forEach((id, index) => {
      const badge = getBadge(id);
      setTimeout(() => {
        if (get().phase === 'title') return;
        get().notify(`Badge earned — ${badge.name}`, 'quest');
        audio.play('discovery');
      }, 700 + index * 1200);
    });
    persist(get());
  };

  const completeQuest = (id: QuestId, message?: string) => {
    const state = get();
    if (state.quests[id]) return;
    const quests = { ...state.quests, [id]: true };
    set({ quests });
    get().notify(message ?? `Quest complete: ${getQuest(id).title}`, 'quest');
    audio.play('discovery');
    const next = currentQuestId(quests);
    if (next) {
      setTimeout(() => {
        const latest = get();
        // Skip if the player already finished it (or left) during the delay.
        if (latest.phase === 'title' || currentQuestId(latest.quests) !== next) return;
        latest.notify(`Next: ${getQuest(next).title}`, 'info');
      }, 1300);
    } else {
      scheduleFinale();
    }
    syncBadges();
    persist(get());
  };

  return {
    ...saved,
    phase: 'title',
    scene: 'island',
    nearby: null,
    modal: null,
    modalReturnPhase: 'title',
    toasts: [],
    pickupFx: null,
    spawn: { ...LAYOUT.spawn },
    discovery: null,

    startGame: () => {
      audio.unlock();
      audio.setEnabled(get().settings.sound);
      set({ phase: 'playing', modal: null, modalReturnPhase: 'playing' });
      const state = get();
      // Older saves predate badges: grant what has already been earned, quietly.
      const earned = unlockedBadges(state);
      if (earned.some((id) => !state.badges[id])) {
        const badges = { ...state.badges };
        for (const id of earned) badges[id] = true;
        set({ badges });
        persist(get());
      }
      if (allQuestsComplete(state.quests) && !state.visited.finale) {
        scheduleFinale();
        return;
      }
      const next = currentQuestId(state.quests);
      const fresh =
        Object.values(state.quests).every((done) => !done) &&
        Object.keys(state.collected).length === 0;
      setTimeout(() => {
        if (get().phase !== 'playing') return;
        if (fresh) {
          get().notify(
            'Welcome, Hossna! Start by reading the welcome sign right in front of you. 💗',
            'magic',
          );
        } else if (next) {
          get().notify(`Welcome back! Next: ${getQuest(next).title}`, 'info');
        }
      }, 900);
    },

    pauseGame: () => {
      if (get().phase !== 'playing') return;
      set({ phase: 'paused', nearby: null });
    },

    resumeGame: () => {
      if (get().phase !== 'paused') return;
      set({ phase: 'playing', modal: null });
    },

    returnToTitle: () => {
      persist(get());
      set({
        phase: 'title',
        scene: 'island',
        modal: null,
        nearby: null,
        spawn: { ...LAYOUT.spawn },
      });
      audio.play('ui');
    },

    openModal: (modal) => {
      const { phase, modal: current, modalReturnPhase } = get();
      if (phase === 'playing') {
        set({ phase: 'paused', modal, modalReturnPhase: 'playing', nearby: null });
      } else {
        set({ modal, modalReturnPhase: current ? modalReturnPhase : phase });
      }
      audio.play('ui');
    },

    closeModal: () => {
      const { modalReturnPhase, phase } = get();
      set({
        modal: null,
        phase: modalReturnPhase === 'playing' && phase === 'paused' ? 'playing' : phase,
      });
      audio.play('ui');
    },

    toggleSound: () => {
      const sound = !get().settings.sound;
      set({ settings: { ...get().settings, sound } });
      audio.setEnabled(sound);
      persist(get());
      get().notify(sound ? 'Sound is on — the island is humming.' : 'Sound is off.', 'info');
    },

    updateSettings: (partial) => {
      set({ settings: { ...get().settings, ...partial } });
      if (partial.sound !== undefined) audio.setEnabled(partial.sound);
      persist(get());
    },

    setCharacter: (partial) => {
      set({ character: { ...get().character, ...partial } });
      persist(get());
    },

    notify: (message, tone = 'magic') => {
      const id = ++toastCounter;
      set((state) => {
        const dropped = state.toasts.slice(0, -3);
        for (const toast of dropped) {
          const timer = toastTimers.get(toast.id);
          if (timer) clearTimeout(timer);
          toastTimers.delete(toast.id);
        }
        return { toasts: [...state.toasts.slice(-3), { id, message, tone }] };
      });
      const timer = setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
        toastTimers.delete(id);
      }, 4600);
      toastTimers.set(id, timer);
    },

    dismissToast: (id) => {
      const timer = toastTimers.get(id);
      if (timer) clearTimeout(timer);
      toastTimers.delete(id);
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
    },

    setNearby: (nearby) => {
      if (get().nearby !== nearby) set({ nearby });
    },

    setSpawn: (x, z) => set({ spawn: { x, z } }),

    discover: (title, subtitle) => {
      const id = ++discoveryCounter;
      if (discoveryTimer) clearTimeout(discoveryTimer);
      set({ discovery: { id, title, subtitle } });
      discoveryTimer = setTimeout(() => {
        discoveryTimer = null;
        set((state) => (state.discovery?.id === id ? { discovery: null } : {}));
      }, 5200);
    },

    clearDiscovery: (id) => {
      if (discoveryTimer) {
        clearTimeout(discoveryTimer);
        discoveryTimer = null;
      }
      set((state) => (state.discovery?.id === id ? { discovery: null } : {}));
    },

    collect: (id) => {
      const definition = COLLECTIBLES.find((item) => item.id === id);
      if (!definition) return;
      const state = get();
      if (state.collected[id]) return;

      const collected: CollectedMap = { ...state.collected, [id]: true };
      set({
        collected,
        nearby: null,
        pickupFx: {
          id: ++pickupCounter,
          x: definition.x,
          z: definition.z,
          color: definition.color ?? '#ffe08a',
        },
      });

      if (definition.type === 'star') audio.play('collect');
      else if (definition.type === 'crystal') audio.play('crystal');
      else audio.play('discovery');
      get().notify(definition.message, definition.type === 'gift' ? 'quest' : 'magic');

      if (definition.type === 'star' && starCount(collected) >= STAR_GOAL) {
        completeQuest('stars', 'Five golden stars! The Star Shrine is starting to stir.');
      }
      if (definition.type === 'crystal' && countCollected(collected, 'crystal') >= CRYSTAL_GOAL) {
        completeQuest('crystals', 'All three pink crystals are humming together!');
      }
      if (
        definition.type === 'flower' &&
        !get().quests.flowers &&
        countCollected(collected, 'flower') === FLOWER_GOAL
      ) {
        get().notify('Two magical flowers! Bring them to the fountain in the flower garden.', 'quest');
      }
      syncBadges();
      persist(get());
    },

    readSign: () => {
      get().openModal('sign');
      completeQuest('sign', 'Quest complete: you read the welcome sign. 🪧');
    },

    triggerArea: (area) => {
      const state = get();
      if (state.visited[area]) return;
      set({ visited: { ...state.visited, [area]: true } });
      switch (area) {
        case 'meadowView':
          completeQuest('meadow', 'The arrival meadow hums with tiny wings. The island knows you are here!');
          get().discover('Arrival Meadow', 'Tiny wings, soft grass, and the start of everything.');
          break;
        case 'beach':
          get().discover('Shell Beach', 'Warm sand and a tide that hums in thirds.');
          break;
        case 'flowerGarden':
          get().discover('Flower Garden', 'Butterflies rehearsing their spirals.');
          break;
        case 'shrine':
          get().discover('Star Shrine', 'A hill that keeps a sleepy kind of light.');
          break;
      }
      syncBadges();
      persist(get());
    },

    enterSecretGarden: () => {
      const state = get();
      if (!state.gateOpen || state.quests.secret) return;
      set({ visited: { ...state.visited, secretGarden: true } });
      completeQuest('secret', 'You stepped into the secret garden. Welcome to the most hidden place on the island.');
      get().discover('Secret Garden', 'A place that only opens for the curious.');
    },

    enterCottage: () => {
      if (get().scene === 'interior') return;
      const firstVisit = !get().quests.cottage;
      set({
        scene: 'interior',
        spawn: { ...INTERIOR.spawn },
        nearby: null,
        modal: null,
        modalReturnPhase: 'playing',
        visited: { ...get().visited, cottage: true },
        phase: 'playing',
      });
      audio.play('door');
      if (firstVisit) {
        completeQuest('cottage', GAME_INFO.cottageWelcome);
        get().discover("Hossna's Cottage", 'Cinnamon, warm light, and a cat who approves.');
      } else {
        get().notify('The cottage is just as cozy as you remember.', 'info');
      }
      syncBadges();
      persist(get());
    },

    exitCottage: () => {
      set({
        scene: 'island',
        spawn: { x: LAYOUT.cottage.x, z: LAYOUT.cottage.interactZ + 0.6 },
        nearby: null,
        modal: null,
        phase: 'playing',
      });
      audio.play('door');
      persist(get());
    },

    takeKey: () => {
      if (get().quests.key) return;
      audio.play('reward');
      completeQuest('key', GAME_INFO.keyFound);
    },

    tryGate: () => {
      const state = get();
      if (state.gateOpen) return;
      if (!state.quests.key) {
        get().notify(GAME_INFO.gateLocked, 'info');
        audio.play('ui');
        return;
      }
      set({ gateOpen: true, nearby: null });
      audio.play('door');
      get().notify('The old key turns with a soft click. The gate swings open!', 'quest');
      persist(get());
    },

    openSecretNote: () => {
      if (!get().gateOpen) return;
      set({ visited: { ...get().visited, secretNote: true } });
      get().openModal('note');
      completeQuest('note', 'Quest complete: you read the secret note. 💌');
    },

    offerFlowers: () => {
      const state = get();
      if (state.quests.flowers) {
        get().notify('You toss a tiny pebble in and make a wish. The water sparkles back at you.', 'magic');
        audio.play('collect');
        return;
      }
      const flowers = countCollected(state.collected, 'flower');
      if (flowers < FLOWER_GOAL) {
        get().notify(GAME_INFO.fountainNeedsFlowers.replace('{flowers}', String(flowers)), 'info');
        audio.play('ui');
        return;
      }
      set({ nearby: null });
      audio.play('reward');
      completeQuest('flowers', GAME_INFO.fountainReward);
    },

    unlockShrine: () => {
      const state = get();
      if (state.shrineUnlocked) {
        get().notify("The shrine's light is still warm. It is happy you came back.", 'magic');
        audio.play('collect');
        return;
      }
      const stars = starCount(state.collected);
      const crystals = countCollected(state.collected, 'crystal');
      if (stars < STAR_GOAL || crystals < CRYSTAL_GOAL) {
        get().notify(
          GAME_INFO.shrineLocked
            .replace('{starGoal}', String(STAR_GOAL))
            .replace('{crystalGoal}', String(CRYSTAL_GOAL))
            .replace('{stars}', String(stars))
            .replace('{crystals}', String(crystals)),
          'info',
        );
        audio.play('ui');
        return;
      }
      set({ shrineUnlocked: true, nearby: null });
      audio.play('reward');
      completeQuest('shrine', GAME_INFO.shrineRewardTitle);
      setTimeout(() => get().notify(GAME_INFO.shrineReward, 'magic'), 700);
      syncBadges();
    },

    findSecret: (id) => {
      const secret = SECRETS.find((item) => item.id === id);
      if (!secret) return;
      const state = get();
      get().notify(secret.message, 'magic');
      if (state.secrets[id]) {
        audio.play('ui');
        return;
      }
      const secrets = { ...state.secrets, [id]: true as const };
      set({ secrets });
      audio.play('discovery');
      const found = Object.keys(secrets).length;
      get().notify(`Secret found: ${secret.name} (${found}/${TOTAL_SECRETS})`, 'quest');
      syncBadges();
      persist(get());
    },

    addPlayTime: (seconds) => {
      set({ playSeconds: get().playSeconds + seconds });
      persist(get());
    },

    resetProgress: () => {
      clearProgress();
      if (finaleTimer) clearTimeout(finaleTimer);
      finaleTimer = null;
      for (const timer of toastTimers.values()) clearTimeout(timer);
      toastTimers.clear();
      if (discoveryTimer) clearTimeout(discoveryTimer);
      discoveryTimer = null;
      set({
        collected: {},
        quests: { ...DEFAULT_QUESTS },
        visited: {},
        secrets: {},
        badges: {},
        gateOpen: false,
        shrineUnlocked: false,
        character: { ...DEFAULT_CHARACTER },
        playSeconds: 0,
        phase: 'title',
        scene: 'island',
        nearby: null,
        modal: null,
        modalReturnPhase: 'title',
        toasts: [],
        pickupFx: null,
        spawn: { ...LAYOUT.spawn },
        discovery: null,
      });
      // Keep preferences, but erase all progress from storage.
      persist(get());
      audio.play('ui');
    },

    saveNow: () => persist(get()),
  };
});

// Persist once more when a tab is hidden or closed, so the latest step is kept.
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persist(useGameStore.getState());
  });
}

export const selectStars = (state: GameStore) => starCount(state.collected);
