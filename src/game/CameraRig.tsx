import { useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import {
  cameraState,
  ISLAND_DISTANCE,
  ISLAND_PITCH,
  requestCameraRecenter,
} from './cameraState';
import { playerState } from './playerState';
import { useGameStore } from './store';
import { terrainHeight } from './terrain';
import { CAMERA_BLOCKERS, INTERIOR } from './world/layout';

const clamp = THREE.MathUtils.clamp;

export const CameraRig = ({ mode }: { mode: 'island' | 'interior' }) => {
  const { camera, gl } = useThree();
  const sensitivity = useGameStore((state) => state.settings.sensitivity);
  const lookAt = useRef(new THREE.Vector3(0, 2, 0));
  const desired = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const snapped = useRef(false);

  useLayoutEffect(() => {
    if (mode === 'interior') {
      cameraState.distance = Math.min(4.4, cameraState.distance);
      cameraState.pitch = clamp(cameraState.pitch, 0.08, 0.9);
    } else {
      cameraState.distance = ISLAND_DISTANCE;
      cameraState.pitch = ISLAND_PITCH;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.touchAction = 'none';

    const onPointerDown = (event: PointerEvent) => {
      const state = useGameStore.getState();
      if (state.phase !== 'playing' || state.modal) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Safari can refuse capture on some touches; drag still works.
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const active = pointer.current;
      if (!active || active.id !== event.pointerId) return;
      const state = useGameStore.getState();
      if (state.phase !== 'playing') return;
      const dx = event.clientX - active.x;
      const dy = event.clientY - active.y;
      active.x = event.clientX;
      active.y = event.clientY;
      cameraState.yaw -= dx * 0.0048 * sensitivity;
      cameraState.pitch = clamp(
        cameraState.pitch - dy * 0.0038 * sensitivity,
        mode === 'interior' ? 0.04 : -0.08,
        1.18,
      );
    };

    const endPointer = (event: PointerEvent) => {
      if (pointer.current?.id === event.pointerId) pointer.current = null;
    };

    const onWheel = (event: WheelEvent) => {
      const state = useGameStore.getState();
      if (state.phase !== 'playing' || state.modal) return;
      event.preventDefault();
      const min = mode === 'interior' ? 2.6 : 5;
      const max = mode === 'interior' ? 5.2 : 12.5;
      cameraState.distance = clamp(
        cameraState.distance + event.deltaY * 0.004,
        min,
        max,
      );
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('lostpointercapture', endPointer);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', endPointer);
      canvas.removeEventListener('pointercancel', endPointer);
      canvas.removeEventListener('lostpointercapture', endPointer);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [gl, mode, sensitivity]);

  useFrame(({ clock }, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    const phase = useGameStore.getState().phase;

    if (phase === 'title') {
      const time = clock.elapsedTime;
      const angle = time * 0.055;
      target.current.set(0, 3, 0);
      desired.current.set(
        Math.sin(angle) * 58,
        23 + Math.sin(time * 0.17) * 2,
        Math.cos(angle) * 58,
      );
      const factor = 1 - Math.exp(-2.5 * dt);
      camera.position.lerp(desired.current, factor);
      lookAt.current.lerp(target.current, factor);
      camera.lookAt(lookAt.current);
      // Keep snapping off during the title so PLAY glides into position.
      snapped.current = true;
      return;
    }

    target.current.set(playerState.x, playerState.y + 1.35, playerState.z);

    if (cameraState.recenterRequested) {
      cameraState.recenterRequested = false;
      cameraState.yaw = playerState.yaw + Math.PI;
      cameraState.pitch = mode === 'interior' ? 0.32 : ISLAND_PITCH;
      cameraState.distance = mode === 'interior' ? 4.2 : ISLAND_DISTANCE;
    }

    const minDistance = mode === 'interior' ? 2.6 : 5;
    const maxDistance = mode === 'interior' ? 5.2 : 12.5;
    cameraState.distance = clamp(cameraState.distance, minDistance, maxDistance);
    if (mode === 'interior') {
      cameraState.pitch = clamp(cameraState.pitch, 0.04, 1.0);
    }

    const horizontal = Math.cos(cameraState.pitch) * cameraState.distance;
    desired.current.set(
      target.current.x + Math.sin(cameraState.yaw) * horizontal,
      target.current.y + Math.sin(cameraState.pitch) * cameraState.distance,
      target.current.z + Math.cos(cameraState.yaw) * horizontal,
    );

    if (mode === 'island') {
      // Pull the camera in if a building would sit between it and Aya.
      let allowed = 1;
      for (let step = 1; step <= 7; step += 1) {
        const t = step / 7;
        const px = target.current.x + (desired.current.x - target.current.x) * t;
        const py = target.current.y + (desired.current.y - target.current.y) * t;
        const pz = target.current.z + (desired.current.z - target.current.z) * t;
        const blocked = CAMERA_BLOCKERS.some(
          (blocker) =>
            px > blocker.x - blocker.halfX - 0.35 &&
            px < blocker.x + blocker.halfX + 0.35 &&
            pz > blocker.z - blocker.halfZ - 0.35 &&
            pz < blocker.z + blocker.halfZ + 0.35 &&
            py > blocker.base - 0.2 &&
            py < blocker.base + blocker.height,
        );
        if (blocked) {
          allowed = Math.max(0.25, (step - 1) / 7);
          break;
        }
      }
      if (allowed < 1) {
        desired.current.lerpVectors(target.current, desired.current, allowed);
      }
    }

    if (!snapped.current) {
      camera.position.copy(desired.current);
      lookAt.current.copy(target.current);
      snapped.current = true;
    } else {
      const smoothing = 1 - Math.exp(-(mode === 'interior' ? 10 : 7.5) * dt);
      camera.position.lerp(desired.current, smoothing);
      lookAt.current.lerp(target.current, 1 - Math.exp(-11 * dt));
    }

    if (mode === 'island') {
      const ground = terrainHeight(camera.position.x, camera.position.z);
      camera.position.y = Math.max(camera.position.y, ground + 0.8, 1.1);
    } else {
      camera.position.x = clamp(
        camera.position.x,
        -INTERIOR.bounds.halfX - 0.08,
        INTERIOR.bounds.halfX + 0.08,
      );
      camera.position.z = clamp(
        camera.position.z,
        -INTERIOR.bounds.halfZ + 0.02,
        INTERIOR.bounds.halfZ + 0.02,
      );
      camera.position.y = clamp(camera.position.y, 0.65, 3.05);
    }

    camera.lookAt(lookAt.current);
  });

  useEffect(() => {
    // Recenter once on scene entry so the character is always visible.
    const timer = setTimeout(() => requestCameraRecenter(), 60);
    return () => clearTimeout(timer);
  }, [mode]);

  return null;
};
