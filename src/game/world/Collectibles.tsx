import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { COLLECTIBLES, type CollectibleDefinition } from '../../config/gameConfig';
import { terrainHeight } from '../terrain';
import { useGameStore } from '../store';
import { getGlowTexture, Glow, StarMesh } from './visuals';

const getOffsets = (item: CollectibleDefinition) => {
  switch (item.type) {
    case 'star':
      return { hover: 1.15, ring: 1.2 };
    case 'crystal':
      return { hover: 0.52, ring: 0.6 };
    case 'flower':
      return { hover: 0, ring: 0.1 };
    case 'gift':
      return { hover: 0.34, ring: 0.42 };
  }
};

const MagicalFlower = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.26, 0]} castShadow>
      <cylinderGeometry args={[0.025, 0.035, 0.52, 4]} />
      <meshLambertMaterial color="#77b987" />
    </mesh>
    <mesh position={[0.09, 0.24, 0]} rotation-z={-0.7}>
      <sphereGeometry args={[0.1, 5, 3]} />
      <meshLambertMaterial color="#8dd49a" />
    </mesh>
    <group position={[0, 0.56, 0]}>
      {Array.from({ length: 6 }).map((_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 0.17, 0, Math.sin(angle) * 0.17]}
            scale={[1, 0.45, 1]}
          >
            <sphereGeometry args={[0.14, 7, 5]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.45}
              roughness={0.5}
            />
          </mesh>
        );
      })}
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.1, 7, 5]} />
        <meshStandardMaterial color="#ffe6a0" emissive="#ffd374" emissiveIntensity={0.8} />
      </mesh>
    </group>
  </group>
);

const Gift = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.24, 0]} castShadow>
      <boxGeometry args={[0.62, 0.5, 0.62]} />
      <meshStandardMaterial color={color} roughness={0.65} />
    </mesh>
    <mesh position={[0, 0.24, 0]}>
      <boxGeometry args={[0.68, 0.1, 0.15]} />
      <meshStandardMaterial color="#fff3dc" />
    </mesh>
    <mesh position={[0, 0.24, 0]}>
      <boxGeometry args={[0.15, 0.1, 0.68]} />
      <meshStandardMaterial color="#fff3dc" />
    </mesh>
    <mesh position={[0, 0.53, 0]} rotation-x={Math.PI / 2}>
      <torusGeometry args={[0.13, 0.045, 5, 10]} />
      <meshStandardMaterial color="#fff3dc" />
    </mesh>
    <mesh position={[0.12, 0.56, 0]} rotation-z={0.5}>
      <boxGeometry args={[0.28, 0.05, 0.09]} />
      <meshStandardMaterial color="#fff3dc" />
    </mesh>
    <mesh position={[-0.12, 0.56, 0]} rotation-z={-0.5}>
      <boxGeometry args={[0.28, 0.05, 0.09]} />
      <meshStandardMaterial color="#fff3dc" />
    </mesh>
  </group>
);

const Crystal = ({ color }: { color: string }) => (
  <mesh castShadow rotation-z={0.12}>
    <octahedronGeometry args={[0.34, 0]} />
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={0.8}
      roughness={0.2}
      metalness={0.2}
      transparent
      opacity={0.94}
    />
  </mesh>
);

const Collectible = ({ item }: { item: CollectibleDefinition }) => {
  const group = useRef<THREE.Group>(null);
  const spinner = useRef<THREE.Group>(null);
  const near = useGameStore((state) => state.nearby === item.id);
  const offset = getOffsets(item);
  const baseY = terrainHeight(item.x, item.z);
  const color = item.color ?? '#ffe08a';

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (group.current) {
      group.current.position.y = baseY + offset.hover + Math.sin(time * 1.5 + item.x) * 0.12;
    }
    if (spinner.current) {
      spinner.current.rotation.y = time * 0.8 + item.z;
    }
  });

  return (
    <group
      position={[item.x, baseY + offset.hover, item.z]}
      ref={group}
    >
      <group ref={spinner}>
        {item.type === 'star' && <StarMesh scale={1} showGlow={false} />}
        {item.type === 'crystal' && <Crystal color={color} />}
        {item.type === 'flower' && <MagicalFlower color={color} />}
        {item.type === 'gift' && <Gift color={color} />}
      </group>
      <Glow
        color={color}
        scale={near ? 2.8 : item.type === 'star' ? 2 : 1.6}
        opacity={near ? 0.45 : 0.26}
      />
      <mesh
        position={[0, -offset.hover + offset.ring, 0]}
        rotation-x={-Math.PI / 2}
      >
        <ringGeometry args={[0.58, 0.72, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={near ? 0.55 : 0.22}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {near && (
        <mesh position={[0, -offset.hover + offset.ring + 0.01, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.85, 0.9, 28]} />
          <meshBasicMaterial
            color="#fff8e3"
            transparent
            opacity={0.35}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
};

const PickupBurst = () => {
  const pickup = useGameStore((state) => state.pickupFx);
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const startTime = useRef<number | null>(null);
  const activeId = useRef<number | null>(null);
  const glow = useMemo(getGlowTexture, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(18 * 3), 3),
    );
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const velocities = useMemo(() => {
    const list: THREE.Vector3[] = [];
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 18; i += 1) {
      const angle = rand() * Math.PI * 2;
      const speed = 0.8 + rand() * 1.9;
      list.push(
        new THREE.Vector3(
          Math.cos(angle) * speed,
          1.3 + rand() * 1.8,
          Math.sin(angle) * speed,
        ),
      );
    }
    return list;
  }, []);

  useFrame(({ clock }) => {
    if (!pickup) {
      if (points.current) points.current.visible = false;
      return;
    }
    if (activeId.current !== pickup.id) {
      activeId.current = pickup.id;
      startTime.current = clock.elapsedTime;
      if (points.current) points.current.visible = true;
      if (material.current) material.current.color.set(pickup.color);
    }
    if (startTime.current === null || !points.current || !points.current.visible) return;
    const elapsed = clock.elapsedTime - startTime.current;
    const baseY = terrainHeight(pickup.x, pickup.z) + 0.9;
    const attribute = points.current.geometry.attributes.position as THREE.BufferAttribute;
    velocities.forEach((velocity, index) => {
      attribute.setXYZ(
        index,
        pickup.x + velocity.x * elapsed,
        baseY + velocity.y * elapsed - 1.8 * elapsed * elapsed,
        pickup.z + velocity.z * elapsed,
      );
    });
    attribute.needsUpdate = true;
    if (material.current) {
      material.current.opacity = Math.max(0, 1 - elapsed / 1.1);
    }
    if (elapsed > 1.2) points.current.visible = false;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false} visible={false}>
      <pointsMaterial
        ref={material}
        map={glow}
        color="#ffe6a7"
        size={0.5}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        sizeAttenuation
      />
    </points>
  );
};

export const Collectibles = () => {
  const collected = useGameStore((state) => state.collected);
  return (
    <group>
      {COLLECTIBLES.filter((item) => !collected[item.id]).map((item) => (
        <Collectible key={item.id} item={item} />
      ))}
      <PickupBurst />
    </group>
  );
};
