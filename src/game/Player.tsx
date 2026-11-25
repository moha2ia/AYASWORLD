import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { HAIR_STYLES, OUTFITS } from '../config/gameConfig';
import { audio } from './audio';
import { cameraState, ISLAND_DISTANCE, ISLAND_PITCH } from './cameraState';
import {
  consumeJump,
  keyboard,
  mobileInput,
} from './input';
import { playerState, teleportRequest } from './playerState';
import { useGameStore } from './store';
import {
  isWalkable,
  PLAY_RADIUS,
  terrainHeight,
} from './terrain';
import type { ObstacleBox } from './world/layout';
import {
  angleDelta,
  COTTAGE_BOX,
  HEDGE,
  INTERIOR,
  OBSTACLE_CIRCLES,
} from './world/layout';
import { useQuality } from './useQuality';

const PLAYER_RADIUS = 0.36;
const GRAVITY = 20;
const JUMP_SPEED = 6.3;
const WALK_SPEED = 3.9;
const RUN_SPEED = 6.7;

const dampAngle = (current: number, target: number, lambda: number, dt: number) => {
  let difference = target - current;
  difference = ((difference + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return current + difference * (1 - Math.exp(-lambda * dt));
};

const resolveBox = (position: { x: number; z: number }, box: ObstacleBox) => {
  const minX = box.x - box.halfX - PLAYER_RADIUS;
  const maxX = box.x + box.halfX + PLAYER_RADIUS;
  const minZ = box.z - box.halfZ - PLAYER_RADIUS;
  const maxZ = box.z + box.halfZ + PLAYER_RADIUS;
  if (position.x <= minX || position.x >= maxX || position.z <= minZ || position.z >= maxZ) {
    return;
  }
  const left = position.x - minX;
  const right = maxX - position.x;
  const back = position.z - minZ;
  const front = maxZ - position.z;
  const smallest = Math.min(left, right, back, front);
  if (smallest === left) position.x = minX;
  else if (smallest === right) position.x = maxX;
  else if (smallest === back) position.z = minZ;
  else position.z = maxZ;
};

const resolveCircles = (position: { x: number; z: number }) => {
  for (let pass = 0; pass < 2; pass += 1) {
    for (const obstacle of OBSTACLE_CIRCLES) {
      const dx = position.x - obstacle.x;
      const dz = position.z - obstacle.z;
      const minimum = obstacle.r + PLAYER_RADIUS;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq < minimum * minimum) {
        const distance = Math.sqrt(distanceSq) || 0.0001;
        position.x = obstacle.x + (dx / distance) * minimum;
        position.z = obstacle.z + (dz / distance) * minimum;
      }
    }
  }
};

/** Keeps the player on whichever side of the garden hedge they came from. */
const resolveHedge = (
  position: { x: number; z: number },
  previous: { x: number; z: number },
  gateOpen: boolean,
) => {
  const dx = position.x - HEDGE.x;
  const dz = position.z - HEDGE.z;
  const distance = Math.hypot(dx, dz) || 0.0001;
  const band = HEDGE.halfThickness + PLAYER_RADIUS;
  if (Math.abs(distance - HEDGE.radius) >= band) return;
  if (gateOpen) {
    const along = Math.abs(angleDelta(Math.atan2(dz, dx), HEDGE.gateAngle)) * HEDGE.radius;
    if (along < HEDGE.openingHalfWidth - PLAYER_RADIUS) return;
  }
  const wasInside =
    Math.hypot(previous.x - HEDGE.x, previous.z - HEDGE.z) < HEDGE.radius;
  const target = wasInside ? HEDGE.radius - band : HEDGE.radius + band;
  position.x = HEDGE.x + (dx / distance) * target;
  position.z = HEDGE.z + (dz / distance) * target;
};

// Pretty girl character with body shape, short skirt dress look
export const Player = ({ mode }: { mode: 'island' | 'interior' }) => {
  const quality = useQuality();
  const phase = useGameStore((state) => state.phase);
  const character = useGameStore((state) => state.character);
  const gateOpen = useGameStore((state) => state.gateOpen);

  const outfit = OUTFITS.find((item) => item.id === character.outfit);
  // Make Vectoria Secret the default
  const outfitG = outfit ?? OUTFITS.find(o => o.id === 'secret') ?? OUTFITS[0];
  const hair = HAIR_STYLES.find((item) => item.id === character.hair) ?? HAIR_STYLES[0];

  const spawn = useGameStore.getState().spawn;
  const initialY = useMemo(
    () => (mode === 'island' ? terrainHeight(spawn.x, spawn.z) : INTERIOR.floorY + 0.02),
    [mode, spawn.x, spawn.z],
  );
  const position = useRef(new THREE.Vector3(spawn.x, initialY, spawn.z));
  const velocity = useRef(new THREE.Vector2());
  const verticalVelocity = useRef(0);
  const grounded = useRef(true);
  const facing = useRef(mode === 'island' ? Math.PI : Math.PI);
  const walkPhase = useRef(0);
  const landing = useRef(0);
  const stepTimer = useRef(0);
  const idleTime = useRef(0);
  const initialized = useRef(false);

  const model = useRef<THREE.Group>(null);
  const squash = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);

  useLayoutEffect(() => {
    position.current.set(spawn.x, initialY, spawn.z);
    playerState.x = spawn.x;
    playerState.y = initialY;
    playerState.z = spawn.z;
    playerState.yaw = facing.current;
    playerState.speed = 0;
    playerState.grounded = true;
    playerState.scene = mode;
    if (mode === 'interior') {
      cameraState.distance = 4.9;
      cameraState.pitch = 0.74;
      cameraState.yaw = 0;
    } else {
      cameraState.distance = ISLAND_DISTANCE;
      cameraState.pitch = ISLAND_PITCH;
      cameraState.yaw = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useFrame(({ clock }, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    const current = position.current;

    if (phase === 'playing') {
      const state = useGameStore.getState();
      const canMove = !state.modal;

      let inputX = 0;
      let inputY = 0;
      if (canMove) {
        if (keyboard.keys.has('KeyD') || keyboard.keys.has('ArrowRight')) inputX += 1;
        if (keyboard.keys.has('KeyA') || keyboard.keys.has('ArrowLeft')) inputX -= 1;
        if (keyboard.keys.has('KeyW') || keyboard.keys.has('ArrowUp')) inputY += 1;
        if (keyboard.keys.has('KeyS') || keyboard.keys.has('ArrowDown')) inputY -= 1;
        const joystickMagnitude = Math.hypot(mobileInput.x, mobileInput.y);
        if (joystickMagnitude > 0.08) {
          inputX = mobileInput.x;
          inputY = mobileInput.y;
        }
      }

      const inputLength = Math.hypot(inputX, inputY);
      const magnitude = Math.min(1, inputLength);
      const running =
        canMove &&
        (keyboard.keys.has('ShiftLeft') ||
          keyboard.keys.has('ShiftRight') ||
          mobileInput.run);

      let targetX = 0;
      let targetZ = 0;
      if (magnitude > 0.03) {
        const forwardX = -Math.sin(cameraState.yaw);
        const forwardZ = -Math.cos(cameraState.yaw);
        const rightX = Math.cos(cameraState.yaw);
        const rightZ = -Math.sin(cameraState.yaw);
        const directionX = rightX * (inputX / inputLength) + forwardX * (inputY / inputLength);
        const directionZ = rightZ * (inputX / inputLength) + forwardZ * (inputY / inputLength);
        const speed = (running ? RUN_SPEED : WALK_SPEED) * magnitude;
        targetX = directionX * speed;
        targetZ = directionZ * speed;
      }

      const smoothing = 1 - Math.exp(-(magnitude > 0.03 ? 12 : 16) * dt);
      velocity.current.x += (targetX - velocity.current.x) * smoothing;
      velocity.current.y += (targetZ - velocity.current.y) * smoothing;

      if (teleportRequest.pending) {
        current.x = teleportRequest.pending.x;
        current.z = teleportRequest.pending.z;
        current.y =
          mode === 'island'
            ? terrainHeight(current.x, current.z)
            : INTERIOR.floorY + 0.02;
        velocity.current.set(0, 0);
        grounded.current = true;
        verticalVelocity.current = 0;
        teleportRequest.pending = null;
      }

      const next = { x: current.x + velocity.current.x * dt, z: current.z + velocity.current.y * dt };
      const previousX = current.x;
      const previousZ = current.z;

      if (mode === 'island') {
        const distance = Math.hypot(next.x, next.z);
        if (distance > PLAY_RADIUS - 0.6) {
          const clamp = (PLAY_RADIUS - 0.6) / distance;
          next.x *= clamp;
          next.z *= clamp;
        }
        if (!isWalkable(next.x, next.z)) {
          if (isWalkable(next.x, current.z)) next.z = current.z;
          else if (isWalkable(current.x, next.z)) next.x = current.x;
          else {
            next.x = current.x;
            next.z = current.z;
          }
        }
        resolveCircles(next);
        resolveBox(next, COTTAGE_BOX);
        resolveHedge(next, current, gateOpen);
        if (!isWalkable(next.x, next.z)) {
          next.x = previousX;
          next.z = previousZ;
        }
        const distanceAfter = Math.hypot(next.x, next.z);
        if (distanceAfter > PLAY_RADIUS - 0.45) {
          const clamp = (PLAY_RADIUS - 0.45) / distanceAfter;
          next.x *= clamp;
          next.z *= clamp;
        }
      } else {
        next.x = THREE.MathUtils.clamp(
          next.x,
          -INTERIOR.bounds.halfX + PLAYER_RADIUS,
          INTERIOR.bounds.halfX - PLAYER_RADIUS,
        );
        next.z = THREE.MathUtils.clamp(
          next.z,
          -INTERIOR.bounds.halfZ + PLAYER_RADIUS,
          INTERIOR.bounds.halfZ - PLAYER_RADIUS,
        );
        for (const box of INTERIOR.boxes) resolveBox(next, box);
      }

      current.x = next.x;
      current.z = next.z;

      const groundHeight =
        mode === 'island'
          ? terrainHeight(current.x, current.z)
          : INTERIOR.floorY + 0.02;

      if (grounded.current) {
        current.y = groundHeight;
        if (consumeJump() && canMove) {
          verticalVelocity.current = JUMP_SPEED;
          grounded.current = false;
          landing.current = 0;
          audio.play('jump');
        }
      }

      if (!grounded.current) {
        verticalVelocity.current -= GRAVITY * dt;
        current.y += verticalVelocity.current * dt;
        if (current.y <= groundHeight && verticalVelocity.current <= 0) {
          const impact = -verticalVelocity.current;
          current.y = groundHeight;
          verticalVelocity.current = 0;
          grounded.current = true;
          landing.current = Math.min(1, impact / 9);
          if (impact > 2.2) audio.play('land');
        }
      } else {
        current.y = groundHeight;
      }

      const horizontalSpeed = Math.hypot(velocity.current.x, velocity.current.y);
      playerState.x = current.x;
      playerState.y = current.y;
      playerState.z = current.z;
      playerState.speed = horizontalSpeed;
      playerState.grounded = grounded.current;

      if (horizontalSpeed > 0.25) {
        facing.current = dampAngle(
          facing.current,
          Math.atan2(velocity.current.x, velocity.current.y),
          13,
          dt,
        );
        playerState.yaw = facing.current;
        walkPhase.current += dt * (4.4 + horizontalSpeed * 1.65);
        stepTimer.current -= dt * (0.6 + horizontalSpeed * 0.22);
        if (stepTimer.current <= 0 && grounded.current) {
          audio.play('footstep');
          stepTimer.current = 0.42;
        }
      } else {
        stepTimer.current = Math.min(stepTimer.current, 0.1);
      }

      if (model.current) {
        model.current.position.set(current.x, current.y, current.z);
        model.current.rotation.y = facing.current;
      }
      if (shadow.current) {
        const shadowGround =
          mode === 'island' ? terrainHeight(current.x, current.z) : INTERIOR.floorY + 0.025;
        shadow.current.position.set(current.x, shadowGround + 0.025, current.z);
        const heightAboveGround = Math.max(0, current.y - shadowGround);
        const scale = Math.max(0.55, 1 - heightAboveGround * 0.18);
        shadow.current.scale.setScalar(scale);
        (shadow.current.material as THREE.MeshBasicMaterial).opacity =
          0.16 * Math.max(0.35, 1 - heightAboveGround * 0.22);
      }

      landing.current = Math.max(0, landing.current - dt * 4.5);
      const time = clock.elapsedTime;
      const moving = horizontalSpeed > 0.2;

      if (squash.current) {
        const squashY = 1 - landing.current * 0.16;
        const squashXZ = 1 + landing.current * 0.1;
        squash.current.scale.x += (squashXZ - squash.current.scale.x) * 0.35;
        squash.current.scale.y += (squashY - squash.current.scale.y) * 0.35;
        squash.current.scale.z += (squashXZ - squash.current.scale.z) * 0.35;
      }

      if (grounded.current) {
        const swing = moving ? Math.min(1, horizontalSpeed / 4.2) : 0;
        if (leftLeg.current) {
          leftLeg.current.rotation.x = Math.sin(walkPhase.current) * 0.62 * swing;
          leftLeg.current.rotation.z = 0;
        }
        if (rightLeg.current) {
          rightLeg.current.rotation.x = -Math.sin(walkPhase.current) * 0.62 * swing;
          rightLeg.current.rotation.z = 0;
        }
        if (leftArm.current) {
          leftArm.current.rotation.x = -Math.sin(walkPhase.current) * 0.5 * swing;
          leftArm.current.rotation.z = 0.12 + (moving ? 0 : Math.sin(time * 1.5) * 0.02);
        }
        if (rightArm.current) {
          rightArm.current.rotation.x = Math.sin(walkPhase.current) * 0.5 * swing;
          rightArm.current.rotation.z = -0.12 - (moving ? 0 : Math.sin(time * 1.5) * 0.02);
        }
        if (head.current) {
          head.current.rotation.z =
            Math.sin(time * 0.9) * 0.025 + (moving ? Math.sin(walkPhase.current) * 0.02 : 0);
          head.current.rotation.x = moving ? Math.sin(walkPhase.current * 2) * 0.015 : 0;
        }
        if (squash.current) {
          squash.current.position.y = moving
            ? Math.abs(Math.sin(walkPhase.current)) * 0.035
            : Math.sin(time * 1.7) * 0.012;
        }
      } else {
        if (leftLeg.current) leftLeg.current.rotation.x = 0.35;
        if (rightLeg.current) rightLeg.current.rotation.x = -0.22;
        if (leftArm.current) {
          leftArm.current.rotation.x = -0.5;
          leftArm.current.rotation.z = 0.75;
        }
        if (rightArm.current) {
          rightArm.current.rotation.x = -0.5;
          rightArm.current.rotation.z = -0.75;
        }
        if (head.current) head.current.rotation.z = 0;
      }

      idleTime.current += dt;
      initialized.current = true;
    } else if (!initialized.current) {
      if (model.current) {
        model.current.position.set(current.x, current.y, current.z);
        model.current.rotation.y = facing.current;
      }
      initialized.current = true;
    }
  });

  const bodyColor = '#ffe0c9';
  const hairColor = hair.color;
  const skirtColor = outfitG.color ?? '#e8b0c8';
  const trimColor = outfitG.trim ?? '#ffd1dc';

  return (
    <>
      <group ref={model} position={[spawn.x, initialY, spawn.z]}>
        <group ref={squash}>
          {/* Legs */}
          <group ref={leftLeg} position={[-0.21, 0.6, 0]}>
            <mesh position={[0, -0.24, 0]} castShadow={quality.shadows}>
              <capsuleGeometry args={[0.105, 0.3, 4, 7]} />
              <meshLambertMaterial color={bodyColor} />
            </mesh>
            <mesh position={[0, -0.48, 0.055]} scale={[1, 0.72, 1.35]} castShadow={quality.shadows}>
              <sphereGeometry args={[0.145, 8, 6]} />
              <meshLambertMaterial color="#8f6475" />
            </mesh>
          </group>
          <group ref={rightLeg} position={[0.21, 0.6, 0]}>
            <mesh position={[0, -0.24, 0]} castShadow={quality.shadows}>
              <capsuleGeometry args={[0.105, 0.3, 4, 7]} />
              <meshLambertMaterial color={bodyColor} />
            </mesh>
            <mesh position={[0, -0.48, 0.055]} scale={[1, 0.72, 1.35]} castShadow={quality.shadows}>
              <sphereGeometry args={[0.145, 8, 6]} />
              <meshLambertMaterial color="#8f6475" />
            </mesh>
          </group>

          {/* Short dress / Vectoria Secret style */}
          <mesh position={[0, 1.0, 0]} rotation-x={-0.1} castShadow={quality.shadows}>
            <sphereGeometry args={[0.38, 12, 10]} />
            <meshLambertMaterial color={skirtColor} emissive={trimColor} emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0, 0.85, 0]} rotation-x={0.05}>
            <sphereGeometry args={[0.42, 14, 10]} />
            <meshLambertMaterial color={trimColor} emissive={skirtColor} emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, 1.12, 0]} rotation-y={0} castShadow={quality.shadows}>
            <sphereGeometry args={[0.34, 12, 10]} />
            <meshLambertMaterial color={skirtColor} emissive={trimColor} emissiveIntensity={0.15} />
          </mesh>
          {/* Belt / waist accent */}
          <mesh position={[0, 0.95, 0]} rotation-z={Math.PI / 2}>
            <torusGeometry args={[0.34, 0.045, 6, 20]} />
            <meshLambertMaterial color={trimColor} emissive={skirtColor} emissiveIntensity={0.3} />
          </mesh>
          {/* Skirt frill */}
          <mesh position={[0, 0.78, 0]} rotation-z={-0.1}>
            <sphereGeometry args={[0.44, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshLambertMaterial color={trimColor} emissive={skirtColor} emissiveIntensity={0.2} />
          </mesh>
          {/* Chest accent */}
          <mesh position={[0, 1.15, 0.18]} scale={[0.5, 0.4, 0.1]}>
            <sphereGeometry args={[0.32, 10, 8]} />
            <meshLambertMaterial color={trimColor} emissive={skirtColor} emissiveIntensity={0.2} />
          </mesh>
          {/* Shoulders */}
          <mesh position={[-0.34, 1.18, 0]} rotation-z={0.15}>
            <sphereGeometry args={[0.13, 8, 6]} />
            <meshLambertMaterial color={bodyColor} />
          </mesh>
          <mesh position={[0.34, 1.18, 0]} rotation-z={-0.15}>
            <sphereGeometry args={[0.13, 8, 6]} />
            <meshLambertMaterial color={bodyColor} />
          </mesh>

          {/* Arms */}
          <group ref={leftArm} position={[-0.38, 1.18, 0]} rotation-z={0.12}>
            <mesh position={[0, -0.23, 0]} castShadow={quality.shadows}>
              <capsuleGeometry args={[0.085, 0.3, 4, 7]} />
              <meshLambertMaterial color={bodyColor} />
            </mesh>
            <mesh position={[0, -0.02, 0]}>
              <sphereGeometry args={[0.13, 7, 6]} />
              <meshLambertMaterial color={skirtColor} />
            </mesh>
            <mesh position={[0, -0.42, 0]}>
              <sphereGeometry args={[0.095, 7, 5]} />
              <meshLambertMaterial color={bodyColor} />
            </mesh>
          </group>
          <group ref={rightArm} position={[0.38, 1.18, 0]} rotation-z={-0.12}>
            <mesh position={[0, -0.23, 0]} castShadow={quality.shadows}>
              <capsuleGeometry args={[0.085, 0.3, 4, 7]} />
              <meshLambertMaterial color={bodyColor} />
            </mesh>
            <mesh position={[0, -0.02, 0]}>
              <sphereGeometry args={[0.13, 7, 6]} />
              <meshLambertMaterial color={skirtColor} />
            </mesh>
            <mesh position={[0, -0.42, 0]}>
              <sphereGeometry args={[0.095, 7, 5]} />
              <meshLambertMaterial color={bodyColor} />
            </mesh>
          </group>

          {/* Head and face */}
          <group ref={head} position={[0, 1.62, 0]}>
            <mesh castShadow={quality.shadows}>
              <sphereGeometry args={[0.41, 14, 12]} />
              <meshLambertMaterial color="#ffe0bc" />
            </mesh>
            {/* Hair back portion */}
            <mesh position={[0, 0.05, -0.05]} scale={[1.06, 1.02, 1.02]}>
              <sphereGeometry args={[0.43, 14, 11, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
              <meshLambertMaterial color={hairColor} />
            </mesh>
            {/* Hair side strands */}
            <mesh position={[0, -0.1, -0.17]} scale={[1.02, 1.04, 0.72]}>
              <sphereGeometry args={[0.37, 10, 8]} />
              <meshLambertMaterial color={hairColor} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * 0.36, 0.29, -0.04]}>
                <sphereGeometry args={[0.17, 8, 7]} />
                <meshLambertMaterial color={hairColor} />
              </mesh>
            ))}
            {/* Hair flowing down back */}
            <mesh position={[0, -0.26, -0.26]} scale={[0.78, 1.04, 0.5]}>
              <sphereGeometry args={[0.37, 10, 8]} />
              <meshLambertMaterial color={hairColor} />
            </mesh>
            <mesh position={[0, -0.58, -0.31]} scale={[0.72, 0.86, 0.42]}>
              <sphereGeometry args={[0.24, 8, 6]} />
              <meshLambertMaterial color={hairColor} />
            </mesh>
            {/* Tiny ribbon at back */}
            <group position={[0, -0.02, -0.355]} rotation-x={0.18}>
              {[-1, 1].map((side) => (
                <mesh
                  key={side}
                  position={[side * 0.11, 0.015, 0]}
                  rotation-z={side * 0.28}
                  scale={[1.35, 0.7, 0.45]}
                >
                  <sphereGeometry args={[0.085, 6, 5]} />
                  <meshLambertMaterial color={trimColor} />
                </mesh>
              ))}
              <mesh scale={[0.55, 0.75, 0.5]}>
                <sphereGeometry args={[0.075, 6, 5]} />
                <meshLambertMaterial color={trimColor} />
              </mesh>
            </group>
            {/* Bangs */}
            {[-0.22, 0, 0.22].map((x, index) => (
              <mesh
                key={x}
                position={[x, 0.26 - (index === 1 ? 0.03 : 0), 0.28]}
                scale={[1, 0.8, 0.55]}
              >
                <sphereGeometry args={[0.15, 7, 5]} />
                <meshLambertMaterial color={hairColor} />
              </mesh>
            ))}
            {[-1, 1].map((side) => (
              <group key={side}>
                <mesh position={[side * 0.145, 0.015, 0.365]}>
                  <sphereGeometry args={[0.055, 7, 6]} />
                  <meshStandardMaterial color="#493c43" roughness={0.4} />
                </mesh>
                <mesh position={[side * 0.13, 0.04, 0.407]}>
                  <sphereGeometry args={[0.017, 5, 4]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh position={[side * 0.25, -0.09, 0.35]} scale={[1, 0.6, 0.35]}>
                  <sphereGeometry args={[0.075, 6, 4]} />
                  <meshBasicMaterial color="#ffb3c0" transparent opacity={0.55} />
                </mesh>
              </group>
            ))}
            <mesh position={[0, -0.105, 0.39]} rotation-z={Math.PI}>
              <torusGeometry args={[0.052, 0.012, 4, 8, Math.PI]} />
              <meshBasicMaterial color="#a96678" />
            </mesh>
            {/* Flower clip on side */}
            <group position={[0.31, 0.26, 0.23]} rotation-z={0.3}>
              {Array.from({ length: 5 }).map((_, index) => {
                const angle = (index / 5) * Math.PI * 2;
                return (
                  <mesh
                    key={index}
                    position={[Math.cos(angle) * 0.06, Math.sin(angle) * 0.06, 0]}
                    scale={[1, 1, 0.45]}
                  >
                    <sphereGeometry args={[0.055, 5, 4]} />
                    <meshBasicMaterial color={trimColor} />
                  </mesh>
                );
              })}
            </group>
          </group>
        </group>
      </group>
      <mesh ref={shadow} rotation-x={-Math.PI / 2} position={[spawn.x, initialY + 0.025, spawn.z]}>
        <circleGeometry args={[0.52, 20]} />
        <meshBasicMaterial color="#5c4a50" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </>
  );
};