import { DOOM_QUOTES_FALLBACK } from '../api/ollama';

export async function narrateRoundWinner(winnerName, loserName, round) {
  // Pick a random DOOM quote for each fight
  const randomQuote = DOOM_QUOTES_FALLBACK[Math.floor(Math.random() * DOOM_QUOTES_FALLBACK.length)];
  // Ensure it's a one-liner with ending period
  const oneLiner = (randomQuote || '').split('.')[0].trim();
  return oneLiner ? (oneLiner.endsWith('.') ? oneLiner : oneLiner + '.') : (randomQuote || '');
}
