export const PLAYER_NAME = 'Hossna';

export const GAME_INFO = {
  title: "HOSSNA'S SECRET WORLD",
  shortTitle: "HOSSNA'S WORLD",
  subtitle: 'A little world made just for you.',
  welcomeMessage:
    'Hey Hossna! Welcome to your own little island. Visit your cottage, find the old garden key, unlock the secret garden, and gather stars and crystals to wake the Star Shrine. I hid a few surprises just for you. 💗',
  secretNote:
    "Hey Hossna! I made this little world for you. Explore every corner, find all the hidden surprises, and remember that there's always a little magic waiting to be discovered. 💗",
  signTitle: "Welcome to Hossna's Secret World!",
  signSubtitle: 'Stars, secrets & soft island breezes',
  cottageWelcome:
    'The cottage is warm, smells like cinnamon, and feels like it was built for quiet afternoons. Something glints on the tea table…',
  keyFound:
    'You found the old garden key! It is warm, as if it has been waiting for you. The gate in the west will open now.',
  gateLocked:
    'The old gate is locked tight. There is a little keyhole shaped like a heart… maybe the key is somewhere cozy.',
  fountainNeedsFlowers:
    'The fountain hums softly. It wants two magical flowers — you are carrying {flowers}.',
  fountainReward:
    'You float the magical flowers on the water. The fountain sings and glows — the island trusts you now.',
  shrineLocked:
    'The shrine is sleeping. It needs {starGoal} golden stars and {crystalGoal} pink crystals — you have {stars} stars and {crystals} crystals.',
  shrineRewardTitle: 'The Star Shrine awakens!',
  shrineReward:
    'A warm light spills over the island. A little gift appears: a jar of stardust, and the knowledge that you are very loved.',
  finaleTitle: 'You found every little piece of magic.',
  finaleBody:
    'The meadow, the cottage, the secret garden, the fountain, the stars, the crystals and the shrine — all of it was waiting for you. Thank you for exploring, Hossna. There is always more magic to discover.',
  resetWarning:
    'This clears stars, quests, secrets and outfits saved in this browser. It cannot be undone.',
  saveNote:
    'Progress is saved in this browser only. It does not sync to other devices or browsers.',
} as const;

export const OUTFITS = [
  // Short dresses
  { id: "secret", name: "Vectoria Secret", color: "#7b3f7a", trim: "#ff9ec4", type: "dress" },
  { id: "celestial", name: "Celestial Short", color: "#5b5ce0", trim: "#ffd67d", type: "dress" },
  { id: "magical", name: "Magical Short", color: "#b44ad4", trim: "#7fffd9", type: "dress" },
  { id: "dreamy", name: "Dreamy Short", color: "#ff6b9d", trim: "#c8e6ff", type: "dress" },

  // Long floral dresses
  { id: "blooming", name: "Blooming Rose", color: "#e88ca5", trim: "#ffd1dc", type: "dress" },
  { id: "spring", name: "Spring Breeze", color: "#b8d4be", trim: "#fff8e7", type: "dress" },
  { id: "lavender", name: "Lavender Field", color: "#c3a9ee", trim: "#fff6fb", type: "dress" },
  { id: "sunset", name: "Sunset Breeze", color: "#fda085", trim: "#ffe8d6", type: "dress" },

  // Twist dresses
  { id: "swirl", name: "Swirl Maiden", color: "#e0a0c0", trim: "#fff0f5", type: "dress" },
  { id: "twine", name: "Wine in the Sky", color: "#8b5a8b", trim: "#ffd1d1", type: "dress" },

  // Party / festive
  { id: "sparkle", name: "Disco Sparkle", color: "#ff0080", trim: "#ffd700", type: "dress" },
  { id: "rainbow", name: "Rainy Day Rainbow", color: "#c43bff", trim: "#ffea8a", type: "dress" },

  // Over-sized coats / jackets
  { id: "fairyBombshell", name: "Fairy Bombshell", color: "#445566", trim: "#6ee7b7", type: "coat" },
  { id: "velvetBombshell", name: "Velvet Bombshell", color: "#6a4c93", trim: "#ff8fab", type: "coat" },
  { id: "sparkleBombshell", name: "Sparkle Bombshell", color: "#9b5de5", trim: "#f15bb5", type: "coat" },

  // Cardigans
  { id: "cardigan", name: "Cardigan", color: "#f0c6d8", trim: "#e68898", type: "cardigan" },

  // Scarfs / wraps
  { id: "scarf", name: "Scarf", color: "#ff8fa3", trim: "#badcff", type: "scarf" },
  { id: "wrap", name: "Wrap", color: "#9d8df1", trim: "#ff9eb5", type: "scarf" },

  // Undergarments / loungewear
  { id: "nightgown", name: "Nightgown", color: "#ffe8e0", trim: "#fadadd", type: "undergarment" },
  { id: "lace", name: "Lace Set", color: "#ffe0f0", trim: "#e0c8ff", type: "undergarment" },
  { id: "silk", name: "Silk Pajamas", color: "#f0f0f8", trim: "#c8c8e8", type: "undergarment" },

  // Formal / special
  { id: "ballgown", name: "Ballgown", color: "#ffe8c6", trim: "#ffd4b8", type: "formal" },
  { id: "summer", name: "Summer Dress", color: "#ffecd2", trim: "#fdebd0", type: "dress" },
  { id: "winter", name: "Winter Coat", color: "#c8e0f8", trim: "#a3c8f0", type: "formal" },

  // Layers / over-dresses
  { id: "jacket", name: "Denim Jacket", color: "#ffe8dc", trim: "#ffe0c8", type: "layer" },

  // Summer collection
  { id: "summer1", name: "Tropical Print", color: "#ff6b6b", trim: "#ffd93e", type: "dress" },
  { id: "summer2", name: "Ocean Breeze", color: "#48d1cc", trim: "#6c5ce7", type: "dress" },
  { id: "summer3", name: "Citrus Sun", color: "#ffa726", trim: "#ffffff", type: "dress" },

  // Winter collection
  { id: "winter1", name: "Frost Kimono", color: "#a8d8ff", trim: "#7e5cef", type: "coat" },
  { id: "winter2", name: "Midnight Velvet", color: "#4a4a6a", trim: "#e94560", type: "coat" },
  { id: "winter3", name: "Crystal Snow", color: "#e0ffff", trim: "#7b68ee", type: "coat" },

  // Festival / seasonal
  { id: "lunarNewYear", name: "Lunar New Year", color: "#ff6b6b", trim: "#ffd700", type: "dress" },
  { id: "halloween", name: "Spooky Witch", color: "#6b3a5e", trim: "#ffe5b4", type: "coat" },
  { id: "christmas", name: "Christmas Sweater", color: "#f5a9a9", trim: "#ffe5e5", type: "formal" },
] as const;

export const HAIR_STYLES = [
  { id: "cocoa", name: "Cocoa bob", color: "#6b4a3b" },
  { id: "midnight", name: "Midnight bun", color: "#3e3646" },
  { id: "rose", name: "Rose waves", color: "#b96d79" },
  { id: "honey", name: "Honey braids", color: "#c99a5b" },
  { id: "lilac", name: "Lilac dream", color: "#ab93cf" },
  { id: "silver", name: "Silver pixie", color: "#c0c0c0" },
  { id: "golden", name: "Golden curls", color: "#e8b03c" },
  { id: "platinum", name: "Platinum bob", color: "#e8e4ec" },
  { id: "rainbow", name: "Rainbow braids", color: "#ff0080" },
  { id: "purpleDream", name: "Purple Dream", color: "#7b3f7a" },
  { id: "pinkDream", name: "Pink Dream", color: "#ff69b4" },
  { id: "sparkleDream", name: "Sparkle Dream", color: "#ddbeff" },
  // Additional seasonal hair styles
  { id: "snow", name: "Snow braids", color: "#e0e7ff" },
  { id: "sunrise", name: "Sunrise waves", color: "#ff8c42" },
] as const;

export type OutfitId = (typeof OUTFITS)[number]["id"];
export type HairId = (typeof HAIR_STYLES)[number]["id"];

export const DEFAULT_CHARACTER = {
  outfit: "secret" as OutfitId,
  hair: "purpleDream" as HairId,
};

export type CollectibleType = "star" | "crystal" | "flower" | "gift";

export interface CollectibleDefinition {
  id: string;
  type: CollectibleType;
  name: string;
  x: number;
  z: number;
  message: string;
  color?: string;
}

export const COLLECTIBLES: CollectibleDefinition[] = [
  {
    id: "star-meadow",
    type: "star",
    name: "Golden Star",
    x: 6.5,
    z: 20.5,
    message: "You found a little piece of magic!",
  },
  {
    id: "star-cottage",
    type: "star",
    name: "Golden Star",
    x: -11.6,
    z: 3.2,
    message: "Tucked beside the cottage, a star was waiting for you.",
  },
  {
    id: "star-garden",
    type: "star",
    name: "Golden Star",
    x: 18.5,
    z: 8.2,
    message: "The flowers whispered where this star was hiding.",
  },
  {
    id: "star-beach",
    type: "star",
    name: "Golden Star",
    x: 10.5,
    z: 38.2,
    message: "A star washed up with the tide, just for you.",
  },
  {
    id: "star-path",
    type: "star",
    name: "Golden Star",
    x: 2.2,
    z: -9.5,
    message: "The island has another surprise for you.",
  },
  {
    id: "star-pond",
    type: "star",
    name: "Golden Star",
    x: 22.4,
    z: -9.2,
    message: "The pond keeps a tiny reflection of the sky.",
  },
  {
    id: "star-secret",
    type: "star",
    name: "Golden Star",
    x: -31.4,
    z: 23.2,
    message: "The secret garden grows its own kind of light.",
  },
  {
    id: "crystal-garden",
    type: "crystal",
    name: "Pink Crystal",
    x: 21.8,
    z: 1.2,
    color: "#ff9cc6",
    message: "A pink crystal hums softly in your hand.",
  },
  {
    id: "crystal-beach",
    type: "crystal",
    name: "Pink Crystal",
    x: -15.5,
    z: 38.5,
    color: "#ff9cc6",
    message: "Sea-glass and starlight, all in one little crystal.",
  },
  {
    id: "crystal-hill",
    type: "crystal",
    name: "Pink Crystal",
    x: 12.5,
    z: -23.5,
    color: "#ff9cc6",
    message: "The hill sparkles a little brighter now.",
  },
  {
    id: "flower-cottage",
    type: "flower",
    name: "Magical Flower",
    x: -11.8,
    z: 8.6,
    color: "#ffd0e2",
    message: "A magical flower that never stops blooming.",
  },
  {
    id: "flower-pond",
    type: "flower",
    name: "Magical Flower",
    x: 28.4,
    z: -2.3,
    color: "#e2c9ff",
    message: "This flower glows like a tiny lantern.",
  },
  {
    id: "gift-secret",
    type: "gift",
    name: "Hidden Gift",
    x: -33.2,
    z: 20.4,
    color: "#ffb3c8",
    message: "A hidden gift! Inside: a tiny paper heart that says 'you are magic'.",
  },
];

export const STAR_GOAL = 5;
export const CRYSTAL_GOAL = 3;
export const FLOWER_GOAL = 2;

export const SECRETS = [
  {
    id: 'mailbox',
    name: 'The little letter',
    hint: 'Someone left mail by the cottage path.',
    message: 'A tiny letter inside: "If you found this, you are already good at noticing the little things. — with love"',
  },
  {
    id: 'message',
    name: 'The carved stone',
    hint: 'A small stone sits by the path to the beach.',
    message: 'Carved into the stone: "Your curiosity is what makes this island glow."',
  },
  {
    id: 'willow',
    name: 'The whispering willow',
    hint: 'A tall willow leans toward the sea, west of the beach path.',
    message: 'The willow whispers: "Secrets lie where the moonlight touches the water… look east of the pond."',
  },
  {
    id: 'moonstone',
    name: 'The moonstone',
    hint: 'Something pale glows on the rocks east of the lily pond.',
    message: 'The moonstone glows warmly under your hand. It remembers every wish ever made here.',
  },
  {
    id: 'wish',
    name: 'The wishing tree',
    hint: 'The blossoming tree in the secret garden listens to wishes.',
    message: 'You whisper a wish to the blossoms. A petal floats down and lands right on your nose. Wish granted. 🌸',
  },
  {
    id: 'cat',
    name: 'The sleepy cat',
    hint: 'Someone is napping in a basket inside the cottage.',
    message: 'The cat purrs, stretches one paw, and goes right back to sleep. You have been approved. 🐾',
  },
  {
    id: 'fireplace',
    name: 'The warm fireplace',
    hint: 'The cottage fireplace is always crackling.',
    message: 'You warm your hands by the fire. Somewhere a kettle starts to sing.',
  },
] as const;

export const QUALITY_LABELS = {
  auto: "Auto (recommended)",
  high: "High — soft shadows",
  low: "Low — best battery",
} as const;