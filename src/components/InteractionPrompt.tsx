import {
  getInteraction,
  getInteractionLabel,
  interactWithNearby,
} from '../game/interactions';
import { useGameStore } from '../game/store';
import { SparkleIcon } from './Icons';
import { useMobileLayout } from '../ui/useMobileLayout';

export const InteractionPrompt = () => {
  const nearby = useGameStore((state) => state.nearby);
  const phase = useGameStore((state) => state.phase);
  const modal = useGameStore((state) => state.modal);
  const mobile = useMobileLayout();
  const interaction = getInteraction(nearby);

  if (!interaction || phase !== 'playing' || modal) return null;

  const label = getInteractionLabel(interaction);

  return (
    <button
      className={`interaction-prompt ${mobile ? 'interaction-prompt--mobile' : ''}`}
      onClick={interactWithNearby}
      aria-label={`${label}. ${mobile ? 'Tap to interact' : 'Press E to interact'}.`}
    >
      <span className="interaction-key" aria-hidden="true">
        {mobile ? <SparkleIcon size={15} /> : 'E'}
      </span>
      <span className="interaction-label">{label}</span>
      {!mobile && <span className="interaction-sub">press to interact</span>}
    </button>
  );
};
