import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getGlowTexture, useGeneratedTexture } from './visuals';

const makeWindowTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, 384);
    gradient.addColorStop(0, '#9ac8ee');
    gradient.addColorStop(0.55, '#f5d6e0');
    gradient.addColorStop(1, '#ffe7c8');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 384);
    context.fillStyle = 'rgba(255,255,255,0.8)';
    [
      [110, 110, 58, 26],
      [155, 102, 40, 20],
      [360, 150, 66, 26],
      [405, 142, 44, 20],
    ].forEach(([x, y, rx, ry]) => {
      context.beginPath();
      context.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      context.fill();
    });
    context.fillStyle = 'rgba(255,245,200,0.7)';
    context.beginPath();
    context.arc(390, 70, 32, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = 'rgba(150,202,168,0.35)';
    context.beginPath();
    context.ellipse(250, 370, 260, 80, 0, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const makePaintingTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 288;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, 288);
    gradient.addColorStop(0, '#c3dcf5');
    gradient.addColorStop(0.6, '#f7d9e2');
    gradient.addColorStop(1, '#fce8c7');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 384, 288);
    context.fillStyle = '#8ecf9e';
    context.beginPath();
    context.ellipse(192, 310, 240, 130, 0, Math.PI, Math.PI * 2);
    context.fill();
    context.fillStyle = '#7cc6c1';
    context.beginPath();
    context.ellipse(192, 300, 280, 100, 0, Math.PI, Math.PI * 2);
    context.fill();
    context.fillStyle = '#8ecf9e';
    context.beginPath();
    context.ellipse(192, 300, 210, 115, 0, Math.PI, Math.PI * 2);
    context.fill();
    context.fillStyle = '#c89fe0';
    context.beginPath();
    context.moveTo(160, 215);
    context.lineTo(224, 215);
    context.lineTo(192, 178);
    context.closePath();
    context.fill();
    context.fillStyle = '#fff1dc';
    context.fillRect(172, 215, 40, 28);
    context.fillStyle = '#ffdb8c';
    for (let i = 0; i < 6; i += 1) {
      context.beginPath();
      context.arc(60 + i * 52, 115 + (i % 2) * 30, 3, 0, Math.PI * 2);
      context.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const Fire = () => {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.children.forEach((child, index) => {
      const flicker =
        0.85 +
        Math.sin(clock.elapsedTime * (7 + index) + index * 2.4) * 0.15 +
        Math.sin(clock.elapsedTime * 13 + index) * 0.06;
      child.scale.y = flicker;
      child.position.x = Math.sin(clock.elapsedTime * 3 + index * 2) * 0.05;
    });
  });
  return (
    <group ref={group} position={[4.05, 0.45, -2]}>
      {[
        [0, 0.2, 0, 0.34, '#ff9d5c'],
        [-0.13, 0.16, 0.06, 0.24, '#ffcf74'],
        [0.12, 0.18, -0.04, 0.27, '#ffb45e'],
      ].map(([x, y, z, scale, color], index) => (
        <mesh key={index} position={[x as number, y as number, z as number]} scale={[1, 1.4, 1]}>
          <coneGeometry args={[scale as number, 0.6, 5]} />
          <meshBasicMaterial color={color as string} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
};

const SleepingCat = () => {
  const cat = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (cat.current) {
      const breath = 1 + Math.sin(clock.elapsedTime * 1.6) * 0.025;
      cat.current.scale.set(breath, 1 / breath, breath);
    }
  });
  return (
    <group position={[1.2, 0, 2.6]}>
      <mesh position={[0, 0.16, 0]} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[0.46, 0.13, 6, 18]} />
        <meshLambertMaterial color="#c89b76" />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.5, 0.46, 0.18, 14]} />
        <meshLambertMaterial color="#f6d3dd" />
      </mesh>
      <group ref={cat} position={[0, 0.34, 0]}>
        <mesh scale={[1.2, 0.7, 0.9]}>
          <sphereGeometry args={[0.32, 8, 6]} />
          <meshLambertMaterial color="#e8c7a6" />
        </mesh>
        <mesh position={[0.22, 0.1, 0.14]}>
          <sphereGeometry args={[0.21, 8, 6]} />
          <meshLambertMaterial color="#f1d4b6" />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[0.24, 0.26, 0.08 + side * 0.11]} rotation-z={0.1 * side}>
            <coneGeometry args={[0.07, 0.15, 4]} />
            <meshLambertMaterial color="#e8c7a6" />
          </mesh>
        ))}
        <mesh position={[0.4, 0.1, 0.22]}>
          <sphereGeometry args={[0.03, 5, 4]} />
          <meshBasicMaterial color="#e79a9a" />
        </mesh>
      </group>
      <mesh position={[0.3, 0.4, 0.5]} rotation-x={-0.4}>
        <cylinderGeometry args={[0.032, 0.05, 0.8, 4]} />
        <meshLambertMaterial color="#f2c3d2" />
      </mesh>
    </group>
  );
};

const HangingLantern = () => {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.035;
    }
  });
  return (
    <group ref={group} position={[0, 3.2, 0.6]}>
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.7, 3]} />
        <meshLambertMaterial color="#8a6e59" />
      </mesh>
      <mesh position={[0, -0.82, 0]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#ffe8b8" emissive="#ffc879" emissiveIntensity={1.3} />
      </mesh>
      <mesh position={[0, -0.82, 0]}>
        <sprite scale={[1.4, 1.4, 1]}>
          <spriteMaterial
            map={getGlowTexture()}
            color="#ffe6b0"
            transparent
            opacity={0.55}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      </mesh>
    </group>
  );
};

const WindowView = ({ side }: { side: -1 | 1 }) => {
  const texture = useGeneratedTexture(makeWindowTexture);
  return (
    <group position={[side * 4.92, 1.9, 0.55]} rotation-y={side * -Math.PI / 2}>
      <mesh>
        <planeGeometry args={[2.1, 1.55]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[2.24, 0.1, 0.1]} />
        <meshLambertMaterial color="#fdf1dc" />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.08, 1.55, 0.1]} />
        <meshLambertMaterial color="#fdf1dc" />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[2.1, 0.06, 0.1]} />
        <meshLambertMaterial color="#fdf1dc" />
      </mesh>
      {[-1, 1].map((curtain) => (
        <mesh key={curtain} position={[curtain * 0.88, 0, 0.1]}>
          <planeGeometry args={[0.48, 1.9]} />
          <meshLambertMaterial color="#f2d9e5" side={THREE.DoubleSide} transparent opacity={0.94} />
        </mesh>
      ))}
      <mesh position={[0, -0.86, 0.12]}>
        <boxGeometry args={[2.4, 0.12, 0.24]} />
        <meshLambertMaterial color="#e4d0b8" />
      </mesh>
      <mesh position={[0, -0.72, 0.18]}>
        <cylinderGeometry args={[0.18, 0.14, 0.2, 7]} />
        <meshLambertMaterial color="#b78368" />
      </mesh>
      {Array.from({ length: 5 }).map((_, index) => (
        <mesh
          key={index}
          position={[-0.18 + index * 0.09, -0.53 + (index % 2) * 0.06, 0.18]}
        >
          <sphereGeometry args={[0.07, 5, 4]} />
          <meshLambertMaterial color={['#ffb7ca', '#ffe09b', '#d9c3fa'][index % 3]} />
        </mesh>
      ))}
    </group>
  );
};

export const Interior = () => {
  const painting = useGeneratedTexture(makePaintingTexture);
  const glow = useMemo(getGlowTexture, []);

  return (
    <group>
      <color attach="background" args={['#2b2029']} />
      <ambientLight intensity={0.62} color="#ffe7d6" />
      <hemisphereLight args={['#ffe9dc', '#71545c', 0.72]} />
      <directionalLight position={[2, 4, 3]} intensity={0.65} color="#ffe6cf" />
      <pointLight position={[3.4, 1.45, -2]} color="#ffb765" intensity={16} distance={6.5} decay={2} />
      <pointLight position={[0, 2.1, 0.5]} color="#ffd7a1" intensity={8} distance={7} decay={2} />

      {/* Shell of the cottage */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[10.2, 0.2, 8.2]} />
        <meshLambertMaterial color="#b98c67" />
      </mesh>
      <mesh position={[0, 3.32, 0]}>
        <boxGeometry args={[10.4, 0.18, 8.4]} />
        <meshLambertMaterial color="#f3e3cd" />
      </mesh>
      {[
        [0, -4.05, 10.3, 0.2],
        [0, 4.05, 10.3, 0.2],
        [-5.05, 0, 0.2, 8.2],
        [5.05, 0, 0.2, 8.2],
      ].map(([x, z, width, depth], index) => (
        <mesh key={index} position={[x, 1.6, z]}>
          <boxGeometry args={[width, 3.2, depth]} />
          <meshLambertMaterial color="#fff0da" />
        </mesh>
      ))}
      {/* Wainscot panels and rails */}
      {[-3.98, 3.98].map((z) => (
        <group key={z}>
          <mesh position={[0, 0.62, z]}>
            <boxGeometry args={[10.0, 1.16, 0.07]} />
            <meshLambertMaterial color="#e7cfdf" />
          </mesh>
          <mesh position={[0, 1.2, z]}>
            <boxGeometry args={[10.1, 0.09, 0.1]} />
            <meshLambertMaterial color="#cfb3c9" />
          </mesh>
        </group>
      ))}
      {[-4.98, 4.98].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.62, 0]}>
            <boxGeometry args={[0.07, 1.16, 8.0]} />
            <meshLambertMaterial color="#e7cfdf" />
          </mesh>
          <mesh position={[x, 1.2, 0]}>
            <boxGeometry args={[0.1, 0.09, 8.1]} />
            <meshLambertMaterial color="#cfb3c9" />
          </mesh>
        </group>
      ))}
      {/* Ceiling beams */}
      {[-2.4, 0, 2.4].map((z) => (
        <mesh key={z} position={[0, 3.15, z]}>
          <boxGeometry args={[10.2, 0.16, 0.22]} />
          <meshLambertMaterial color="#c69b79" />
        </mesh>
      ))}

      {/* Door home */}
      <group position={[0, 0, -3.93]}>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[2.05, 3.0, 0.16]} />
          <meshLambertMaterial color="#f5e6d0" />
        </mesh>
        <mesh position={[0, 1.32, 0.09]}>
          <boxGeometry args={[1.7, 2.64, 0.12]} />
          <meshLambertMaterial color="#c59bce" />
        </mesh>
        <mesh position={[0, 1.32, 0.16]}>
          <boxGeometry args={[1.36, 2.3, 0.04]} />
          <meshLambertMaterial color="#d6b0dc" />
        </mesh>
        <mesh position={[0.52, 1.22, 0.22]}>
          <sphereGeometry args={[0.075, 8, 6]} />
          <meshStandardMaterial color="#ffda90" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.05, 0.18]}>
          <torusGeometry args={[0.25, 0.07, 5, 13]} />
          <meshLambertMaterial color="#94c9a4" />
        </mesh>
        {[-0.16, 0, 0.16].map((offset, index) => (
          <mesh key={index} position={[offset, 2.22, 0.22]}>
            <sphereGeometry args={[0.07, 5, 4]} />
            <meshLambertMaterial color={['#ffb9ce', '#ffe5a3', '#dcc4fa'][index]} />
          </mesh>
        ))}
      </group>

      <WindowView side={-1} />
      <WindowView side={1} />

      {/* Rug */}
      <mesh position={[0, 0.012, 0.2]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[2.3, 28]} />
        <meshLambertMaterial color="#f2ccd9" />
      </mesh>
      <mesh position={[0, 0.018, 0.2]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.5, 1.62, 30]} />
        <meshLambertMaterial color="#d8bce4" />
      </mesh>
      <mesh position={[0, 0.02, 0.2]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.65, 0.72, 24]} />
        <meshLambertMaterial color="#f9e6c7" />
      </mesh>

      {/* Bed */}
      <group position={[-3.5, 0, -2.25]}>
        <mesh position={[0, 0.23, 0]} castShadow>
          <boxGeometry args={[2.25, 0.35, 2.95]} />
          <meshLambertMaterial color="#a57a5c" />
        </mesh>
        <mesh position={[0, 0.43, 0]}>
          <boxGeometry args={[2.08, 0.28, 2.72]} />
          <meshLambertMaterial color="#fff3e3" />
        </mesh>
        <mesh position={[0, 0.58, 0.34]}>
          <boxGeometry args={[2.1, 0.12, 1.9]} />
          <meshLambertMaterial color="#f3b8c9" />
        </mesh>
        <mesh position={[0, 0.63, -0.4]}>
          <boxGeometry args={[2.12, 0.08, 0.4]} />
          <meshLambertMaterial color="#fbe2e8" />
        </mesh>
        <mesh position={[0, 0.78, -1.35]}>
          <boxGeometry args={[2.3, 1.35, 0.14]} />
          <meshLambertMaterial color="#b98d6c" />
        </mesh>
        {[-0.52, 0.52].map((x) => (
          <mesh key={x} position={[x, 0.68, -1.05]} rotation-x={-0.15}>
            <boxGeometry args={[0.9, 0.2, 0.55]} />
            <meshLambertMaterial color="#fffaf0" />
          </mesh>
        ))}
        <mesh position={[0.62, 0.72, 0.5]} rotation-z={0.2}>
          <boxGeometry args={[0.5, 0.08, 0.75]} />
          <meshLambertMaterial color="#e7d1f1" />
        </mesh>
      </group>

      {/* Fireplace */}
      <group position={[4.55, 0, -2]}>
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[0.5, 2.3, 1.35]} />
          <meshLambertMaterial color="#d8c8b8" />
        </mesh>
        <mesh position={[-0.28, 0.62, 0]}>
          <boxGeometry args={[0.2, 0.9, 0.9]} />
          <meshBasicMaterial color="#2e2222" />
        </mesh>
        <mesh position={[-0.22, 2.22, 0]}>
          <boxGeometry args={[0.55, 0.14, 1.55]} />
          <meshLambertMaterial color="#b48d6c" />
        </mesh>
        {[-0.55, 0, 0.55].map((z) => (
          <mesh key={z} position={[-0.3, 0.36, z]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.075, 0.09, 0.55, 5]} />
            <meshLambertMaterial color="#7c543c" />
          </mesh>
        ))}
        <mesh position={[-0.32, 2.38, 0.4]}>
          <cylinderGeometry args={[0.13, 0.1, 0.26, 6]} />
          <meshLambertMaterial color="#c78f78" />
        </mesh>
        {Array.from({ length: 7 }).map((_, index) => (
          <mesh
            key={index}
            position={[-0.18 + (index % 3) * 0.16, 2.53 + (index % 2) * 0.12, 0.24 + index * 0.06]}
          >
            <sphereGeometry args={[0.1, 5, 4]} />
            <meshLambertMaterial color={['#8fc79a', '#a9d9ad', '#ffd0dc'][index % 3]} />
          </mesh>
        ))}
      </group>

      {/* Table and tea */}
      <group position={[2.5, 0, 0.35]}>
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.92, 0.92, 0.1, 18]} />
          <meshLambertMaterial color="#c7a07c" />
        </mesh>
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.14, 0.25, 0.72, 7]} />
          <meshLambertMaterial color="#a67c5b" />
        </mesh>
        <mesh position={[0, 0.82, 0]}>
          <sphereGeometry args={[0.23, 10, 7]} />
          <meshLambertMaterial color="#f9e8d1" />
        </mesh>
        <mesh position={[0.23, 0.86, 0]} rotation-z={-1.1}>
          <cylinderGeometry args={[0.04, 0.09, 0.28, 5]} />
          <meshLambertMaterial color="#f9e8d1" />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <sphereGeometry args={[0.07, 6, 5]} />
          <meshLambertMaterial color="#e4b6ca" />
        </mesh>
        {[[-0.45, 0.26], [0.5, -0.32]].map(([x, z], index) => (
          <group key={index} position={[x, 0.8, z]}>
            <mesh>
              <cylinderGeometry args={[0.13, 0.1, 0.16, 8]} />
              <meshLambertMaterial color="#f6e6d0" />
            </mesh>
            <mesh position={[0.14, 0, 0]} rotation-z={-1.2}>
              <torusGeometry args={[0.07, 0.02, 4, 8]} />
              <meshLambertMaterial color="#f6e6d0" />
            </mesh>
          </group>
        ))}
        <mesh position={[0.05, 1.18, 0]}>
          <sphereGeometry args={[0.02, 4, 3]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.13, 1.35, 0.02]}>
          <sphereGeometry args={[0.026, 4, 3]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.35} />
        </mesh>
      </group>
      {[-1.3, 1.3].map((offset, index) => (
        <group key={offset} position={[2.5 + offset, 0, 0.35]} rotation-y={index === 0 ? Math.PI / 2 : -Math.PI / 2}>
          <mesh position={[0, 0.42, 0.4]}>
            <boxGeometry args={[0.75, 0.12, 0.7]} />
            <meshLambertMaterial color="#c39a74" />
          </mesh>
          <mesh position={[0, 0.75, 0.7]}>
            <boxGeometry args={[0.75, 0.7, 0.1]} />
            <meshLambertMaterial color="#b98e69" />
          </mesh>
          {[-0.3, 0.3].map((leg) => (
            <mesh key={leg} position={[leg, 0.2, 0.4]}>
              <boxGeometry args={[0.08, 0.42, 0.08]} />
              <meshLambertMaterial color="#a9815f" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Sofa */}
      <group position={[-3.35, 0, 2.45]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[2.0, 0.6, 1.2]} />
          <meshLambertMaterial color="#b6c9e0" />
        </mesh>
        <mesh position={[0, 0.78, -0.52]}>
          <boxGeometry args={[2.0, 0.8, 0.28]} />
          <meshLambertMaterial color="#a9bed9" />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.95, 0.62, 0]}>
            <boxGeometry args={[0.25, 0.7, 1.2]} />
            <meshLambertMaterial color="#a9bed9" />
          </mesh>
        ))}
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.68, 0.02]}>
            <boxGeometry args={[0.86, 0.16, 1.0]} />
            <meshLambertMaterial color="#d5e3ef" />
          </mesh>
        ))}
        <mesh position={[0.45, 0.8, 0.15]} rotation-z={0.15}>
          <boxGeometry args={[0.55, 0.1, 0.8]} />
          <meshLambertMaterial color="#f0c6d6" />
        </mesh>
      </group>

      {/* Bookshelf */}
      <group position={[4.55, 0, 2.0]}>
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[0.45, 2.5, 2.1]} />
          <meshLambertMaterial color="#a87e5c" />
        </mesh>
        {[0.42, 1.12, 1.82].map((y) => (
          <mesh key={y} position={[-0.25, y, 0]}>
            <boxGeometry args={[0.1, 0.08, 1.95]} />
            <meshLambertMaterial color="#d1ac85" />
          </mesh>
        ))}
        {Array.from({ length: 15 }).map((_, index) => (
          <mesh
            key={index}
            position={[
              -0.25 - (index % 3) * 0.04,
              0.58 + Math.floor(index / 5) * 0.7,
              -0.8 + (index % 5) * 0.33,
            ]}
            rotation-z={(index % 4 === 0 ? -1 : 1) * 0.03}
          >
            <boxGeometry args={[0.2, 0.42 + (index % 3) * 0.06, 0.16]} />
            <meshLambertMaterial
              color={['#d590a7', '#9db3d9', '#b4a4d8', '#e0c28f', '#9ecdb3'][index % 5]}
            />
          </mesh>
        ))}
        <mesh position={[-0.1, 2.02, 0.6]}>
          <sphereGeometry args={[0.17, 7, 5]} />
          <meshLambertMaterial color="#94c8a1" />
        </mesh>
        <mesh position={[-0.1, 2.12, 0.45]}>
          <cylinderGeometry args={[0.1, 0.12, 0.15, 6]} />
          <meshLambertMaterial color="#c98976" />
        </mesh>
      </group>

      <SleepingCat />
      <HangingLantern />
      <Fire />

      {/* Painting above the sofa */}
      <group position={[-4.94, 2.15, 2.45]} rotation-y={Math.PI / 2}>
        <mesh position={[0, 0, 0.07]}>
          <planeGeometry args={[1.85, 1.4]} />
          <meshBasicMaterial map={painting} toneMapped={false} />
        </mesh>
        <mesh>
          <boxGeometry args={[2.0, 1.55, 0.08]} />
          <meshLambertMaterial color="#b48764" />
        </mesh>
      </group>

      {/* Warm dust motes */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 24 }).flatMap(() => [
                  (Math.random() - 0.5) * 8.5,
                  0.8 + Math.random() * 2.1,
                  (Math.random() - 0.5) * 7,
                ]),
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          map={glow}
          color="#ffe6b8"
          size={0.1}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
};
