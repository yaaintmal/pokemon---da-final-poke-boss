import { narrateRoundWinner } from './narration';

// Mock the ollama API
jest.mock('../api/ollama', () => ({
  generateNarration: jest.fn(),
  DOOM_QUOTES_FALLBACK: [
    'The only good demon is a shredded demon.',
    'You were inconvenient.',
  ],
}));

import { generateNarration } from '../api/ollama';

describe('narrateRoundWinner', () => {
  test('returns doom quote from array', async () => {
    const result = await narrateRoundWinner('Pikachu', 'Charmander', 1);
    expect(result).toBe('The only good demon is a shredded demon.');
  });

  test('returns different quote for different rounds', async () => {
    const result = await narrateRoundWinner('Pikachu', 'Charmander', 2);
    expect(result).toBe('You were inconvenient.');
  });
});