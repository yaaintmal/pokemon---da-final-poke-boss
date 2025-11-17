/**
 * API utility - centralized API endpoint configuration
 * Uses environment variables for base URL to support dev and production deployments
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Build full API URL
 */
function getApiUrl(endpoint) {
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * Fetch hall of fame leaderboard
 */
export async function fetchHallOfFame(limit = 15) {
  const res = await fetch(getApiUrl(`/api/hall-of-fame?limit=${limit}`));
  if (!res.ok) throw new Error('Failed to fetch leaderboard: ' + res.status + ' ' + res.statusText);
  return await res.json();
}

/**
 * Increment hall of fame score for a pokemon
 */
export async function incrementHallOfFame(id, name) {
  const res = await fetch(getApiUrl('/api/hall-of-fame/increment'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name }),
  });
  if (!res.ok) throw new Error('Failed to increment hall of fame: ' + res.status);
  return await res.json();
}

/**
 * Save battle results
 */
export async function saveBattle(battleData) {
  const res = await fetch(getApiUrl('/api/battles'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(battleData),
  });
  if (!res.ok) throw new Error('Failed to save battle: ' + res.status);
  return await res.json();
}

/**
 * Fetch pokemon stats (win rates, damage, etc.)
 */
export async function fetchPokemonStats() {
  const res = await fetch(getApiUrl('/api/pokemon-stats'));
  if (!res.ok) throw new Error('Failed to fetch stats');
  return await res.json();
}

/**
 * Fetch specific pokemon data
 */
export async function fetchPokemon(nameOrId) {
  const res = await fetch(getApiUrl(`/api/pokemon/${nameOrId.toLowerCase()}`));
  if (!res.ok) return null;
  return await res.json();
}

/**
 * Get random pokemon
 */
export async function getRandomPokemon(count = 4) {
  const res = await fetch(getApiUrl('/api/random'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count }),
  });
  if (!res.ok) throw new Error('Failed to fetch random pokemon');
  return await res.json();
}

/**
 * Search pokemon list
 */
export async function searchPokemon(query) {
  const res = await fetch(getApiUrl(`/api/pokemon-list?search=${encodeURIComponent(query)}`));
  if (!res.ok) throw new Error('Failed to search pokemon');
  return await res.json();
}
