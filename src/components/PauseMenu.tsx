import { audio } from '../game/audio';
import { QUESTS, starCount } from '../game/quests';
import { useGameStore } from '../game/store';
import {
  FlowerIcon,
  GearIcon,
  HeartIcon,
  MuteIcon,
  PlayIcon,
  SoundIcon,
  StarIcon,
} from './Icons';

export const PauseMenu = () => {
  const phase = useGameStore((state) => state.phase);
  const modal = useGameStore((state) => state.modal);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const openModal = useGameStore((state) => state.openModal);
  const returnToTitle = useGameStore((state) => state.returnToTitle);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const sound = useGameStore((state) => state.settings.sound);
  const collected = useGameStore((state) => state.collected);
  const quests = useGameStore((state) => state.quests);

  if (phase !== 'paused' || modal) return null;

  const stars = starCount(collected);
  const completed = QUESTS.filter((quest) => quests[quest.id]).length;

  return (
    <div className="pause-overlay">
      <div className="pause-card" role="dialog" aria-modal="true" aria-labelledby="pause-title">
        <div className="pause-moon" aria-hidden="true">
          <span />
        </div>
        <p className="modal-kicker">a quiet moment</p>
        <h2 id="pause-title" className="pause-title">The island will wait for you.</h2>
        <p className="pause-subtitle">
          <StarIcon size={14} /> {stars} stars · {completed} / {QUESTS.length} quests found
        </p>

        <button
          className="button button--primary button--wide"
          onClick={() => {
            audio.play('ui');
            resumeGame();
          }}
        >
          <PlayIcon size={18} /> Keep exploring
        </button>

        <div className="pause-grid">
          <button className="button button--soft" onClick={() => openModal('howto')}>
            How to play
          </button>
          <button className="button button--soft" onClick={() => openModal('character')}>
            <FlowerIcon size={16} /> Dress up
          </button>
          <button className="button button--soft" onClick={() => openModal('settings')}>
            <GearIcon size={16} /> Settings
          </button>
          <button className="button button--soft" onClick={toggleSound}>
            {sound ? <SoundIcon size={16} /> : <MuteIcon size={16} />}
            {sound ? 'Sound on' : 'Sound off'}
          </button>
        </div>

        <button className="pause-title-button" onClick={returnToTitle}>
          Back to the title screen
        </button>
        <p className="pause-note">
          <HeartIcon size={12} /> Everything is saved in this browser as you go.
        </p>
      </div>
    </div>
  );
};
