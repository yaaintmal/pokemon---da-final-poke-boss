// Type definitions for the Pokemon Battle API

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  'special-attack': number;
  'special-defense': number;
  speed: number;
}

export interface Pokemon {
  id: number;
  name: string;
  height?: number;
  weight?: number;
  image?: string;
  audioUrl?: string;
  stats: PokemonStats;
  types: string[];
  abilities?: string[];
  baseExperience?: number;
  cries?: {
    latest?: string;
    legacy?: string;
  };
  hallOfFame?: number;
  createdAt?: Date;
}

export interface BattleFighter {
  name: string;
  id: number;
  hp: number;
  atk: number;
  def: number;
  satk: number;
  sdef: number;
  spd: number;
}

export interface BattleStats {
  totalDamageA?: number;
  totalDamageB?: number;
  [key: string]: any;
}

export interface Battle {
  round?: number;
  fighter1: BattleFighter;
  fighter2: BattleFighter;
  winner?: {
    name: string;
    id: number;
  };
  winnerName?: string; // Legacy field
  winnerId?: number; // Legacy field
  loser?: {
    name: string;
    id?: number;
  };
  loserName?: string; // Legacy field
  loserId?: number; // Legacy field
  stats?: BattleStats;
  timestamp?: Date;
  createdAt?: Date;
}

export interface HallOfFameEntry {
  id: number;
  name: string;
  image?: string;
  hallOfFame: number;
}

export interface WinRateStats {
  wins: number;
  losses: number;
  totalDamageDealt?: number;
  totalDamageTaken?: number;
}

// API Request/Response types

export interface RandomPokemonRequest {
  count?: number;
}

export interface RandomPokemonResponse {
  [key: string]: any; // Pokemon data
}

export interface NotesRequest {
  stat: string;
  pokemon: {
    name?: string;
    [key: string]: any;
  };
}

export interface NotesResponse {
  source: 'ollama' | 'fallback';
  note: string;
}

export interface BattleRequest {
  round?: number;
  fighter1: BattleFighter;
  fighter2: BattleFighter;
  winner: {
    name: string;
    id: number;
  };
  loser?: {
    name: string;
    id?: number;
  };
  stats?: BattleStats;
  timestamp?: Date;
}

export interface BattleResponse {
  success: boolean;
  id?: string;
  battle?: Battle;
}

export interface HallOfFameIncrementRequest {
  id?: number;
  name?: string;
}

export interface HallOfFameIncrementResponse {
  success: boolean;
  pokemon: Pokemon;
}

export interface HallOfFameResponse {
  entries: HallOfFameEntry[];
}

export interface BattleStatsResponse {
  totalBattles: number;
  winRates: Record<string, WinRateStats>;
  recentBattles: Battle[];
}

export interface PokemonStatsResponse {
  totalBattles: number;
  winRates: Record<string, WinRateStats>;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

// MongoDB collection types
export interface MongoCollections {
  pokemon: any; // MongoDB Collection
  battles: any; // MongoDB Collection
}