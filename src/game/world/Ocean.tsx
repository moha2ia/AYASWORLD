import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  varying float vWave;

  void main() {
    vec3 p = position;
    float wave =
      sin(p.x * 0.11 + uTime * 0.75) * 0.075 +
      cos(p.y * 0.14 + uTime * 0.55) * 0.06 +
      sin((p.x + p.y) * 0.06 - uTime * 0.4) * 0.05;
    p.z += wave;
    vWave = wave;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  varying float vWave;

  void main() {
    float radius = length(vWorld.xz);
    vec3 deep = vec3(0.30, 0.72, 0.72);
    vec3 shallow = vec3(0.64, 0.91, 0.87);
    vec3 horizon = vec3(0.99, 0.90, 0.84);

    float shore = smoothstep(52.0, 37.0, radius);
    vec3 color = mix(deep, shallow, shore * 0.78);

    // Soft foam where the island meets the sea.
    float band = smoothstep(47.5, 43.5, radius);
    float foam = band * (0.48 + 0.3 * sin(radius * 1.9 - uTime * 1.2 + vWorld.x * 0.2));
    color = mix(color, vec3(1.0, 0.97, 0.92), clamp(foam, 0.0, 0.7));

    // Slow ribbons of light across the water.
    float lightRibbon =
      sin(vWorld.x * 0.32 + uTime * 0.8) *
      sin(vWorld.z * 0.27 - uTime * 0.6);
    color += smoothstep(0.72, 1.0, lightRibbon) * 0.035;

    // A few tiny sun sparkles.
    float sparkle = pow(
      max(0.0, sin(vWorld.x * 2.7 + uTime * 1.7) * sin(vWorld.z * 2.1 - uTime * 1.2)),
      18.0
    );
    color += sparkle * 0.22;

    float distanceToCamera = distance(cameraPosition, vWorld);
    color = mix(color, horizon, smoothstep(110.0, 260.0, distanceToCamera));

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const Ocean = () => {
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 } }),
    [],
  );

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.02} renderOrder={1}>
      <planeGeometry args={[520, 520, 96, 96]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.FrontSide}
      />
    </mesh>
  );
};

/** Calm pond water with a gentle expanding ripple. */
export const PondWater = ({ radius = 2.9, y }: { radius?: number; y: number }) => {
  const ring = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: '#8fe6dd',
        transparent: true,
        opacity: 0.86,
        emissive: '#5fc9c6',
        emissiveIntensity: 0.18,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    if (!ring.current) return;
    const cycle = (clock.elapsedTime * 0.22) % 1;
    ring.current.scale.setScalar(0.4 + cycle * 0.85);
    const meshMaterial = ring.current.material as THREE.MeshBasicMaterial;
    meshMaterial.opacity = 0.35 * (1 - cycle);
  });

  return (
    <group position-y={y}>
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[radius, 32]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.008}>
        <ringGeometry args={[1.5, 1.62, 40]} />
        <meshBasicMaterial
          color="#fffdf3"
          transparent
          opacity={0.3}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
