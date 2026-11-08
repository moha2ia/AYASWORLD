import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { terrainHeight } from '../terrain';
import { useQuality } from '../useQuality';
import { LAYOUT, ROCKS } from './layout';
import { Glow } from './visuals';

export const Rocks = () => {
  const quality = useQuality();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []);
  const palette = useMemo(
    () => [
      new THREE.Color('#c9c2b8'),
      new THREE.Color('#b8c6bd'),
      new THREE.Color('#d8c9cf'),
    ],
    [],
  );

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const dummy = new THREE.Object3D();
    ROCKS.forEach((rock, index) => {
      dummy.position.set(rock.x, rock.y + rock.scale * 0.28, rock.z);
      dummy.rotation.set(rock.rotation * 0.2, rock.rotation, rock.rotation * 0.12);
      dummy.scale.set(rock.scale, rock.scale * 0.68, rock.scale * 0.9);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
      mesh.current?.setColorAt(index, palette[rock.tint % palette.length]);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [palette]);

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, undefined, ROCKS.length]}
      frustumCulled={false}
      castShadow={quality.shadows}
      receiveShadow
    >
      <meshLambertMaterial color="#ffffff" flatShading />
    </instancedMesh>
  );
};

const Lantern = ({ x, z, delay = 0 }: { x: number; z: number; delay?: number }) => {
  const baseY = terrainHeight(x, z);
  const glow = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (glow.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 1.4 + delay) * 0.12;
      glow.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={[x, baseY, z]}>
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 2.1, 5]} />
        <meshLambertMaterial color="#8f6f5c" />
      </mesh>
      <mesh position={[0, 2.12, 0]} castShadow>
        <boxGeometry args={[0.46, 0.08, 0.46]} />
        <meshLambertMaterial color="#8f6f5c" />
      </mesh>
      <mesh position={[0, 1.86, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.3]} />
        <meshStandardMaterial
          color="#ffe9bb"
          emissive="#ffc06e"
          emissiveIntensity={1.3}
          transparent
          opacity={0.92}
        />
      </mesh>
      <group ref={glow} position={[0, 1.86, 0]}>
        <Glow color="#ffdb95" scale={1.8} opacity={0.5} />
      </group>
    </group>
  );
};

const lanternSpots = [
  { x: -12.5, z: 8.6, delay: 0 },
  { x: 3.8, z: 10.4, delay: 1.1 },
  { x: 5.7, z: -14.5, delay: 2.2 },
  { x: 17.8, z: 8.7, delay: 0.7 },
  { x: -24.2, z: 16.9, delay: 1.6 },
  { x: 23.6, z: -1.8, delay: 2.8 },
];

export const Lanterns = () => (
  <group>
    {lanternSpots.map((spot, index) => (
      <Lantern key={index} x={spot.x} z={spot.z} delay={spot.delay} />
    ))}
  </group>
);

const waterfallVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const waterfallFragment = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float stripes = sin(vUv.y * 26.0 - uTime * 5.0 + sin(vUv.x * 11.0) * 1.5);
    float foam = smoothstep(0.15, 0.9, stripes) * 0.28;
    vec3 color = mix(vec3(0.62, 0.91, 0.90), vec3(1.0, 0.99, 0.95), 0.45 + foam);
    float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
    gl_FragColor = vec4(color, (0.72 + foam) * edge);
  }
`;

const Waterfall = () => {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <mesh position={[25.2, 2.85, -8.35]} rotation-x={0.08}>
      <planeGeometry args={[1.25, 2.0, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={waterfallVertex}
        fragmentShader={waterfallFragment}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const LilyPads = () => {
  const pads = useMemo(
    () => [
      { x: -0.8, z: 1.2, scale: 0.55, rotation: 0.4 },
      { x: 1.3, z: 0.2, scale: 0.42, rotation: 1.5 },
      { x: -1.6, z: -1.1, scale: 0.36, rotation: 2.2 },
      { x: 1.5, z: -1.8, scale: 0.5, rotation: 0.9 },
    ],
    [],
  );
  return (
    <group position-y={0.05}>
      {pads.map((pad, index) => (
        <group key={index} position={[pad.x, 0, pad.z]} scale={pad.scale} rotation-y={pad.rotation}>
          <mesh rotation-x={-Math.PI / 2}>
            <circleGeometry args={[0.9, 9, 0.2, Math.PI * 1.9]} />
            <meshLambertMaterial color="#8ccf9d" side={THREE.DoubleSide} />
          </mesh>
          {index % 2 === 0 && (
            <group position={[0.15, 0.08, 0]}>
              {Array.from({ length: 5 }).map((_, petal) => (
                <mesh
                  key={petal}
                  position={[
                    Math.cos((petal / 5) * Math.PI * 2) * 0.22,
                    0.05,
                    Math.sin((petal / 5) * Math.PI * 2) * 0.22,
                  ]}
                  scale={[1, 0.5, 1]}
                >
                  <sphereGeometry args={[0.16, 6, 4]} />
                  <meshLambertMaterial color="#ffc3d8" />
                </mesh>
              ))}
              <mesh position={[0, 0.12, 0]}>
                <sphereGeometry args={[0.1, 6, 4]} />
                <meshLambertMaterial color="#ffe49a" />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
};

export const Pond = () => {
  const center = LAYOUT.pond;
  const surfaceY = terrainHeight(center.x, center.z) + 0.04;
  return (
    <group>
      <group position={[center.x, surfaceY, center.z]}>
        {/* A stone rim makes the pond feel intentionally nestled into the hill. */}
        <mesh position={[0, -0.02, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[2.75, 3.15, 32]} />
          <meshLambertMaterial color="#cfc1b2" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.015, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[2.9, 32]} />
          <meshLambertMaterial
            color="#87e3da"
            transparent
            opacity={0.88}
            emissive="#5dc9c7"
            emissiveIntensity={0.2}
          />
        </mesh>
        <LilyPads />
      </group>
      <Waterfall />
    </group>
  );
};

export const SmallBridge = () => {
  const x = 21.6;
  const z = -0.1;
  const y = terrainHeight(x, z);
  return (
    <group position={[x, y, z]} rotation-y={0.4}>
      {Array.from({ length: 7 }).map((_, index) => {
        const offset = (index - 3) * 0.34;
        const arch = Math.cos((index / 6 - 0.5) * Math.PI) * 0.22;
        return (
          <mesh key={index} position={[0, 0.18 + arch, offset]} castShadow>
            <boxGeometry args={[1.75, 0.11, 0.3]} />
            <meshLambertMaterial color={index % 2 === 0 ? '#b58d6d' : '#c49b79'} />
          </mesh>
        );
      })}
      {[-0.82, 0.82].map((railX) => (
        <group key={railX} position={[railX, 0, 0]}>
          <mesh position={[0, 0.62, -1.05]}>
            <boxGeometry args={[0.09, 0.8, 0.09]} />
            <meshLambertMaterial color="#a47e62" />
          </mesh>
          <mesh position={[0, 0.62, 1.05]}>
            <boxGeometry args={[0.09, 0.8, 0.09]} />
            <meshLambertMaterial color="#a47e62" />
          </mesh>
          <mesh position={[0, 0.98, 0]} rotation-x={-0.06}>
            <boxGeometry args={[0.08, 0.08, 2.2]} />
            <meshLambertMaterial color="#a47e62" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
