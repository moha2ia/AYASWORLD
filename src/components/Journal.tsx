import { COLLECTIBLES, SECRETS, type CollectibleType } from '../config/gameConfig';
import { badgeCount, BADGES, TOTAL_BADGES } from '../game/achievements';
import {
  completionPercent,
  countCollected,
  currentQuestId,
  formatPlayTime,
  QUESTS,
} from '../game/quests';
import { useGameStore } from '../game/store';
import { Modal } from './Modal';

const PLACES: Array<{ id: string; name: string }> = [
  { id: 'meadowView', name: 'Arrival Meadow' },
  { id: 'cottage', name: "Hossna's Cottage" },
  { id: 'flowerGarden', name: 'Flower Garden' },
  { id: 'beach', name: 'Shell Beach' },
  { id: 'secretGarden', name: 'Secret Garden' },
  { id: 'shrine', name: 'Star Shrine' },
];

const COLLECTION: Array<{ type: CollectibleType; name: string; icon: string }> = [
  { type: 'star', name: 'Golden stars', icon: '⭐' },
  { type: 'crystal', name: 'Pink crystals', icon: '💎' },
  { type: 'flower', name: 'Magical flowers', icon: '🌸' },
  { type: 'gift', name: 'Little gifts', icon: '🎁' },
];

export const Journal = () => {
  const modal = useGameStore((state) => state.modal);
  const quests = useGameStore((state) => state.quests);
  const collected = useGameStore((state) => state.collected);
  const secrets = useGameStore((state) => state.secrets);
  const badges = useGameStore((state) => state.badges);
  const visited = useGameStore((state) => state.visited);
  const gateOpen = useGameStore((state) => state.gateOpen);
  const shrineUnlocked = useGameStore((state) => state.shrineUnlocked);
  const playSeconds = useGameStore((state) => state.playSeconds);
  const closeModal = useGameStore((state) => state.closeModal);

  if (modal !== 'journal') return null;

  const current = currentQuestId(quests);
  const percent = completionPercent({ collected, quests, gateOpen, shrineUnlocked, secrets });
  const secretsFound = SECRETS.filter((secret) => secrets[secret.id]).length;
  const badgesFound = badgeCount(badges);
  const questRows = QUESTS.filter((quest) => quests[quest.id] || quest.id === current);
  const hiddenQuests = QUESTS.length - questRows.length;

  return (
    <Modal
      kicker="Hossna's journal"
      title="Island Journal"
      subtitle={`${percent}% complete · ${badgesFound} ${badgesFound === 1 ? 'badge' : 'badges'} · ${formatPlayTime(playSeconds)} on the island`}
      onClose={closeModal}
      size="wide"
      footer={
        <button className="button button--primary button--small" onClick={closeModal}>
          Back to the island
        </button>
      }
    >
      <div className="journal-progress" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>

      <div className="journal-grid">
        <section className="journal-section">
          <h3 className="journal-heading">Quests</h3>
          <ol className="journal-quests">
            {questRows.map((quest) => {
              const status = quests[quest.id] ? 'done' : 'current';
              return (
                <li key={quest.id} className={`journal-quest journal-quest--${status}`}>
                  <span className="journal-quest-mark" aria-hidden="true">
                    {status === 'done' ? '✓' : quest.icon}
                  </span>
                  <span className="journal-quest-text">
                    <span className="journal-quest-title">{quest.title}</span>
                    {status === 'current' && <span className="journal-quest-hint">{quest.hint}</span>}
                  </span>
                </li>
              );
            })}
            {hiddenQuests > 0 && (
              <li className="journal-quest journal-quest--locked">
                <span className="journal-quest-mark" aria-hidden="true">
                  ✦
                </span>
                <span className="journal-quest-text">
                  <span className="journal-quest-title">
                    {hiddenQuests} more little {hiddenQuests === 1 ? 'quest' : 'quests'} to discover
                  </span>
                </span>
              </li>
            )}
          </ol>
        </section>

        <div className="journal-column">
          <section className="journal-section">
            <h3 className="journal-heading">Collection</h3>
            <ul className="journal-collection">
              {COLLECTION.map((entry) => {
                const total = COLLECTIBLES.filter((item) => item.type === entry.type).length;
                const found = countCollected(collected, entry.type);
                return (
                  <li key={entry.type} className={found === total ? 'is-complete' : ''}>
                    <span aria-hidden="true">{entry.icon}</span>
                    <span>{entry.name}</span>
                    <strong>
                      {found}/{total}
                    </strong>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="journal-section">
            <h3 className="journal-heading">
              Hidden secrets <span className="journal-count">{secretsFound}/{SECRETS.length}</span>
            </h3>
            <ul className="journal-secrets">
              {SECRETS.map((secret) => {
                const found = Boolean(secrets[secret.id]);
                return (
                  <li key={secret.id} className={found ? 'is-found' : ''}>
                    <span className="journal-secret-name">{found ? secret.name : '???'}</span>
                    <span className="journal-secret-text">{found ? secret.message : secret.hint}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="journal-section">
            <h3 className="journal-heading">Places</h3>
            <ul className="journal-places">
              {PLACES.map((place) => (
                <li key={place.id} className={visited[place.id] ? 'is-found' : ''}>
                  {visited[place.id] ? place.name : '???'}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className="journal-section journal-badges">
        <h3 className="journal-heading">
          Badges <span className="journal-count">{badgesFound}/{TOTAL_BADGES}</span>
        </h3>
        <ul className="badge-grid">
          {BADGES.map((badge) => {
            const found = Boolean(badges[badge.id]);
            return (
              <li key={badge.id} className={`badge-card ${found ? 'is-found' : ''}`}>
                <span className="badge-icon" aria-hidden="true">
                  {found ? badge.icon : '✦'}
                </span>
                <span className="badge-copy">
                  <strong>{found ? badge.name : 'Hidden badge'}</strong>
                  <span>{found ? badge.description : 'Not found yet — keep exploring.'}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </Modal>
  );
};
