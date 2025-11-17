#!/usr/bin/env node
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { 
  setPokemonCollection, 
  getPokemonById, 
  getPokemonByName, 
  getAllPokemon, 
  searchPokemon, 
  getRandomPokemon,
  getTotalPokemonCount
} from './pokemonRepository.js';

const app = express();
app.use(bodyParser.json());

// CORS configuration - allow frontend on ports 3003 and 3009, backend on port 3006
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3003',
      'http://localhost:3009',
      'http://localhost:5173', // Vite dev server default port
      'http://localhost:3001',  // Local backend
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const MONGO_DB = process.env.MONGO_DB || 'pokemon_battles';
let db = null;
let battles = null;
let mongoClient = null;

async function initMongo() {
  try {
    mongoClient = new MongoClient(MONGO_URL);
    await mongoClient.connect();
    db = mongoClient.db(MONGO_DB);
    battles = db.collection('battles');
    
    // Initialize Pokemon collection for repository
    const pokemonCollection = db.collection('pokemon');
    setPokemonCollection(pokemonCollection);
    
    // Check if pokemon collection has data
    const count = await getTotalPokemonCount();
    if (count === 0) {
      console.warn('Pokemon collection is empty! Run: npm run seed-pokemon');
    } else {
      console.log(`✓ Pokemon collection loaded with ${count} Pokemon`);
    }
    
    console.log('MongoDB connected');
  } catch (err) {
    console.warn('MongoDB connection failed:', err.message);
  }
}

const PORT = process.env.PORT || 3001;

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// GET /api/pokemon/:nameOrId - get a specific Pokémon from MongoDB
app.get('/api/pokemon/:name', async (req, res) => {
  const name = req.params.name;
  try {
    // Try by name first, then by ID
    let p = await getPokemonByName(name);
    if (!p) {
      const id = parseInt(name);
      if (!isNaN(id)) {
        p = await getPokemonById(id);
      }
    }
    if (!p) {
      return res.status(404).json({ error: 'Pokémon not found' });
    }
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Pokémon', message: err.message });
  }
});

// POST /api/random - get random Pokémon from MongoDB
app.post('/api/random', async (req, res) => {
  try {
    const count = parseInt(req.body.count, 10) || 4;
    const picks = await getRandomPokemon(count);
    res.json(picks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch random Pokemon', message: err.message });
  }
});

// GET /api/pokemon-list?search=query - search or list all Pokémon from MongoDB
app.get('/api/pokemon-list', async (req, res) => {
  try {
    const search = req.query.search || '';
    let results;
    if (search) {
      results = await searchPokemon(search, 100);
    } else {
      results = await getAllPokemon();
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Pokemon list', message: err.message });
  }
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

// POST /api/battles - Save a battle result to MongoDB
app.post('/api/battles', async (req, res) => {
  try {
    if (!battles) {
      return res.status(503).json({ error: 'MongoDB not available' });
    }
    
    const { round, fighter1, fighter2, winner, loser, stats, timestamp } = req.body;
    
    if (!fighter1 || !fighter2 || !winner) {
      return res.status(400).json({ error: 'Missing required fields: fighter1, fighter2, winner' });
    }
    
    const battle = {
      round: round || 0,
      fighter1: {
        name: fighter1.name,
        id: fighter1.id,
        hp: fighter1.hp,
        atk: fighter1.atk,
        def: fighter1.def,
        satk: fighter1.satk,
        sdef: fighter1.sdef,
        spd: fighter1.spd,
      },
      fighter2: {
        name: fighter2.name,
        id: fighter2.id,
        hp: fighter2.hp,
        atk: fighter2.atk,
        def: fighter2.def,
        satk: fighter2.satk,
        sdef: fighter2.sdef,
        spd: fighter2.spd,
      },
      winnerName: winner.name,
      winnerId: winner.id,
      loserName: loser?.name || 'Unknown',
      loserId: loser?.id || null,
      stats: stats || {},
      timestamp: timestamp || new Date(),
      createdAt: new Date(),
    };
    
    const result = await battles.insertOne(battle);
    res.json({ success: true, id: result.insertedId, battle });
  } catch (err) {
    console.error('Error saving battle:', err);
    res.status(500).json({ error: 'Failed to save battle', message: err.message });
  }
});

// POST /api/hall-of-fame/increment - increment hall of fame score for a pokemon
app.post('/api/hall-of-fame/increment', async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: 'MongoDB not available' });

    const { id, name } = req.body || {};
    if (!id && !name) return res.status(400).json({ error: 'Missing pokemon id or name' });

    const pokemonCollection = db.collection('pokemon');
    const query = {};
    if (id !== undefined && id !== null) query.id = parseInt(id, 10);
    else query.name = ('' + name).toLowerCase();

    // Use aggregation pipeline to safely initialize and increment hallOfFame
    const pipeline = [
      { $match: query },
      {
        $set: {
          hallOfFame: { $add: [{ $ifNull: ['$hallOfFame', 0] }, 1] }
        }
      }
    ];

    // Use updateOne with pipeline instead
    const result = await pokemonCollection.updateOne(query, [
      {
        $set: {
          hallOfFame: { $add: [{ $ifNull: ['$hallOfFame', 0] }, 1] }
        }
      }
    ]);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Pokemon not found to increment' });
    }

    // Fetch the updated document
    const updated = await pokemonCollection.findOne(query);
    if (!updated) {
      return res.status(404).json({ error: 'Pokemon not found after increment' });
    }
    res.json({ success: true, pokemon: updated });
  } catch (err) {
    console.error('Error incrementing hall of fame:', err);
    res.status(500).json({ error: 'Failed to increment hall of fame', message: err.message });
  }
});

// GET /api/hall-of-fame?limit=15 - return top pokemon by hallOfFame score
app.get('/api/hall-of-fame', async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: 'MongoDB not available' });
    const limit = parseInt(req.query.limit, 10) || 15;
    const pokemonCollection = db.collection('pokemon');
    const docs = await pokemonCollection.find({ hallOfFame: { $gt: 0 } }).sort({ hallOfFame: -1 }).limit(limit).toArray();

    const entries = docs.map(d => ({ id: d.id, name: d.name, image: d.image, hallOfFame: d.hallOfFame || 0 }));
    res.json({ entries });
  } catch (err) {
    console.error('Error fetching hall of fame:', err);
    res.status(500).json({ error: 'Failed to fetch hall of fame', message: err.message });
  }
});

// GET /api/battles/stats - Get battle statistics
app.get('/api/battles/stats', async (req, res) => {
  try {
    if (!battles) {
      return res.status(503).json({ error: 'MongoDB not available' });
    }
    
    const totalBattles = await battles.countDocuments();
    const battles_list = await battles.find({}).toArray();
    const winRates = {};
    
    // Calculate win rates from ALL battles in database
    battles_list.forEach(battle => {
      const winner = battle.winnerName;
      if (!winRates[winner]) {
        winRates[winner] = { wins: 0, losses: 0 };
      }
      winRates[winner].wins++;
      
      const loser = battle.loserName;
      if (loser && loser !== 'Unknown') {
        if (!winRates[loser]) {
          winRates[loser] = { wins: 0, losses: 0 };
        }
        winRates[loser].losses++;
      }
    });
    
    res.json({
      totalBattles,
      winRates,
      recentBattles: battles_list.slice(-20).reverse(),
    });
  } catch (err) {
    console.error('Error fetching battle stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats', message: err.message });
  }
});

// GET /api/pokemon-stats - Get detailed Pokemon statistics (replaces the old endpoint)
app.get('/api/pokemon-stats', async (req, res) => {
  try {
    if (!battles) {
      return res.status(503).json({ error: 'MongoDB not available' });
    }
    
    const battles_list = await battles.find({}).toArray();
    const winRates = {};
    
    // Calculate stats from all battles
    battles_list.forEach(battle => {
      const winner = battle.winnerName;
      if (!winRates[winner]) {
        winRates[winner] = { wins: 0, losses: 0, totalDamageDealt: 0, totalDamageTaken: 0 };
      }
      winRates[winner].wins++;
      if (battle.stats?.totalDamageA !== undefined) {
        winRates[winner].totalDamageDealt += battle.stats.totalDamageA;
      }
      
      const loser = battle.loserName;
      if (loser && loser !== 'Unknown') {
        if (!winRates[loser]) {
          winRates[loser] = { wins: 0, losses: 0, totalDamageDealt: 0, totalDamageTaken: 0 };
        }
        winRates[loser].losses++;
        if (battle.stats?.totalDamageB !== undefined) {
          winRates[loser].totalDamageTaken += battle.stats.totalDamageB;
        }
      }
    });
    
    res.json({
      totalBattles: battles_list.length,
      winRates,
    });
  } catch (err) {
    console.error('Error fetching pokemon stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats', message: err.message });
  }
});

const server = app.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  // Initialize MongoDB
  await initMongo();
  console.log(`Ready to serve!`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port or kill the process using it.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
