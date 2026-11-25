import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { guideState, updateGuide } from '../guide';
import { useGameStore } from '../store';
import { terrainHeight } from '../terrain';
import { INTERIOR } from './layout';
import { Glow, STAR_GEOMETRY } from './visuals';

/** A soft floating marker over wherever the current quest wants you to go. */
export const QuestBeacon = () => {
  const guide = useGameStore((state) => state.settings.guide);
  const reducedMotion = useGameStore((state) => state.settings.reducedMotion);
  const group = useRef<THREE.Group>(null);
  const gem = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const beam = useRef<THREE.MeshBasicMaterial>(null);
  const gemMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const timer = useRef(1);
  const fade = useRef(0);

  useFrame(({ clock }, delta) => {
    timer.current += delta;
    if (timer.current > 0.25) {
      timer.current = 0;
      updateGuide();
    }
    if (!group.current) return;
    const scene = useGameStore.getState().scene;
    const show = guide && guideState.active && guideState.scene === scene;
    // Fade out when you are standing right on the goal so it never hides the item.
    const near = THREE.MathUtils.smoothstep(guideState.distance, 1.6, 4.5);
    const targetFade = show ? near : 0;
    fade.current = THREE.MathUtils.damp(fade.current, targetFade, 5, delta);
    group.current.visible = fade.current > 0.02;
    if (!group.current.visible) return;

    const interior = scene === 'interior';
    const ground = interior
      ? INTERIOR.floorY
      : terrainHeight(guideState.x, guideState.z);
    const time = clock.elapsedTime;
    const bob = reducedMotion ? 0 : Math.sin(time * 2.2) * 0.18;
    group.current.position.set(guideState.x, ground, guideState.z);
    if (gem.current) {
      gem.current.position.y = (interior ? 1.75 : 3.1) + bob;
      gem.current.rotation.y = reducedMotion ? 0 : time * 0.9;
      gem.current.scale.setScalar(interior ? 0.6 : 1);
    }
    if (orbit.current) {
      orbit.current.rotation.x = 0.6 + Math.sin(time * 0.9) * 0.15;
      orbit.current.rotation.z = reducedMotion ? 0 : time * 0.8;
    }
    if (gemMaterial.current) gemMaterial.current.opacity = 0.94 * fade.current;
    if (beam.current) beam.current.opacity = 0.14 * fade.current;
  });

  return (
    <group ref={group} visible={false}>
      <group ref={gem} position={[0, 3.1, 0]}>
        <mesh geometry={STAR_GEOMETRY} rotation-x={-0.2} scale={0.9}>
          <meshStandardMaterial
            ref={gemMaterial}
            color="#ffe2f0"
            emissive="#ff9acb"
            emissiveIntensity={0.85}
            transparent
            depthWrite={false}
            roughness={0.28}
            metalness={0.2}
          />
        </mesh>
        <group ref={orbit}>
          <mesh rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.62, 0.016, 6, 40]} />
            <meshBasicMaterial
              color="#ffe6f2"
              transparent
              opacity={0.8}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
          <mesh rotation-x={Math.PI / 2} rotation-y={0.9}>
            <torusGeometry args={[0.78, 0.012, 6, 40]} />
            <meshBasicMaterial
              color="#ffd0e6"
              transparent
              opacity={0.5}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        </group>
        <Glow color="#ffc1df" scale={2.0} opacity={0.45} />
      </group>
      <mesh position={[0, 1.6, 0]} renderOrder={2}>
        <cylinderGeometry args={[0.07, 0.32, 3.2, 10, 1, true]} />
        <meshBasicMaterial
          ref={beam}
          color="#ffe1ef"
          transparent
          opacity={0.14}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};
