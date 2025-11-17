// You can work here or download the template
const API_URL = "https://pokeapi.co/api/v2/pokemon/";

const pokemonContainer = document.getElementById("pokemon-container");

// fetching first 150 Pokémons
const fetchPokemonData = async () => {
  // Clear any previous content
  pokemonContainer.innerHTML = "";

  // Adding load-spinner while we're fetching
  const loadingSpinner = document.createElement("div");
  loadingSpinner.className =
    "w-16 h-16 border-4 border-dashed rounded-full animate-spin border-yellow-500 mt-20";
  pokemonContainer.appendChild(loadingSpinner);

  try {
    const pokemonPromises = [];
    for (let i = 1; i <= 150; i++) {
      pokemonPromises.push(fetch(`${API_URL}${i}`).then((res) => res.json()));
    }

    const allPokemon = await Promise.all(pokemonPromises);

    // Remove the spinner after data is fetched
    loadingSpinner.remove();

    allPokemon.forEach((pokemon) => {
      createPokemonCard(pokemon);
    });
  } catch (error) {
    console.error("Failed to fetch Pokémon data:", error);
    pokemonContainer.innerHTML = `
            <div class="text-red-500 font-semibold text-center col-span-full mt-10 ">
              Failed to load Pokémon data. Please try again later.
            </div>
          `;
  }
};

// Function to create a card for a single Pokémon and getting type
const createPokemonCard = (pokemonData) => {
  const type = pokemonData.types[0].type.name;

  console.log(pokemonData);

  const cardURL = pokemonData.cardURL;

  // since all pokes seems to have a special type (wasn't really into dat), we use a color map for type-based card styling
  const typeColors = {
    fire: "bg-red-500",
    water: "bg-blue-600",
    grass: "bg-green-500",
    electric: "bg-cyan-400",
    bug: "bg-violet-700",
    normal: "bg-gray-500",
    poison: "bg-lime-500",
    ground: "bg-amber-700",
    fairy: "bg-pink-400",
    fighting: "bg-orange-600",
    psychic: "bg-fuchsia-600",
    rock: "bg-stone-500",
    ghost: "bg-indigo-700",
    ice: "bg-cyan-300",
    dragon: "bg-indigo-900",
    dark: "bg-neutral-800",
    steel: "bg-slate-500",
    flying: "bg-sky-400",
  };
  const typeColorClass = typeColors[type] || "bg-gray-500";

  // creaing main card element...
  const card = document.createElement("div");
  card.className = `pokemon-card grayscale-75 hover:grayscale-0 transition-all transform transition-transform duration-300 hover:scale-105 ${typeColorClass} rounded-lg shadow-xl p-4 flex flex-col items-center cursor-pointer saturate-50 hover:saturate-100`;

  // and the image element with alt text and even a fallback
  const image = document.createElement("img");
  image.src = pokemonData.sprites.front_default;
  image.alt = `Image of ${pokemonData.name}`;
  image.className = "w-28 h-28 object-contain mb-2";

  // ofc also a name element
  const name = document.createElement("h2");
  name.textContent =
    pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);
  name.className = "text-xl font-bold mb-1";

  // damn, each of dem has it's own type
  const typeElement = document.createElement("p");
  typeElement.textContent = `Type: ${
    type.charAt(0).toUpperCase() + type.slice(1)
  }`;
  typeElement.className = "text-sm text-gray-100 opacity-80";

  // appending all elements to the card
  card.appendChild(image);
  card.appendChild(name);
  card.appendChild(typeElement);

  // adding a click event listener
  card.addEventListener("click", () => {
    window.location.href = `poki-details.html?id=${pokemonData.id}`;
  });

  // Append the card to the main container
  pokemonContainer.appendChild(card);
};

// Call the function to start the process when the window loads
window.onload = () => {
  fetchPokemonData();
};
