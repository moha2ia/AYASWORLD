import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { terrainHeight } from '../terrain';
import { PATHS } from './layout';

interface Stone {
  x: number;
  y: number;
  z: number;
  rotation: number;
  scaleX: number;
  scaleZ: number;
  color: THREE.Color;
}

export const StonePaths = () => {
  const mesh = useRef<THREE.InstancedMesh>(null);

  const stones = useMemo(() => {
    const palette = [
      new THREE.Color('#efe0c4'),
      new THREE.Color('#e7d7bb'),
      new THREE.Color('#dcd0e9'),
      new THREE.Color('#f3dfcf'),
    ];
    const list: Stone[] = [];
    PATHS.forEach((path, pathIndex) => {
      let index = 0;
      for (let i = 0; i < path.length - 1; i += 1) {
        const [ax, az] = path[i];
        const [bx, bz] = path[i + 1];
        const length = Math.hypot(bx - ax, bz - az);
        const count = Math.max(1, Math.floor(length / 1.28));
        for (let step = 0; step < count; step += 1) {
          const t = (step + 0.35) / count;
          const x = ax + (bx - ax) * t + Math.sin(index * 2.1) * 0.18;
          const z = az + (bz - az) * t + Math.cos(index * 1.7) * 0.14;
          list.push({
            x,
            y: terrainHeight(x, z) + 0.025,
            z,
            rotation: (index * 1.7 + pathIndex) % (Math.PI * 2),
            scaleX: 0.72 + ((index * 7) % 5) * 0.08,
            scaleZ: 0.6 + ((index * 3) % 4) * 0.09,
            color: palette[(index + pathIndex) % palette.length],
          });
          index += 1;
        }
      }
    });
    return list;
  }, []);

  useLayoutEffect(() => {
    const instance = mesh.current;
    if (!instance) return;
    const dummy = new THREE.Object3D();
    stones.forEach((stone, index) => {
      dummy.position.set(stone.x, stone.y, stone.z);
      dummy.rotation.set(0, stone.rotation, 0);
      dummy.scale.set(stone.scaleX, 1, stone.scaleZ);
      dummy.updateMatrix();
      instance.setMatrixAt(index, dummy.matrix);
      instance.setColorAt(index, stone.color);
    });
    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
  }, [stones]);

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, stones.length]}
      frustumCulled={false}
      receiveShadow
    >
      <cylinderGeometry args={[0.58, 0.64, 0.09, 7]} />
      <meshLambertMaterial color="#ffffff" />
    </instancedMesh>
  );
};
