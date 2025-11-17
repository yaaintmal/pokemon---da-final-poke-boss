// MongoDB Pokemon repository
let pokemonCollection = null;

export function setPokemonCollection(collection) {
  pokemonCollection = collection;
}

export async function getPokemonById(id) {
  if (!pokemonCollection) throw new Error('Pokemon collection not initialized');
  return pokemonCollection.findOne({ id: parseInt(id) });
}

export async function getPokemonByName(name) {
  if (!pokemonCollection) throw new Error('Pokemon collection not initialized');
  return pokemonCollection.findOne({ name: name.toLowerCase() });
}

export async function getAllPokemon() {
  if (!pokemonCollection) throw new Error('Pokemon collection not initialized');
  return pokemonCollection.find({}).sort({ id: 1 }).toArray();
}

export async function searchPokemon(query, limit = 50) {
  if (!pokemonCollection) throw new Error('Pokemon collection not initialized');
  const searchRegex = new RegExp(query, 'i');
  return pokemonCollection
    .find({ name: { $regex: searchRegex } })
    .limit(limit)
    .toArray();
}

export async function getRandomPokemon(count = 1) {
  if (!pokemonCollection) throw new Error('Pokemon collection not initialized');
  const sample = await pokemonCollection.aggregate([
    { $sample: { size: count } }
  ]).toArray();
  return sample;
}

export async function getTotalPokemonCount() {
  if (!pokemonCollection) throw new Error('Pokemon collection not initialized');
  return pokemonCollection.countDocuments();
}
