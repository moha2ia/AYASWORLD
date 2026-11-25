import type { CSSProperties } from 'react';
import { HAIR_STYLES, OUTFITS } from '../config/gameConfig';
import { useGameStore } from '../game/store';
import { audio } from '../game/audio';
import { Modal } from './Modal';

export const CharacterPanel = () => {
  const modal = useGameStore((state) => state.modal);
  const character = useGameStore((state) => state.character);
  const setCharacter = useGameStore((state) => state.setCharacter);
  const closeModal = useGameStore((state) => state.closeModal);

  if (modal !== 'character') return null;

  const outfit = OUTFITS.find((item) => item.id === character.outfit) ?? OUTFITS[0];
  const hair = HAIR_STYLES.find((item) => item.id === character.hair) ?? HAIR_STYLES[0];

  const previewStyle = {
    '--preview-outfit': outfit.color,
    '--preview-trim': outfit.trim,
    '--preview-hair': hair.color,
  } as CSSProperties;

  return (
    <Modal
      kicker="a little dress-up"
      title="Dress for the island"
      subtitle="Pick the colours that feel most like you. It saves automatically."
      onClose={closeModal}
      size="wide"
      footer={
        <button className="button button--primary button--wide" onClick={closeModal}>
          Wear it proudly
        </button>
      }
    >
      <div className="character-layout">
        <div className="character-preview" style={previewStyle} aria-hidden="true">
          <span className="preview-sun" />
          <span className="preview-cloud preview-cloud--a" />
          <span className="preview-cloud preview-cloud--b" />
          <span className="preview-shadow" />
          <div className="preview-character">
            <span className="preview-bun preview-bun--left" />
            <span className="preview-bun preview-bun--right" />
            <span className="preview-head" />
            <span className="preview-hair-back" />
            <span className="preview-hair" />
            <span className="preview-eye preview-eye--left" />
            <span className="preview-eye preview-eye--right" />
            <span className="preview-blush preview-blush--left" />
            <span className="preview-blush preview-blush--right" />
            <span className="preview-smile" />
            <span className="preview-dress" />
            <span className="preview-apron" />
            <span className="preview-arm preview-arm--left" />
            <span className="preview-arm preview-arm--right" />
            <span className="preview-leg preview-leg--left" />
            <span className="preview-leg preview-leg--right" />
            <span className="preview-flower" />
          </div>
          <span className="preview-grass" />
          <span className="preview-caption">
            {outfit.name} · {hair.name}
          </span>
        </div>

        <div className="character-options">
          <section>
            <h3 className="option-heading">Outfit</h3>
            <div className="swatch-grid" role="group" aria-label="Outfit colours">
              {OUTFITS.map((option) => (
                <button
                  key={option.id}
                  className={`swatch ${character.outfit === option.id ? 'is-selected' : ''}`}
                  style={{ '--swatch': option.color } as CSSProperties}
                  onClick={() => {
                    setCharacter({ outfit: option.id });
                    audio.play('ui');
                  }}
                  aria-pressed={character.outfit === option.id}
                  aria-label={`${option.name} outfit`}
                  title={option.name}
                >
                  <span />
                </button>
              ))}
            </div>
            <p className="option-value">{outfit.name}</p>
          </section>

          <section>
            <h3 className="option-heading">Hair</h3>
            <div className="swatch-grid" role="group" aria-label="Hair colours">
              {HAIR_STYLES.map((option) => (
                <button
                  key={option.id}
                  className={`swatch ${character.hair === option.id ? 'is-selected' : ''}`}
                  style={{ '--swatch': option.color } as CSSProperties}
                  onClick={() => {
                    setCharacter({ hair: option.id });
                    audio.play('ui');
                  }}
                  aria-pressed={character.hair === option.id}
                  aria-label={`${option.name} hair`}
                  title={option.name}
                >
                  <span />
                </button>
              ))}
            </div>
            <p className="option-value">{hair.name}</p>
          </section>

          <div className="character-note">
            <span aria-hidden="true">✿</span>
            <p>
              Your outfit and hair are saved, so they will greet you next time.
              You can change them any time at the dresser inside the cottage.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
