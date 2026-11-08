import { GAME_INFO } from '../config/gameConfig';
import { QUESTS, starCount } from '../game/quests';
import { useGameStore } from '../game/store';
import { GearIcon, HeartIcon, MuteIcon, PlayIcon, SoundIcon, StarIcon } from './Icons';

export const StartScreen = ({ ready }: { ready: boolean }) => {
  const startGame = useGameStore((state) => state.startGame);
  const openModal = useGameStore((state) => state.openModal);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const sound = useGameStore((state) => state.settings.sound);
  const collected = useGameStore((state) => state.collected);
  const quests = useGameStore((state) => state.quests);

  const stars = starCount(collected);
  const completed = QUESTS.filter((quest) => quests[quest.id]).length;
  const hasProgress = stars > 0 || completed > 0;

  return (
    <section className="start-screen" aria-label="Aya's Secret World start screen">
      <div className="start-vignette" aria-hidden="true" />
      <div className="start-petals" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => (
          <span key={index} className={`start-petal start-petal--${index % 4}`} />
        ))}
      </div>

      <header className="start-topbar">
        <p className="start-made">
          <HeartIcon size={13} /> a tiny island, made for AYA
        </p>
        <div className="start-actions">
          <button
            className="icon-button icon-button--light"
            onClick={toggleSound}
            aria-label={sound ? 'Mute sound' : 'Turn sound on'}
            title={sound ? 'Mute sound' : 'Turn sound on'}
          >
            {sound ? <SoundIcon size={20} /> : <MuteIcon size={20} />}
          </button>
          <button
            className="icon-button icon-button--light"
            onClick={() => openModal('settings')}
            aria-label="Open settings"
            title="Settings"
          >
            <GearIcon size={20} />
          </button>
        </div>
      </header>

      <div className="start-main">
        <p className="start-kicker">A cozy little 3D adventure</p>
        <h1 className="game-title" aria-label={GAME_INFO.title}>
          <span className="game-title__aya">AYA'S</span>
          <span className="game-title__secret">SECRET WORLD</span>
        </h1>
        <p className="game-subtitle">{GAME_INFO.subtitle}</p>

        <div className="start-buttons">
          <button
            className="button button--primary button--play"
            onClick={startGame}
            disabled={!ready}
          >
            <PlayIcon size={22} />
            <span>PLAY</span>
            <span className="button-play-note">
              {hasProgress ? 'continue your adventure' : 'step onto the island'}
            </span>
          </button>
          <div className="start-secondary">
            <button className="button button--soft" onClick={() => openModal('howto')}>
              How to play
            </button>
            <button className="button button--soft" onClick={() => openModal('character')}>
              Dress up
            </button>
          </div>
        </div>

        <p className="start-progress" aria-live="polite">
          {hasProgress ? (
            <>
              <StarIcon size={15} />
              {stars} {stars === 1 ? 'star' : 'stars'} found · {completed} / {QUESTS.length}{' '}
              quests complete
            </>
          ) : (
            <>
              <StarIcon size={15} />
              A fresh little world is waiting for you
            </>
          )}
        </p>

        <p className="start-save-note">
          Progress is saved in this browser only — not synced across devices.
        </p>
      </div>

      <footer className="start-footer">
        <span>Best with sound on</span>
        <span className="start-footer-dot">·</span>
        <span>Sit back, wander, and find the little things</span>
      </footer>
    </section>
  );
};
