import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32, terrainHeight } from '../terrain';
import { useGameStore } from '../store';
import { useQuality } from '../useQuality';
import { LAYOUT } from './layout';
import { Glow, makePlaqueTexture, StarMesh, useGeneratedTexture } from './visuals';

const Shrine = () => {
  const unlocked = useGameStore((state) => state.shrineUnlocked);
  const quality = useQuality();
  const starGroup = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Mesh>(null);
  const groundGlow = useRef<THREE.Mesh>(null);
  const x = LAYOUT.shrine.x;
  const z = LAYOUT.shrine.z;
  const y = terrainHeight(x, z);
  const plaque = useGeneratedTexture(() => makePlaqueTexture('Star Shrine'));

  const sparkles = useMemo(() => {
    const random = mulberry32(31415);
    return Array.from({ length: 9 }).map(() => ({
      angle: random() * Math.PI * 2,
      radius: 1.4 + random() * 1.2,
      height: 2.5 + random() * 2,
      speed: 0.2 + random() * 0.35,
      phase: random() * Math.PI * 2,
    }));
  }, []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (starGroup.current) {
      starGroup.current.position.y = 3.15 + Math.sin(time * 0.75) * 0.18;
      starGroup.current.rotation.y = time * 0.32;
      starGroup.current.rotation.z = Math.sin(time * 0.45) * 0.08;
    }
    if (beam.current) {
      const material = beam.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.05 + Math.sin(time * 0.9) * 0.018 + (unlocked ? 0.055 : 0);
      beam.current.visible = unlocked;
    }
    if (groundGlow.current) {
      const material = groundGlow.current.material as THREE.MeshBasicMaterial;
      material.opacity = unlocked ? 0.18 + Math.sin(time * 1.1) * 0.035 : 0;
      groundGlow.current.scale.setScalar(1 + Math.sin(time * 0.8) * 0.04);
    }
  });

  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.16, 0]} receiveShadow castShadow={quality.shadows}>
        <cylinderGeometry args={[2.75, 3.05, 0.34, 10]} />
        <meshLambertMaterial color="#d4c9c0" />
      </mesh>
      <mesh position={[0, 0.34, 0]} receiveShadow>
        <cylinderGeometry args={[2.35, 2.5, 0.16, 10]} />
        <meshLambertMaterial color="#e1d5ca" />
      </mesh>
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          position={[0, 0.06 + index * 0.09, 2.85 + index * 0.32]}
          receiveShadow
        >
          <boxGeometry args={[2.3 - index * 0.35, 0.14, 0.5]} />
          <meshLambertMaterial color="#cfc2b5" />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((index) => {
        const angle = (index / 4) * Math.PI * 2 + Math.PI / 4;
        const px = Math.cos(angle) * 2.05;
        const pz = Math.sin(angle) * 2.05;
        return (
          <group key={index} position={[px, 0, pz]}>
            <mesh position={[0, 0.55, 0]} castShadow={quality.shadows}>
              <cylinderGeometry args={[0.24, 0.32, 1.0, 6]} />
              <meshLambertMaterial color="#d8ccc2" />
            </mesh>
            <mesh position={[0, 2.2, 0]} castShadow={quality.shadows}>
              <cylinderGeometry args={[0.16, 0.24, 2.4, 6]} />
              <meshLambertMaterial color="#e3d8cc" />
            </mesh>
            <mesh position={[0, 3.45, 0]}>
              <sphereGeometry args={[0.22, 6, 5]} />
              <meshStandardMaterial
                color={unlocked ? '#ffe5aa' : '#cbbfb7'}
                emissive={unlocked ? '#ffc66e' : '#8c8179'}
                emissiveIntensity={unlocked ? 1.1 : 0.1}
              />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 3.6, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[2.05, 0.13, 7, 24]} />
        <meshStandardMaterial
          color={unlocked ? '#f4dfb0' : '#cbbfb4'}
          emissive={unlocked ? '#ffce82' : '#000000'}
          emissiveIntensity={unlocked ? 0.55 : 0}
          roughness={0.6}
        />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow={quality.shadows}>
        <cylinderGeometry args={[0.85, 1.0, 0.8, 8]} />
        <meshLambertMaterial color="#e5dad0" />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.78, 0.22, 8]} />
        <meshLambertMaterial color="#f0e6dc" />
      </mesh>
      <mesh position={[0, 0.97, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.6, 20]} />
        <meshStandardMaterial
          color={unlocked ? '#ffe7ae' : '#cfc7bd'}
          emissive={unlocked ? '#ffce85' : '#000000'}
          emissiveIntensity={unlocked ? 0.8 : 0}
          transparent
          opacity={0.9}
        />
      </mesh>

      <group ref={starGroup} position={[0, 3.15, 0]}>
        <group scale={unlocked ? 1.35 : 0.8}>
          <StarMesh
            color={unlocked ? '#ffe089' : '#d4c8ae'}
            glowColor="#ffe6a7"
            showGlow={unlocked}
          />
        </group>
      </group>

      <mesh ref={beam} position={[0, 8, 0]}>
        <cylinderGeometry args={[0.9, 1.6, 15, 14, 1, true]} />
        <meshBasicMaterial
          color="#ffe7b0"
          transparent
          opacity={0.1}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={groundGlow} position={[0, 0.42, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.8, 3.0, 30]} />
        <meshBasicMaterial
          color="#ffe9be"
          transparent
          opacity={0.18}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 0.9, 1.02]} rotation-x={-0.18}>
        <planeGeometry args={[1.2, 0.45]} />
        <meshBasicMaterial map={plaque} transparent toneMapped={false} />
      </mesh>

      {unlocked &&
        sparkles.map((sparkle, index) => (
          <group
            key={index}
            position={[
              Math.cos(sparkle.angle) * sparkle.radius,
              sparkle.height,
              Math.sin(sparkle.angle) * sparkle.radius,
            ]}
          >
            <Glow
              color={index % 2 === 0 ? '#ffe9b8' : '#ffd1e3'}
              scale={0.9 + (index % 3) * 0.2}
              opacity={0.55}
            />
          </group>
        ))}
    </group>
  );
};

export const StarShrine = () => <Shrine />;
