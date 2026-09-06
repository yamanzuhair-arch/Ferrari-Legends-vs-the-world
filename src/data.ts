import { VehicleConfig, MapConfig } from './types';

export const VEHICLE_CONFIGS: VehicleConfig[] = [
  {
    id: 'f40',
    name: 'Ferrari F40',
    year: '1987',
    maxSpeed: 4.5,
    handling: 1.2,
    acceleration: 1.5,
    color: '#E30A17', // Rosso Corsa Red
    accentColor: '#FFD700', // Ferrari Yellow
    description: 'The ultimate wedge-shaped raw twin-turbo V8 masterpiece. Loud, visceral, and uncompromising. Designed to celebrate Ferrari’s 40th anniversary.',
    quote: '"Ascolta! The F40 is not a mere car, it is a sword! It has no compromise, only pure racing blood."'
  },
  {
    id: 'f50',
    name: 'Ferrari F50',
    year: '1995',
    maxSpeed: 4.8,
    handling: 1.4,
    acceleration: 1.3,
    color: '#FF1801', // Bright Red
    accentColor: '#ffffff',
    description: 'A literal Formula 1 car in civilian clothing. Featuring a naturally aspirated 4.7L V12 bolted directly to the chassis for pure, unadulterated feedback.',
    quote: '"A naturally aspirated Formula 1 V12 bolted directly to your spine! If you are afraid, do not touch the key!"'
  },
  {
    id: 'testarossa',
    name: 'Ferrari Testarossa',
    year: '1991',
    maxSpeed: 4.2,
    handling: 1.1,
    acceleration: 1.4,
    color: '#D1001C', // Deep Crimson
    accentColor: '#008C45', // Italian Green
    description: 'The definitive 90s supercar icon. Striking side strakes, ultra-wide rear track, and a roaring flat-12 engine representing pure, luxurious Italian style.',
    quote: '"Twelve cylinders screaming with pride, those beautiful side-strakes cutting the wind... Che bella macchina! Respect it!"'
  }
];

export const WIN_QUOTES = [
  "Incredibile! You drive with fire in your soul, with the true fury of Maranello! Bravissimo!",
  "Che bella vittoria! This is how we defeat those quiet electric appliances! The roar of our pistons is the true music of Italy!",
  "Magnificent! You respect the machine, and the machine respects you. That is how a champion crosses the finish line!",
  "Listen to me: they can build all the batteries they want, but they can never buy the soul of raw mechanical combustion. A masterclass!"
];

export const LOSE_QUOTES = [
  "Ma che fai?! You steer my beautiful machine like you are driving a rusty wheelbarrow! Basta!",
  "Corbezzoli! This is a legendary Ferrari, not an electric toy under your Christmas tree! Respect the legacy!",
  "Madonna mia... what a catastrophe! If you want a slow carriage, go buy a bicycle, or a Fiat!",
  "Listen to me: your gear shifts sound like a broken cement mixer. Wake up! Show me some dignity!",
  "Perhaps you belong in one of those silent electric appliances. Real horsepower requires real hands and a cold mind!",
  "Mamma mia... to crash against cheap batteries! This is an insult to the workers of Maranello! Try again, and focus!"
];

// Let's design an awesome 21x21 Scuderia Monza racetrack style Pac-Man maze!
// 0: Barrier / Wall
// 1: Track corridor with Turbo Boost Canister (dot)
// 2: Track corridor with Gas Can (Power pill)
// 3: Track corridor EMPTY (no dot / starting zone)
// 4: Luce Charging Station Gate (Ghost gate, player blocks, Luce enters/leaves)
// 5: Luce Charging Station INSIDE (Ghost house, spawn point)

export const INITIAL_MAZE = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,2,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,2,0],
  [0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0],
  [0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0],
  [0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0],
  [0,0,0,0,0,1,0,0,0,3,0,3,0,0,0,1,0,0,0,0,0],
  [3,3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3,3],
  [0,0,0,0,0,1,0,3,0,0,4,0,0,3,0,1,0,0,0,0,0],
  [3,3,3,3,3,1,3,3,0,5,5,5,0,3,3,1,3,3,3,3,3], // Center tunnels
  [0,0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0,0],
  [3,3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3,3],
  [0,0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0],
  [0,2,1,1,0,1,1,1,1,1,3,1,1,1,1,1,0,1,1,2,0],
  [0,0,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,0,0],
  [0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0],
  [0,1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

// Start positions (grid coordinates)
export const PLAYER_START = { gridX: 10, gridY: 16 };

export const LUCE_START_GHOSTS = [
  { id: 'luce1', name: 'Luce Red', color: '#ff3344', personality: 'aggressive', startGridX: 9, startGridY: 10 },
  { id: 'luce2', name: 'Luce Teal', color: '#00ffee', personality: 'ambush', startGridX: 11, startGridY: 10 },
  { id: 'luce3', name: 'Luce Amber', color: '#ffbb00', personality: 'unpredictable', startGridX: 10, startGridY: 10 },
  { id: 'luce4', name: 'Luce Purple', color: '#ee11ff', personality: 'patrol', startGridX: 10, startGridY: 10 }
] as const;

export const MAPS: MapConfig[] = [
  {
    id: 'monza',
    name: 'Monza Speedring',
    tagline: 'High-speed classic',
    description: 'The definitive Italian speed ring. Features double-wide sweeping outer curves, massive straights, and minimal central blockages for high-gear drifting.',
    imageColor: '#e30a17',
    playerStart: { gridX: 10, gridY: 16 },
    maze: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1,1,0],
      [0,1,1,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,1,0,0,0,3,0,3,0,0,0,1,0,0,0,0,0],
      [3,3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,4,0,0,3,0,1,0,0,0,0,0],
      [3,3,3,3,3,1,3,3,0,5,5,5,0,3,3,1,3,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0,0],
      [3,3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1,1,0],
      [0,2,1,0,0,0,0,1,1,1,3,1,1,1,0,0,0,0,1,2,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ]
  },
  {
    id: 'imola',
    name: 'Imola Chicane',
    tagline: 'Technical corners',
    description: 'A highly technical chicane layout. Filled with quick double S-curve bottlenecks and staggered block barriers to check chassis responsiveness.',
    imageColor: '#38bdf8',
    playerStart: { gridX: 10, gridY: 16 },
    maze: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,2,1,0,1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,2,0],
      [0,1,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,1,0],
      [0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0],
      [0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0],
      [0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0],
      [0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0],
      [0,0,0,0,0,1,0,0,0,3,0,3,0,0,0,1,0,0,0,0,0],
      [3,3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,4,0,0,3,0,1,0,0,0,0,0],
      [3,3,3,3,3,1,3,3,0,5,5,5,0,3,3,1,3,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0,0],
      [3,3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0,0],
      [0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0],
      [0,1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,1,0],
      [0,2,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,2,0],
      [0,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,0],
      [0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0],
      [0,1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ]
  },
  {
    id: 'fiorano',
    name: 'Fiorano technical',
    tagline: 'Maranello test grounds',
    description: 'An asymmetrical technical test track. Winding inner loops on the left are paired with complex hairpin segments on the right to simulate raw trials.',
    imageColor: '#fbbf24',
    playerStart: { gridX: 10, gridY: 16 },
    maze: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,2,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,2,0],
      [0,1,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,0,1,0],
      [0,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,0],
      [0,0,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,0,0],
      [0,1,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,1,1,0],
      [0,1,0,0,1,1,1,0,0,1,0,1,0,0,1,1,1,0,0,1,0],
      [0,0,0,0,0,1,0,0,0,3,0,3,0,0,0,1,0,0,0,0,0],
      [3,3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,4,0,0,3,0,1,0,0,0,0,0],
      [3,3,3,3,3,1,3,3,0,5,5,5,0,3,3,1,3,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0,0],
      [3,3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0],
      [0,1,0,0,0,0,1,0,0,1,0,1,1,1,0,0,0,0,1,1,0],
      [0,2,1,1,0,1,1,1,0,1,3,1,0,1,1,1,0,1,1,2,0],
      [0,0,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,0,0],
      [0,1,1,1,0,1,0,0,0,0,1,0,0,0,0,1,0,1,1,1,0],
      [0,1,0,0,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ]
  },
  {
    id: 'mugello',
    name: 'Mugello Ring',
    tagline: 'Concentric sweeps',
    description: 'A circular concentric track configuration. Double sweeping running lanes around the perimeter create wide loops, ideal for high speed chase sequences.',
    imageColor: '#10b981',
    playerStart: { gridX: 10, gridY: 16 },
    maze: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
      [0,1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0],
      [0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,0],
      [0,1,0,1,0,0,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0],
      [0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0],
      [0,1,0,1,1,1,0,0,0,1,0,1,0,0,0,1,1,1,0,1,0],
      [0,0,0,0,0,1,0,0,0,3,0,3,0,0,0,1,0,0,0,0,0],
      [3,3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,4,0,0,3,0,1,0,0,0,0,0],
      [3,3,3,3,3,1,3,3,0,5,5,5,0,3,3,1,3,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0,0],
      [3,3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0],
      [0,1,0,1,1,1,0,0,0,1,0,1,0,0,0,1,1,1,0,1,0],
      [0,2,1,0,0,1,1,1,1,1,3,1,1,1,1,1,0,0,1,2,0],
      [0,0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0],
      [0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0],
      [0,1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ]
  },
  {
    id: 'maranello',
    name: 'Maranello Streets',
    tagline: 'Historic street grid',
    description: 'A structural, clean 90-degree grid style street course. Sharp orthogonal junctions make this track ideal for precision drift powersliding.',
    imageColor: '#ea580c',
    playerStart: { gridX: 10, gridY: 16 },
    maze: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,2,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,2,0],
      [0,1,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0],
      [0,1,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0],
      [0,1,0,0,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,1,0],
      [0,0,0,0,0,1,0,0,0,3,0,3,0,0,0,1,0,0,0,0,0],
      [3,3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,4,0,0,3,0,1,0,0,0,0,0],
      [3,3,3,3,3,1,3,3,0,5,5,5,0,3,3,1,3,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0,0],
      [3,3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3,3],
      [0,0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0],
      [0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0],
      [0,2,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,2,0],
      [0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0],
      [0,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0],
      [0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0],
      [0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ]
  },
  {
    id: 'random',
    name: 'Autodromo Custom GP',
    tagline: 'Procedural dynamic track',
    description: 'A custom computer-simulated circuit. Pathway blocks, street corridors, and turbo placements are compiled dynamically every single time you launch!',
    imageColor: '#a855f7',
    playerStart: { gridX: 10, gridY: 16 },
    maze: [] // Will be populated dynamically
  }
];

export function generateRandomTrack(): number[][] {
  const maze: number[][] = Array(22).fill(null).map(() => Array(21).fill(0));

  // Force center nursery cage structure (rows 7 to 13) to remain standard so ghosts are perfectly functional
  const centerCage = [
    [0,0,0,0,0,1,0,0,0,3,0,3,0,0,0,1,0,0,0,0,0], // Row 7
    [3,3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3,3], // Row 8
    [0,0,0,0,0,1,0,3,0,0,4,0,0,3,0,1,0,0,0,0,0], // Row 9
    [3,3,3,3,3,1,3,3,0,5,5,5,0,3,3,1,3,3,3,3,3], // Row 10
    [0,0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0,0], // Row 11
    [3,3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3,3], // Row 12
    [0,0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0,0]  // Row 13
  ];

  for (let r = 7; r <= 13; r++) {
    maze[r] = [...centerCage[r - 7]];
  }

  // Draw continuous outer frame tracks for guaranteed connectivity!
  // Row 1, Row 20, Col 1, Col 19 are standard open roads
  for (let c = 1; c < 20; c++) {
    maze[1][c] = 1;
    maze[20][c] = 1;
  }
  for (let r = 1; r < 21; r++) {
    maze[r][1] = 1;
    maze[r][19] = 1;
  }

  // Set default gas canisters at outer boundaries
  maze[1][1] = 2;
  maze[1][19] = 2;
  maze[20][1] = 2;
  maze[20][19] = 2;

  // Vertical middle line road connecting top and bottom sectors elegantly
  for (let r = 2; r <= 6; r++) {
    maze[r][10] = 1;
  }
  for (let r = 14; r <= 19; r++) {
    maze[r][10] = 1;
  }

  // Carve left half blocks (we mirror them to the right dynamically)
  // Determine randomized grid rows
  const possibleHRoadsUpper = [2, 3, 4, 5, 6];
  const possibleHRoadsLower = [14, 15, 16, 17, 18, 19];
  const possibleVRoads = [2, 3, 4, 5, 6, 7, 8, 9];

  // Pick 2 random horizontal streets for upper/lower halves
  const hU1 = possibleHRoadsUpper[Math.floor(Math.random() * 2)];
  const hU2 = possibleHRoadsUpper[3 + Math.floor(Math.random() * 2)];
  
  const hL1 = possibleHRoadsLower[Math.floor(Math.random() * 2)];
  const hL2 = possibleHRoadsLower[3 + Math.floor(Math.random() * 3)];

  [hU1, hU2].forEach(row => {
    for (let col = 1; col <= 10; col++) {
      maze[row][col] = 1;
    }
  });

  [hL1, hL2].forEach(row => {
    for (let col = 1; col <= 10; col++) {
      maze[row][col] = 1;
    }
  });

  // Pick 2 random vertical streets
  const v1 = possibleVRoads[Math.floor(Math.random() * 3)];
  const v2 = possibleVRoads[4 + Math.floor(Math.random() * 4)];

  [v1, v2].forEach(col => {
    for (let row = 1; row <= 6; row++) {
      maze[row][col] = 1;
    }
    for (let row = 14; row <= 20; row++) {
      maze[row][col] = 1;
    }
  });

  // Mirror left half to right half for beautiful racing symmetry
  for (let r = 0; r < 22; r++) {
    for (let c = 0; c < 10; c++) {
      if (r >= 7 && r <= 13) continue; // Skip center cage area
      const val = maze[r][c];
      maze[r][20 - c] = val;
    }
  }

  // Clean-up and ensure canisters are randomized properly
  for (let r = 1; r <= 20; r++) {
    for (let c = 1; c <= 19; c++) {
      if (maze[r][c] === 1) {
        if (Math.random() < 0.04) {
          maze[r][c] = 2; // Extra gas can
        } else if (Math.random() < 0.08) {
          maze[r][c] = 3; // Clear road
        }
      }
    }
  }

  // Double check power junctions
  maze[1][1] = 2;
  maze[1][19] = 2;
  maze[20][1] = 2;
  maze[20][19] = 2;

  return maze;
}
