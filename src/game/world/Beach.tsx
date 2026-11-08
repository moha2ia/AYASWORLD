import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { terrainHeight } from '../terrain';
import { useQuality } from '../useQuality';
import { SHELLS } from './layout';

const Shells = () => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(
    () => new THREE.SphereGeometry(1, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    [],
  );
  const colors = useMemo(
    () => [
      new THREE.Color('#f8dfd5'),
      new THREE.Color('#f4c8ce'),
      new THREE.Color('#efe3cb'),
      new THREE.Color('#e4d4ef'),
    ],
    [],
  );

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const dummy = new THREE.Object3D();
    SHELLS.forEach((shell, index) => {
      dummy.position.set(shell.x, shell.y + 0.05, shell.z);
      dummy.rotation.set(0.1, shell.rotation, 0);
      dummy.scale.set(shell.scale * 1.6, shell.scale * 0.65, shell.scale * 1.3);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
      mesh.current?.setColorAt(index, colors[shell.color % colors.length]);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [colors]);

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, undefined, SHELLS.length]}
      frustumCulled={false}
      receiveShadow
    >
      <meshLambertMaterial color="#ffffff" side={THREE.DoubleSide} />
    </instancedMesh>
  );
};

const Driftwood = () => {
  const x = -6.3;
  const z = 38.8;
  const y = terrainHeight(x, z);
  return (
    <group position={[x, y + 0.24, z]} rotation-y={0.6} rotation-z={0.04}>
      <mesh rotation-z={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 2.7, 6]} />
        <meshLambertMaterial color="#b89578" />
      </mesh>
      <mesh position={[0.45, 0.12, 0.18]} rotation-z={1.1} rotation-y={0.4} castShadow>
        <cylinderGeometry args={[0.09, 0.13, 1.1, 5]} />
        <meshLambertMaterial color="#a58164" />
      </mesh>
      <mesh position={[-0.7, 0.08, -0.22]} rotation-z={1.35} rotation-y={-0.6} castShadow>
        <cylinderGeometry args={[0.06, 0.11, 0.9, 5]} />
        <meshLambertMaterial color="#a58164" />
      </mesh>
      <mesh position={[0.2, 0.34, 0.1]}>
        <sphereGeometry args={[0.26, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshLambertMaterial color="#e6d0b4" />
      </mesh>
    </group>
  );
};

const Rowboat = () => {
  const x = -11.5;
  const z = 41.2;
  const y = terrainHeight(x, z);
  return (
    <group position={[x, y, z]} rotation-y={0.38} rotation-z={0.06}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[3.6, 0.22, 1.5]} />
        <meshLambertMaterial color="#d9c3a6" />
      </mesh>
      {/* Slanted sides */}
      {[-0.78, 0.78].map((side) => (
        <mesh
          key={side}
          position={[0, 0.7, side]}
          rotation-x={side > 0 ? -0.22 : 0.22}
          castShadow
        >
          <boxGeometry args={[3.6, 0.7, 0.14]} />
          <meshLambertMaterial color="#e5cfb1" />
        </mesh>
      ))}
      {[-1.78, 1.78].map((side) => (
        <mesh
          key={side}
          position={[side, 0.7, 0]}
          rotation-z={side > 0 ? -0.22 : 0.22}
          castShadow
        >
          <boxGeometry args={[0.14, 0.7, 1.5]} />
          <meshLambertMaterial color="#e5cfb1" />
        </mesh>
      ))}
      <mesh position={[0, 0.84, 0]}>
        <boxGeometry args={[2.8, 0.08, 1.1]} />
        <meshLambertMaterial color="#8fb9b0" />
      </mesh>
      {[-0.7, 0.7].map((offset) => (
        <mesh key={offset} position={[offset, 0.72, 0]}>
          <boxGeometry args={[0.28, 0.08, 1.22]} />
          <meshLambertMaterial color="#b58d6d" />
        </mesh>
      ))}
      <mesh position={[0.1, 1.02, 0.62]} rotation-z={0.55} rotation-y={0.4}>
        <cylinderGeometry args={[0.045, 0.055, 2.8, 5]} />
        <meshLambertMaterial color="#a77f5f" />
      </mesh>
      <mesh position={[0.1, 1.02, -0.62]} rotation-z={-0.55} rotation-y={-0.3}>
        <cylinderGeometry args={[0.045, 0.055, 2.8, 5]} />
        <meshLambertMaterial color="#a77f5f" />
      </mesh>
      <mesh position={[0.7, 0.62, 0.12]} rotation-y={0.2}>
        <boxGeometry args={[0.4, 0.12, 0.5]} />
        <meshLambertMaterial color="#f3c4d2" />
      </mesh>
    </group>
  );
};

const Sandcastle = () => {
  const x = 5.2;
  const z = 40.2;
  const y = terrainHeight(x, z);
  const quality = useQuality();
  return (
    <group position={[x, y, z]} rotation-y={-0.4}>
      <mesh position={[0, 0.16, 0]} castShadow={quality.shadows}>
        <cylinderGeometry args={[0.95, 1.15, 0.32, 7]} />
        <meshLambertMaterial color="#e6c98e" />
      </mesh>
      {[
        [-0.55, 0.22],
        [0.45, 0.12],
        [0.05, -0.5],
      ].map(([cx, cz], index) => (
        <group key={index} position={[cx, 0.3, cz]}>
          <mesh castShadow={quality.shadows}>
            <cylinderGeometry args={[0.3, 0.35, 0.55, 6]} />
            <meshLambertMaterial color="#edcf96" />
          </mesh>
          <mesh position={[0, 0.52, 0]} rotation-y={index}>
            <coneGeometry args={[0.38, 0.45, 6]} />
            <meshLambertMaterial color="#e2c083" />
          </mesh>
          <mesh position={[0.12, 0.45, 0.1]}>
            <boxGeometry args={[0.07, 0.16, 0.02]} />
            <meshLambertMaterial color="#b28f5f" />
          </mesh>
        </group>
      ))}
      <mesh position={[0.05, 0.98, -0.5]}>
        <cylinderGeometry args={[0.015, 0.015, 0.7, 4]} />
        <meshLambertMaterial color="#a87f58" />
      </mesh>
      <mesh position={[0.24, 1.24, -0.5]}>
        <planeGeometry args={[0.32, 0.2]} />
        <meshLambertMaterial color="#f5a5bd" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export const Beach = () => (
  <group>
    <Shells />
    <Driftwood />
    <Rowboat />
    <Sandcastle />
  </group>
);
