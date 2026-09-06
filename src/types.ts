export type VehicleId = 'f40' | 'f50' | 'testarossa';

export interface MapConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  imageColor: string;
  maze: number[][];
  playerStart: { gridX: number; gridY: number };
}

export interface VehicleConfig {
  id: VehicleId;
  name: string;
  year: string;
  maxSpeed: number;
  handling: number; // visual turn responsiveness or small speed bonus
  acceleration: number;
  color: string;
  accentColor: string;
  description: string;
  quote: string;
}

export type GameStage = 'menu' | 'playing' | 'paused' | 'win' | 'lose';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  gridX: number;
  gridY: number;
  canvasX: number;
  canvasY: number;
  dir: Direction;
  nextDir: Direction;
  speed: number;
}

export type LuceState = 'chase' | 'scatter' | 'frightened' | 'eaten';

export interface LuceGhost {
  id: string;
  name: string;
  gridX: number;
  gridY: number;
  canvasX: number;
  canvasY: number;
  color: string; // Neon electrified color
  state: LuceState;
  dir: Direction;
  speed: number;
  respawnTime: number; // counters for eaten state
  personality: 'aggressive' | 'ambush' | 'unpredictable' | 'patrol';
}

export interface GameSettings {
  highSpeedMode: boolean;
  soundEnabled: boolean;
}
