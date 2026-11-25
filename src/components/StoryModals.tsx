import { GAME_INFO } from '../config/gameConfig';
import {
  completionPercent,
  formatPlayTime,
  TOTAL_COLLECTIBLES,
  TOTAL_SECRETS,
} from '../game/quests';
import { useGameStore } from '../game/store';
import { HeartIcon, SparkleIcon, StarIcon } from './Icons';
import { Modal } from './Modal';

export const StoryModals = () => {
  const modal = useGameStore((state) => state.modal);
  const closeModal = useGameStore((state) => state.closeModal);
  const returnToTitle = useGameStore((state) => state.returnToTitle);
  const collected = useGameStore((state) => state.collected);
  const quests = useGameStore((state) => state.quests);
  const gateOpen = useGameStore((state) => state.gateOpen);
  const shrineUnlocked = useGameStore((state) => state.shrineUnlocked);
  const secrets = useGameStore((state) => state.secrets);
  const playSeconds = useGameStore((state) => state.playSeconds);

  if (modal === 'sign') {
    return (
      <Modal
        kicker="a wooden sign in the meadow"
        title={GAME_INFO.signTitle}
        onClose={closeModal}
        footer={
          <button className="button button--primary button--wide" onClick={closeModal}>
            Let's explore
          </button>
        }
      >
        <p className="story-letter">{GAME_INFO.welcomeMessage}</p>
        <div className="story-flourish" aria-hidden="true">
          <span>✿</span>
          <span>♥</span>
          <span>✿</span>
        </div>
        <p className="story-small">
          Start at the cottage on the western path — someone left something there for
          you. The quest card and the pink marker will always show the way.
        </p>
      </Modal>
    );
  }

  if (modal === 'note') {
    return (
      <Modal
        kicker="found in the secret garden"
        title="A note for Hossna"
        onClose={closeModal}
        footer={
          <button className="button button--primary button--wide" onClick={closeModal}>
            Keep it close
          </button>
        }
      >
        <div className="note-paper">
          <HeartIcon size={22} />
          <p className="story-letter">{GAME_INFO.secretNote}</p>
          <p className="note-signature">— with all my love</p>
        </div>
      </Modal>
    );
  }

  if (modal === 'finale') {
    const percent = completionPercent({ collected, quests, gateOpen, shrineUnlocked, secrets });
    const secretsFound = Object.keys(secrets).length;
    const itemsFound = Object.keys(collected).length;
    return (
      <Modal
        kicker="the island remembers"
        title={GAME_INFO.finaleTitle}
        onClose={closeModal}
        celebrate
        size="wide"
        footer={
          <div className="finale-actions">
            <button className="button button--primary" onClick={closeModal}>
              Keep wandering
            </button>
            <button className="button button--soft" onClick={returnToTitle}>
              Back to the title screen
            </button>
          </div>
        }
      >
        <div className="finale-confetti" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={index}
              className={`confetti confetti--${index % 5}`}
              style={{
                left: `${(index * 37) % 100}%`,
                animationDelay: `${(index % 7) * 0.18}s`,
              }}
            />
          ))}
        </div>
        <div className="finale-stars" aria-hidden="true">
          <StarIcon size={28} />
          <SparkleIcon size={18} />
          <StarIcon size={20} />
        </div>
        <p className="story-letter story-letter--large">{GAME_INFO.finaleBody}</p>
        <blockquote className="finale-quote">{GAME_INFO.secretNote}</blockquote>
        <div className="finale-stats">
          <div>
            <strong>{percent}%</strong>
            <span>complete</span>
          </div>
          <div>
            <strong>
              {secretsFound}/{TOTAL_SECRETS}
            </strong>
            <span>secrets</span>
          </div>
          <div>
            <strong>
              {itemsFound}/{TOTAL_COLLECTIBLES}
            </strong>
            <span>treasures</span>
          </div>
          <div>
            <strong>{formatPlayTime(playSeconds)}</strong>
            <span>play time</span>
          </div>
        </div>
        <p className="story-small">
          {secretsFound < TOTAL_SECRETS || itemsFound < TOTAL_COLLECTIBLES
            ? 'A few treasures and secrets are still hiding. Your journal (J) keeps the hints.'
            : 'You found every last piece of magic. The island will keep its stars glowing for you.'}
        </p>
      </Modal>
    );
  }

  return null;
};
