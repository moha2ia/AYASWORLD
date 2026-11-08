import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { terrainHeight } from '../terrain';
import { useQuality } from '../useQuality';
import { LAYOUT } from './layout';
import { Glow } from './visuals';

const Fountain = () => {
  const quality = useQuality();
  const { x, z } = LAYOUT.flowerGarden.fountain;
  const y = terrainHeight(x, z);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const jet = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    [ringA.current, ringB.current].forEach((ring, index) => {
      if (!ring) return;
      const cycle = (time * 0.18 + index * 0.5) % 1;
      ring.scale.setScalar(0.35 + cycle * 0.9);
      const material = ring.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 * (1 - cycle);
    });
    if (jet.current) {
      jet.current.rotation.y = time * 0.6;
      jet.current.children.forEach((child, index) => {
        child.scale.y = 0.88 + Math.sin(time * 3 + index * 2) * 0.12;
      });
    }
  });

  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.2, 0]} castShadow={quality.shadows} receiveShadow>
        <cylinderGeometry args={[2.05, 2.2, 0.4, 20]} />
        <meshLambertMaterial color="#ded2c3" />
      </mesh>
      <mesh position={[0, 0.43, 0]}>
        <cylinderGeometry args={[1.85, 1.85, 0.12, 20]} />
        <meshLambertMaterial color="#cdbfae" />
      </mesh>
      <mesh position={[0, 0.47, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.7, 28]} />
        <meshLambertMaterial
          color="#8ce5dc"
          transparent
          opacity={0.88}
          emissive="#5fc9c7"
          emissiveIntensity={0.24}
        />
      </mesh>
      {[ringA, ringB].map((ref, index) => (
        <mesh key={index} ref={ref} position={[0, 0.5, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.7, 0.78, 28]} />
          <meshBasicMaterial
            color="#fffdf2"
            transparent
            opacity={0.28}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.92, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.38, 0.9, 8]} />
        <meshLambertMaterial color="#d8cabb" />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.75, 0.45, 0.22, 14]} />
        <meshLambertMaterial color="#e1d4c5" />
      </mesh>
      <mesh position={[0, 1.52, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.68, 20]} />
        <meshLambertMaterial color="#a1eee4" transparent opacity={0.85} />
      </mesh>
      <group ref={jet} position={[0, 1.5, 0]}>
        {Array.from({ length: 5 }).map((_, index) => {
          const angle = (index / 5) * Math.PI * 2;
          return (
            <mesh
              key={index}
              position={[Math.cos(angle) * 0.25, 0.25, Math.sin(angle) * 0.25]}
              rotation-z={Math.cos(angle) * 0.22}
              rotation-x={Math.sin(angle) * 0.22}
            >
              <cylinderGeometry args={[0.025, 0.05, 0.85, 5]} />
              <meshBasicMaterial color="#c9f8f0" transparent opacity={0.72} />
            </mesh>
          );
        })}
      </group>
      <mesh position={[0, 1.86, 0]}>
        <sphereGeometry args={[0.14, 7, 5]} />
        <meshStandardMaterial color="#ffe3a0" emissive="#ffc96e" emissiveIntensity={0.9} />
      </mesh>
      <Glow color="#d5fff8" scale={1.6} opacity={0.35} />
    </group>
  );
};

const Bench = () => {
  const x = 19.6;
  const z = 2.2;
  const y = terrainHeight(x, z);
  const rotation = Math.atan2(LAYOUT.flowerGarden.fountain.x - x, LAYOUT.flowerGarden.fountain.z - z);
  return (
    <group position={[x, y, z]} rotation-y={rotation}>
      {[-0.75, 0.75].map((offset) => (
        <mesh key={offset} position={[offset, 0.22, 0]} castShadow>
          <boxGeometry args={[0.14, 0.44, 1.5]} />
          <meshLambertMaterial color="#98745a" />
        </mesh>
      ))}
      {[-0.42, 0, 0.42].map((offset) => (
        <mesh key={offset} position={[0, 0.47, offset]}>
          <boxGeometry args={[1.85, 0.09, 0.32]} />
          <meshLambertMaterial color="#c69b77" />
        </mesh>
      ))}
      {[-0.75, 0.75].map((offset) => (
        <mesh key={`back-${offset}`} position={[offset, 0.9, -0.55]} rotation-x={-0.1}>
          <boxGeometry args={[0.12, 0.86, 0.12]} />
          <meshLambertMaterial color="#98745a" />
        </mesh>
      ))}
      {[-0.3, 0.3].map((offset) => (
        <mesh key={`slat-${offset}`} position={[0, 0.95, -0.6 - offset * 0.15]} rotation-x={-0.1}>
          <boxGeometry args={[1.85, 0.22, 0.08]} />
          <meshLambertMaterial color="#c69b77" />
        </mesh>
      ))}
      <mesh position={[0.55, 0.62, 0.12]} rotation-y={-0.2}>
        <boxGeometry args={[0.28, 0.06, 0.42]} />
        <meshLambertMaterial color="#f7b9ca" />
      </mesh>
    </group>
  );
};

export const FlowerGarden = () => (
  <group>
    <Fountain />
    <Bench />
  </group>
);
