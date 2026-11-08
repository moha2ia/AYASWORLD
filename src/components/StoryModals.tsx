import { GAME_INFO } from '../config/gameConfig';
import { useGameStore } from '../game/store';
import { HeartIcon, SparkleIcon, StarIcon } from './Icons';
import { Modal } from './Modal';

export const StoryModals = () => {
  const modal = useGameStore((state) => state.modal);
  const closeModal = useGameStore((state) => state.closeModal);
  const returnToTitle = useGameStore((state) => state.returnToTitle);

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
          Five golden stars will wake the shrine on the northern hill. Everything else
          is yours to discover.
        </p>
      </Modal>
    );
  }

  if (modal === 'note') {
    return (
      <Modal
        kicker="found in the secret garden"
        title="A note for AYA"
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
        <p className="story-small">
          You found all five little pieces of magic. The island will keep its stars
          glowing for whenever you want to come back.
        </p>
      </Modal>
    );
  }

  return null;
};
