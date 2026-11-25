import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32, terrainHeight } from '../terrain';
import { useGameStore } from '../store';
import { useQuality } from '../useQuality';
import type { SecretId } from '../types';
import { angleDelta, HEDGE, LAYOUT } from './layout';
import { Glow } from './visuals';

const HEDGE_GREENS = ['#6fae7c', '#7dbb86', '#86c290', '#679f74'].map(
  (color) => new THREE.Color(color),
);
const HEDGE_BLOOMS = ['#ffc3d8', '#fff1f6', '#e4cdfa', '#ffe0a3'].map(
  (color) => new THREE.Color(color),
);

/** A ring of round hedge bushes around the secret garden, broken only by the gate. */
const Hedge = () => {
  const quality = useQuality();
  const leaves = useRef<THREE.InstancedMesh>(null);
  const blooms = useRef<THREE.InstancedMesh>(null);

  const { puffs, flowers } = useMemo(() => {
    const random = mulberry32(4242);
    const puffList: Array<{ x: number; y: number; z: number; s: number; c: number }> = [];
    const flowerList: Array<{ x: number; y: number; z: number; c: number }> = [];
    const spacing = 0.8;
    const steps = Math.round((Math.PI * 2 * HEDGE.radius) / spacing);
    for (let i = 0; i < steps; i += 1) {
      const angle = (i / steps) * Math.PI * 2;
      const along = Math.abs(angleDelta(angle, HEDGE.gateAngle)) * HEDGE.radius;
      if (along < HEDGE.gateHalfWidth + 0.15) continue;
      const wobble = (random() - 0.5) * 0.12;
      const x = HEDGE.x + Math.cos(angle) * (HEDGE.radius + wobble);
      const z = HEDGE.z + Math.sin(angle) * (HEDGE.radius + wobble);
      const y = terrainHeight(x, z);
      const size = 0.62 + random() * 0.16;
      puffList.push({ x, y: y + size * 0.75, z, s: size, c: Math.floor(random() * 4) });
      puffList.push({
        x: x + (random() - 0.5) * 0.2,
        y: y + size * 1.55,
        z: z + (random() - 0.5) * 0.2,
        s: size * 0.72,
        c: Math.floor(random() * 4),
      });
      if (random() > 0.45) {
        const outward = random() > 0.5 ? 1 : -1;
        const r = HEDGE.radius + outward * (size * 0.85);
        flowerList.push({
          x: HEDGE.x + Math.cos(angle) * r,
          y: y + size * (0.9 + random() * 0.8),
          z: HEDGE.z + Math.sin(angle) * r,
          c: Math.floor(random() * 4),
        });
      }
    }
    return { puffs: puffList, flowers: flowerList };
  }, []);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    if (leaves.current) {
      puffs.forEach((puff, index) => {
        dummy.position.set(puff.x, puff.y, puff.z);
        dummy.scale.set(puff.s, puff.s * 0.92, puff.s);
        dummy.rotation.set(0, index, 0);
        dummy.updateMatrix();
        leaves.current!.setMatrixAt(index, dummy.matrix);
        leaves.current!.setColorAt(index, HEDGE_GREENS[puff.c]);
      });
      leaves.current.instanceMatrix.needsUpdate = true;
      if (leaves.current.instanceColor) leaves.current.instanceColor.needsUpdate = true;
      leaves.current.computeBoundingSphere();
    }
    if (blooms.current) {
      flowers.forEach((flower, index) => {
        dummy.position.set(flower.x, flower.y, flower.z);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        blooms.current!.setMatrixAt(index, dummy.matrix);
        blooms.current!.setColorAt(index, HEDGE_BLOOMS[flower.c]);
      });
      blooms.current.instanceMatrix.needsUpdate = true;
      if (blooms.current.instanceColor) blooms.current.instanceColor.needsUpdate = true;
      blooms.current.computeBoundingSphere();
    }
  }, [puffs, flowers]);

  return (
    <group>
      <instancedMesh
        ref={leaves}
        args={[undefined, undefined, puffs.length]}
        castShadow={quality.shadows}
        receiveShadow
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshLambertMaterial flatShading />
      </instancedMesh>
      <instancedMesh ref={blooms} args={[undefined, undefined, flowers.length]}>
        <sphereGeometry args={[0.1, 6, 4]} />
        <meshLambertMaterial emissive="#ffd9e8" emissiveIntensity={0.25} />
      </instancedMesh>
    </group>
  );
};

/** Sparkles above a secret until it has been found. */
const SecretSparkle = ({ id, height }: { id: SecretId; height: number }) => {
  const found = useGameStore((state) => Boolean(state.secrets[id]));
  const sprite = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!sprite.current) return;
    sprite.current.position.y = height + Math.sin(clock.elapsedTime * 2.4) * 0.12;
  });
  if (found) return null;
  return (
    <group ref={sprite} position={[0, height, 0]}>
      <Glow color="#fff0b8" scale={0.9} opacity={0.75} />
    </group>
  );
};

const MessageStone = () => {
  const { x, z } = LAYOUT.messageStone;
  const y = terrainHeight(x, z);
  return (
    <group position={[x, y, z]} rotation-y={0.5}>
      <mesh position={[0, 0.38, 0]} scale={[0.55, 0.78, 0.32]} castShadow>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshLambertMaterial color="#c9c1c8" flatShading />
      </mesh>
      <mesh position={[0, 0.48, 0.2]}>
        <circleGeometry args={[0.13, 12]} />
        <meshBasicMaterial color="#f29ab9" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.65, 14]} />
        <meshLambertMaterial color="#9fcf96" />
      </mesh>
      <SecretSparkle id="message" height={1.3} />
    </group>
  );
};

const Willow = () => {
  const { x, z } = LAYOUT.willow;
  const y = terrainHeight(x, z);
  const fronds = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (fronds.current) fronds.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.06;
  });
  const strands = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return { x: Math.cos(angle) * 1.45, z: Math.sin(angle) * 1.45, angle };
      }),
    [],
  );
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.42, 2.8, 7]} />
        <meshLambertMaterial color="#8f7462" />
      </mesh>
      <mesh position={[0, 3.25, 0]} scale={[1.8, 1.05, 1.8]} castShadow>
        <sphereGeometry args={[1, 9, 6]} />
        <meshLambertMaterial color="#a6cf8f" />
      </mesh>
      <group ref={fronds} position={[0, 3.0, 0]}>
        {strands.map((strand, index) => (
          <mesh
            key={index}
            position={[strand.x, -0.85, strand.z]}
            rotation-y={-strand.angle}
            scale={[0.32, 1.25, 0.32]}
          >
            <sphereGeometry args={[1, 6, 5]} />
            <meshLambertMaterial color={index % 2 === 0 ? '#b7dc9c' : '#9cc98a'} />
          </mesh>
        ))}
      </group>
      <SecretSparkle id="willow" height={2.1} />
    </group>
  );
};

const Moonstone = () => {
  const { x, z } = LAYOUT.moonstone;
  const y = terrainHeight(x, z);
  const stone = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (stone.current) {
      stone.current.position.y = 0.72 + Math.sin(clock.elapsedTime * 1.3) * 0.05;
      stone.current.rotation.y = clock.elapsedTime * 0.4;
    }
  });
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.36, 0.5, 7]} />
        <meshLambertMaterial color="#b7b1c4" flatShading />
      </mesh>
      <mesh ref={stone} position={[0, 0.72, 0]}>
        <icosahedronGeometry args={[0.22, 1]} />
        <meshStandardMaterial
          color="#eef4ff"
          emissive="#b9ccff"
          emissiveIntensity={0.9}
          roughness={0.2}
        />
      </mesh>
      <group position={[0, 0.72, 0]}>
        <Glow color="#cfdcff" scale={1.8} opacity={0.6} />
      </group>
      <SecretSparkle id="moonstone" height={1.4} />
    </group>
  );
};

export const IslandSecrets = () => (
  <group>
    <Hedge />
    <MessageStone />
    <Willow />
    <Moonstone />
  </group>
);
