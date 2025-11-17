# API Refactoring Summary

## Changes Made

### 1. Created Centralized API Utility (`frontend/src/util/api.js`)
- Single source of truth for all API endpoints
- Uses `VITE_API_URL` environment variable for base URL
- Automatically adjusts for development and production environments
- Provides typed functions for all API calls:
  - `fetchHallOfFame(limit)` - GET leaderboard data
  - `incrementHallOfFame(id, name)` - POST to increment Hall of Fame
  - `saveBattle(battleData)` - POST battle results
  - `fetchPokemonStats()` - GET Pokémon statistics
  - `fetchPokemon(nameOrId)` - GET specific Pokémon data
  - `getRandomPokemon(count)` - POST for random selections
  - `searchPokemon(query)` - GET search results

### 2. Updated Components
- **`Leaderboard.jsx`**: Now uses `fetchHallOfFame()` from API utility
- **`FinalWinner.jsx`**: Now uses `incrementHallOfFame()` from API utility
- **`PokemonStats.jsx`**: Now uses `fetchPokemonStats()` from API utility
- **`GameScreen.jsx`**: Now uses `fetchPokemon()` and `saveBattle()` from API utility

### 3. Environment Configuration
Created two environment files for different deployment scenarios:

#### Development (`.env.development`)
```
VITE_API_URL=
```
- Empty URL means requests go through Vite's dev proxy
- Vite proxies `/api` requests to `http://localhost:3001` (development backend)

#### Production (`.env.production`)
```
VITE_API_URL=http://localhost:3006
```
- Full URL to production backend running on port 3006
- Can be updated to your production domain (e.g., `https://api.yourdomain.com`)

### 4. Vite Configuration
Updated `vite.config.js` to proxy development API requests to the correct port:
```javascript
server: {
  proxy: {
    '/api': 'http://localhost:3001'  // Development backend
  }
}
```

## How to Use

### Development
1. Start backend on port 3001: `cd server && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Frontend automatically uses empty `VITE_API_URL`, which means Vite proxies `/api` requests to localhost:3001

### Production Build
1. Build frontend: `cd frontend && npm run build`
2. This uses `.env.production` with `VITE_API_URL=http://localhost:3006`
3. Start backend on port 3006: `PORT=3006 npm start`
4. Serve the built frontend from `frontend/dist` alongside the backend

### Changing Production API URL
If deploying to a different domain/port, update `.env.production`:
```
VITE_API_URL=https://api.yourdomain.com
```

## Benefits
- ✅ Single configuration point for all API endpoints
- ✅ Supports both development and production environments
- ✅ Easy to switch between localhost and remote servers
- ✅ Cleaner component code without repeated fetch calls
- ✅ Consistent error handling across all API calls
