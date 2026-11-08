const ISLAND_DISTANCE = 7;
const ISLAND_PITCH = 0.32;

export const cameraState = {
  yaw: 0,
  pitch: ISLAND_PITCH,
  distance: ISLAND_DISTANCE,
  recenterRequested: false,
};

export const requestCameraRecenter = () => {
  cameraState.recenterRequested = true;
};

export const setDefaultCamera = () => {
  cameraState.yaw = 0;
  cameraState.pitch = ISLAND_PITCH;
  cameraState.distance = ISLAND_DISTANCE;
};

export { ISLAND_DISTANCE, ISLAND_PITCH };
