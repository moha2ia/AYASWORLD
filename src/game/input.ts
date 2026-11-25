import { handleInteraction, interactWithNearby } from './interactions';
import { requestCameraRecenter } from './cameraState';
import { useGameStore } from './store';

export const keyboard = {
  keys: new Set<string>(),
};

export const mobileInput = {
  x: 0,
  y: 0,
  run: false,
};

let jumpQueued = false;

export const queueJump = () => {
  jumpQueued = true;
};

export const consumeJump = () => {
  const value = jumpQueued;
  jumpQueued = false;
  return value;
};

export const clearMovement = () => {
  keyboard.keys.clear();
  mobileInput.x = 0;
  mobileInput.y = 0;
};

const MOVEMENT_CODES = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Space',
]);

const isTextInput = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  );
};

/**
 * Global keyboard bindings. Returns a cleanup function so hot reload never
 * stacks duplicate listeners.
 */
export const bindKeyboard = (): (() => void) => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (isTextInput(event.target)) return;
    const state = useGameStore.getState();

    if (event.code === 'Escape') {
      event.preventDefault();
      if (state.modal) {
        state.closeModal();
      } else if (state.phase === 'playing') {
        state.pauseGame();
      } else if (state.phase === 'paused') {
        state.resumeGame();
      }
      return;
    }

    if (event.code === 'KeyJ' && !event.repeat && state.phase !== 'title') {
      if (state.modal === 'journal') state.closeModal();
      else if (!state.modal) state.openModal('journal');
      return;
    }

    if (state.modal) return;

    if (event.code === 'KeyM') {
      state.toggleSound();
      return;
    }

    if (state.phase !== 'playing') return;

    if (MOVEMENT_CODES.has(event.code)) {
      event.preventDefault();
    }

    keyboard.keys.add(event.code);

    if (event.code === 'Space' && !event.repeat) {
      queueJump();
    }
    if (event.code === 'KeyE' && !event.repeat) {
      if (state.nearby) handleInteraction(state.nearby);
      else interactWithNearby();
    }
    if (event.code === 'KeyR' && !event.repeat) {
      requestCameraRecenter();
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    keyboard.keys.delete(event.code);
  };

  const onBlur = () => clearMovement();

  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
  };
};
