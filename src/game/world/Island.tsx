import { SkyAndLights } from './Atmosphere';
import { Beach } from './Beach';
import { Butterflies } from './Butterflies';
import { Collectibles } from './Collectibles';
import { Cottage } from './Cottage';
import { Critters } from './Critters';
import { FlowerGarden } from './Garden';
import { Meadow } from './Meadow';
import { Ocean } from './Ocean';
import { StonePaths } from './Paths';
import { Lanterns, Pond, Rocks, SmallBridge } from './Props';
import { SecretGarden } from './SecretGarden';
import { IslandSecrets } from './Secrets';
import { StarShrine } from './Shrine';
import { Terrain } from './Terrain';
import { Vegetation } from './Vegetation';

export const Island = () => (
  <group>
    <SkyAndLights />
    <Terrain />
    <Ocean />
    <StonePaths />
    <Vegetation />
    <Rocks />
    <Meadow />
    <Cottage />
    <FlowerGarden />
    <Pond />
    <SmallBridge />
    <Beach />
    <SecretGarden />
    <IslandSecrets />
    <StarShrine />
    <Lanterns />
    <Butterflies />
    <Critters />
    <Collectibles />
  </group>
);
