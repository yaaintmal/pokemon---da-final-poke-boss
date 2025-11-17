// Fetch a Pokemon avatar (prefer animated sprite) from pokeapi
export async function fetchPokemonAvatar(pokemonNameOrId) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(pokemonNameOrId)}`);
    if (!res.ok) throw new Error('Pokemon not found');
    const data = await res.json();

    const paths = [
      data?.sprites?.versions?.["generation-v"]["black-white"]?.animated?.front_default,
      data?.sprites?.animated?.front_default,
      data?.sprites?.front_default,
    ];
    const url = paths.find((p) => !!p) || null;
    return url;
  } catch (e) {
    console.warn('Avatar fetch failed for', pokemonNameOrId, e);
    return null;
  }
}
