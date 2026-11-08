import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32, terrainHeight } from '../terrain';
import { useGameStore } from '../store';
import { useQuality } from '../useQuality';
import { LAYOUT } from './layout';
import { getGlowTexture, Glow, makeNoteTexture, useGeneratedTexture } from './visuals';

const Gate = () => {
  const open = useGameStore((state) => state.gateOpen);
  const panel = useRef<THREE.Group>(null);
  const quality = useQuality();
  const x = LAYOUT.secretGarden.gate.x;
  const z = LAYOUT.secretGarden.gate.z;
  const y = terrainHeight(x, z);

  useFrame((_, delta) => {
    if (!panel.current) return;
    const target = open ? -1.4 : 0;
    panel.current.rotation.y = THREE.MathUtils.damp(
      panel.current.rotation.y,
      target,
      3.2,
      delta,
    );
  });

  return (
    <group position={[x, y, z]}>
      {[-1.9, 1.9].map((side) => (
        <group key={side} position={[0, 0, side]}>
          <mesh position={[0, 1.5, 0]} castShadow={quality.shadows}>
            <cylinderGeometry args={[0.16, 0.2, 3, 6]} />
            <meshLambertMaterial color="#8e7462" />
          </mesh>
          <mesh position={[0, 3.05, 0]}>
            <sphereGeometry args={[0.2, 6, 5]} />
            <meshLambertMaterial color="#c6b0d8" />
          </mesh>
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.12, 5, 4]} />
            <meshStandardMaterial color="#ffe6ad" emissive="#ffc06e" emissiveIntensity={0.9} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 3.05, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[0.24, 0.26, 4.25]} />
        <meshLambertMaterial color="#8e7462" />
      </mesh>
      <mesh position={[0, 3.18, 0]}>
        <boxGeometry args={[0.18, 0.1, 3.9]} />
        <meshLambertMaterial color="#a8cf9f" />
      </mesh>
      {Array.from({ length: 7 }).map((_, index) => (
        <mesh
          key={index}
          position={[0.08, 3.28 + (index % 2) * 0.06, -1.75 + index * 0.58]}
        >
          <sphereGeometry args={[0.12, 5, 4]} />
          <meshLambertMaterial color={['#ffbcd2', '#ffe2a0', '#d6bdf5'][index % 3]} />
        </mesh>
      ))}

      <group ref={panel} position={[0, 0, -1.65]}>
        {[0.35, 1.45, 2.55].map((barZ) => (
          <mesh key={barZ} position={[0, 0.55, barZ]}>
            <boxGeometry args={[0.1, 0.1, 3.2]} />
            <meshLambertMaterial color="#7d6654" />
          </mesh>
        ))}
        {Array.from({ length: 8 }).map((_, index) => (
          <mesh key={index} position={[0, 1.25, 0.15 + index * 0.42]}>
            <boxGeometry args={[0.07, 1.7, 0.09]} />
            <meshLambertMaterial color={index % 2 === 0 ? '#876e59' : '#917763'} />
          </mesh>
        ))}
        <mesh position={[0, 2.2, 1.6]}>
          <boxGeometry args={[0.12, 0.12, 3.2]} />
          <meshLambertMaterial color="#7d6654" />
        </mesh>
        <mesh position={[0, 2.0, 1.48]}>
          <torusGeometry args={[0.3, 0.05, 5, 10]} />
          <meshLambertMaterial color="#d4b47f" />
        </mesh>
      </group>
      <Glow color="#ffe3ad" scale={2.6} opacity={0.32} />
    </group>
  );
};

const WishingTree = () => {
  const x = -32.6;
  const z = 22.6;
  const y = terrainHeight(x, z);
  const canopies = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (canopies.current) {
      canopies.current.rotation.z = Math.sin(clock.elapsedTime * 0.45) * 0.018;
    }
  });

  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.45, 3.0, 7]} />
        <meshLambertMaterial color="#9d7b64" />
      </mesh>
      <mesh position={[0.55, 2.6, 0.15]} rotation-z={-0.6} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 1.8, 5]} />
        <meshLambertMaterial color="#9d7b64" />
      </mesh>
      <group ref={canopies} position={[0, 3.7, 0]}>
        {[
          [0, 0, 0, 1.9],
          [-1.3, -0.35, 0.3, 1.25],
          [1.2, -0.25, -0.2, 1.35],
          [0.1, 0.9, 0.1, 1.2],
        ].map(([cx, cy, cz, scale], index) => (
          <mesh key={index} position={[cx, cy, cz]} scale={scale}>
            <sphereGeometry args={[1, 7, 5]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? '#f4b9d1' : '#d6b9f0'}
              emissive={index % 2 === 0 ? '#ff8fb5' : '#b18bef'}
              emissiveIntensity={0.28}
              roughness={0.8}
            />
          </mesh>
        ))}
        <Glow color="#ffc7e2" scale={7} opacity={0.4} />
      </group>
      {[0, 1, 2, 3, 4].map((index) => {
        const angle = (index / 5) * Math.PI * 2;
        return (
          <group
            key={index}
            position={[Math.cos(angle) * 2.1, 2.2 + (index % 2) * 0.7, Math.sin(angle) * 2.1]}
          >
            <mesh>
              <sphereGeometry args={[0.11, 5, 4]} />
              <meshBasicMaterial color="#ffe3ae" />
            </mesh>
            <Glow color="#ffe0a5" scale={0.9} opacity={0.55} />
          </group>
        );
      })}
    </group>
  );
};

const SecretNote = () => {
  const texture = useGeneratedTexture(makeNoteTexture);
  const { x, z } = LAYOUT.secretNote;
  const y = terrainHeight(x, z);
  const rotation = Math.atan2(
    LAYOUT.secretGarden.gate.x - x,
    LAYOUT.secretGarden.gate.z - z,
  );

  return (
    <group position={[x, y, z]} rotation-y={rotation}>
      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.48, 0.58, 0.68, 7]} />
        <meshLambertMaterial color="#d4c4b3" />
      </mesh>
      <mesh position={[0, 0.72, 0]} rotation-x={-0.42} castShadow>
        <boxGeometry args={[1.15, 0.12, 0.85]} />
        <meshLambertMaterial color="#a98572" />
      </mesh>
      <mesh position={[0, 0.86, 0.04]} rotation-x={-0.42}>
        <planeGeometry args={[1.0, 0.76]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <Glow color="#ffd9c2" scale={1.6} opacity={0.35} />
    </group>
  );
};

const MushroomRing = () => {
  const mushrooms = useMemo(() => {
    const random = mulberry32(5150);
    return Array.from({ length: 13 }).map((_, index) => {
      const angle = (index / 13) * Math.PI * 2 + random() * 0.2;
      const radius = 1.8 + random() * 3;
      const x = LAYOUT.secretGarden.x + Math.cos(angle) * radius;
      const z = LAYOUT.secretGarden.z + Math.sin(angle) * radius;
      return {
        x,
        z,
        y: terrainHeight(x, z),
        scale: 0.6 + random() * 0.7,
        rotation: random() * Math.PI,
      };
    });
  }, []);

  return (
    <group>
      {mushrooms.map((mushroom, index) => (
        <group
          key={index}
          position={[mushroom.x, mushroom.y, mushroom.z]}
          scale={mushroom.scale}
          rotation-y={mushroom.rotation}
        >
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.06, 0.09, 0.4, 5]} />
            <meshLambertMaterial color="#fff1de" />
          </mesh>
          <mesh position={[0, 0.42, 0]} scale={[1, 0.58, 1]}>
            <sphereGeometry args={[0.22, 7, 5]} />
            <meshStandardMaterial
              color={index % 3 === 0 ? '#ffb6d0' : '#c2eef1'}
              emissive={index % 3 === 0 ? '#ff86b5' : '#74dbe0'}
              emissiveIntensity={0.9}
              roughness={0.5}
            />
          </mesh>
          {index % 3 === 0 && (
            <group position={[0, 0.5, 0]}>
              <Glow color="#ffc2dd" scale={0.8} opacity={0.55} />
            </group>
          )}
        </group>
      ))}
    </group>
  );
};

const PetalMotes = () => {
  const quality = useQuality();
  const points = useRef<THREE.Points>(null);
  const count = Math.max(20, Math.round(64 * quality.particleScale));

  const motes = useMemo(() => {
    const random = mulberry32(1999);
    return Array.from({ length: count }).map(() => {
      const angle = random() * Math.PI * 2;
      const radius = 1 + random() * 5.5;
      return {
        angle,
        radius,
        y: 0.4 + random() * 3.8,
        speed: 0.07 + random() * 0.12,
        bob: random() * Math.PI * 2,
      };
    });
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const pink = new THREE.Color('#ffb7d4');
    const lavender = new THREE.Color('#d9c2ff');
    motes.forEach((mote, index) => {
      positions[index * 3] = LAYOUT.secretGarden.x + Math.cos(mote.angle) * mote.radius;
      positions[index * 3 + 1] = terrainHeight(LAYOUT.secretGarden.x, LAYOUT.secretGarden.z) + mote.y;
      positions[index * 3 + 2] = LAYOUT.secretGarden.z + Math.sin(mote.angle) * mote.radius;
      const color = index % 2 === 0 ? pink : lavender;
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    });
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [motes, count]);

  useFrame(({ clock }) => {
    if (!points.current || quality.reducedMotion) return;
    const time = clock.elapsedTime;
    const attribute = points.current.geometry.attributes.position as THREE.BufferAttribute;
    motes.forEach((mote, index) => {
      const angle = mote.angle + time * mote.speed;
      const radius = mote.radius + Math.sin(time * 0.6 + mote.bob) * 0.3;
      attribute.setXYZ(
        index,
        LAYOUT.secretGarden.x + Math.cos(angle) * radius,
        terrainHeight(LAYOUT.secretGarden.x, LAYOUT.secretGarden.z) +
          0.5 +
          ((mote.y + time * 0.09) % 4),
        LAYOUT.secretGarden.z + Math.sin(angle) * radius,
      );
    });
    attribute.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.4}
        vertexColors
        map={getGlowTexture()}
        transparent
        opacity={0.88}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        sizeAttenuation
      />
    </points>
  );
};

const GardenBench = () => {
  const x = -34.3;
  const z = 18.2;
  const y = terrainHeight(x, z);
  return (
    <group position={[x, y, z]} rotation-y={1.1}>
      {[-0.6, 0.6].map((offset) => (
        <mesh key={offset} position={[offset, 0.2, 0]}>
          <boxGeometry args={[0.18, 0.4, 1.2]} />
          <meshLambertMaterial color="#a98b71" />
        </mesh>
      ))}
      <mesh position={[0, 0.43, 0]}>
        <boxGeometry args={[1.5, 0.14, 1.15]} />
        <meshLambertMaterial color="#c6a483" />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[1.35, 0.08, 1.0]} />
        <meshLambertMaterial color="#f3c5d6" />
      </mesh>
      <mesh position={[0, 0.82, -0.48]} rotation-x={-0.12}>
        <boxGeometry args={[1.5, 0.55, 0.12]} />
        <meshLambertMaterial color="#c6a483" />
      </mesh>
      <mesh position={[0, 0.82, -0.38]} rotation-x={-0.12}>
        <boxGeometry args={[1.25, 0.42, 0.1]} />
        <meshLambertMaterial color="#f3c5d6" />
      </mesh>
    </group>
  );
};

export const SecretGarden = () => (
  <group>
    <Gate />
    <WishingTree />
    <SecretNote />
    <MushroomRing />
    <PetalMotes />
    <GardenBench />
  </group>
);
