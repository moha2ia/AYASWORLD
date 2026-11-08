import { GAME_INFO } from '../config/gameConfig';

export const LoadingOverlay = ({ done }: { done: boolean }) => (
  <div
    className={`loading-overlay ${done ? 'loading-overlay--done' : ''}`}
    role="status"
    aria-live="polite"
  >
    <div className="loading-flower" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <span
          key={index}
          className="loading-petal"
          style={{ transform: `rotate(${index * 60}deg) translateY(-22px)` }}
        />
      ))}
      <span className="loading-heart">♥</span>
    </div>
    <p className="loading-title">{GAME_INFO.title}</p>
    <p className="loading-copy">gathering starlight…</p>
    <div className="loading-bar" aria-hidden="true">
      <span />
    </div>
  </div>
);
