import { z } from 'zod';

// Pokemon schemas
export const PokemonStatsSchema = z.object({
  hp: z.number().min(0),
  attack: z.number().min(0),
  defense: z.number().min(0),
  'special-attack': z.number().min(0),
  'special-defense': z.number().min(0),
  speed: z.number().min(0),
});

export const PokemonSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  height: z.number().optional(),
  weight: z.number().optional(),
  image: z.string().optional(),
  audioUrl: z.string().optional(),
  stats: PokemonStatsSchema,
  types: z.array(z.string()),
  abilities: z.array(z.string()).optional(),
  baseExperience: z.number().optional(),
  cries: z.object({
    latest: z.string().optional(),
    legacy: z.string().optional(),
  }).optional(),
  hallOfFame: z.number().optional(),
  createdAt: z.date().optional(),
});

// Battle schemas
export const BattleFighterSchema = z.object({
  name: z.string().min(1),
  id: z.number().int().positive(),
  hp: z.number().min(0),
  atk: z.number().min(0),
  def: z.number().min(0),
  satk: z.number().min(0),
  sdef: z.number().min(0),
  spd: z.number().min(0),
});

export const BattleStatsSchema = z.any().optional();

export const BattleSchema = z.object({
  round: z.number().int().optional(),
  fighter1: BattleFighterSchema,
  fighter2: BattleFighterSchema,
  winner: z.object({
    name: z.string().min(1),
    id: z.number().int().positive(),
  }).optional(),
  winnerName: z.string().optional(),
  winnerId: z.number().int().optional(),
  loser: z.object({
    name: z.string().min(1),
    id: z.number().int().optional(),
  }).optional(),
  loserName: z.string().optional(),
  loserId: z.number().int().optional(),
  stats: BattleStatsSchema,
  timestamp: z.date().optional(),
  createdAt: z.date().optional(),
});

// API Request/Response schemas
export const RandomPokemonRequestSchema = z.object({
  count: z.number().int().min(1).max(100).optional().default(4),
});

export const NotesRequestSchema = z.object({
  stat: z.string().min(1),
  pokemon: z.object({
    name: z.string().optional(),
  }).catchall(z.any()),
});

export const NotesResponseSchema = z.object({
  source: z.enum(['ollama', 'fallback']),
  note: z.string(),
});

export const BattleRequestSchema = z.object({
  round: z.number().int().optional(),
  fighter1: BattleFighterSchema,
  fighter2: BattleFighterSchema,
  winner: z.object({
    name: z.string().min(1),
    id: z.number().int().positive(),
  }),
  loser: z.object({
    name: z.string().min(1),
    id: z.number().int().optional(),
  }).optional(),
  stats: BattleStatsSchema,
  timestamp: z.date().optional(),
});

export const BattleResponseSchema = z.object({
  success: z.boolean(),
  id: z.string().optional(),
  battle: BattleSchema.optional(),
});

export const HallOfFameIncrementRequestSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1).optional(),
}).refine(data => data.id !== undefined || data.name !== undefined, {
  message: 'Either id or name must be provided',
});

export const HallOfFameIncrementResponseSchema = z.object({
  success: z.boolean(),
  pokemon: PokemonSchema,
});

export const HallOfFameEntrySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  image: z.string().optional(),
  hallOfFame: z.number().min(0),
});

export const HallOfFameResponseSchema = z.object({
  entries: z.array(HallOfFameEntrySchema),
});

export const WinRateStatsSchema = z.object({
  wins: z.number().min(0),
  losses: z.number().min(0),
  totalDamageDealt: z.number().optional(),
  totalDamageTaken: z.number().optional(),
});

export const BattleStatsResponseSchema = z.object({
  totalBattles: z.number().min(0),
  winRates: z.record(z.string(), WinRateStatsSchema),
  recentBattles: z.array(BattleSchema),
});

export const PokemonStatsResponseSchema = z.object({
  totalBattles: z.number().min(0),
  winRates: z.record(z.string(), WinRateStatsSchema),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
});

// Utility schemas for validation
export const PokemonIdParamSchema = z.string().regex(/^\d+$/).transform(val => parseInt(val));
export const PokemonNameParamSchema = z.string().min(1);
export const LimitQuerySchema = z.string().regex(/^\d+$/).transform(val => parseInt(val)).refine(val => val > 0 && val <= 100, { message: 'Limit must be between 1 and 100' }).optional().default(15);
export const SearchQuerySchema = z.string().optional();