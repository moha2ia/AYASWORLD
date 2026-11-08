import { useEffect, useRef } from 'react';
import { interactWithNearby } from '../game/interactions';
import { mobileInput, queueJump } from '../game/input';
import { useGameStore } from '../game/store';
import { useMobileLayout } from '../ui/useMobileLayout';
import { JumpIcon, RunIcon, SparkleIcon } from './Icons';

export const MobileControls = () => {
  const mobile = useMobileLayout();
  const phase = useGameStore((state) => state.phase);
  const modal = useGameStore((state) => state.modal);
  const nearby = useGameStore((state) => state.nearby);

  const baseRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const running = useRef(false);
  const runButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    running.current = false;
    mobileInput.run = false;
    return () => {
      mobileInput.x = 0;
      mobileInput.y = 0;
      mobileInput.run = false;
    };
  }, []);

  if (!mobile || phase !== 'playing' || modal) return null;

  const setStick = (dx: number, dy: number) => {
    if (stickRef.current) {
      stickRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  };

  const update = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const max = rect.width * 0.32;
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);
    if (distance > max) {
      dx = (dx / distance) * max;
      dy = (dy / distance) * max;
    }
    setStick(dx, dy);
    mobileInput.x = Math.abs(dx) < 6 ? 0 : dx / max;
    mobileInput.y = Math.abs(dy) < 6 ? 0 : -dy / max;
  };

  const release = () => {
    pointerId.current = null;
    mobileInput.x = 0;
    mobileInput.y = 0;
    setStick(0, 0);
  };

  const toggleRun = () => {
    running.current = !running.current;
    mobileInput.run = running.current;
    runButton.current?.classList.toggle('is-active', running.current);
    runButton.current?.setAttribute('aria-pressed', String(running.current));
  };

  return (
    <div className="mobile-controls" aria-label="Touch controls">
      <div
        ref={baseRef}
        className="joystick"
        role="group"
        aria-label="Movement joystick. Drag to move."
        onPointerDown={(event) => {
          event.preventDefault();
          if (pointerId.current !== null) return;
          pointerId.current = event.pointerId;
          baseRef.current?.setPointerCapture(event.pointerId);
          baseRef.current?.classList.add('is-active');
          update(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (pointerId.current !== event.pointerId) return;
          event.preventDefault();
          update(event.clientX, event.clientY);
        }}
        onPointerUp={(event) => {
          if (pointerId.current !== event.pointerId) return;
          baseRef.current?.classList.remove('is-active');
          release();
        }}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <span className="joystick-ring" aria-hidden="true" />
        <div ref={stickRef} className="joystick-stick" aria-hidden="true">
          <span />
        </div>
        <span className="joystick-caption" aria-hidden="true">MOVE</span>
      </div>

      <div className="touch-actions">
        <button
          ref={runButton}
          className="touch-button touch-button--run"
          onPointerDown={(event) => {
            event.preventDefault();
            toggleRun();
          }}
          aria-label="Toggle running"
          aria-pressed="false"
        >
          <RunIcon size={19} />
          <span>RUN</span>
        </button>
        <button
          className={`touch-button touch-button--interact ${nearby ? 'is-visible' : ''}`}
          onPointerDown={(event) => {
            event.preventDefault();
            interactWithNearby();
          }}
          disabled={!nearby}
          aria-label={nearby ? 'Interact with nearby object' : 'Nothing to interact with'}
          aria-hidden={!nearby}
        >
          <SparkleIcon size={23} />
          <span>ACTION</span>
        </button>
        <button
          className="touch-button touch-button--jump"
          onPointerDown={(event) => {
            event.preventDefault();
            queueJump();
          }}
          aria-label="Jump"
        >
          <JumpIcon size={25} />
          <span>JUMP</span>
        </button>
      </div>
    </div>
  );
};
