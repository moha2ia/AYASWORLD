import { useGameStore } from '../game/store';
import { Modal } from './Modal';
import { StarIcon } from './Icons';

export const Journal = () => {
  const modal = useGameStore((state) => state.modal);
  const discovered = useGameStore((state) => state.discovered);

  if (modal !== 'journal') return null;

  const discoveredKeys = Object.keys(discovered).filter(
    (key) => discovered[key as keyof typeof discovered] === true
  );

  return (
    <Modal
      kicker="what you've discovered"
      title="Discovery Journal"
      subtitle="First-time findings on the island"
      onClose={() => useGameStore.getState().closeModal()}
      size="wide"
    >
      <div className="journal-list">
        {discoveredKeys.length === 0 ? (
          <p className="journal-empty">No discoveries yet. Go explore!</p>
        ) : (
          <ul>
            {discoveredKeys.map((key) => {
              const labelMap: Record<string, string> = {
                meadowView: 'Arrival Meadow',
                beach: 'Beach',
                flowerGarden: 'Flower Garden',
                shrine: 'Star Shrine',
              };
              return (
                <li key={key} className="journal-item">
                  <span className="journal-icon">✦</span>
                  <span className="journal-name">{labelMap[key] || key}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="journal-footer">
        <p>
          <StarIcon size={12} /> {discoveredKeys.length} discoveries recorded
        </p>
        <button
          className="button button--primary button--small"
          onClick={() => useGameStore.getState().closeModal()}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};