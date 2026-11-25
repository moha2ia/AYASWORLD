import { useGameStore } from '../game/store';

export const AreaBanner = () => {
  const discovery = useGameStore((state) => state.discovery);

  if (!discovery) return null;

  return (
    <div key={discovery.id} className="area-banner" role="status" aria-live="polite">
      <span className="area-banner__spark" aria-hidden="true">
        ✦
      </span>
      <div className="area-banner__copy">
        <p className="area-banner__kicker">place discovered</p>
        <p className="area-banner__title">{discovery.title}</p>
        <p className="area-banner__subtitle">{discovery.subtitle}</p>
      </div>
      <span className="area-banner__spark" aria-hidden="true">
        ✦
      </span>
    </div>
  );
};
