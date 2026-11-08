import { useEffect, useState } from 'react';
import { CharacterPanel } from './components/CharacterPanel';
import { DressRoom } from './components/DressRoom';
import { GameErrorBoundary } from './components/ErrorBoundary';
import { PhotoMode } from './components/PhotoMode';
import { StoryModals } from './components/StoryModals';
import { GameHUD } from './components/GameHUD';
import { HowToPlay } from './components/HowToPlay';
import { LoadingOverlay } from './components/LoadingOverlay';
import { MobileControls } from './components/MobileControls';
import { Notifications } from './components/Notifications';
import { PauseMenu } from './components/PauseMenu';
import { SettingsMenu } from './components/SettingsMenu';
import { StartScreen } from './components/StartScreen';
import { GameCanvas } from './game/Scene';
import { bindKeyboard } from './game/input';
import { handleInteraction, interactWithNearby } from './game/interactions';
import { playerState, teleportRequest } from './game/playerState';
import { useGameStore } from './game/store';

interface TestBridge {
  getState: () => ReturnType<typeof useGameStore.getState>;
  teleport: (x: number, z: number) => void;
  player: () => typeof playerState;
  interact: (id: string) => void;
  interactNearby: () => void;
}

export default function App() {
  const phase = useGameStore((state) => state.phase);
  const scene = useGameStore((state) => state.scene);
  const modal = useGameStore((state) => state.modal);
  const reducedMotion = useGameStore((state) => state.settings.reducedMotion);
  const [loaderDone, setLoaderDone] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => bindKeyboard(), []);

  useEffect(() => {
    const reducedTimer = setTimeout(() => setLoaderDone(true), 950);
    const doneTimer = setTimeout(() => setShowLoader(false), 1800);
    return () => {
      clearTimeout(reducedTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
    document.documentElement.dataset.scene = scene;
  }, [reducedMotion, scene]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const testWindow = window as unknown as { __AYA_TEST__?: TestBridge };
    testWindow.__AYA_TEST__ = {
      getState: () => useGameStore.getState(),
      teleport: (x, z) => {
        teleportRequest.pending = { x, z };
      },
      player: () => playerState,
      interact: (id) => handleInteraction(id),
      interactNearby: interactWithNearby,
    };
    return () => {
      delete testWindow.__AYA_TEST__;
    };
  }, []);

  const isTitle = phase === 'title';

  return (
    <div className={`app ${isTitle ? 'app--title' : 'app--playing'}`}>
      <GameErrorBoundary>
        <GameCanvas />
      </GameErrorBoundary>

      <div className="scene-fade" key={scene} aria-hidden="true" />

      {!isTitle && <GameHUD />}
      {!isTitle && <MobileControls />}
      {isTitle && <StartScreen ready={!showLoader} />}
      {phase === 'paused' && !modal && <PauseMenu />}
      {!isTitle && <Notifications />}

      <SettingsMenu />
      <HowToPlay />
      <CharacterPanel />
      <StoryModals />
      <DressRoom />
      <PhotoMode />

      {showLoader && <LoadingOverlay done={loaderDone} />}
    </div>
  );
}
