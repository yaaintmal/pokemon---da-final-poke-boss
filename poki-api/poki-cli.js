const API_URL = "https://pokeapi.co/api/v2/pokemon/";

const displayPokemon = async (pokemonId) => {
  if (!pokemonId) {
    console.error(
      "Please provide a Pokémon ID as a command-line argument. Example: 'node poki-cli.js 25'"
    );
    return;
  }

  try {
    const response = await fetch(`${API_URL}${pokemonId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Pokémon with ID ${pokemonId} not found.`);
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const pokemon = await response.json();
    console.log("###########################");
    console.log(
      `Name: ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`
    );
    console.log(`ID: ${pokemon.id}`);
    console.log(`Height: ${pokemon.height / 10} m`);
    console.log(`Weight: ${pokemon.weight / 10} kg`);
    console.log(`Image URL: ${pokemon.sprites.front_default}`);
    console.log(`Cry URL: ${pokemon.cries.latest}`);
    console.log(
      `Types: ${pokemon.types
        .map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1))
        .join(", ")}`
    );
    console.log(
      `Abilities: ${pokemon.abilities
        .map(
          (a) =>
            a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1)
        )
        .join(", ")}`
    );
    console.log(
      `Base Stats: ${pokemon.stats
        .map((s) => `${s.stat.name.replace("-", " ")}: ${s.base_stat}`)
        .join(", ")}`
    );
  } catch (error) {
    console.error(`Failed to fetch Pokémon data:`, error.message);
  }
};

// Get the Pokémon ID from the command-line arguments
const pokemonID = process.argv[2];

// Call the function with the provided ID
displayPokemon(pokemonID);
