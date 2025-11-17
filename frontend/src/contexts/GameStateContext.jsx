import React, { createContext, useContext, useMemo, useState } from 'react';
import { createGame, saveGame } from '../api/gameStorage';

export const GameStateContext = createContext(null);
export const useGameState = () => {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used within GameStateProvider');
  return ctx;
};

export const GameStateProvider = ({ children }) => {
  const [state, setState] = useState({
    participants: [],
    round: 1,
    doomQuotes: [],
    started: false,
    winner: null,
    gameId: null,
    bracket: [], // Array of rounds, each with matches
    currentMatch: null, // { a: PokemonCard, b: PokemonCard }
    tournamentMode: true,
    autoplayEnabled: false,
    comicData: null, // { a, b, winner, stats }
  });

  const startGame = async (participants) => {
    const p = participants ?? [];
    // Initialize bracket: Round 1: pair them up
    const matches = [];
    for (let i = 0; i < p.length; i += 2) {
      matches.push({ a: p[i], b: p[i + 1] || null, winner: null });
    }
    const bracket = [
      {
        round: 1,
        matches,
      },
    ];
    const init = {
      participants: p,
      round: 1,
      doomQuotes: [],
      started: true,
      winner: null,
      gameId: null,
      bracket,
      currentMatch: matches[0] || null,
      tournamentMode: true,
    };
    setState(init);
    try {
      const res = await createGame(init);
      const gid = res?.gameId ?? null;
      if (gid) setState((s) => ({ ...s, gameId: gid }));
    } catch {
      // Ignore backend failure; operate locally
    }
  };



  const advanceBracket = (winner) => {
    setState((s) => {
      if (!s.currentMatch) return s;
      const { bracket, currentMatch } = s;
      // Find current match and set winner
      const updatedBracket = bracket.map((r) => ({
        ...r,
        matches: r.matches.map((m) =>
          m.a === currentMatch.a && m.b === currentMatch.b ? { ...m, winner } : m
        ),
      }));
      // Determine next match or end tournament
      let nextMatch = null;
      let winnerTeam = null;
      let nextRoundNum = null;
      const currentRound = updatedBracket.find((r) => r.round === s.round);
      if (currentRound) {
        const unfinished = currentRound.matches.filter((m) => !m.winner);
        if (unfinished.length > 0) {
          nextMatch = unfinished[0];
        } else {
          // All matches in round done, create next round
          const winners = currentRound.matches.map((m) => m.winner).filter(Boolean);
          if (winners.length > 1) {
            nextRoundNum = s.round + 1;
            const nextMatches = [];
            for (let i = 0; i < winners.length; i += 2) {
              nextMatches.push({ a: winners[i], b: winners[i + 1] || null, winner: null });
            }
            updatedBracket.push({ round: nextRoundNum, matches: nextMatches });
            nextMatch = nextMatches[0];
          } else if (winners.length === 1) {
            winnerTeam = winners[0]; // Tournament winner
          }
        }
      }
       const nextState = {
        ...s,
        bracket: updatedBracket,
        currentMatch: nextMatch,
        round: nextRoundNum != null ? nextRoundNum : (nextMatch ? s.round : s.round + 1),
        winner: winnerTeam || null,
        started: !winnerTeam,
      };
      if (nextState.gameId) saveGame(nextState.gameId, nextState).catch(() => {});
      return nextState;
    });
  };

  const pushDoomQuote = (dq) => {
    setState((s) => {
      const next = { ...s, doomQuotes: [...s.doomQuotes, dq] };
      if (next.gameId) saveGame(next.gameId, next).catch(() => {});
      return next;
    });
  };

  const toggleAutoplay = () => {
    setState((s) => ({ ...s, autoplayEnabled: !s.autoplayEnabled }));
  };

  const setComicData = (data) => {
    setState((s) => ({ ...s, comicData: data }));
  };

  const value = useMemo(() => ({ state, startGame, advanceBracket, pushDoomQuote, toggleAutoplay, setComicData }), [state]);

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
};
