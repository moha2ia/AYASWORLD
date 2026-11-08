import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { terrainHeight } from '../terrain';
import { useQuality } from '../useQuality';
import { LAYOUT } from './layout';
import { Glow, makePlaqueTexture, useGeneratedTexture } from './visuals';

const Window = ({
  x,
  y,
  z,
  rotationY = 0,
  width = 1.5,
  height = 1.5,
  shutters = true,
  flowerBox = false,
}: {
  x: number;
  y: number;
  z: number;
  rotationY?: number;
  width?: number;
  height?: number;
  shutters?: boolean;
  flowerBox?: boolean;
}) => (
  <group position={[x, y, z]} rotation-y={rotationY}>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[width + 0.26, height + 0.26, 0.12]} />
      <meshLambertMaterial color="#fff4e2" />
    </mesh>
    <mesh position={[0, 0, 0.08]}>
      <planeGeometry args={[width - 0.12, height - 0.12]} />
      <meshStandardMaterial
        color="#ffe1a8"
        emissive="#ffc678"
        emissiveIntensity={0.7}
        roughness={0.35}
      />
    </mesh>
    <mesh position={[0, 0, 0.16]}>
      <boxGeometry args={[0.07, height - 0.1, 0.05]} />
      <meshLambertMaterial color="#fff4e2" />
    </mesh>
    <mesh position={[0, 0, 0.16]}>
      <boxGeometry args={[width - 0.1, 0.07, 0.05]} />
      <meshLambertMaterial color="#fff4e2" />
    </mesh>
    {shutters && (
      <>
        <mesh position={[-width / 2 - 0.25, 0, 0.02]} rotation-z={0.04}>
          <boxGeometry args={[0.45, height + 0.3, 0.1]} />
          <meshLambertMaterial color="#b795d6" />
        </mesh>
        <mesh position={[width / 2 + 0.25, 0, 0.02]} rotation-z={-0.04}>
          <boxGeometry args={[0.45, height + 0.3, 0.1]} />
          <meshLambertMaterial color="#b795d6" />
        </mesh>
      </>
    )}
    {flowerBox && (
      <group position={[0, -height / 2 - 0.28, 0.2]}>
        <mesh>
          <boxGeometry args={[width + 0.3, 0.28, 0.36]} />
          <meshLambertMaterial color="#a97a5f" />
        </mesh>
        {[-0.55, -0.2, 0.2, 0.55].map((offset, index) => (
          <mesh key={index} position={[offset, 0.22, 0.02]}>
            <sphereGeometry args={[0.12, 6, 5]} />
            <meshLambertMaterial
              color={['#ffb8cd', '#f8cfdf', '#e0c4ff', '#ffe3a1'][index % 4]}
            />
          </mesh>
        ))}
      </group>
    )}
  </group>
);

const Smoke = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const time = clock.elapsedTime;
    group.current.children.forEach((child, index) => {
      const phase = (time * 0.18 + index / 3) % 1;
      child.position.y = phase * 2.2;
      child.position.x = Math.sin(time * 0.35 + index * 2.4) * 0.22;
      const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      material.opacity = (1 - phase) * 0.22;
      child.scale.setScalar(0.45 + phase * 0.85);
    });
    if (reducedMotion) group.current.visible = false;
  });
  return (
    <group ref={group} position={[2.7, 5.9, -1.2]}>
      {[0, 1, 2, 3].map((index) => (
        <mesh key={index}>
          <sphereGeometry args={[0.35, 7, 5]} />
          <meshBasicMaterial color="#fffaf4" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

const Mailbox = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 1.1, 5]} />
        <meshLambertMaterial color="#9d745a" />
      </mesh>
      <mesh position={[0, 1.18, 0]} castShadow>
        <boxGeometry args={[0.46, 0.36, 0.72]} />
        <meshLambertMaterial color="#f6ede0" />
      </mesh>
      <mesh position={[0, 1.38, 0]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.29, 0.29, 0.46, 10, 1, false, 0, Math.PI]} />
        <meshLambertMaterial color="#b795d6" />
      </mesh>
      <mesh position={[0.25, 1.46, 0.18]} rotation-x={0.3}>
        <boxGeometry args={[0.05, 0.38, 0.04]} />
        <meshLambertMaterial color="#e48098" />
      </mesh>
      <mesh position={[0.26, 1.46, 0.28]} rotation-z={0.7}>
        <boxGeometry args={[0.2, 0.05, 0.03]} />
        <meshLambertMaterial color="#e48098" />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.16, 6]} />
        <meshLambertMaterial color="#b9d6a5" />
      </mesh>
    </group>
  );
};

export const Cottage = () => {
  const quality = useQuality();
  const baseY = terrainHeight(LAYOUT.cottage.x, LAYOUT.cottage.z);
  const plaqueTexture = useGeneratedTexture(() => makePlaqueTexture('AYA'));
  const gableGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-4.2, 0);
    shape.lineTo(4.2, 0);
    shape.lineTo(0, 1.72);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  return (
    <group position={[LAYOUT.cottage.x, baseY, LAYOUT.cottage.z]}>
      {/* Foundation and warm cream walls */}
      <mesh position={[0, 0.2, 0]} receiveShadow castShadow={quality.shadows}>
        <boxGeometry args={[9.3, 0.4, 6.7]} />
        <meshLambertMaterial color="#c6b9a8" />
      </mesh>
      <mesh position={[0, 2.05, 0]} castShadow={quality.shadows} receiveShadow>
        <boxGeometry args={[8.4, 3.5, 5.8]} />
        <meshLambertMaterial color="#fff1dd" />
      </mesh>
      {/* Soft timber trim */}
      {[-4.18, 4.18].map((x) => (
        <mesh key={x} position={[x, 2.05, 0]}>
          <boxGeometry args={[0.14, 3.45, 0.14]} />
          <meshLambertMaterial color="#d3b28f" />
        </mesh>
      ))}
      <mesh position={[0, 1.1, 2.91]}>
        <boxGeometry args={[8.1, 0.13, 0.08]} />
        <meshLambertMaterial color="#d3b28f" />
      </mesh>

      {/* Gables */}
      <mesh geometry={gableGeometry} position={[0, 3.8, 2.905]}>
        <meshLambertMaterial color="#fff1dd" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={gableGeometry} position={[0, 3.8, -2.905]} rotation-y={Math.PI}>
        <meshLambertMaterial color="#fff1dd" side={THREE.DoubleSide} />
      </mesh>

      {/* Lavender roof */}
      <mesh
        position={[0, 4.55, 1.45]}
        rotation-x={0.54}
        castShadow={quality.shadows}
        receiveShadow
      >
        <boxGeometry args={[9.9, 0.3, 4.25]} />
        <meshLambertMaterial color="#c8a5dd" />
      </mesh>
      <mesh
        position={[0, 4.55, -1.45]}
        rotation-x={-0.54}
        castShadow={quality.shadows}
        receiveShadow
      >
        <boxGeometry args={[9.9, 0.3, 4.25]} />
        <meshLambertMaterial color="#c19bd8" />
      </mesh>
      <mesh position={[0, 5.55, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[9.95, 0.24, 0.36]} />
        <meshLambertMaterial color="#b38bc9" />
      </mesh>
      {/* Scalloped roof edge */}
      {Array.from({ length: 11 }).map((_, index) => (
        <mesh
          key={index}
          position={[-4.5 + index * 0.9, 3.95, 3.36]}
          rotation-x={0.1}
        >
          <sphereGeometry args={[0.28, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshLambertMaterial color="#d7b8e8" />
        </mesh>
      ))}

      {/* Chimney */}
      <mesh position={[2.7, 5.2, -1.15]} castShadow={quality.shadows}>
        <boxGeometry args={[0.82, 2.1, 0.82]} />
        <meshLambertMaterial color="#cdb9ad" />
      </mesh>
      <mesh position={[2.7, 6.27, -1.15]}>
        <boxGeometry args={[1.02, 0.16, 1.02]} />
        <meshLambertMaterial color="#ae9a91" />
      </mesh>
      <Smoke reducedMotion={quality.reducedMotion} />

      {/* Front door with arch */}
      <group position={[0, 0.4, 2.93]}>
        <mesh position={[0, 1.15, 0]} castShadow={quality.shadows}>
          <boxGeometry args={[1.5, 2.3, 0.16]} />
          <meshLambertMaterial color="#b687c8" />
        </mesh>
        <mesh position={[0, 2.3, 0]} rotation-z={0}>
          <circleGeometry args={[0.75, 18, 0, Math.PI]} />
          <meshLambertMaterial color="#b687c8" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 1.15, 0.1]}>
          <boxGeometry args={[1.18, 1.85, 0.05]} />
          <meshLambertMaterial color="#caa0d8" />
        </mesh>
        <mesh position={[0.43, 1.1, 0.18]}>
          <sphereGeometry args={[0.075, 8, 6]} />
          <meshStandardMaterial color="#ffd98a" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.28, 0.09]}>
          <boxGeometry args={[0.07, 0.5, 0.03]} />
          <meshLambertMaterial color="#f8e8cf" />
        </mesh>
        <mesh position={[0, 2.35, 0.09]}>
          <boxGeometry args={[0.4, 0.07, 0.03]} />
          <meshLambertMaterial color="#f8e8cf" />
        </mesh>
      </group>

      {/* AYA plaque */}
      <mesh position={[0, 3.4, 2.93]}>
        <planeGeometry args={[1.9, 0.7]} />
        <meshBasicMaterial map={plaqueTexture} transparent toneMapped={false} />
      </mesh>

      <Window x={-2.55} y={2.35} z={2.93} flowerBox />
      <Window x={2.55} y={2.35} z={2.93} flowerBox />
      <Window x={4.22} y={2.35} z={0.2} rotationY={Math.PI / 2} width={1.1} height={1.2} />
      <Window x={-4.22} y={2.35} z={-0.4} rotationY={-Math.PI / 2} width={1.1} height={1.2} />

      {/* Porch */}
      <mesh position={[0, 0.23, 3.95]} receiveShadow>
        <boxGeometry args={[4.6, 0.26, 1.9]} />
        <meshLambertMaterial color="#d5bea1" />
      </mesh>
      <mesh position={[0, 0.1, 5.15]} receiveShadow>
        <boxGeometry args={[3.8, 0.2, 0.8]} />
        <meshLambertMaterial color="#cdb595" />
      </mesh>
      {[-1.95, 1.95].map((x) => (
        <mesh key={x} position={[x, 1.35, 4.6]} castShadow={quality.shadows}>
          <cylinderGeometry args={[0.11, 0.14, 2.35, 6]} />
          <meshLambertMaterial color="#a98268" />
        </mesh>
      ))}
      <mesh position={[0, 2.62, 4.3]} castShadow={quality.shadows}>
        <boxGeometry args={[4.5, 0.2, 2.1]} />
        <meshLambertMaterial color="#c8a5dd" />
      </mesh>
      <mesh position={[0, 2.75, 4.3]} rotation-x={0.1}>
        <boxGeometry args={[4.7, 0.12, 2.2]} />
        <meshLambertMaterial color="#d8b9e8" />
      </mesh>

      {/* Lanterns by the door */}
      {[-1.9, 1.9].map((x) => (
        <group key={x} position={[x, 1.65, 4.62]}>
          <mesh>
            <boxGeometry args={[0.22, 0.38, 0.22]} />
            <meshStandardMaterial
              color="#ffe6b0"
              emissive="#ffc778"
              emissiveIntensity={1.1}
              transparent
              opacity={0.92}
            />
          </mesh>
          <Glow color="#ffe3a0" scale={1.1} opacity={0.6} />
        </group>
      ))}

      {/* Little front garden fence */}
      <group position={[-4.6, 0, 5.2]}>
        {Array.from({ length: 7 }).map((_, index) => (
          <group key={index} position={[0, 0, index * 0.52]}>
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[0.1, 0.7, 0.14]} />
              <meshLambertMaterial color="#f4ead7" />
            </mesh>
            <mesh position={[0, 0.63, 0]}>
              <coneGeometry args={[0.1, 0.16, 4]} />
              <meshLambertMaterial color="#f4ead7" />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.35, 1.56]}>
          <boxGeometry args={[0.06, 0.09, 3.2]} />
          <meshLambertMaterial color="#eadcc7" />
        </mesh>
        <mesh position={[0, 0.52, 1.56]}>
          <boxGeometry args={[0.06, 0.09, 3.2]} />
          <meshLambertMaterial color="#eadcc7" />
        </mesh>
      </group>

      <Mailbox
        position={[
          LAYOUT.cottageMailbox.x - LAYOUT.cottage.x,
          terrainHeight(LAYOUT.cottageMailbox.x, LAYOUT.cottageMailbox.z) - baseY,
          LAYOUT.cottageMailbox.z - LAYOUT.cottage.z,
        ]}
      />
    </group>
  );
};
