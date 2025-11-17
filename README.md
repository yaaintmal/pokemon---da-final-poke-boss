# PokéDojo — DOOM-Inspired Pokémon Tournament (React + Express + MongoDB)

A cinematic, arcade-style Pokémon battle tournament with Tekken-inspired countdowns, comic panels, randomized victory cries, and DOOM-themed quotes. Features a complete tournament bracket system with automatic progression.

## Features

- **🎮 Full Tournament System**: Single-elimination bracket with automatic round progression
- **⏰ Tekken-Style Countdown**: Dramatic 5-second countdown showing both fighters before each battle
- **🎭 Comic Book Battles**: Multi-panel comic sequences for each fight phase
- **🎵 Randomized Victory Cries**: Each Pokémon uses either latest or legacy cry randomly
- **💬 DOOM-Themed Quotes**: 150+ atmospheric victory quotes inspired by DOOM Slayer
- **🏆 Winner/Loser Tiles**: Green winner tiles and red loser tiles in result comics
- **💾 Local MongoDB Cache**: All 1000+ Pokémon cached locally for fast loading
- **🎨 Arcade Styling**: Neon glow effects, retro fonts, and immersive UI
- **♿ Accessibility**: ARIA live regions, keyboard navigation, screen reader support

## Architecture

- `server/` — Express server with MongoDB cache for Pokémon data and DOOM quote generation
- `frontend/` — Vite + React tournament interface with comic panels and audio
- `playground/` — Standalone CLI version for testing
- `poki-api/` — API documentation and examples

## Prerequisites

- **Node.js** (v16+ recommended)
- **MongoDB** running locally (default: `mongodb://localhost:27017`)
- **Optional**: Ollama for enhanced DOOM quotes (`ollama pull mistral`)

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies (root, server, frontend)
npm install
cd server && npm install
cd ../frontend && npm install
cd ..
```

### 2. Start MongoDB

Ensure MongoDB is running locally:

```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or using local installation
mongod
```

### 3. Prefetch All Pokémon Data

Preload all ~1000 Pokémon into your local MongoDB cache:

```bash
# Install batch loader dependencies
cd server && npm install mongodb axios

# Run the batch loader (this may take 5-10 minutes)
node scripts/pokemon_batch_load.js
```

This creates a `pokemons` collection in your `pokedb` database with complete data for all Pokémon.

### 4. Start the Application

```bash
# Start both server and frontend
npm run dev

# Or run separately:
npm run start:server    # Backend on http://localhost:5000
cd frontend && npm run dev  # Frontend on http://localhost:5173
```

### 5. Play the Game

1. Open `http://localhost:5173`
2. Select tournament size (8, 16, 32, or 64 Pokémon)
3. Pick your favorite Pokémon from the full 1000+ collection
4. Watch the Tekken-style countdown and enjoy the tournament!

## Game Flow

1. **Team Selection**: Choose tournament size and select Pokémon from the complete database
2. **Countdown**: Dramatic 5-second countdown showing both fighters
3. **Intro Comic**: Fighter introductions with stats
4. **Fight Comic**: Battle preparations
5. **Result Comic**: Winner (green tile) vs Loser (red tile) with stats
6. **Celebration**: DOOM victory quote + randomized Pokemon cry
7. **Auto-Progression**: Seamless advancement to next round

## Data Management

### MongoDB Cache Schema

Collection: `pokemons` (database: `pokedb`)

```javascript
{
  _id: Number,        // Pokemon ID (1-1000+)
  name: String,       // Pokemon name
  image: String,      // Sprite URL
  hp: Number,         // Base HP stat
  atk: Number,        // Attack
  def: Number,        // Defense
  spa: Number,        // Special Attack
  spd: Number,        // Special Defense
  spe: Number,        // Speed
  height: Number,     // Height in decimeters
  weight: Number,     // Weight in hectograms
  latest: String,     // Latest cry URL (optional)
  legacy: String,     // Legacy cry URL (optional)
  audioUrl: String,   // Selected cry URL
  types: [String],    // Pokemon types
  cachedAt: Date      // Cache timestamp
}
```

### API Endpoints

- `GET /api/pokemons?limit=N&offset=M&cached=true` - Get cached Pokémon
- `POST /api/pokemons/batch-refresh` - Refresh specific Pokémon IDs
- `POST /game/create` - Create new tournament game
- `GET /health` - Server health check

### Batch Loading Script

The `scripts/pokemon_batch_load.js` script:
- Fetches Pokémon in batches of 50 with 5 concurrent requests
- Respects PokéAPI rate limits with delays
- Upserts data into MongoDB by `_id`
- Includes complete stats, types, and cry URLs

## DOOM-Themed Victory Quotes

The game features 150+ atmospheric victory quotes inspired by the DOOM Slayer. Quotes are generated using either:

### Ollama Integration (Enhanced)

If Ollama is running locally, the server generates dynamic, hilarious quotes:

```bash
# Start Ollama server
ollama serve

# Pull Mistral model
ollama pull mistral
```

Set custom Ollama URL if needed:
```bash
OLLAMA_URL=http://192.168.1.100:11434 npm run start:server
```

### Fallback Quotes (Always Available)

150 curated DOOM-inspired quotes including:
- "The only good demon is a shredded demon."
- "You were inconvenient."
- "Silence is restored."
- "Check your inventory—you're missing a soul."
- "Another debt paid in blood."
- "Did that count as exercise?"
- "That was merely the warm-up."
- "Rest in pieces."
- "Welcome to the eternal dirt nap."
- "Next."
- "This is my final word."
- "Just another Tuesday."
- "You fought like a tourist."
- "I'm not locked in here with you; you're locked in here with me."
- "The Super Shotgun sends its regards."
- "Enjoy the silence of your own failure."
- "Stay down."
- "Objective complete: Exterminate."
- "You should have brought friends."
- "That's how you remove a heart."
- "Too slow."
- "Pathetic."
- "Now, where's the next portal?"
- "You've been processed."
- "The only peace you'll find is extinction."
- "Try again in a millennium."
- "Just another casualty of the war."
- "I don't bleed, but you do."
- "You picked the wrong fight."
- "My therapy is complete."
- "Your existence was a minor inconvenience."
- "The fun part is over for you."
- "Another false idol shattered."
- "Back to the abyss, maggot."
- "Your screams are fuel."
- "Clean up, aisle Hell."
- "I'm just getting started."
- "Is that all you had?"
- "Found your weakness: me."
- "You're extinct now."
- "The deed is done."
- "Wipe the blood and move on."
- "You're dismissed."
- "This wasn't a duel; it was a disposal."
- "I'm the ultimate answer."
- "Your throne is broken."
- "All resistance is futile."
- "The Rip and Tear continues."
- "I expected more resistance."
- "Just a stain on the floor."
- "The only reward is death."
- "I am the reckoning."
- "The clock stops now."
- "You are irrelevant."
- "Don't worry, it'll heal... never."
- "Another one for the collection."
- "My boots needed shining."
- "The prophecy was wrong."
- "The Doom Slayer has arrived."
- "Look what the cat dragged in—and killed."
- "A good death is a fast death. This was neither."
- "I never asked for your name."
- "The crucible is cold."
- "Feel the weight of your trespass."
- "It's always a shame when they break."
- "Just dust and guts now."
- "I'm done talking."
- "You cease to be."
- "Is the arena ready for the next dance?"
- "You got what you deserved."
- "Your legacy is this mess."
- "Another tyrant falls."
- "I am the storm."
- "Never bring a spell to a gunfight."
- "Consider this your final lesson."
- "Error: Boss health zero."
- "The blood is still fresh."
- "Do not mistake patience for mercy."
- "Every god bleeds."
- "Did you truly think you could win?"
- "Your pain is temporary, mine is eternal."
- "I'm out of bubblegum."
- "The Icon of Sin just got a little less iconic."
- "Demons don't understand subtraction."
- "Revenge is a messy business."
- "This planet is now condemned."
- "I'm bored now."
- "You just wasted my time."
- "The price of hubris."
- "The fire is out."
- "Reloading the BFG."
- "You died well enough."
- "My fist is the last thing you'll see."
- "Nothing left to salvage."
- "Welcome to the end."
- "Should have run faster."
- "I'll take that as a surrender."
- "The only master here is me."
- "You taste like fear."
- "Back to the drawing board... for the Creator."
- "Another tick on the kill count."
- "Is there a harder difficulty?"
- "That was not a request for peace."
- "You're in my way."
- "The harvest is plentiful."
- "I am the predator."
- "Your fear is justified."
- "Consider the terms of surrender declined."
- "This universe is mine."
- "I have no rival."
- "The chains are broken."
- "You had your chance."
- "I'm not forgiving you."
- "You're charcoal now."
- "The darkness recedes."
- "The machine works."
- "Don't mourn, organize."
- "You were never a challenge."
- "The bell tolls for thee."
- "Now for the rest of your kin."
- "The only end I see is yours."
- "Your reign is over."
- "I've faced worse indigestion."
- "I'll be seeing you, or what's left of you."
- "The harvest is in."
- "I needed that."
- "Just another line on the ledger."
- "You're canceled."
- "The power fantasy is real."
- "I am violence incarnate."
- "You picked the wrong dimension."
- "Your suffering is a monument."
- "No witnesses."
- "The only way out is through me."
- "Welcome to the kill floor."
- "The reckoning is here."
- "I brought the pain."
- "You are beneath my contempt."
- "Just a footnote in my rampage."
- "This is for the mortals."
- "The hammer fell."
- "I'll send your regards to the rest of them."
- "I am the last hope."
- "Your final breath was earned."
- "Your immortality failed."
- "My job description is very simple."
- "Too much talking."
- "The end of your existence is now."
- "You've been weighed and found wanting."
- "I don't negotiate with demons."
- "Rest in hell."
- "The cycle continues."
- "Your soul is forfeit."

## Tournament Features

### Game Modes
- **Single Elimination**: Classic tournament bracket with automatic round progression
- **Team Sizes**: 8, 16, 32, or 64 Pokémon tournaments
- **Auto-Progression**: No manual intervention needed between rounds

### Battle System
- **Stat-Based Combat**: HP, Attack, Defense, Special Attack, Special Defense, Speed
- **Deterministic Fights**: Same stats always produce same outcomes
- **Comic Panels**: Multi-panel battle sequences for each fight phase
- **Victory Celebrations**: DOOM quotes + randomized Pokemon cries

### UI Features
- **Countdown Overlay**: Tekken-style 5-second countdown showing both fighters
- **Winner/Loser Tiles**: Green winner tiles (🏆) and red loser tiles (💀) in results
- **Audio Controls**: Manual play buttons for Pokemon cries
- **Arcade Styling**: Neon glows, retro fonts, and immersive effects
- **Responsive Design**: Works on desktop and mobile devices

### Controls
- **Tournament Setup**: Select size and choose Pokemon from the complete database
- **Fight Resolution**: Click "Start Round" to begin countdown and battle
- **Audio**: Click speaker icons to play Pokemon cries manually
- **Navigation**: Keyboard accessible with proper focus management

## Development

### Project Structure
```
├── server/           # Express backend with MongoDB cache
│   ├── index.js      # Main server with API routes
│   └── scripts/      # Batch loading utilities
├── frontend/         # React tournament interface
│   ├── src/
│   │   ├── game/     # Tournament components
│   │   ├── landing/  # Team selection
│   │   └── contexts/ # Game state management
└── playground/       # CLI version for testing
```

### Environment Variables
- `OLLAMA_URL`: Custom Ollama server URL (default: http://localhost:11434)
- `MONGO_URI`: MongoDB connection string (default: mongodb://localhost:27017)
- `PORT`: Server port (default: 5000)

### Building for Production
```bash
# Build frontend
cd frontend && npm run build

# Start production server
npm run start:server
```

# Pokémon Quartett (playground)

This small repository contains a CLI implementation of a simple "Pokémon Quartett" game.

Files:
- `playground/index.js` — the Node.js (CommonJS) CLI game that uses `pokedex-promise-v2`.

Quick start

1. From the `wbs` directory, install dependencies:

```bash
# from /home/malone/tutors/wbs
npm install
```

2. Run the game:

```bash
npm start
```

Game notes
- The game fetches Pokémon data from the PokéAPI via `pokedex-promise-v2`.
- By default it draws random Pokémon from the original 1–151 range.
- You will be prompted to choose a stat to compare (HP, Attack, Defense, Special Attack, Special Defense, Speed).

If you want to change the range (e.g. include later generations), edit `playground/index.js` and adjust the `maxId` value passed to `playRound()`.

Note: This repository also contains a separate CLI playground under `/playground` that implements a different Pokémon Quartett CLI game. It is independent from the React+Express app described above and may have different setup and run steps.
