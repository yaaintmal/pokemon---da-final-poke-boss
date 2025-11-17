export const BACKEND_BASE = 'http://localhost:5000';

export async function createGame(initialState) {
  try {
    const res = await fetch(`${BACKEND_BASE}/game/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: initialState }),
    });
    if (!res.ok) throw new Error(`Create failed: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('Failed to create game in backend, operating locally:', e.message);
    return null; // Operate locally
  }
}

export async function saveGame(gameId, state) {
  if (!gameId) return; // No backend gameId, skip
  try {
    const res = await fetch(`${BACKEND_BASE}/game/${gameId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('Failed to save game in backend, continuing locally:', e.message);
  }
}

export async function loadGame(gameId) {
  try {
    const res = await fetch(`${BACKEND_BASE}/game/${gameId}`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error(`Load failed: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('Failed to load game from backend, no saved game:', e.message);
    return null;
  }
}
