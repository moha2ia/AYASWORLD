import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { terrainHeight } from '../terrain';
import { useQuality } from '../useQuality';

interface ButterflyData {
  centerX: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
  height: number;
  speed: number;
  phase: number;
  color: string;
}

const centers = [
  { x: 15, z: 5, count: 3 },
  { x: 0, z: 18, count: 2 },
  { x: -17, z: 7, count: 1 },
  { x: -30, z: 20, count: 2 },
  { x: 25, z: -3, count: 1 },
];

const palette = ['#ffb6cc', '#e3c2ff', '#ffe6a3', '#a9d8f5', '#ffc9ad'];

export const Butterflies = () => {
  const quality = useQuality();
  const groupRefs = useRef<Array<THREE.Group | null>>([]);
  const wingRefs = useRef<Array<{ left: THREE.Group | null; right: THREE.Group | null }>>([]);

  const data = useMemo(() => {
    const list: ButterflyData[] = [];
    let index = 0;
    centers.forEach((center) => {
      for (let i = 0; i < center.count; i += 1) {
        list.push({
          centerX: center.x + (index % 3 - 1) * 1.3,
          centerZ: center.z + ((index + 1) % 3 - 1) * 1.1,
          radiusX: 1.6 + (index % 3) * 0.65,
          radiusZ: 1.3 + ((index + 1) % 4) * 0.45,
          height: 1 + (index % 4) * 0.28,
          speed: 0.33 + (index % 4) * 0.07,
          phase: index * 1.37,
          color: palette[index % palette.length],
        });
        index += 1;
      }
    });
    return list;
  }, []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime * (quality.reducedMotion ? 0.45 : 1);
    data.forEach((butterfly, index) => {
      const group = groupRefs.current[index];
      const wings = wingRefs.current[index];
      if (!group) return;
      const angle = time * butterfly.speed + butterfly.phase;
      const x = butterfly.centerX + Math.cos(angle) * butterfly.radiusX;
      const z = butterfly.centerZ + Math.sin(angle * 1.17) * butterfly.radiusZ;
      const y =
        terrainHeight(x, z) +
        butterfly.height +
        Math.sin(time * 1.8 + butterfly.phase) * 0.22;
      group.position.set(x, y, z);
      group.rotation.y = -angle + Math.PI / 2;

      if (wings?.left && wings.right) {
        const flap = Math.sin(time * 12 + butterfly.phase) * 0.72;
        wings.left.rotation.z = flap;
        wings.right.rotation.z = -flap;
      }
    });
  });

  return (
    <group>
      {data.map((butterfly, index) => (
        <group
          key={index}
          ref={(node) => {
            groupRefs.current[index] = node;
          }}
        >
          <mesh rotation-x={Math.PI / 2}>
            <capsuleGeometry args={[0.035, 0.22, 3, 6]} />
            <meshLambertMaterial color="#6d5159" />
          </mesh>
          <group
            ref={(node) => {
              wingRefs.current[index] = {
                ...(wingRefs.current[index] ?? { left: null, right: null }),
                left: node,
              };
            }}
          >
            <mesh position={[0.2, 0.02, 0]} rotation-x={-Math.PI / 2}>
              <circleGeometry args={[0.23, 6]} />
              <meshBasicMaterial
                color={butterfly.color}
                transparent
                opacity={0.93}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
          <group
            ref={(node) => {
              wingRefs.current[index] = {
                ...(wingRefs.current[index] ?? { left: null, right: null }),
                right: node,
              };
            }}
          >
            <mesh position={[-0.2, 0.02, 0]} rotation-x={-Math.PI / 2}>
              <circleGeometry args={[0.23, 6]} />
              <meshBasicMaterial
                color={butterfly.color}
                transparent
                opacity={0.93}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
};
