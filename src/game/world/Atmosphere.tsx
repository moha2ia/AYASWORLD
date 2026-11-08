import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32, terrainHeight } from '../terrain';
import { useQuality } from '../useQuality';
import { getGlowTexture } from './visuals';

const skyVertex = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragment = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    float h = clamp(vDirection.y, 0.0, 1.0);
    vec3 horizon = vec3(1.0, 0.90, 0.83);
    vec3 middle = vec3(0.97, 0.85, 0.88);
    vec3 top = vec3(0.63, 0.80, 0.94);

    vec3 color = mix(horizon, middle, smoothstep(0.0, 0.24, h));
    color = mix(color, top, smoothstep(0.16, 0.82, h));

    vec3 sunDirection = normalize(vec3(0.5, 0.42, -0.72));
    float sun = max(dot(vDirection, sunDirection), 0.0);
    color += smoothstep(0.996, 0.9995, sun) * vec3(1.0, 0.92, 0.72) * 0.9;
    color += smoothstep(0.92, 0.997, sun) * vec3(1.0, 0.76, 0.6) * 0.12;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const SkyAndLights = () => {
  const quality = useQuality();
  const light = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      <mesh renderOrder={-10}>
        <sphereGeometry args={[300, 32, 20]} />
        <shaderMaterial
          vertexShader={skyVertex}
          fragmentShader={skyFragment}
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      <hemisphereLight args={['#d9ecff', '#f7dfc5', 0.95]} />
      <ambientLight intensity={0.17} color="#fff0e6" />
      <directionalLight
        ref={light}
        position={[38, 56, 24]}
        intensity={1.9}
        color="#ffe4b8"
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.shadowMapSize}
        shadow-mapSize-height={quality.shadowMapSize}
        shadow-camera-left={-48}
        shadow-camera-right={48}
        shadow-camera-top={48}
        shadow-camera-bottom={-48}
        shadow-camera-near={1}
        shadow-camera-far={150}
        shadow-bias={-0.0007}
        shadow-normalBias={0.035}
      />
      <Clouds reducedMotion={quality.reducedMotion} />
      <Fireflies count={Math.round(54 * quality.particleScale)} reducedMotion={quality.reducedMotion} />
    </>
  );
};

interface CloudPuff {
  baseX: number;
  baseY: number;
  baseZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  drift: number;
}

const CloudInstances = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const puffs = useMemo(() => {
    const random = mulberry32(3311);
    const list: CloudPuff[] = [];
    for (let i = 0; i < 8; i += 1) {
      const angle = random() * Math.PI * 2;
      const distance = 42 + random() * 90;
      const baseX = Math.cos(angle) * distance;
      const baseZ = Math.sin(angle) * distance;
      const baseY = 27 + random() * 20;
      const count = 3 + Math.floor(random() * 2);
      for (let j = 0; j < count; j += 1) {
        list.push({
          baseX: baseX + (j - count / 2) * (4 + random() * 3),
          baseY: baseY + random() * 1.8,
          baseZ: baseZ + (random() - 0.5) * 7,
          scaleX: 4 + random() * 4.5,
          scaleY: 1.5 + random() * 1.6,
          scaleZ: 3 + random() * 3,
          drift: 0.12 + random() * 0.12,
        });
      }
    }
    return list;
  }, []);

  useEffect(() => {
    const instance = mesh.current;
    if (!instance) return;
    const dummy = new THREE.Object3D();
    puffs.forEach((puff, index) => {
      dummy.position.set(puff.baseX, puff.baseY, puff.baseZ);
      dummy.scale.set(puff.scaleX, puff.scaleY, puff.scaleZ);
      dummy.rotation.y = index;
      dummy.updateMatrix();
      instance.setMatrixAt(index, dummy.matrix);
    });
    instance.instanceMatrix.needsUpdate = true;
  }, [puffs]);

  useFrame(({ clock }) => {
    if (reducedMotion || !mesh.current) return;
    const dummy = new THREE.Object3D();
    const time = clock.elapsedTime;
    puffs.forEach((puff, index) => {
      let x = puff.baseX + time * puff.drift;
      if (x > 155) x -= 310;
      dummy.position.set(x, puff.baseY + Math.sin(time * 0.1 + index) * 0.35, puff.baseZ);
      dummy.scale.set(puff.scaleX, puff.scaleY, puff.scaleZ);
      dummy.rotation.y = index;
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, puffs.length]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshLambertMaterial
        color="#fff6ee"
        emissive="#ffe9dc"
        emissiveIntensity={0.22}
        transparent
        opacity={0.94}
        depthWrite={false}
        fog
      />
    </instancedMesh>
  );
};

const Clouds = ({ reducedMotion }: { reducedMotion: boolean }) => (
  <CloudInstances reducedMotion={reducedMotion} />
);

interface Mote {
  x: number;
  y: number;
  z: number;
  phase: number;
  speed: number;
  drift: number;
}

const Fireflies = ({ count, reducedMotion }: { count: number; reducedMotion: boolean }) => {
  const points = useRef<THREE.Points>(null);
  const glow = useMemo(getGlowTexture, []);

  const motes = useMemo(() => {
    const random = mulberry32(90210);
    const centers = [
      { x: 0, z: 18, r: 9 },
      { x: -17, z: 6, r: 7 },
      { x: 15, z: 5, r: 7 },
      { x: -30, z: 20, r: 5 },
      { x: 8, z: -26, r: 6 },
    ];
    const list: Mote[] = [];
    for (let i = 0; i < Math.max(20, count); i += 1) {
      const center = centers[i % centers.length];
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random()) * center.r;
      const x = center.x + Math.cos(angle) * radius;
      const z = center.z + Math.sin(angle) * radius;
      list.push({
        x,
        y: terrainHeight(x, z) + 0.7 + random() * 2.6,
        z,
        phase: random() * Math.PI * 2,
        speed: 0.4 + random() * 0.7,
        drift: 0.35 + random() * 0.9,
      });
    }
    return list;
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(motes.length * 3);
    motes.forEach((mote, index) => {
      positions[index * 3] = mote.x;
      positions[index * 3 + 1] = mote.y;
      positions[index * 3 + 2] = mote.z;
    });
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [motes]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (!points.current || reducedMotion) return;
    const time = clock.elapsedTime;
    const attribute = points.current.geometry.attributes.position as THREE.BufferAttribute;
    motes.forEach((mote, index) => {
      attribute.setXYZ(
        index,
        mote.x + Math.sin(time * mote.speed + mote.phase) * mote.drift,
        mote.y + Math.sin(time * mote.speed * 1.4 + mote.phase) * 0.35,
        mote.z + Math.cos(time * mote.speed * 0.8 + mote.phase) * mote.drift,
      );
    });
    attribute.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        map={glow}
        color="#ffe9a0"
        size={0.22}
        sizeAttenuation
        transparent
        opacity={0.48}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};
