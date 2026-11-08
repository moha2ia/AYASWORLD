import { GAME_INFO, STAR_GOAL } from '../config/gameConfig';
import { useGameStore } from '../game/store';
import { Modal } from './Modal';

const controls = [
  { keys: ['W', 'A', 'S', 'D'], text: 'Wander across the island' },
  { keys: ['↑', '←', '↓', '→'], text: 'Arrow keys work too' },
  { keys: ['Shift'], text: 'Run a little faster' },
  { keys: ['Space'], text: 'Jump over the flowers' },
  { keys: ['E'], text: 'Read, collect, open, enter' },
  { keys: ['Esc'], text: 'Pause and take a breath' },
  { keys: ['R'], text: 'Recenter the camera' },
];

export const HowToPlay = () => {
  const modal = useGameStore((state) => state.modal);
  const closeModal = useGameStore((state) => state.closeModal);
  if (modal !== 'howto') return null;

  return (
    <Modal
      kicker="a tiny guide"
      title="How to wander"
      subtitle="There is no wrong way to explore a world made for you."
      onClose={closeModal}
      size="wide"
      footer={
        <button className="button button--primary button--wide" onClick={closeModal}>
          I'm ready to wander
        </button>
      }
    >
      <div className="howto-grid">
        <section className="howto-section">
          <h3>On a laptop</h3>
          <ul className="control-list">
            {controls.map((control) => (
              <li key={control.text}>
                <span className="key-cluster">
                  {control.keys.map((key) => (
                    <kbd key={key}>{key}</kbd>
                  ))}
                </span>
                <span>{control.text}</span>
              </li>
            ))}
            <li>
              <span className="key-cluster"><kbd>Mouse</kbd></span>
              <span>Drag to turn the camera · scroll to zoom</span>
            </li>
          </ul>
        </section>
        <section className="howto-section">
          <h3>On a phone or tablet</h3>
          <ul className="control-list control-list--touch">
            <li><span className="touch-dot" aria-hidden="true" /> <span>Left thumb joystick to move</span></li>
            <li><span className="touch-dot" aria-hidden="true" /> <span>Drag anywhere on the island to look around</span></li>
            <li><span className="touch-dot" aria-hidden="true" /> <span>JUMP and RUN buttons sit under your right thumb</span></li>
            <li><span className="touch-dot" aria-hidden="true" /> <span>Tap ✦ when something sparkles nearby</span></li>
            <li><span className="touch-dot" aria-hidden="true" /> <span>Landscape gives you a wider view, but portrait works too</span></li>
          </ul>
        </section>
      </div>

      <div className="howto-tips">
        <h3>Little things worth knowing</h3>
        <p>
          Collect <strong>{STAR_GOAL} golden stars</strong> to wake the Star Shrine on the
          northern hill. Stars, crystals, magical flowers and hidden gifts all wait in
          different corners of the island.
        </p>
        <p>
          Something is hidden behind the trees in the west. The gate is old, but it
          still opens. A secret note is waiting inside — written just for you.
        </p>
        <p>
          Your progress saves in this browser automatically. It does not sync to other
          devices or browsers, so playing on your phone starts its own little adventure.
        </p>
        <p className="howto-heart">
          <span aria-hidden="true">♥</span> {GAME_INFO.subtitle}
        </p>
      </div>
    </Modal>
  );
};
