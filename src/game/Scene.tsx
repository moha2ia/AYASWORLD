import { Suspense, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { useGameStore } from './store';
import { useQuality } from './useQuality';
import { CameraRig } from './CameraRig';
import { Player } from './Player';
import { AreaTriggers, InteractionManager, PlayClock } from './WorldLogic';
import { Island } from './world/Island';
import { Interior } from './world/Interior';
import { QuestBeacon } from './world/QuestBeacon';

export const GameCanvas = () => {
  const scene = useGameStore((state) => state.scene);
  const phase = useGameStore((state) => state.phase);
  const quality = useQuality();
  const isInterior = scene === 'interior';
  const [degraded, setDegraded] = useState(false);
  const adaptive = quality.setting === 'auto';
  const dpr = adaptive && degraded ? 1 : quality.dpr;

  return (
    <Canvas
      shadows="percentage"
      dpr={dpr}
      camera={{ fov: 55, near: 0.1, far: 420, position: [0, 18, 46] }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      }}
      onCreated={({ gl, scene: threeScene, camera }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
        if (import.meta.env.DEV) {
          (window as unknown as { __HOSSNA_RENDER__?: unknown }).__HOSSNA_RENDER__ = {
            gl,
            scene: threeScene,
            camera,
          };
        }
      }}
      className="game-canvas"
    >
      {adaptive && (
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDegraded(true)}
          onIncline={() => setDegraded(false)}
          onFallback={() => setDegraded(true)}
        />
      )}
      <color attach="background" args={[isInterior ? '#2b2029' : '#f9e7e3']} />
      <fog attach="fog" args={[isInterior ? '#2b2029' : '#f8e6df', 105, 245]} />
      <Suspense fallback={null}>
        <group visible={!isInterior}>
          <Island />
        </group>
        <group visible={isInterior}>
          <Interior />
        </group>
        {phase !== 'title' && <Player key={`player-${scene}`} mode={scene} />}
        <CameraRig key={`camera-${scene}`} mode={scene} />
        {phase !== 'title' && <QuestBeacon />}
        <InteractionManager />
        <AreaTriggers />
        <PlayClock />
      </Suspense>
    </Canvas>
  );
};
