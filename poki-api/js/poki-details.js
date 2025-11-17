// setting url
const API_URL = "https://pokeapi.co/api/v2/pokemon/";

// setting container
const pokemonDetailsContainer = document.getElementById(
  "pokemon-details-container"
);

// getting poki-id
const getPokemonID = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

// Function to fetch and display the Pokémon's details
const displayDetails = async () => {
  const pokemonId = getPokemonID();

  if (!pokemonId) {
    pokemonDetailsContainer.innerHTML = `<p>No Pokémon specified.</p>`;
    return;
  }

  try {
    const response = await fetch(`${API_URL}${pokemonId}`);
    if (!response.ok) {
      throw new Error("Pokémon not found");
    }
    const pokemonData = await response.json();
    renderPokemonDetails(pokemonData);
  } catch (error) {
    console.error("Failed to fetch Pokémon details:", error);
    pokemonDetailsContainer.innerHTML = `
      <div class="text-red-500 font-semibold text-center mt-10">
        Failed to load Pokémon data. Please try again.
      </div>
    `;
  }
};

// Function to render the detailed view of the Pokémon
const renderPokemonDetails = (pokemonData) => {
  const types = pokemonData.types // this is fakin great!
    .map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)) // more styling than in css
    .join(", ");

  const abilities = pokemonData.abilities
    .map(
      (a) => a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1) // yeah, copy-paste!
    ) // prettier is ridiculous LMAO!
    .join(", ");

  const stats = pokemonData.stats // mapping the stats, can't see any order in it tbh
    .map(
      (s) => `
    <li class="capitalize mb-1">
      <strong>${s.stat.name.replace("-", " ")}:</strong> ${s.base_stat}
    </li>
  `
    )
    .join(""); // so, schokocreme drauf... :3

  pokemonDetailsContainer.innerHTML = `
    <div class="flex flex-col md:flex-row items-center justify-center p-4">
    <div class="md:w-1/2 p-4">
        <h2 class="text-3xl font-bold capitalize mb-2 bg-gray-100 rounded-lg">
        ${pokemonData.name}
        </h2>

        <p class="text-lg mb-1">
        <strong>Height:</strong> ${pokemonData.height / 10} m
        </p>
        <p class="text-lg mb-1">
        <strong>Weight:</strong> ${pokemonData.weight / 10} kg
        </p>
        <p class="text-lg mb-1"><strong>Type(s):</strong> ${types}</p>
        <p class="text-lg mb-1"><strong>Abilities:</strong> ${abilities}</p>
    </div>

    <div class="md:w-1/2 flex justify-center p-4">
        <img
        src="${pokemonData.sprites.other.dream_world.front_default}"
        alt="Image of ${pokemonData.name}"
        class="object-contain"
        />
    </div>
    </div>

    <div class="md:w-1/2 p-4">
    <div class="bg-gray-100 rounded-lg p-4">
        <h3 class="text-xl font-semibold mb-2">Base Stats:</h3>
        <ul class="pokemon-list">
        ${stats}
        </ul>
    </div>
    </div>

    <div class="mt-4">
    <a href="index.html" class="inline-block text-amber-300"
        >&larr; Back to all Pokémon</a
    >
    </div>
    <audio src="${pokemonData.cries.latest}" autoplay volume="0.5"></audio>
  `;
};

// calling the function when the window loads
window.onload = displayDetails;
