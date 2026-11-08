import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useFrame } from '@react-three/fiber';
import { BUSHES, FLOWERS, GRASS, TREES } from './layout';
import { useQuality } from '../useQuality';
import { useSwayMaterial } from './visuals';

const variantColors = [
  new THREE.Color('#87ca93'),
  new THREE.Color('#e7a6bf'),
  new THREE.Color('#b6a0d6'),
];

const RoundTrees = ({ castShadow }: { castShadow: boolean }) => {
  const roundTrees = useMemo(() => TREES.filter((tree) => tree.kind === 'round'), []);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const canopyRef = useRef<THREE.InstancedMesh>(null);
  const canopyMaterial = useSwayMaterial('#ffffff', 0.028, { flatShading: true });

  const trunkGeometry = useMemo(() => new THREE.CylinderGeometry(0.16, 0.3, 2.4, 6), []);
  const canopyGeometry = useMemo(() => new THREE.SphereGeometry(1, 7, 5), []);

  useLayoutEffect(() => {
    const trunks = trunkRef.current;
    const canopies = canopyRef.current;
    if (!trunks || !canopies) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    roundTrees.forEach((tree, index) => {
      dummy.position.set(tree.x, tree.y + 1.2 * tree.scale, tree.z);
      dummy.rotation.set(0, tree.rotation, 0);
      dummy.scale.set(tree.scale, tree.scale, tree.scale);
      dummy.updateMatrix();
      trunks.setMatrixAt(index, dummy.matrix);

      const blobs = [
        { x: 0, y: 2.65, z: 0, s: 1.5 },
        { x: -0.78, y: 2.1, z: 0.25, s: 0.98 },
        { x: 0.65, y: 2.3, z: -0.3, s: 1.05 },
      ];
      blobs.forEach((blob, blobIndex) => {
        dummy.position.set(
          tree.x + blob.x * tree.scale,
          tree.y + blob.y * tree.scale,
          tree.z + blob.z * tree.scale,
        );
        dummy.rotation.set(0, tree.rotation + blobIndex, 0);
        dummy.scale.set(
          blob.s * tree.scale * 1.32,
          blob.s * tree.scale * 1.08,
          blob.s * tree.scale * 1.32,
        );
        dummy.updateMatrix();
        const instanceIndex = index * 3 + blobIndex;
        canopies.setMatrixAt(instanceIndex, dummy.matrix);
        color.copy(variantColors[tree.variant % variantColors.length]);
        color.offsetHSL(0, 0, (blobIndex - 1) * 0.025);
        canopies.setColorAt(instanceIndex, color);
      });
    });

    trunks.instanceMatrix.needsUpdate = true;
    canopies.instanceMatrix.needsUpdate = true;
    if (canopies.instanceColor) canopies.instanceColor.needsUpdate = true;
  }, [roundTrees]);

  return (
    <group>
      <instancedMesh
        ref={trunkRef}
        args={[trunkGeometry, undefined, roundTrees.length]}
        frustumCulled={false}
        castShadow={castShadow}
        receiveShadow
      >
        <meshLambertMaterial color="#9c745a" />
      </instancedMesh>
      <instancedMesh
        ref={canopyRef}
        args={[canopyGeometry, undefined, roundTrees.length * 3]}
        frustumCulled={false}
        castShadow={castShadow}
      >
        <primitive object={canopyMaterial} attach="material" />
      </instancedMesh>
    </group>
  );
};

const Palm = ({
  x,
  y,
  z,
  scale,
  rotation,
  castShadow,
}: {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: number;
  castShadow: boolean;
}) => {
  const leaves = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (leaves.current) {
      leaves.current.rotation.z = Math.sin(clock.elapsedTime * 0.7 + x) * 0.035;
      leaves.current.rotation.x = Math.cos(clock.elapsedTime * 0.55 + z) * 0.025;
    }
  });

  const trunkSegments = 5;
  return (
    <group position={[x, y, z]} scale={scale} rotation-y={rotation}>
      {Array.from({ length: trunkSegments }).map((_, index) => {
        const t = index / (trunkSegments - 1);
        return (
          <mesh
            key={index}
            position={[t * t * 0.75, 0.35 + index * 0.66, t * 0.22]}
            rotation-z={-0.12 - t * 0.16}
            rotation-x={0.06}
            castShadow={castShadow}
          >
            <cylinderGeometry args={[0.16 + t * 0.04, 0.2 + t * 0.03, 0.8, 6]} />
            <meshLambertMaterial color="#ad8764" />
          </mesh>
        );
      })}
      <group ref={leaves} position={[0.75, 3.7, 0.22]}>
        {Array.from({ length: 7 }).map((_, index) => (
          <group key={index} rotation-y={(index / 7) * Math.PI * 2 + 0.4}>
            <mesh
              position={[1.05, -0.15 + (index % 2) * 0.12, 0]}
              rotation-z={-1.18}
              castShadow={castShadow}
            >
              <coneGeometry args={[0.33, 2.25, 4]} />
              <meshLambertMaterial
                color={index % 3 === 0 ? '#83c98d' : '#9ad7a0'}
                flatShading
              />
            </mesh>
          </group>
        ))}
        {[0, 1].map((index) => (
          <mesh key={index} position={[0.2 + index * 0.22, -0.32, index === 0 ? 0.2 : -0.18]}>
            <sphereGeometry args={[0.16, 6, 5]} />
            <meshLambertMaterial color="#9a744f" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const Palms = ({ castShadow }: { castShadow: boolean }) => {
  const palms = useMemo(() => TREES.filter((tree) => tree.kind === 'palm'), []);
  return (
    <group>
      {palms.map((palm, index) => (
        <Palm
          key={index}
          x={palm.x}
          y={palm.y}
          z={palm.z}
          scale={palm.scale}
          rotation={palm.rotation}
          castShadow={castShadow}
        />
      ))}
    </group>
  );
};

const flowerPalette = [
  new THREE.Color('#ffc5d8'),
  new THREE.Color('#f7a8c5'),
  new THREE.Color('#d8c3fa'),
  new THREE.Color('#ffe5a3'),
  new THREE.Color('#fff5f1'),
  new THREE.Color('#ffb9a7'),
];

const Bushes = ({ castShadow }: { castShadow: boolean }) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 6, 4), []);
  const palette = useMemo(
    () => [
      new THREE.Color('#7fc38e'),
      new THREE.Color('#93d09c'),
      new THREE.Color('#b2dba3'),
      new THREE.Color('#b9afd9'),
    ],
    [],
  );

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    BUSHES.forEach((bush, index) => {
      const blobs = [
        { x: 0, y: 0.34, z: 0, s: 1 },
        { x: 0.42, y: 0.22, z: 0.2, s: 0.66 },
      ];
      blobs.forEach((blob, blobIndex) => {
        dummy.position.set(
          bush.x + blob.x * bush.scale,
          bush.y + blob.y * bush.scale,
          bush.z + blob.z * bush.scale,
        );
        dummy.rotation.set(0, bush.rotation + blobIndex, 0);
        dummy.scale.set(
          blob.s * bush.scale * 1.15,
          blob.s * bush.scale * 0.72,
          blob.s * bush.scale * 1.1,
        );
        dummy.updateMatrix();
        mesh.current?.setMatrixAt(index * 2 + blobIndex, dummy.matrix);
        color.copy(palette[bush.tint % palette.length]);
        color.offsetHSL(0, 0, blobIndex * 0.02);
        mesh.current?.setColorAt(index * 2 + blobIndex, color);
      });
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [palette]);

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, undefined, BUSHES.length * 2]}
      frustumCulled={false}
      castShadow={castShadow}
    >
      <meshLambertMaterial color="#ffffff" flatShading />
    </instancedMesh>
  );
};

const Flowers = () => {
  const heads = useRef<THREE.InstancedMesh>(null);
  const stems = useRef<THREE.InstancedMesh>(null);
  const centers = useRef<THREE.InstancedMesh>(null);
  const headMaterial = useSwayMaterial('#ffffff', 0.045, { flatShading: true });
  const stemMaterial = useSwayMaterial('#6cab78', 0.03);
  const centerMaterial = useSwayMaterial('#ffd36a', 0.045, { flatShading: true });

  const headGeometry = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(0.16, 0);
    geometry.scale(1, 0.55, 1);
    return geometry;
  }, []);
  const stemGeometry = useMemo(() => new THREE.CylinderGeometry(0.017, 0.024, 0.34, 4), []);
  const centerGeometry = useMemo(() => new THREE.IcosahedronGeometry(0.055, 0), []);

  useLayoutEffect(() => {
    if (!heads.current || !stems.current || !centers.current) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    FLOWERS.forEach((flower, index) => {
      const stemHeight = 0.34 * flower.scale;
      dummy.position.set(flower.x, flower.y + stemHeight * 0.5, flower.z);
      dummy.rotation.set(0, flower.rotation, 0);
      dummy.scale.set(flower.scale, flower.scale, flower.scale);
      dummy.updateMatrix();
      stems.current?.setMatrixAt(index, dummy.matrix);

      const headY = flower.y + stemHeight + 0.04;
      dummy.position.set(flower.x, headY, flower.z);
      dummy.rotation.set(0, flower.rotation, 0);
      dummy.scale.setScalar(flower.scale);
      dummy.updateMatrix();
      heads.current?.setMatrixAt(index, dummy.matrix);
      color.copy(flowerPalette[flower.color % flowerPalette.length]);
      heads.current?.setColorAt(index, color);

      dummy.position.set(flower.x, headY + 0.025, flower.z);
      dummy.rotation.set(0, flower.rotation, 0);
      dummy.scale.setScalar(flower.scale * 0.9);
      dummy.updateMatrix();
      centers.current?.setMatrixAt(index, dummy.matrix);
    });

    if (heads.current.instanceMatrix) heads.current.instanceMatrix.needsUpdate = true;
    if (stems.current.instanceMatrix) stems.current.instanceMatrix.needsUpdate = true;
    if (centers.current.instanceMatrix) centers.current.instanceMatrix.needsUpdate = true;
    if (heads.current.instanceColor) heads.current.instanceColor.needsUpdate = true;
  }, []);

  return (
    <group>
      <instancedMesh
        ref={stems}
        args={[stemGeometry, undefined, FLOWERS.length]}
        frustumCulled={false}
      >
        <primitive object={stemMaterial} attach="material" />
      </instancedMesh>
      <instancedMesh
        ref={heads}
        args={[headGeometry, undefined, FLOWERS.length]}
        frustumCulled={false}
      >
        <primitive object={headMaterial} attach="material" />
      </instancedMesh>
      <instancedMesh
        ref={centers}
        args={[centerGeometry, undefined, FLOWERS.length]}
        frustumCulled={false}
      >
        <primitive object={centerMaterial} attach="material" />
      </instancedMesh>
    </group>
  );
};

const Grass = () => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const material = useSwayMaterial('#ffffff', 0.055, { flatShading: true });

  const geometry = useMemo(() => {
    const blade = new THREE.ConeGeometry(0.065, 0.42, 3);
    const blades: THREE.BufferGeometry[] = [];
    const offsets = [
      [0, 0.21, 0, 0],
      [0.1, 0.16, 0.04, 0.3],
      [-0.09, 0.14, 0.05, -0.34],
    ];
    offsets.forEach(([x, y, z, tilt]) => {
      const clone = blade.clone();
      clone.translate(x, y, z);
      clone.rotateZ(tilt);
      blades.push(clone);
    });
    const merged = mergeGeometries(blades);
    blades.forEach((bladeGeometry) => bladeGeometry.dispose());
    blade.dispose();
    return merged ?? new THREE.ConeGeometry(0.06, 0.4, 3);
  }, []);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    GRASS.forEach((tuft, index) => {
      dummy.position.set(tuft.x, tuft.y + 0.02, tuft.z);
      dummy.rotation.set(0, tuft.rotation, 0);
      dummy.scale.setScalar(tuft.scale);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
      color.setHSL(0.33 + (index % 5) * 0.012, 0.38, 0.44 + (index % 4) * 0.045);
      mesh.current?.setColorAt(index, color);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, []);

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, undefined, GRASS.length]}
      frustumCulled={false}
    >
      <primitive object={material} attach="material" />
    </instancedMesh>
  );
};

export const Vegetation = () => {
  const quality = useQuality();
  return (
    <group>
      <RoundTrees castShadow={quality.shadows} />
      <Palms castShadow={quality.shadows} />
      <Bushes castShadow={quality.shadows} />
      <Flowers />
      <Grass />
    </group>
  );
};
