// MongoDB Pokemon repository
import { Pokemon } from './types.js';

let pokemonCollection: any = null;

export function setPokemonCollection(collection: any): void {
  pokemonCollection = collection;
}

export async function getPokemonById(id: number): Promise<Pokemon | null> {
  if (!pokemonCollection) throw new Error('Pokemon collection not initialized');
  return pokemonCollection.findOne({ id });
}

export async function getPokemonByName(name: string): Promise<Pokemon | null> {
  if (!pokemonCollection) throw new Error('Pokemon collection not initialized');
  return pokemonCollection.findOne({ name: name.toLowerCase() });
}

export async function getAllPokemon(): Promise<Pokemon[]> {
  if (!pokemonCollection) throw new Error('Pokemon collection not initialized');
  return pokemonCollection.find({}).sort({ id: 1 }).toArray();
}

export async function searchPokemon(query: string, limit: number = 50): Promise<Pokemon[]> {
  if (!pokemonCollection) throw new Error('Pokemon collection not initialized');
  const searchRegex = new RegExp(query, 'i');
  return pokemonCollection
    .find({ name: { $regex: searchRegex } })
    .limit(limit)
    .toArray();
}

export async function getRandomPokemon(count: number = 1): Promise<Pokemon[]> {
  if (!pokemonCollection) throw new Error('Pokemon collection not initialized');
  const sample = await pokemonCollection.aggregate([
    { $sample: { size: count } }
  ]).toArray();
  return sample;
}

export async function getTotalPokemonCount(): Promise<number> {
  if (!pokemonCollection) throw new Error('Pokemon collection not initialized');
  return pokemonCollection.countDocuments();
}
