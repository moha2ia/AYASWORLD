import { mulberry32, terrainHeight } from '../terrain';

export const LAYOUT = {
  spawn: { x: 0, z: 16.8 },
  meadowSign: { x: 2.8, z: 12.6 },
  meadowArch: { x: -6.2, z: 11.6 },
  cottage: { x: -17, z: 2, doorZ: 5.6, interactZ: 7.2 },
  cottageMailbox: { x: -11.9, z: 8.1 },
  flowerGarden: { x: 15, z: 5, fountain: { x: 15, z: 3.2 } },
  pond: { x: 25, z: -5 },
  secretGarden: { x: -30, z: 20, gate: { x: -25.5, z: 15.1 } },
  secretNote: { x: -29.4, z: 18.3 },
  shrine: { x: 8, z: -26, interact: { x: 8, z: -21.8 } },
  wishingTree: { x: -32.6, z: 22.6 },
  messageStone: { x: -2.1, z: 26.5 },
  willow: { x: -8.5, z: 28.5 },
  moonstone: { x: 30.5, z: -12.3 },
} as const;

/** The hedge that encloses the secret garden; the gate sits on the ring. */
const gateDx = LAYOUT.secretGarden.gate.x - LAYOUT.secretGarden.x;
const gateDz = LAYOUT.secretGarden.gate.z - LAYOUT.secretGarden.z;
export const HEDGE = {
  x: LAYOUT.secretGarden.x,
  z: LAYOUT.secretGarden.z,
  radius: Math.hypot(gateDx, gateDz),
  halfThickness: 0.45,
  gateAngle: Math.atan2(gateDz, gateDx),
  gateHalfWidth: 1.9,
  openingHalfWidth: 1.55,
} as const;

/** Signed smallest difference between two angles, in radians. */
export const angleDelta = (a: number, b: number) =>
  Math.atan2(Math.sin(a - b), Math.cos(a - b));

export type PathPoint = readonly [number, number];

/** Winding stone paths. Every landmark is connected to the meadow. */
export const PATHS: PathPoint[][] = [
  [
    [0, 14.5],
    [-3, 11],
    [-7, 9],
    [-11, 8],
    [-15, 8],
    [-17, 8],
  ],
  [
    [1.5, 14],
    [5, 11],
    [9, 8],
    [12, 7],
    [15, 8.5],
  ],
  [
    [0, 19],
    [0, 24],
    [1, 29],
    [0, 34],
    [0, 38],
  ],
  [
    [1, 13],
    [3, 8],
    [4, 1],
    [5, -6],
    [7, -13],
    [8, -19],
  ],
  [
    [-1, 15],
    [-7, 16],
    [-13, 16],
    [-19, 16],
    [-23, 15.5],
    [-25.5, 15.1],
    [-27.5, 17],
    [-29, 19],
  ],
  [
    [16, 8],
    [19, 5.5],
    [21, 2],
    [22.5, -1],
    [22.5, -3],
  ],
];

export const distanceToPath = (x: number, z: number): number => {
  let best = Infinity;
  for (const path of PATHS) {
    for (let i = 0; i < path.length - 1; i += 1) {
      const [ax, az] = path[i];
      const [bx, bz] = path[i + 1];
      const vx = bx - ax;
      const vz = bz - az;
      const lengthSq = vx * vx + vz * vz || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / lengthSq));
      best = Math.min(best, Math.hypot(x - (ax + vx * t), z - (az + vz * t)));
    }
  }
  return best;
};

interface Exclusion {
  x: number;
  z: number;
  r: number;
}

export const EXCLUSIONS: Exclusion[] = [
  { x: LAYOUT.spawn.x, z: LAYOUT.spawn.z, r: 4 },
  { x: LAYOUT.meadowSign.x, z: LAYOUT.meadowSign.z, r: 2.4 },
  { x: LAYOUT.meadowArch.x, z: LAYOUT.meadowArch.z, r: 3 },
  { x: LAYOUT.cottage.x, z: LAYOUT.cottage.z, r: 8.5 },
  { x: LAYOUT.flowerGarden.x, z: LAYOUT.flowerGarden.z, r: 7.2 },
  { x: LAYOUT.pond.x, z: LAYOUT.pond.z, r: 5.2 },
  { x: LAYOUT.secretGarden.x, z: LAYOUT.secretGarden.z, r: 5.5 },
  { x: LAYOUT.shrine.x, z: LAYOUT.shrine.z, r: 7 },
  { x: LAYOUT.cottageMailbox.x, z: LAYOUT.cottageMailbox.z, r: 1.8 },
];

const blockedForNature = (x: number, z: number, pathClearance = 2.1) => {
  if (terrainHeight(x, z) < 0.9) return true;
  if (z > 31) return true;
  for (const area of EXCLUSIONS) {
    if (Math.hypot(x - area.x, z - area.z) < area.r) return true;
  }
  return distanceToPath(x, z) < pathClearance;
};

export interface TreeData {
  x: number;
  z: number;
  y: number;
  scale: number;
  rotation: number;
  variant: number;
  kind: 'round' | 'palm';
}

const makeTrees = (): TreeData[] => {
  const random = mulberry32(20261019);
  const trees: TreeData[] = [];
  const push = (x: number, z: number, scale: number, variant: number, kind: TreeData['kind'] = 'round') => {
    trees.push({
      x,
      z,
      y: terrainHeight(x, z),
      scale,
      rotation: random() * Math.PI * 2,
      variant,
      kind,
    });
  };

  // Dense, soft forest ring around the island edge.
  let attempts = 0;
  while (trees.length < 42 && attempts < 500) {
    attempts += 1;
    const angle = random() * Math.PI * 2;
    const radius = 28 + random() * 16;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (blockedForNature(x, z, 2.4)) continue;
    if (trees.some((tree) => Math.hypot(tree.x - x, tree.z - z) < 2.3)) continue;
    push(x, z, 0.9 + random() * 0.5, Math.floor(random() * 3));
  }

  // A wall of trees that hides the secret garden, with one clear opening.
  const secret = LAYOUT.secretGarden;
  for (let i = 0; i < 11; i += 1) {
    const angle = (i / 11) * Math.PI * 2;
    const degrees = (angle * 180) / Math.PI;
    if (degrees > 285 && degrees < 335) continue; // gate opening
    const radius = 8.2 + random() * 1.4;
    const x = secret.x + Math.cos(angle) * radius;
    const z = secret.z + Math.sin(angle) * radius;
    if (Math.hypot(x - LAYOUT.cottage.x, z - LAYOUT.cottage.z) < 8) continue;
    push(x, z, 1.15 + random() * 0.35, Math.floor(random() * 3));
  }

  // A few friendly standalone trees near the paths.
  push(-8, 22, 1.05, 1);
  push(7, -2, 1.1, 0);
  push(19, -14, 1.2, 2);
  push(-12, -8, 1, 1);
  push(-23, -4, 1.15, 0);

  // Palm trees along the beach.
  const palms: Array<[number, number, number]> = [
    [6.5, 40.5, 1.15],
    [-6, 42.5, 1.05],
    [14.5, 41.5, 1],
    [-1, 38.8, 0.9],
    [-18, 40.5, 1.05],
  ];
  for (const [x, z, scale] of palms) push(x, z, scale, 0, 'palm');

  return trees;
};

export const TREES = makeTrees();

export interface RockData {
  x: number;
  z: number;
  y: number;
  scale: number;
  rotation: number;
  tint: number;
}

const makeRocks = (): RockData[] => {
  const random = mulberry32(777);
  const spots: Array<[number, number, number]> = [
    [-14, 38, 1.35],
    [16.5, 35.6, 1.05],
    [-20, 36.2, 0.9],
    [23.5, -8.5, 1.05],
    [27.2, -6.8, 0.75],
    [21.6, -3.2, 0.7],
    [13, -29, 1.15],
    [3, -25, 0.8],
    [-33, 24, 1.1],
    [-25.8, 21.5, 0.8],
    [-22, 10, 0.75],
    [9, 2, 0.65],
    [-6, 2, 0.8],
    [20, 14, 0.7],
    [32, -13, 1.5],
    [-31, -8, 1.3],
  ];
  return spots.map(([x, z, scale]) => ({
    x,
    z,
    y: terrainHeight(x, z),
    scale,
    rotation: random() * Math.PI * 2,
    tint: Math.floor(random() * 3),
  }));
};

export const ROCKS = makeRocks();

export interface FlowerData {
  x: number;
  y: number;
  z: number;
  scale: number;
  color: number;
  rotation: number;
}

const FLOWER_PATCHES: Array<{ x: number; z: number; r: number; count: number }> = [
  { x: 0, z: 18, r: 8, count: 112 },
  { x: -17, z: 2, r: 7.5, count: 78 },
  { x: 15, z: 5, r: 6.5, count: 88 },
  { x: -30, z: 20, r: 5.5, count: 58 },
  { x: 8, z: -26, r: 6.5, count: 48 },
  { x: 25, z: -5, r: 5.5, count: 34 },
  { x: 2, z: 4, r: 8, count: 42 },
  { x: 20, z: -14, r: 5, count: 28 },
];

const makeFlowers = (): FlowerData[] => {
  const random = mulberry32(424242);
  const flowers: FlowerData[] = [];
  FLOWER_PATCHES.forEach((patch, patchIndex) => {
    let placed = 0;
    let attempts = 0;
    while (placed < patch.count && attempts < patch.count * 12) {
      attempts += 1;
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random()) * patch.r;
      const x = patch.x + Math.cos(angle) * radius;
      const z = patch.z + Math.sin(angle) * radius;
      if (terrainHeight(x, z) < 0.85) continue;
      if (Math.hypot(x - LAYOUT.pond.x, z - LAYOUT.pond.z) < 3) continue;
      if (
        x > LAYOUT.cottage.x - 4.6 &&
        x < LAYOUT.cottage.x + 4.6 &&
        z > LAYOUT.cottage.z - 3.4 &&
        z < LAYOUT.cottage.z + 3.4
      ) {
        continue;
      }
      if (distanceToPath(x, z) < 0.9) continue;
      flowers.push({
        x,
        z,
        y: terrainHeight(x, z),
        scale: 0.7 + random() * 0.7,
        color: Math.floor(random() * 6),
        rotation: random() * Math.PI * 2,
      });
      placed += 1;
    }
    void patchIndex;
  });
  return flowers;
};

export const FLOWERS = makeFlowers();

export interface GrassData {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: number;
}

const makeGrass = (): GrassData[] => {
  const random = mulberry32(98765);
  const grass: GrassData[] = [];
  let attempts = 0;
  while (grass.length < 980 && attempts < 3200) {
    attempts += 1;
    const angle = random() * Math.PI * 2;
    const radius = 5 + random() * 37;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (blockedForNature(x, z, 1.4)) continue;
    grass.push({
      x,
      z,
      y: terrainHeight(x, z),
      scale: 0.6 + random() * 0.55,
      rotation: random() * Math.PI * 2,
    });
  }
  return grass;
};

export const GRASS = makeGrass();

export interface ShellData {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: number;
  color: number;
}

const makeShells = (): ShellData[] => {
  const random = mulberry32(8181);
  const shells: ShellData[] = [];
  let attempts = 0;
  while (shells.length < 34 && attempts < 400) {
    attempts += 1;
    const x = -22 + random() * 44;
    const z = 33 + random() * 9;
    if (terrainHeight(x, z) < 0.5) continue;
    shells.push({
      x,
      z,
      y: terrainHeight(x, z),
      scale: 0.12 + random() * 0.12,
      rotation: random() * Math.PI * 2,
      color: Math.floor(random() * 4),
    });
  }
  return shells;
};

export const SHELLS = makeShells();

export interface BushData {
  x: number;
  z: number;
  y: number;
  scale: number;
  rotation: number;
  tint: number;
}

const makeBushes = (): BushData[] => {
  const random = mulberry32(6161);
  const bushes: BushData[] = [];
  let attempts = 0;
  while (bushes.length < 44 && attempts < 500) {
    attempts += 1;
    const angle = random() * Math.PI * 2;
    const radius = 11 + random() * 29;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (blockedForNature(x, z, 2.4)) continue;
    if (bushes.some((bush) => Math.hypot(bush.x - x, bush.z - z) < 3.2)) continue;
    bushes.push({
      x,
      z,
      y: terrainHeight(x, z),
      scale: 0.45 + random() * 0.55,
      rotation: random() * Math.PI * 2,
      tint: Math.floor(random() * 4),
    });
  }
  return bushes;
};

export const BUSHES = makeBushes();

export interface ButterflyData {
  x: number;
  z: number;
  y: number;
  scale: number;
  rotation: number;
  phase: number;
  kind: 'butterfly' | 'firefly';
}

const makeButterflies = (): ButterflyData[] => {
  const random = mulberry32(328238);
  const butterflies: ButterflyData[] = [];
  let attempts = 0;
  while (butterflies.length < 30 && attempts < 600) {
    attempts += 1;
    const angle = random() * Math.PI * 2;
    const radius = 8 + random() * 24;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (blockedForNature(x, z, 2.5)) continue;
    if (butterflies.some((b) => Math.hypot(b.x - x, b.z - z) < 1.5)) continue;
    butterflies.push({
      x,
      z,
      y: terrainHeight(x, z),
      scale: 0.3 + random() * 0.4,
      rotation: random() * Math.PI * 2,
      phase: random() * Math.PI * 2,
      kind: random() > 0.8 ? 'firefly' : 'butterfly',
    });
  }
  return butterflies;
};

export const BUTTERFLIES = makeButterflies();

export interface ObstacleCircle {
  x: number;
  z: number;
  r: number;
}

export interface ObstacleBox {
  x: number;
  z: number;
  halfX: number;
  halfZ: number;
}

/** Circular colliders (trees, rocks, fountain, shrine...). */
export const OBSTACLE_CIRCLES: ObstacleCircle[] = [
  ...TREES.filter((tree) => tree.kind === 'round').map((tree) => ({
    x: tree.x,
    z: tree.z,
    r: 0.5 * tree.scale,
  })),
  ...TREES.filter((tree) => tree.kind === 'palm').map((tree) => ({
    x: tree.x,
    z: tree.z,
    r: 0.55,
  })),
  ...ROCKS.filter((rock) => rock.scale > 0.85).map((rock) => ({
    x: rock.x,
    z: rock.z,
    r: 0.9 * rock.scale,
  })),
  { x: LAYOUT.flowerGarden.fountain.x, z: LAYOUT.flowerGarden.fountain.z, r: 2.1 },
  { x: LAYOUT.pond.x, z: LAYOUT.pond.z, r: 2.85 },
  { x: LAYOUT.shrine.x, z: LAYOUT.shrine.z, r: 2.4 },
  { x: 19.6, z: 2.2, r: 0.9 }, // garden bench
  { x: -6.3, z: 38.8, r: 0.8 }, // driftwood log
  { x: -11.5, z: 41.2, r: 1.8 }, // beached rowboat
  { x: LAYOUT.meadowArch.x - 1.8, z: LAYOUT.meadowArch.z, r: 0.3 },
  { x: LAYOUT.meadowArch.x + 1.8, z: LAYOUT.meadowArch.z, r: 0.3 },
  { x: LAYOUT.wishingTree.x, z: LAYOUT.wishingTree.z, r: 0.55 },
  { x: LAYOUT.willow.x, z: LAYOUT.willow.z, r: 0.5 },
  { x: LAYOUT.messageStone.x, z: LAYOUT.messageStone.z, r: 0.4 },
  { x: LAYOUT.moonstone.x, z: LAYOUT.moonstone.z, r: 0.35 },
];

/** Solid building boxes. */
export const COTTAGE_BOX: ObstacleBox = {
  x: LAYOUT.cottage.x,
  z: LAYOUT.cottage.z,
  halfX: 4.5,
  halfZ: 3.4,
};

export interface InteriorLayout {
  floorY: number;
  bounds: { halfX: number; halfZ: number };
  spawn: { x: number; z: number };
  exit: { x: number; z: number };
  key: { x: number; z: number };
  cat: { x: number; z: number };
  fireplace: { x: number; z: number };
  dresser: { x: number; z: number };
  boxes: ObstacleBox[];
}

export const INTERIOR: InteriorLayout = {
  floorY: 0,
  bounds: { halfX: 4.55, halfZ: 3.7 },
  spawn: { x: 0, z: 1.3 },
  exit: { x: 0, z: -3.1 },
  key: { x: 2.05, z: 0.95 },
  cat: { x: 1.2, z: 2.6 },
  fireplace: { x: 2.5, z: -2.6 },
  dresser: { x: -2.8, z: -2.2 },
  boxes: [
    { x: -3.5, z: -2.25, halfX: 1.15, halfZ: 1.5 }, // bed
    { x: 4.1, z: -2.1, halfX: 0.75, halfZ: 1.2 }, // fireplace
    { x: 2.5, z: 0.35, halfX: 1.05, halfZ: 1.0 }, // table
    { x: 4.2, z: 2.0, halfX: 0.6, halfZ: 1.25 }, // bookshelf
    { x: -3.35, z: 2.45, halfX: 1.3, halfZ: 0.75 }, // sofa
    { x: 1.2, z: 2.6, halfX: 0.65, halfZ: 0.6 }, // cat basket
  ],
};

export const CAMERA_BLOCKERS = [
  { ...COTTAGE_BOX, height: 6.6, base: terrainHeight(COTTAGE_BOX.x, COTTAGE_BOX.z) },
  {
    x: LAYOUT.shrine.x,
    z: LAYOUT.shrine.z,
    halfX: 2.6,
    halfZ: 2.6,
    height: 5.4,
    base: terrainHeight(LAYOUT.shrine.x, LAYOUT.shrine.z),
  },
  {
    // Wishing tree canopy — the secret garden is small, so the camera often swings into it.
    x: LAYOUT.wishingTree.x,
    z: LAYOUT.wishingTree.z,
    halfX: 2.6,
    halfZ: 2.6,
    height: 4.6,
    base: terrainHeight(LAYOUT.wishingTree.x, LAYOUT.wishingTree.z) + 1.7,
  },
];
