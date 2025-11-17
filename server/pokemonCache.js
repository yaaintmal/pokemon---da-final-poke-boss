/**
 * pokemonCache.js - In-memory cache for all Pokémon from PokéAPI
 * Fetches and stores up to ~1025 Pokémon on server startup with batching
 */

const POKE_API_BASE = 'https://pokeapi.co/api/v2/pokemon';

// In-memory cache
let pokemonCache = {};
let pokemonArray = []; // Keep as array for easy iteration
let isCacheFetching = false;
let cacheFetchPromise = null;

/**
 * Fetch and cache a single Pokémon by name or ID
 */
export async function getCachedPokemon(nameOrId) {
  // Check cache first
  const cacheKey = (nameOrId + '').toLowerCase();
  if (pokemonCache[cacheKey]) {
    return pokemonCache[cacheKey];
  }

  // Fetch from PokéAPI
  try {
    const res = await fetch(`${POKE_API_BASE}/${cacheKey}`);
    if (!res.ok) throw new Error(`Not found: ${nameOrId}`);
    const data = await res.json();
    const formatted = formatPokemon(data);
    pokemonCache[cacheKey] = formatted;
    pokemonCache[formatted.id] = formatted;
    return formatted;
  } catch (err) {
    console.warn(`Failed to fetch Pokémon: ${nameOrId}`, err.message);
    throw err;
  }
}

/**
 * Prefetch all Pokémon (up to a limit)
 * Returns a promise that resolves when done
 */
export async function prefetchAllPokemon(limit = 1025) {
  if (isCacheFetching) return cacheFetchPromise;
  if (pokemonArray.length > 100) {
    return pokemonArray;
  }

  isCacheFetching = true;
  cacheFetchPromise = (async () => {
    console.log(`[Cache] Starting prefetch of up to ${limit} Pokémon...`);
    const start = Date.now();

    try {
      // Fetch the full index to get all names and IDs
      const indexRes = await fetch(`${POKE_API_BASE}?limit=${limit}&offset=0`);
      if (!indexRes.ok) throw new Error('Failed to fetch Pokémon index');
      const indexData = await indexRes.json();

      const pokemonList = indexData.results || [];
      console.log(`[Cache] Found ${pokemonList.length} Pokémon in index`);

      // Fetch each Pokémon in parallel (with concurrency control to avoid overload)
      const batchSize = 50;
      for (let i = 0; i < pokemonList.length; i += batchSize) {
        const batch = pokemonList.slice(i, i + batchSize);
        const promises = batch.map(p =>
          fetch(`${POKE_API_BASE}/${p.name}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              if (data) {
                const formatted = formatPokemon(data);
                pokemonCache[formatted.id] = formatted;
                pokemonCache[formatted.name] = formatted;
                pokemonArray.push(formatted);
              }
            })
            .catch(err => console.warn(`Failed to fetch ${p.name}:`, err.message))
        );
        await Promise.all(promises);
        const progress = Math.min(i + batchSize, pokemonList.length);
        console.log(`[Cache] Fetched ${progress}/${pokemonList.length} Pokémon (${Math.round(progress/pokemonList.length*100)}%)`);
      }

      // Sort by ID for consistent ordering
      pokemonArray.sort((a, b) => a.id - b.id);
      
      console.log(`[Cache] Prefetch complete. Cached ${pokemonArray.length} unique Pokémon in ${Date.now() - start}ms`);
    } catch (err) {
      console.error('[Cache] Prefetch failed:', err.message);
    } finally {
      isCacheFetching = false;
    }

    return pokemonArray;
  })();

  return cacheFetchPromise;
}

/**
 * Get all cached Pokémon as an array
 */
export function getAllCachedPokemon() {
  return pokemonArray;
}

/**
 * Format raw PokéAPI data into our format
 */
function formatPokemon(data) {
  const stats = {};
  if (data.stats) {
    data.stats.forEach(s => {
      stats[s.stat.name] = s.base_stat;
    });
  }
  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    image: data.sprites?.front_default || '',
    audioUrl: data.cries?.latest || '',
    stats: {
      hp: stats.hp || 0,
      attack: stats.attack || 0,
      defense: stats.defense || 0,
      'special-attack': stats['special-attack'] || 0,
      'special-defense': stats['special-defense'] || 0,
      speed: stats.speed || 0,
    },
    types: data.types?.map(t => t.type.name) || [],
  };
}

/**
 * Search Pokémon by partial name (returns up to limit matches)
 */
export function searchPokemon(query, limit = 50) {
  const q = query.toLowerCase();
  return pokemonArray
    .filter(p => p.name.includes(q))
    .slice(0, limit);
}

/**
 * Get random Pokémon(s)
 */
export function getRandomPokemon(count = 1, excludeIds = []) {
  const available = pokemonArray.filter(p => !excludeIds.includes(p.id));
  const result = [];
  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    result.push(available[idx]);
    available.splice(idx, 1);
  }
  return result;
}

/**
 * Initialize cache on startup (wait for completion)
 */
export async function initializeCache() {
  try {
    await prefetchAllPokemon(1025);
  } catch (err) {
    console.error('[Cache] Failed to initialize:', err.message);
  }
}
