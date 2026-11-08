import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { ISLAND_SIZE, terrainHeight } from '../terrain';
import { LAYOUT } from './layout';

const terrainColor = (x: number, z: number, height: number) => {
  const color = new THREE.Color();
  const grassA = new THREE.Color('#84cb94');
  const grassB = new THREE.Color('#aade9f');
  const grassC = new THREE.Color('#66b07d');
  const sand = new THREE.Color('#f2dda9');
  const sandPink = new THREE.Color('#f1d0b2');
  const lavender = new THREE.Color('#bcaadf');
  const blossom = new THREE.Color('#cfe296');

  const noise =
    Math.sin(x * 0.31) * 0.5 +
    Math.cos(z * 0.27) * 0.35 +
    Math.sin((x + z) * 0.13) * 0.25 +
    Math.cos((x - z) * 0.19) * 0.18;

  if (height < 1.15) {
    color.copy(sand).lerp(sandPink, (Math.sin(x * 0.4 + z * 0.2) + 1) * 0.25);
  } else {
    color.copy(grassA).lerp(grassB, (noise + 1) * 0.42);
    color.lerp(grassC, Math.max(0, -noise) * 0.38);

    const secretDistance = Math.hypot(x - LAYOUT.secretGarden.x, z - LAYOUT.secretGarden.z);
    if (secretDistance < 10) {
      color.lerp(lavender, (1 - secretDistance / 10) * 0.42);
    }
    const gardenDistance = Math.hypot(x - LAYOUT.flowerGarden.x, z - LAYOUT.flowerGarden.z);
    if (gardenDistance < 9) {
      color.lerp(blossom, (1 - gardenDistance / 9) * 0.22);
    }
    const shrineDistance = Math.hypot(x - LAYOUT.shrine.x, z - LAYOUT.shrine.z);
    if (shrineDistance < 11) {
      color.lerp(grassB, (1 - shrineDistance / 11) * 0.35);
    }
  }

  return color;
};

export const Terrain = () => {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(ISLAND_SIZE, ISLAND_SIZE, 104, 104);
    geo.rotateX(-Math.PI / 2);
    const positions = geo.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const height = terrainHeight(x, z);
      positions.setY(i, height);
      const color = terrainColor(x, z, height);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshLambertMaterial vertexColors />
    </mesh>
  );
};
