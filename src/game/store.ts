import { create } from 'zustand';
import {
  COLLECTIBLES,
  DEFAULT_CHARACTER,
  GAME_INFO,
  STAR_GOAL,
} from '../config/gameConfig';
import { audio } from './audio';
import { allQuestsComplete, starCount } from './quests';
import {
  clearProgress,
  DEFAULT_QUESTS,
  loadProgress,
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
  Toast,
} from './types';
import { INTERIOR, LAYOUT } from './world/layout';

const saved = loadProgress();

interface GameState extends ProgressData {
  phase: Phase;
  scene: SceneId;
  nearby: string | null;
  modal: ModalId;
  modalReturnPhase: Phase;
  toasts: Toast[];
  pickupFx: PickupFx | null;
  spawn: { x: number; z: number };
  startingFresh: boolean;
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
  collect: (id: string) => void;
  discoverSecretGarden: () => void;
  triggerArea: (area: AreaId) => void;
  enterCottage: () => void;
  exitCottage: () => void;
  openSecretNote: () => void;
  openGate: () => void;
  unlockShrine: () => void;
  resetProgress: () => void;
  saveNow: () => void;
}

export type GameStore = GameState & GameActions;

const progressFrom = (state: GameState): ProgressData => ({
  version: 1,
  collected: state.collected,
  quests: state.quests,
  visited: state.visited,
  gateOpen: state.gateOpen,
  shrineUnlocked: state.shrineUnlocked,
  character: state.character,
  settings: state.settings,
  discovered: state.discovered,
});

const persist = (state: GameState) => saveProgress(progressFrom(state));

const initialToasts: Toast[] = [];

let toastCounter = 0;
let pickupCounter = 0;
const toastTimers = new Map<number, ReturnType<typeof setTimeout>>();

const scheduleFinale = (get: () => GameStore) => {
  setTimeout(() => {
    const state = get();
    if (state.visited.finale) return;
    if (!allQuestsComplete(state.quests)) return;
    const visited = { ...state.visited, finale: true };
    audio.play('finale');
    useGameStore.setState({
      modal: 'finale',
      modalReturnPhase: state.phase === 'playing' ? 'playing' : state.phase,
      phase: state.phase === 'playing' ? 'paused' : state.phase,
      nearby: null,
      visited,
    });
    saveProgress(progressFrom(get()));
  }, 1500);
};

export const useGameStore = create<GameStore>()((set, get) => {
  const completeQuest = (id: QuestId, message: string) => {
    const state = get();
    if (state.quests[id]) return;
    const quests = { ...state.quests, [id]: true };
    set({ quests });
    get().notify(message, 'quest');
    audio.play('discovery');
    persist(get());
    if (allQuestsComplete(quests)) scheduleFinale(get);
  };

  return {
    ...saved,
    phase: 'title',
    scene: 'island',
    nearby: null,
    modal: null,
    modalReturnPhase: 'title',
    toasts: initialToasts,
    pickupFx: null,
    spawn: { ...LAYOUT.spawn },
    startingFresh: !saved.collected || Object.keys(saved.collected).length === 0,
    discovered: saved.discovered || {},

    startGame: () => {
      audio.unlock();
      audio.setEnabled(get().settings.sound);
      set({ phase: 'playing', modal: null, modalReturnPhase: 'playing' });
      if (!get().quests.meadow && !get().visited.meadowView) {
        setTimeout(() => {
          const current = get();
          if (current.phase === 'playing' && !current.visited.meadowView) {
            current.notify(
              'Welcome, AYA. Wander to the flower arch near the welcome sign to begin. 💗',
              'magic',
            );
          }
        }, 900);
      }
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
      const phase = get().phase;
      if (phase === 'playing') {
        set({ phase: 'paused', modal, modalReturnPhase: 'playing', nearby: null });
      } else {
        set({ modal, modalReturnPhase: get().modal ? get().modalReturnPhase : phase });
      }
      audio.play('ui');
    },

    closeModal: () => {
      const { modalReturnPhase, phase } = get();
      set({
        modal: null,
        phase:
          modalReturnPhase === 'playing' && phase === 'paused' ? 'playing' : phase,
      });
      audio.play('ui');
    },

    toggleSound: () => {
      const sound = !get().settings.sound;
      const settings = { ...get().settings, sound };
      set({ settings });
      audio.setEnabled(sound);
      persist(get());
      get().notify(sound ? 'Sound is on — the island is humming.' : 'Sound is off.', 'info');
    },

    updateSettings: (partial) => {
      const settings = { ...get().settings, ...partial };
      set({ settings });
      if (partial.sound !== undefined) audio.setEnabled(partial.sound);
      persist(get());
    },

    setCharacter: (partial) => {
      const character = { ...get().character, ...partial };
      set({ character });
      persist(get());
    },

    notify: (message, tone = 'magic') => {
      const id = ++toastCounter;
      const toast: Toast = { id, message, tone };
      set((state) => ({ toasts: [...state.toasts.slice(-3), toast] }));
      const timer = setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
        toastTimers.delete(id);
      }, 4200);
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

    collect: (id) => {
      const definition = COLLECTIBLES.find((item) => item.id === id);
      if (!definition) return;
      const state = get();
      if (state.collected[id]) return;

      const collected: CollectedMap = { ...state.collected, [id]: true };
      const stars = starCount(collected);
      const newDiscovery = stars >= STAR_GOAL && !state.quests.stars;
      set({
        collected,
        nearby: null,
        pickupFx: {
          id: ++pickupCounter,
          x: definition.x,
          z: definition.z,
          color: definition.color ?? '#ffe08a',
        },
        quests: newDiscovery ? { ...state.quests, stars: true } : state.quests,
        startingFresh: false,
      });

      if (definition.type === 'star') audio.play('collect');
      else if (definition.type === 'crystal') audio.play('crystal');
      else audio.play('discovery');

      get().notify(definition.message, definition.type === 'gift' ? 'quest' : 'magic');
      if (newDiscovery) {
        get().notify('Five golden stars! The Star Shrine is waiting on the hill.', 'quest');
        if (allQuestsComplete(get().quests)) scheduleFinale(get);
      }
      persist(get());
    },

    discoverSecretGarden: () => {
      if (get().quests.secret) return;
      const visited = { ...get().visited, secretGarden: true };
      const discovered = { ...get().discovered, secretGarden: true };
      set({ visited, discovered });
      completeQuest('secret', 'A secret path has been discovered. Welcome to the secret garden.');
      persist(get());
    },

    triggerArea: (area) => {
      const state = get();
      if (state.visited[area]) return;
      const visited = { ...state.visited, [area]: true };
      let discovered = { ...state.discovered };
      switch (area) {
        case 'meadowView':
          if (!state.discovered.meadowView) discovered.meadowView = true;
          completeQuest('meadow', 'The arrival meadow hums with tiny wings. You found a little piece of magic!');
          break;
        case 'beach':
          if (!state.discovered.beach) discovered.beach = true;
          get().notify('The sand is warm and the waves are singing. Welcome to the beach.', 'magic');
          break;
        case 'flowerGarden':
          if (!state.discovered.flowerGarden) discovered.flowerGarden = true;
          get().notify('Butterflies are dancing in the flower garden.', 'magic');
          break;
        case 'shrine':
          if (!state.discovered.shrine) discovered.shrine = true;
          get().notify('The Star Shrine hums quietly on the hill.', 'magic');
          break;
      }
      set({ visited, discovered });
      persist(get());
    },

    enterCottage: () => {
      if (get().scene === 'interior') return;
      const firstVisit = !get().quests.cottage;
      set({
        scene: 'interior',
        spawn: { ...INTERIOR.spawn },
        nearby: null,
        modalReturnPhase: 'playing',
        visited: { ...get().visited, cottage: true },
        quests: { ...get().quests, cottage: true },
        phase: 'playing',
      });
      audio.play('door');
      if (firstVisit) {
        get().notify(GAME_INFO.cottageWelcome, 'quest');
        audio.play('discovery');
      } else {
        get().notify('The cottage is just as cozy as you remember.', 'info');
      }
      persist(get());
      if (allQuestsComplete(get().quests)) scheduleFinale(get);
    },

    exitCottage: () => {
      set({
        scene: 'island',
        spawn: { x: LAYOUT.cottage.x, z: LAYOUT.cottage.interactZ },
        nearby: null,
        phase: 'playing',
      });
      audio.play('door');
      persist(get());
    },

    openSecretNote: () => {
      set({ visited: { ...get().visited, secretNote: true } });
      get().openModal('note');
      audio.play('discovery');
      persist(get());
    },

    openGate: () => {
      if (get().gateOpen) return;
      set({ gateOpen: true, nearby: null });
      audio.play('discovery');
      get().notify('The old gate creaks open. A hidden path appears.', 'quest');
      persist(get());
    },

    unlockShrine: () => {
      const state = get();
      const stars = starCount(state.collected);
      if (stars < STAR_GOAL) {
        get().notify(
          GAME_INFO.shrineLocked.replace('{stars}', String(stars)),
          'info',
        );
        audio.play('ui');
        return;
      }
      if (state.shrineUnlocked) {
        get().notify("The shrine's light is still warm. It is happy you came back.", 'magic');
        audio.play('collect');
        return;
      }
      set({
        shrineUnlocked: true,
        quests: { ...state.quests, shrine: true },
        nearby: null,
      });
      get().notify(GAME_INFO.shrineRewardTitle, 'quest');
      setTimeout(() => get().notify(GAME_INFO.shrineReward, 'magic'), 700);
      audio.play('reward');
      persist(get());
      if (allQuestsComplete(get().quests)) scheduleFinale(get);
    },

    resetProgress: () => {
      clearProgress();
      const settings = { ...get().settings };
      set({
        collected: {},
        quests: { ...DEFAULT_QUESTS },
        visited: {},
        gateOpen: false,
        shrineUnlocked: false,
        character: { ...DEFAULT_CHARACTER },
        settings,
        phase: 'title',
        scene: 'island',
        nearby: null,
        modal: null,
        modalReturnPhase: 'title',
        toasts: [],
        pickupFx: null,
        spawn: { ...LAYOUT.spawn },
        startingFresh: true,
      });
      // Keep preferences, but erase all progress from storage.
      saveProgress(progressFrom(get()));
      audio.play('ui');
    },

    saveNow: () => persist(get()),
  };
});

// Persist once more when a tab is hidden or closed, so the latest step is kept.
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      const state = useGameStore.getState();
      saveProgress(progressFrom(state));
    }
  });
}

export const selectStars = (state: GameStore) => starCount(state.collected);
