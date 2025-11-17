# Pokémon Quartett (React + Express)

This workspace contains a small fullstack prototype:

- `server/` — Express server using `pokedex-promise-v2` to fetch Pokémon data and a notes endpoint that proxies to a local Ollama server for hilarious DOOM-themed Pokémon commentary.
- `frontend/` — Vite + React minimal frontend where the user can enter Pokémon names, generate random teams and play quick duels.

## Features

- **ESNext Modules**: The entire project uses modern ESM (`import`/`export`) syntax — no CommonJS `require()`.
- **DOOM-Themed Quotes**: After each battle round, the server generates hilarious, meme-worthy Pokémon commentary inspired by famous DOOM game quotes using a local Ollama server.
- **Ollama Integration**: The server attempts to connect to a local Ollama instance at `http://localhost:11434` (configurable via `OLLAMA_URL` env var). If unavailable, it falls back to canned DOOM quotes.

## Quick start

1. From the project root, install dependencies and start the app:

```bash
npm install
npm run dev
```

2. Start the app (server + frontend):

```bash
npm run dev
# or run separately
npm run start:server
cd frontend && npm run dev
```

3. Open `http://localhost:5173` to view the frontend. The frontend talks to the backend at `http://localhost:5000` by default (the port can be changed via the server). If you run on different ports, update the API base URL in the frontend (e.g. `frontend/src/App.jsx`).

## Ollama Integration

The server exposes `POST /api/notes` which will:

1. **With Ollama running**: Attempt to contact an Ollama server at `http://localhost:11434` (or at `process.env.OLLAMA_URL`). If available, it sends a prompt to generate a DOOM-themed Pokémon battle commentary. The prompt uses the Mistral model to create a funny, one-liner quote combining DOOM game references with Pokémon stat commentary.

2. **Without Ollama**: Return a fallback quote combining a random DOOM quote with the Pokémon's stat (e.g., "Rip and tear until it is done. [Charizard's attack is LEGENDARY]").

### Setting up Ollama

If you have Ollama installed locally:

```bash
# Start Ollama server (runs on port 11434 by default)
ollama serve

# In another terminal, pull a model (e.g., Mistral)
ollama pull mistral
```

The server will automatically detect Ollama and start generating funny quotes. Set `OLLAMA_URL` environment variable to point to a different Ollama instance if needed:

```bash
OLLAMA_URL=http://192.168.1.100:11434 npm run start:server
```

### DOOM Quotes

The server has a curated list of iconic DOOM game quotes that it randomly selects and provides to Ollama for inspiration:

- "Rip and tear until it is done."
- "They are huge, and they are fast."
- "Shoot rockets, it's easier."
- "In the first age, in the first battle, when the shadows first lengthened..."
- "That demon is tougher than a two-dollar steak."
- "A chainsaw? Find something bigger."
- "The only thing they fear is you."
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
