import { generateNarration, DOOM_QUOTES_FALLBACK } from '../api/ollama';

export async function narrateRoundWinner(winnerName, loserName, round) {
  // Always use the predefined Doom quotes array for consistency
  const fallback = DOOM_QUOTES_FALLBACK[(round - 1) % DOOM_QUOTES_FALLBACK.length];
  // Ensure it's a one-liner with ending period
  const oneLiner = (fallback || '').split('.')[0].trim();
  return oneLiner ? (oneLiner.endsWith('.') ? oneLiner : oneLiner + '.') : (fallback || '');
}
