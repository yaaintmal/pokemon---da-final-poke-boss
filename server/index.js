#!/usr/bin/env node

// imports
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
// ofc there's already a small github repo for easy use of pokeapi
import Pokedex from 'pokedex-promise-v2';

const P = new Pokedex();

const app = express();
// Define CORS options to allow only frontend on port 3003
const corsOptions = {
  origin: 'http://localhost:3003', // Only allow frontend
  methods: ['GET', 'POST'], // Only allow safe methods used by your API
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With'
  ], // Only allow necessary headers
  exposedHeaders: [], // No custom headers exposed
  credentials: false, // Do not allow cookies or credentials by default
  maxAge: 0, // Disable preflight caching for stricter control
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatPokemon(res) {
  const stats = {};
  res.stats.forEach(s => { stats[s.stat.name] = s.base_stat; });
  return {
    id: res.id,
    name: res.name,
    height: res.height,
    weight: res.weight,
    sprites: res.sprites,
    stats,
  };
}

// checking name of the pokemon
// GET /api/pokemon/:nameOrId
app.get('/api/pokemon/:name', async (req, res) => {
  const name = req.params.name;
  try {
    const p = await P.getPokemonByName(name.toString().toLowerCase());
    res.json(formatPokemon(p));
  } catch (err) {
    res.status(404).json({ error: 'Pokémon not found', message: err.message });
  }
});


// we need a pokemon array for the cpu... we won't cheat, we randomize to praise the WHOLY RNGeZuZ 🙌🏽
// POST /api/random { count: 4, excludeIds: [] }
app.post('/api/random', async (req, res) => {
  const count = parseInt(req.body.count, 10) || 4;
  const exclude = Array.isArray(req.body.excludeIds) ? req.body.excludeIds.map(Number) : [];
  const picks = [];
  while (picks.length < count) {
    const id = getRandomIntInclusive(1, 898);
    if (exclude.includes(id) || picks.find(p => p.id === id)) continue;
    try {
      const p = await P.getPokemonByName(id);
      picks.push(formatPokemon(p));
    } catch (e) {
      // ignore and retry
    }
  }
  res.json(picks);
});

// DOOM-themed quote prompts (famous DOOM game quotes) >> posted after each round :3
const doomQuotes = [
  "Rip and tear until it is done.",
  "They are huge, and they are fast.",
  "Shoot rockets, it's easier.",
  "In the first age, in the first battle, when the shadows first lengthened...",
  "That demon is tougher than a two-dollar steak.",
  "A chainsaw? Find something bigger.",
  "The only thing they fear is you.",
];

function getRandomDoomQuote() {
  return doomQuotes[Math.floor(Math.random() * doomQuotes.length)];
}

// POST /api/notes { stat: 'attack', pokemon: {name, stats} }
// If an OLLAMA_URL env var is set, forward the request to that server for a hilarious DOOM-themed Pokémon quote.
// Otherwise return a canned DOOM quote.
app.post('/api/notes', async (req, res) => {
  const { stat, pokemon } = req.body || {};
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  
  try {
    // Quick health check to Ollama
    const health = await fetch(ollamaUrl + '/api/tags')
      .then(r => r.ok ? 'ok' : null)
      .catch(() => null);
    
    if (!health) throw new Error('Ollama not available');
    
    // Prompt Ollama to generate a hilarious DOOM-themed Pokémon quote
    const pokemonName = (pokemon && pokemon.name) ? pokemon.name : 'this Pokémon';
    const doomQuote = getRandomDoomQuote();
    const prompt = `You are the Doom Slayer commenting on Pokémon battles. Create a hilarious, meme-worthy one-liner about ${pokemonName}'s ${stat} stat using this DOOM quote as inspiration: "${doomQuote}". Keep it funny and under 50 words. Make it sound like the Doom Slayer is judging Pokémon stats.`;
    
    const response = await fetch(ollamaUrl + '/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt: prompt,
        stream: false,
      }),
    });
    
    if (!response.ok) throw new Error('Ollama generation failed');
    const data = await response.json();
    res.json({ source: 'ollama', note: data.response || 'The battle rages on...' });
  } catch (err) {
    // Fallback: combine a random DOOM quote with the Pokémon stat
    const pokemonName = (pokemon && pokemon.name) ? pokemon.name : 'this legendary beast';
    const fallbackNote = `${getRandomDoomQuote()} [${pokemonName}'s ${stat} is LEGENDARY]`;
    res.json({ source: 'fallback', note: fallbackNote });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port or kill the process using it.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
