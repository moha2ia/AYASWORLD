import {
  QUEST_ORDER,
  QUESTS,
  questProgress,
} from '../game/quests';
import { useGameStore } from '../game/store';

export const QuestTracker = () => {
  const quests = useGameStore((state) => state.quests);
  const collected = useGameStore((state) => state.collected);
  const shrineUnlocked = useGameStore((state) => state.shrineUnlocked);

  const completed = QUEST_ORDER.filter((id) => quests[id]).length;
  const active = QUESTS.find((quest) => !quests[quest.id]);
  const progress = active
    ? questProgress(active.id, { collected, shrineUnlocked })
    : null;
  const ratio = progress && progress.target > 0 ? progress.current / progress.target : 0;

  return (
    <aside className="quest-tracker" aria-live="polite" aria-label="Quest tracker">
      <div className="quest-heading">
        <span className="quest-heading-label">Your little quest</span>
        <span className="quest-count">{completed} / {QUESTS.length}</span>
      </div>
      {active ? (
        <>
          <div className="quest-title-row">
            <span className="quest-icon" aria-hidden="true">{active.icon}</span>
            <h2 className="quest-title">{active.title}</h2>
          </div>
          <p className="quest-hint">{active.hint}</p>
          <div className="quest-progress-row">
            <div className="quest-progress-track" aria-hidden="true">
              <span style={{ width: `${Math.round(ratio * 100)}%` }} />
            </div>
            <span className="quest-progress-text">
              {progress?.text || (completed > 0 ? `${completed} found` : 'just beginning')}
            </span>
          </div>
        </>
      ) : (
        <div className="quest-complete">
          <span aria-hidden="true">✦</span>
          <div>
            <h2 className="quest-title">Every little quest is complete</h2>
            <p className="quest-hint">The island is still yours to wander.</p>
          </div>
        </div>
      )}
    </aside>
  );
};
