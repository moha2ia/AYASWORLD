import { playerState } from './playerState';
import { currentQuestId, questTarget, routeTarget } from './quests';
import { useGameStore } from './store';
import type { QuestId, SceneId } from './types';

/** Where the current quest points right now. Mutated in place, read every frame. */
export const guideState = {
  active: false,
  questId: null as QuestId | null,
  x: 0,
  z: 0,
  scene: 'island' as SceneId,
  distance: 0,
  /** True when the arrow points at a door instead of the real goal. */
  viaDoor: false,
};

export const updateGuide = () => {
  const state = useGameStore.getState();
  const questId = currentQuestId(state.quests);
  guideState.questId = questId;
  if (!questId) {
    guideState.active = false;
    return;
  }
  const target = questTarget(questId, state, {
    x: playerState.x,
    z: playerState.z,
    scene: state.scene,
  });
  if (!target) {
    guideState.active = false;
    return;
  }
  const routed = routeTarget(target, state.scene);
  guideState.active = true;
  guideState.x = routed.x;
  guideState.z = routed.z;
  guideState.scene = routed.scene;
  guideState.viaDoor = routed !== target;
  guideState.distance = Math.hypot(routed.x - playerState.x, routed.z - playerState.z);
};
