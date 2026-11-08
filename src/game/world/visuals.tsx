import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

let cachedGlowTexture: THREE.CanvasTexture | null = null;

/** Soft radial glow, generated once at runtime. */
export const getGlowTexture = (): THREE.CanvasTexture => {
  if (cachedGlowTexture) return cachedGlowTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.25, 'rgba(255,255,255,0.72)');
    gradient.addColorStop(0.55, 'rgba(255,255,255,0.22)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  cachedGlowTexture = texture;
  return texture;
};

export const Glow = ({
  color = '#ffe6a7',
  scale = 2,
  opacity = 0.7,
}: {
  color?: string;
  scale?: number;
  opacity?: number;
}) => {
  const texture = useMemo(getGlowTexture, []);
  return (
    <sprite scale={[scale, scale, 1]} renderOrder={3}>
      <spriteMaterial
        map={texture}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
};

const makeStarGeometry = () => {
  const shape = new THREE.Shape();
  const points = 5;
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? 0.48 : 0.21;
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 2,
    curveSegments: 1,
  });
  geometry.center();
  return geometry;
};

export const STAR_GEOMETRY = makeStarGeometry();

export const StarMesh = ({
  color = '#ffd469',
  glowColor = '#ffe7a3',
  scale = 1,
  showGlow = true,
}: {
  color?: string;
  glowColor?: string;
  scale?: number;
  showGlow?: boolean;
}) => (
  <group scale={scale}>
    <mesh geometry={STAR_GEOMETRY} castShadow>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.55}
        roughness={0.35}
        metalness={0.15}
      />
    </mesh>
    {showGlow && (
      <sprite scale={[2.6, 2.6, 1]} renderOrder={3}>
        <spriteMaterial
          map={getGlowTexture()}
          color={glowColor}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
    )}
  </group>
);

export interface SwayOptions {
  flatShading?: boolean;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}

/**
 * A cheap vertex sway for instanced plants. Requires no custom lit shader:
 * we inject a few lines into Lambert's vertex stage and animate one uniform.
 */
export const useSwayMaterial = (
  color: string,
  sway: number,
  options: SwayOptions = {},
) => {
  const { flatShading, emissive, emissiveIntensity, transparent, opacity } = options;
  const material = useMemo(() => {
    const mat = new THREE.MeshLambertMaterial({
      color,
      flatShading,
      emissive: emissive ?? '#000000',
      emissiveIntensity: emissiveIntensity ?? 0,
      transparent,
      opacity,
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uSway = { value: sway };
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform float uTime;\nuniform float uSway;',
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vec2 instanceOrigin = vec2(0.0);
          #ifdef USE_INSTANCING
            instanceOrigin = instanceMatrix[3].xz;
          #endif
          float swayPhase = uTime * 1.35 + instanceOrigin.x * 0.55 + instanceOrigin.y * 0.42;
          float bend = max(0.0, position.y) * uSway;
          transformed.x += sin(swayPhase) * bend;
          transformed.z += cos(swayPhase * 0.83) * bend * 0.6;`,
        );
      mat.userData.shader = shader;
    };
    mat.customProgramCacheKey = () => 'aya-sway-v2';
    return mat;
  }, [color, flatShading, emissive, emissiveIntensity, transparent, opacity, sway]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    const shader = material.userData.shader as
      | { uniforms: { uTime: { value: number } } }
      | undefined;
    if (shader) shader.uniforms.uTime.value = clock.elapsedTime;
  });

  return material;
};

const roundRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
};

export const makeSignTexture = (title: string, subtitle: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#c99368';
    context.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 32; i += 1) {
      context.strokeStyle = `rgba(120,74,48,${0.05 + (i % 4) * 0.02})`;
      context.lineWidth = 1 + (i % 3);
      context.beginPath();
      context.moveTo(0, i * 17);
      context.bezierCurveTo(240, i * 17 + 6, 700, i * 17 - 8, 1024, i * 17 + 2);
      context.stroke();
    }
    context.fillStyle = '#f9edd5';
    roundRect(context, 34, 32, 956, 448, 38);
    context.fill();
    context.strokeStyle = '#b77d51';
    context.lineWidth = 8;
    roundRect(context, 52, 50, 920, 412, 26);
    context.stroke();

    context.fillStyle = '#7a4a35';
    context.textAlign = 'center';
    context.font = '600 74px Georgia, "Times New Roman", serif';
    const words = title.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (context.measureText(test).width > 850) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    lines.forEach((text, index) => {
      context.fillText(text, 512, 190 + index * 84);
    });
    context.fillStyle = '#a56b80';
    context.font = 'italic 38px Georgia, "Times New Roman", serif';
    context.fillText(subtitle, 512, 190 + lines.length * 84 + 20);
    context.fillStyle = '#e2a4b8';
    context.font = '44px Georgia, serif';
    context.fillText('♥', 512, 452);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

export const makeNoteTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#fff8e9';
    roundRect(context, 8, 8, 496, 368, 22);
    context.fill();
    context.strokeStyle = '#e6b9c8';
    context.lineWidth = 5;
    context.stroke();
    context.fillStyle = '#b36b85';
    context.textAlign = 'center';
    context.font = 'italic 56px Georgia, serif';
    context.fillText('A note for AYA', 256, 122);
    context.fillStyle = '#9b7a68';
    context.font = '30px Georgia, serif';
    context.fillText('press E / tap to read', 256, 210);
    context.fillStyle = '#e2a4b8';
    context.font = '54px Georgia, serif';
    context.fillText('♡', 256, 314);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

export const makePlaqueTexture = (text: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#f5e4cf';
    roundRect(context, 6, 6, 500, 180, 28);
    context.fill();
    context.strokeStyle = '#c69a77';
    context.lineWidth = 6;
    context.stroke();
    context.fillStyle = '#8b5b4b';
    context.textAlign = 'center';
    context.font = 'italic 66px Georgia, serif';
    context.fillText(text, 256, 102);
    context.fillStyle = '#d890a6';
    context.font = '40px Georgia, serif';
    context.fillText('♥', 256, 156);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

/** Hook that disposes a generated texture when its owner unmounts. */
export const useGeneratedTexture = <T extends THREE.Texture>(factory: () => T) => {
  const texture = useMemo(factory, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
};
