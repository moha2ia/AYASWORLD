import { Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from './store';
import { useQuality } from './useQuality';
import { CameraRig } from './CameraRig';
import { Player } from './Player';
import { InteractionManager } from './WorldLogic';
import { Island } from './world/Island';
import { Interior } from './world/Interior';

export const GameCanvas = () => {
  const scene = useGameStore((state) => state.scene);
  const phase = useGameStore((state) => state.phase);
  const quality = useQuality();
  const isInterior = scene === 'interior';

  return (
    <Canvas
      shadows
      dpr={quality.dpr}
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
          (window as unknown as { __AYA_RENDER__?: unknown }).__AYA_RENDER__ = {
            gl,
            scene: threeScene,
            camera,
          };
        }
      }}
      className="game-canvas"
    >
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
        <InteractionManager />
      </Suspense>
    </Canvas>
  );
};
