import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32, terrainHeight } from '../terrain';
import { useGameStore } from '../store';
import { LAYOUT } from './layout';

const SEAGULLS = [
  { radius: 10, height: 5.6, speed: 0.18, phase: 0.4, scale: 1.3 },
  { radius: 15, height: 7.0, speed: 0.14, phase: 2.6, scale: 1.5 },
  { radius: 8, height: 5.0, speed: 0.21, phase: 4.4, scale: 1.2 },
];

const BEACH_CENTER = { x: 0, z: 48 };

const Seagull = ({
  radius,
  height,
  speed,
  phase,
  scale,
}: (typeof SEAGULLS)[number]) => {
  const bird = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Group>(null);
  const rightWing = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const angle = time * speed + phase;
    if (bird.current) {
      bird.current.position.set(
        BEACH_CENTER.x + Math.cos(angle) * radius,
        height + Math.sin(time * 0.6 + phase) * 1.4,
        BEACH_CENTER.z + Math.sin(angle) * radius,
      );
      bird.current.rotation.y = -angle - Math.PI / 2;
      bird.current.rotation.z = Math.sin(time * 0.5 + phase) * 0.12;
    }
    const flap = Math.sin(time * 6.5 + phase) * 0.5;
    if (leftWing.current) leftWing.current.rotation.x = 0.28 + flap;
    if (rightWing.current) rightWing.current.rotation.x = -0.28 - flap;
  });

  return (
    <group
      ref={bird}
      scale={scale}
      name="seagull"
      position={[
        BEACH_CENTER.x + Math.cos(phase) * radius,
        height,
        BEACH_CENTER.z + Math.sin(phase) * radius,
      ]}
    >
      <mesh scale={[0.62, 0.26, 0.3]} castShadow>
        <sphereGeometry args={[1, 8, 6]} />
        <meshLambertMaterial color="#fffaf2" />
      </mesh>
      <mesh position={[0.5, 0.08, 0]}>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshLambertMaterial color="#fffdf7" />
      </mesh>
      <mesh position={[0.64, 0.04, 0]} rotation-z={-Math.PI / 2}>
        <coneGeometry args={[0.06, 0.22, 4]} />
        <meshLambertMaterial color="#f0a86a" />
      </mesh>
      <mesh position={[0.55, 0.12, 0.09]}>
        <sphereGeometry args={[0.025, 5, 4]} />
        <meshBasicMaterial color="#4a3b40" />
      </mesh>
      <group ref={leftWing} position={[0, 0.08, 0.16]} rotation-x={0.28}>
        <mesh position={[0, 0, 0.5]} scale={[0.52, 0.042, 0.78]} castShadow>
          <sphereGeometry args={[1, 8, 4]} />
          <meshLambertMaterial color="#fff8f0" emissive="#ffe9df" emissiveIntensity={0.18} />
        </mesh>
        <mesh position={[0, 0, 1.05]} scale={[0.34, 0.035, 0.24]} castShadow>
          <sphereGeometry args={[1, 7, 4]} />
          <meshLambertMaterial color="#b9b0b8" />
        </mesh>
      </group>
      <group ref={rightWing} position={[0, 0.08, -0.16]} rotation-x={-0.28}>
        <mesh position={[0, 0, -0.5]} scale={[0.52, 0.042, 0.78]} castShadow>
          <sphereGeometry args={[1, 8, 4]} />
          <meshLambertMaterial color="#fff8f0" emissive="#ffe9df" emissiveIntensity={0.18} />
        </mesh>
        <mesh position={[0, 0, -1.05]} scale={[0.34, 0.035, 0.24]} castShadow>
          <sphereGeometry args={[1, 7, 4]} />
          <meshLambertMaterial color="#b9b0b8" />
        </mesh>
      </group>
      <mesh position={[-0.5, 0.02, 0]} rotation-z={Math.PI / 2}>
        <coneGeometry args={[0.14, 0.3, 4]} />
        <meshLambertMaterial color="#f3e8da" />
      </mesh>
    </group>
  );
};

const Duck = ({
  start,
  radius,
  speed,
  phase,
  color,
}: {
  start: { x: number; z: number };
  radius: number;
  speed: number;
  phase: number;
  color: string;
}) => {
  const duck = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const angle = time * speed + phase;
    if (!duck.current) return;
    duck.current.position.set(
      start.x + Math.cos(angle) * radius,
      Math.sin(time * 1.4 + phase) * 0.035,
      start.z + Math.sin(angle) * radius,
    );
    duck.current.rotation.y = -angle - Math.PI / 2;
  });

  return (
    <group position={[start.x, 0, start.z]}>
      <group ref={duck} name="duck">
        <mesh scale={[0.36, 0.24, 0.28]} position={[0, 0.22, 0]} castShadow>
          <sphereGeometry args={[1, 10, 7]} />
          <meshLambertMaterial color={color} />
        </mesh>
        <mesh position={[-0.3, 0.3, 0]} rotation-z={Math.PI / 2} scale={[1, 1, 0.7]}>
          <coneGeometry args={[0.13, 0.26, 5]} />
          <meshLambertMaterial color={color} />
        </mesh>
        <mesh position={[0.26, 0.44, 0]}>
          <sphereGeometry args={[0.165, 9, 7]} />
          <meshLambertMaterial color={color} />
        </mesh>
        <mesh position={[0.39, 0.42, 0]} rotation-z={-Math.PI / 2}>
          <coneGeometry args={[0.07, 0.16, 5]} />
          <meshLambertMaterial color="#f2a457" />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[0.3, 0.5, side * 0.1]}>
            <sphereGeometry args={[0.024, 5, 4]} />
            <meshBasicMaterial color="#3d3238" />
          </mesh>
        ))}
        <mesh position={[0, 0.32, 0]} scale={[0.28, 0.14, 0.32]}>
          <sphereGeometry args={[1, 7, 5]} />
          <meshLambertMaterial color="#fff6ea" />
        </mesh>
      </group>
    </group>
  );
};

const Ducks = () => {
  const surfaceY = terrainHeight(LAYOUT.pond.x, LAYOUT.pond.z) + 0.09;
  return (
    <group position={[0, surfaceY, 0]}>
      <Duck
        start={{ x: LAYOUT.pond.x, z: LAYOUT.pond.z }}
        radius={1.15}
        speed={0.16}
        phase={0.6}
        color="#f6ead6"
      />
      <Duck
        start={{ x: LAYOUT.pond.x, z: LAYOUT.pond.z }}
        radius={1.7}
        speed={-0.11}
        phase={2.3}
        color="#f1dcc4"
      />
    </group>
  );
};

interface Petal {
  x: number;
  z: number;
  y: number;
  ground: number;
  speed: number;
  phase: number;
  sway: number;
}

const getPetalTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(32, 32, 2, 32, 32, 30);
    gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
    gradient.addColorStop(0.6, 'rgba(255,220,235,0.9)');
    gradient.addColorStop(1, 'rgba(255,200,225,0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.ellipse(32, 32, 18, 26, 0.6, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const Petals = () => {
  const points = useRef<THREE.Points>(null);
  const reducedMotion = useGameStore((state) => state.settings.reducedMotion);
  const texture = useMemo(getPetalTexture, []);

  const petals = useMemo(() => {
    const random = mulberry32(505050);
    const centers = [
      { x: 0, z: 18, r: 10 },
      { x: 15, z: 5, r: 8 },
      { x: -17, z: 2, r: 8 },
      { x: -30, z: 20, r: 6 },
    ];
    const list: Petal[] = [];
    for (let i = 0; i < 46; i += 1) {
      const center = centers[i % centers.length];
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random()) * center.r;
      const x = center.x + Math.cos(angle) * radius;
      const z = center.z + Math.sin(angle) * radius;
      const ground = terrainHeight(x, z);
      list.push({
        x,
        z,
        ground,
        y: ground + 0.6 + random() * 5,
        speed: 0.18 + random() * 0.3,
        phase: random() * Math.PI * 2,
        sway: 0.27 + random() * 0.5,
      });
    }
    return list;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(petals.length * 3), 3));
    return geo;
  }, [petals]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const time = clock.elapsedTime;
    const attribute = points.current.geometry.attributes.position as THREE.BufferAttribute;
    petals.forEach((petal, index) => {
      const fall = reducedMotion ? 0 : (time * petal.speed + petal.phase) % 5.4;
      attribute.setXYZ(
        index,
        petal.x + Math.sin(time * 0.4 + petal.phase) * (reducedMotion ? 0 : petal.sway),
        petal.ground + 0.6 + (petal.y - petal.ground) * (1 - fall / 5.4),
        petal.z + Math.cos(time * 0.32 + petal.phase) * (reducedMotion ? 0 : petal.sway * 0.6),
      );
    });
    attribute.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        map={texture}
        color="#ffd3e3"
        size={0.34}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
};

export const Critters = () => (
  <group>
    {SEAGULLS.map((gull, index) => (
      <Seagull key={index} {...gull} />
    ))}
    <Ducks />
    <Petals />
  </group>
);
