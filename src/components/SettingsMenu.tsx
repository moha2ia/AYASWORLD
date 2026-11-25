import { useState } from 'react';
import { GAME_INFO, QUALITY_LABELS } from '../config/gameConfig';
import { useGameStore } from '../game/store';
import type { QualitySetting } from '../game/types';
import { Modal } from './Modal';

const qualities: QualitySetting[] = ['auto', 'high', 'low'];

const Toggle = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) => (
  <div className="setting-row">
    <div>
      <p className="setting-label">{label}</p>
      <p className="setting-description">{description}</p>
    </div>
    <button
      className={`setting-toggle ${checked ? 'is-on' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  </div>
);

export const SettingsMenu = () => {
  const modal = useGameStore((state) => state.modal);
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);
  const closeModal = useGameStore((state) => state.closeModal);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const phase = useGameStore((state) => state.phase);
  const [confirmReset, setConfirmReset] = useState(false);

  if (modal !== 'settings') return null;

  return (
    <Modal
      kicker="make it yours"
      title="Settings"
      subtitle="Gentle defaults for a gentle island."
      onClose={closeModal}
      footer={
        <button className="button button--primary button--wide" onClick={closeModal}>
          {phase === 'title' ? 'Back to the shore' : 'Back to the island'}
        </button>
      }
    >
      <div className="settings-list">
        <Toggle
          label="Sound"
          description="Soft music, footsteps and little chimes."
          checked={settings.sound}
          onChange={(sound) => updateSettings({ sound })}
        />
        <Toggle
          label="Reduced motion"
          description="Calmer clouds, fewer drifting lights and still page animations."
          checked={settings.reducedMotion}
          onChange={(reducedMotion) => updateSettings({ reducedMotion })}
        />

        <Toggle
          label="Quest guide"
          description="A floating pink marker and compass that point to your next goal."
          checked={settings.guide}
          onChange={(guide) => updateSettings({ guide })}
        />

        <div className="setting-row setting-row--stacked">
          <div>
            <p className="setting-label">Visual quality</p>
            <p className="setting-description">
              Auto keeps phones smooth; High adds soft shadows on desktop.
            </p>
          </div>
          <div className="segmented" role="group" aria-label="Visual quality">
            {qualities.map((quality) => (
              <button
                key={quality}
                className={`segmented-button ${settings.quality === quality ? 'is-active' : ''}`}
                onClick={() => updateSettings({ quality })}
                aria-pressed={settings.quality === quality}
                title={QUALITY_LABELS[quality]}
              >
                {quality === 'auto' ? 'Auto' : quality === 'high' ? 'High' : 'Low'}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-row setting-row--stacked">
          <div>
            <p className="setting-label">Camera sensitivity</p>
            <p className="setting-description">How quickly dragging turns the view.</p>
          </div>
          <div className="range-row">
            <span className="range-label">Calm</span>
            <input
              className="range-input"
              type="range"
              min="0.4"
              max="2"
              step="0.1"
              value={settings.sensitivity}
              onChange={(event) =>
                updateSettings({ sensitivity: Number(event.target.value) })
              }
              aria-label="Camera sensitivity"
            />
            <span className="range-label">Quick</span>
          </div>
        </div>
      </div>

      <div className="settings-divider" />

      {!confirmReset ? (
        <div className="reset-card">
          <div>
            <p className="setting-label">Start fresh</p>
            <p className="setting-description">{GAME_INFO.saveNote}</p>
          </div>
          <button className="button button--danger-soft" onClick={() => setConfirmReset(true)}>
            Reset progress
          </button>
        </div>
      ) : (
        <div className="confirm-card" role="alertdialog" aria-label="Confirm reset progress">
          <p className="confirm-title">Really clear your little world?</p>
          <p className="setting-description">{GAME_INFO.resetWarning}</p>
          <div className="confirm-actions">
            <button className="button button--soft" onClick={() => setConfirmReset(false)}>
              Keep my progress
            </button>
            <button className="button button--danger" onClick={resetProgress}>
              Yes, start fresh
            </button>
          </div>
        </div>
      )}

      <p className="settings-footnote">
        Progress is stored only in this browser. Clearing browser data will clear the
        island too. There is no account and no tracking.
      </p>
    </Modal>
  );
};
