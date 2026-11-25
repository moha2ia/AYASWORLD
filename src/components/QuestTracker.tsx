import { useEffect, useRef } from 'react';
import { cameraState } from '../game/cameraState';
import { guideState } from '../game/guide';
import { playerState } from '../game/playerState';
import {
  currentQuestId,
  getQuest,
  QUEST_ORDER,
  questProgress,
  TOTAL_QUESTS,
} from '../game/quests';
import { useGameStore } from '../game/store';

/** An arrow that always points from the player toward the current quest target. */
const GuideCompass = () => {
  const arrow = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let lastText = '';
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!arrow.current || !label.current || !root.current) return;
      if (!guideState.active) {
        root.current.dataset.hidden = 'true';
        return;
      }
      root.current.dataset.hidden = 'false';
      const dx = guideState.x - playerState.x;
      const dz = guideState.z - playerState.z;
      const yaw = cameraState.yaw;
      const forward = dx * -Math.sin(yaw) + dz * -Math.cos(yaw);
      const right = dx * Math.cos(yaw) + dz * -Math.sin(yaw);
      const angle = Math.atan2(right, forward);
      arrow.current.style.transform = `rotate(${angle}rad)`;
      const distance = Math.round(guideState.distance);
      const text =
        distance < 1 ? 'right here' : guideState.viaDoor ? `door · ${distance}m` : `${distance}m`;
      if (text !== lastText) {
        lastText = text;
        label.current.textContent = text;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="quest-compass" ref={root} data-hidden="true" aria-hidden="true">
      <span className="quest-compass-dial">
        <span className="quest-compass-arrow" ref={arrow}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 1.5 13 13 8 10.4 3 13z" fill="currentColor" />
          </svg>
        </span>
      </span>
      <span className="quest-compass-label" ref={label} />
    </div>
  );
};

export const QuestTracker = () => {
  const quests = useGameStore((state) => state.quests);
  const collected = useGameStore((state) => state.collected);
  const shrineUnlocked = useGameStore((state) => state.shrineUnlocked);
  const gateOpen = useGameStore((state) => state.gateOpen);
  const secrets = useGameStore((state) => state.secrets);
  const guide = useGameStore((state) => state.settings.guide);

  const completed = QUEST_ORDER.filter((id) => quests[id]).length;
  const activeId = currentQuestId(quests);
  const active = activeId ? getQuest(activeId) : null;
  const progress = activeId
    ? questProgress(activeId, { collected, quests, gateOpen, shrineUnlocked, secrets })
    : null;
  const ratio = progress && progress.target > 0 ? progress.current / progress.target : 0;

  return (
    <aside className="quest-tracker" aria-live="polite" aria-label="Quest tracker">
      <div className="quest-heading">
        <span className="quest-heading-label">Your little quest</span>
        <span className="quest-count">
          {completed} / {TOTAL_QUESTS}
        </span>
      </div>
      {active ? (
        <>
          <div className="quest-title-row">
            <span className="quest-icon" aria-hidden="true">
              {active.icon}
            </span>
            <h2 className="quest-title">{active.title}</h2>
            {guide && <GuideCompass />}
          </div>
          <p className="quest-hint">{active.hint}</p>
          {progress && (
            <div className="quest-progress-row">
              <div className="quest-progress-track" aria-hidden="true">
                <span style={{ width: `${Math.round(ratio * 100)}%` }} />
              </div>
              <span className="quest-progress-text">{progress.text}</span>
            </div>
          )}
        </>
      ) : (
        <div className="quest-complete">
          <span aria-hidden="true">✦</span>
          <div>
            <h2 className="quest-title">Every little quest is complete</h2>
            <p className="quest-hint">Hunt for the last secrets — press J for your journal.</p>
          </div>
        </div>
      )}
    </aside>
  );
};
