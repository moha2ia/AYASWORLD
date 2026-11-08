import { GAME_INFO } from '../../config/gameConfig';
import { terrainHeight } from '../terrain';
import { useQuality } from '../useQuality';
import { LAYOUT } from './layout';
import { makeSignTexture, useGeneratedTexture } from './visuals';

const WelcomeSign = () => {
  const quality = useQuality();
  const { x, z } = LAYOUT.meadowSign;
  const y = terrainHeight(x, z);
  const texture = useGeneratedTexture(() =>
    makeSignTexture(GAME_INFO.signTitle, GAME_INFO.signSubtitle),
  );

  return (
    <group position={[x, y, z]}>
      {[-1.3, 1.3].map((postX) => (
        <mesh key={postX} position={[postX, 1.05, -0.08]} castShadow={quality.shadows}>
          <boxGeometry args={[0.2, 2.1, 0.2]} />
          <meshLambertMaterial color="#9a7055" />
        </mesh>
      ))}
      <mesh position={[0, 1.95, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[3.5, 1.75, 0.2]} />
        <meshLambertMaterial color="#bd8d66" />
      </mesh>
      <mesh position={[0, 1.95, 0.115]}>
        <planeGeometry args={[3.36, 1.62]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 2.87, 0]} castShadow>
        <boxGeometry args={[3.7, 0.13, 0.3]} />
        <meshLambertMaterial color="#a97b5b" />
      </mesh>
      {[
        [-1.55, 0.15],
        [1.42, 0.18],
        [-1.22, 0.25],
      ].map(([flowerX, flowerZ], index) => (
        <group key={index} position={[flowerX, 0.18, flowerZ]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.35, 4]} />
            <meshLambertMaterial color="#7fbd8e" />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.11, 6, 4]} />
            <meshLambertMaterial color={['#ffc1d5', '#ffe4a6', '#d9c4fb'][index]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const FlowerArch = () => {
  const quality = useQuality();
  const { x, z } = LAYOUT.meadowArch;
  const y = terrainHeight(x, z);
  const archRadius = 1.8;

  return (
    <group position={[x, y, z]}>
      {[-archRadius, archRadius].map((postX) => (
        <mesh key={postX} position={[postX, 1.15, 0]} castShadow={quality.shadows}>
          <cylinderGeometry args={[0.12, 0.15, 2.3, 6]} />
          <meshLambertMaterial color="#f0e0c8" />
        </mesh>
      ))}
      <mesh position={[0, 2.3, 0]} rotation-z={0}>
        <torusGeometry args={[archRadius, 0.12, 6, 22, Math.PI]} />
        <meshLambertMaterial color="#f0e0c8" />
      </mesh>
      {Array.from({ length: 13 }).map((_, index) => {
        const angle = (index / 12) * Math.PI;
        const radius = archRadius + (index % 2 === 0 ? 0.09 : -0.09);
        const vineX = Math.cos(angle) * radius;
        const vineY = Math.sin(angle) * radius + 2.3;
        return (
          <group key={index} position={[vineX, vineY, (index % 3 - 1) * 0.09]}>
            <mesh>
              <sphereGeometry args={[0.14, 5, 4]} />
              <meshLambertMaterial color={index % 2 ? '#8fc79a' : '#a8d8b0'} />
            </mesh>
            {index % 2 === 0 && (
              <mesh position={[0.05, 0.12, 0.06]}>
                <sphereGeometry args={[0.11, 5, 4]} />
                <meshLambertMaterial
                  color={['#ffbcd2', '#ffe5a7', '#e0c6ff'][index % 3]}
                />
              </mesh>
            )}
          </group>
        );
      })}
      <mesh position={[0, 3.6, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.9, 3]} />
        <meshLambertMaterial color="#a98a6d" />
      </mesh>
      <mesh position={[0, 3.1, 0]}>
        <sphereGeometry args={[0.13, 6, 5]} />
        <meshStandardMaterial color="#ffe6ae" emissive="#ffc778" emissiveIntensity={1} />
      </mesh>
    </group>
  );
};

export const Meadow = () => (
  <group>
    <WelcomeSign />
    <FlowerArch />
  </group>
);
