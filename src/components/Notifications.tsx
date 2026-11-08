import { useGameStore } from '../game/store';
import { CloseIcon, HeartIcon, SparkleIcon, StarIcon } from './Icons';

export const Notifications = () => {
  const toasts = useGameStore((state) => state.toasts);
  const dismiss = useGameStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="notifications" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`} role="status">
          <span className="toast-icon" aria-hidden="true">
            {toast.tone === 'quest' ? (
              <StarIcon size={18} />
            ) : toast.tone === 'magic' ? (
              <SparkleIcon size={18} />
            ) : (
              <HeartIcon size={17} />
            )}
          </span>
          <p>{toast.message}</p>
          <button
            className="toast-close"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss message"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
