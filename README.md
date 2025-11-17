# 🎮 PokéDojo — Arcade-Style Pokémon Tournament Battle Arena

A full-stack, cinematic Pokémon tournament battle system featuring Tekken-style countdowns, comic book fight sequences, authentic Pokemon warcries, DOOM-themed victory quotes, and persistent battle statistics tracked in MongoDB.

## ✨ Features

### Core Gameplay
- **🏆 Full Tournament Bracket System** - Single-elimination tournaments with automatic round progression
- **⏰ Tekken-Style Countdowns** - Dramatic 5-second countdown showing both fighters before battle
- **🎭 Comic Book Sequences** - Multi-panel comic panels for intro, fight, and result phases
- **🎵 Authentic Pokemon Warcries** - Each Pokémon plays their official cry from PokéAPI at battle start AND after victory
- **💬 DOOM-Themed Victory Quotes** - 7+ atmospheric quotes inspired by DOOM Slayer, with optional Ollama AI generation
- **📊 Career Statistics** - Track total victories, defeats, and win rates for each Pokémon across all tournaments
- **🎨 Arcade UI** - Neon glow effects, retro fonts, dark themes, and immersive animations

### Technical Features
- **📦 Local MongoDB Cache** - All 1000+ Pokémon preloaded with stats, images, and warcry URLs
- **⚡ Zero-Wait Pokémon Selection** - Instant filtering across entire Pokémon database
- **🎵 25% Background Music** - Pokémon background track plays at low volume during gameplay
- **🔄 Persistent Battle History** - Every battle saved to MongoDB for leaderboards and statistics
- **📱 Responsive Design** - FIFA-like player cards with stat bars and visual indicators
- **🚀 ESM Modules** - Modern ES6 syntax throughout (no CommonJS)

## 🏗️ Project Structure

```
playground/
├── server/                      # Express backend + MongoDB integration
│   ├── index.js                 # Main server with battle & Pokémon endpoints
│   ├── pokemonRepository.js     # MongoDB Pokémon queries
│   ├── scripts/
│   │   └── seed-pokemon.js      # Fetch all Pokémon from PokéAPI → MongoDB
│   └── package.json
├── frontend/                    # React + Vite + Tailwind
│   ├── src/
│   │   ├── game/
│   │   │   ├── GameScreen.jsx   # Main tournament logic + background music
│   │   │   ├── FinalWinner.jsx  # Champion screen with career stats
│   │   │   ├── PokemonStats.jsx # Career win/loss statistics
│   │   │   ├── Celebration.jsx  # Round winner celebration + warcry
│   │   │   ├── ComicPage.jsx    # Comic panel sequences
│   │   │   └── CountdownOverlay.jsx  # 5-second countdown
│   │   ├── landing/
│   │   │   └── TournamentSetup.jsx   # Pokémon selection from full 1000+
│   │   ├── components/
│   │   │   └── PlayerCard.jsx        # FIFA-style Pokémon card
│   │   └── styles.css
│   └── package.json
├── poki-api/                    # Example Pokémon API utilities
└── README.md (this file)
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally (default: `mongodb://localhost:27017`)
- **Optional**: Ollama server for AI DOOM quotes (`ollama pull mistral`)

### 1️⃣ Install Dependencies

```bash
# Root dependencies
npm install

# Server dependencies
cd server && npm install && cd ..

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 2️⃣ Configure Environment Variables

Copy the example files and customize for your setup:

```bash
# Server configuration
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URL and Ollama settings

# Frontend configuration
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local with your API URL and multiplier range
```

**Quick Reference:**
- `server/.env` - MongoDB connection, server port, Ollama settings
- `frontend/.env.local` - API URL, stat multiplier min/max values

### 3️⃣ Start MongoDB

```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name pokemon-db mongo:latest

# Or with local MongoDB installation
mongod
```

### 3️⃣ Seed Pokémon Database (First Time Only)

This preloads all ~1025 Pokémon into MongoDB with stats and warcry URLs (~10 minutes):

```bash
cd server
npm run seed-pokemon
cd ..
```

**What the seed script does:**
- Fetches all Pokémon from PokéAPI in batches of 50
- Stores complete data: stats, image URLs, warcry URLs (latest + legacy)
- Respects API rate limits with 500ms delays between batches
- Creates MongoDB indexes for fast lookups

### 4️⃣ Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm start
# Server listening on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend running on http://localhost:5173
```

### 5️⃣ Play!

1. Open `http://localhost:5173` in your browser
2. Select tournament size (8, 16, 32, or 64 Pokémon)
3. Choose your fighters from the searchable database of 1000+ Pokémon
4. Watch the arcade-style tournament unfold!

## 🔌 API Endpoints

### Pokémon Data
- `GET /api/pokemon/:nameOrId` - Get single Pokémon by name or ID
- `GET /api/pokemon-list?search=query` - List all Pokémon (with optional search)
- `POST /api/random` - Get N random Pokémon (body: `{ count: 4 }`)

### Battle Persistence
- `POST /api/battles` - Save battle result to MongoDB
- `GET /api/battles/stats` - Get all-time battle statistics
- `GET /api/pokemon-stats` - Get per-Pokémon win/loss statistics

### DOOM Quotes
- `POST /api/notes` - Generate DOOM-themed victory quote (Ollama or fallback)

## 🎵 Audio Features

### Warcries
- **Timing**: Fighter A warcry → Fighter B warcry → (battle) → Winner warcry
- **Source**: MongoDB-cached URLs from official PokéAPI `cries` endpoint
- **Fallback**: If warcry unavailable, silently skipped
- **Volume**: 100% (full volume for impact)

### Background Music
- **File**: `frontend/public/sounds/pokemon.mp3`
- **Volume**: 25% (0.25) - subtle background presence
- **Loop**: Continuous throughout tournament, pauses when complete
- **Control**: Auto-plays on game start, pauses on completion

## 🛠️ Development

### Environment Variables & Setup

#### Server Environment (`.env`)

Create a `.env` file in the `server/` directory with the following values:

```bash
# Server Configuration
PORT=3001

# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
MONGO_DB=pokemon_battles

# Ollama Configuration (Optional - for AI DOOM quotes)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Environment
NODE_ENV=development
```

**Example `.env.production`:**
```bash
PORT=3001
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
MONGO_DB=pokemon_battles
OLLAMA_URL=http://ollama-server:11434
NODE_ENV=production
```

#### Frontend Environment (`.env` or `.env.local`)

Create a `.env.local` file in the `frontend/` directory:

```bash
# API Configuration
VITE_API_URL=http://localhost:3001

# Battle System Configuration
# Pokémon stat multiplier range - affects battle balance
# Lower min = weaker Pokémon possible, Higher max = stronger variations
VITE_STAT_MULTIPLIER_MIN=0.6
VITE_STAT_MULTIPLIER_MAX=1.87

# Optional: Environment indicator
VITE_ENV=development
```

**Example `.env.production`:**
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_STAT_MULTIPLIER_MIN=0.6
VITE_STAT_MULTIPLIER_MAX=1.87
VITE_ENV=production
```

**Multiplier Range Explanations:**
- `VITE_STAT_MULTIPLIER_MIN`: Minimum multiplier applied to Pokémon stats (default: `0.6`)
  - Lower values = more variation, weaker Pokémon have better chances
  - Suggested range: 0.5 - 0.8
- `VITE_STAT_MULTIPLIER_MAX`: Maximum multiplier applied to Pokémon stats (default: `1.87`)
  - Higher values = more extreme stat variations, wild upsets possible
  - Suggested range: 1.5 - 2.0
- Each Pokémon receives a random multiplier in this range at the start of each round
- Multipliers are displayed during countdown so players know the odds

### `.gitignore` Files

Each folder has a `.gitignore` to protect sensitive files:
- **Root `.gitignore`**: Ignores node_modules, build output, .env files, IDE files
- **`server/.gitignore`**: Ignores MongoDB seed progress, server logs
- **`frontend/.gitignore`**: Ignores Vite cache, build artifacts

**Never commit:**
- `.env` files with credentials
- `node_modules/` directories
- Build output (`dist/`, `build/`)
- IDE settings (`.vscode/`, `.idea/`)
- Log files

### Running Scripts

```bash
# Seed Pokémon database
cd server && npm run seed-pokemon

# Start server
npm run start

# Build frontend
cd frontend && npm run build

# Run tests
cd frontend && npm test
```

### Code Style

- **ESM Modules**: All code uses `import`/`export` (no CommonJS)
- **Indentation**: 2 spaces
- **Components**: Functional with React hooks
- **Styling**: Tailwind CSS + inline styles
- **State**: React Context for global state, hooks for local state

## 📈 Performance

### Pokémon Loading
- **On Startup**: All 1000+ Pokémon loaded from MongoDB on first seed (~10 min)
- **Subsequent Starts**: Instant (data already in MongoDB)
- **Search**: <50ms across entire dataset (MongoDB indexed on `name`)

### Battle Resolution
- **Fight Calculation**: <10ms deterministic algorithm
- **Audio Playback**: Warcries play sequentially (1-3 seconds per cry)
- **UI Rendering**: Sub-100ms with React optimizations

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
lsof -i :27017

# Start MongoDB if needed
docker run -d -p 27017:27017 mongo:latest
```

### Pokémon Collection Empty
```bash
# Re-run seed script
cd server && npm run seed-pokemon
```

### Warcries Not Playing
- Check browser console for fetch errors
- Verify `cries.latest` or `cries.legacy` URLs are valid
- Browser autoplay policies may require user interaction first

### Background Music Not Playing
- Verify `frontend/public/sounds/pokemon.mp3` exists
- Check browser's autoplay policy (may require user click)
- Check browser console for audio errors

## 📚 Architecture

### Server-Side
- **pokemonRepository.js**: Centralized MongoDB queries (getPokemonById, getPokemonByName, getRandomPokemon, etc.)
- **seed-pokemon.js**: Batch fetches all Pokémon from PokéAPI with rate-limit respecting
- **Battle Calculation**: Deterministic algorithm based on base stats and type matchups

### Frontend State
- **GameStateContext**: Global tournament state (fighters, rounds, phase, started)
- **Component Hierarchy**: TournamentSetup → GameScreen → Phase Components (CountdownOverlay, ComicPage, Celebration)
- **Audio Management**: useRef for background music, async/await for warcry sequencing

## 📚 References

- **PokéAPI**: https://pokeapi.co/api/v2/
- **Pokémon Data**: https://pokeapi.co/api/v2/pokemon?limit=100000
- **MongoDB**: https://www.mongodb.com/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **Tailwind CSS**: https://tailwindcss.com/

## 🎯 Future Enhancements

- [ ] Leaderboard UI to display top Pokémon by win rate
- [ ] Advanced statistics (damage averages, type matchups)
- [ ] Multiplayer tournaments (local split-screen)
- [ ] Pokémon team customization (held items, abilities)
- [ ] Save/load game states
- [ ] Custom DOOM quote input
- [ ] Sound effect packs (arcade, 8-bit, etc.)
- [ ] Mobile-responsive tournament visualization

## 📝 License

MIT - Feel free to use, modify, and distribute!

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Made with ❤️ for Pokémon fans and arcade enthusiasts** 🎮✨
