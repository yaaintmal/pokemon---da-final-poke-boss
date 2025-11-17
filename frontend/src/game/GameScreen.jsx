import React, { useEffect, useState, useRef } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import Arena from './Arena';
// import FifaLineup from './FifaLineup';
// import TournamentBracket from './TournamentBracket';
import FightAnimation from './FightAnimation';
import { narrateRoundWinner } from '../util/narration';
import { fetchPokemonAvatar } from '../util/avatar';
import ComicPage from './ComicPage';
import Celebration from './Celebration';
import FinalWinner from './FinalWinner';
import ErrorBoundary from '../components/ErrorBoundary';
import PokemonImage from '../components/PokemonImage';

import CountdownOverlay from './CountdownOverlay';

export default function GameScreen() {
  const { state, advanceBracket, pushDoomQuote, endTournament } = useGameState();
  const [phase, setPhase] = useState('bracket'); // 'bracket' -> 'countdown' -> 'intro-comic' -> 'fight-comic' -> 'result-comic' -> 'celebration'
  const [localLoading, setLocalLoading] = useState(false);
  const [combat, setCombat] = useState({ a: null, b: null });
  const [winner, setWinner] = useState(null);
  const [localComicData, setLocalComicData] = useState(null);
  const [isFighting, setIsFighting] = useState(false);
  const [currentPlayingRound, setCurrentPlayingRound] = useState(null);
  const [winnerAudioUrl, setWinnerAudioUrl] = useState(null);
  const [hasPlayedWinnerSound, setHasPlayedWinnerSound] = useState(false);
  const [countdownValue, setCountdownValue] = useState(5);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownMatch, setCountdownMatch] = useState(null);
  const timeoutRef = useRef(null);
  const audioRef = useRef(null);

  // Fetch warcry for a Pokemon
  const fetchWarcry = async (pokemonName) => {
    try {
      const res = await fetch(`/api/pokemon/${pokemonName.toLowerCase()}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.cries?.latest || data?.cries?.legacy || null;
    } catch {
      return null;
    }
  };

  // Play audio with promise-based approach
  const playAudio = async (url) => {
    if (!url) return;
    return new Promise((resolve) => {
      const audio = new Audio(url);
      audio.onended = resolve;
      audio.onerror = resolve;
      audio.play().catch(resolve);
      // Timeout after 5 seconds
      setTimeout(resolve, 5000);
    });
  };

  // Start the current round: pick the first unfinished match in the active round
  const startCurrentRound = () => {
    const roundNum = state.round;
    setCurrentPlayingRound(roundNum);
    const currentRound = state.bracket.find(r => r.round === roundNum);
    if (!currentRound || !currentRound.matches) return;
    const nextMatch = currentRound.matches.find(m => !m.winner);
    if (!nextMatch) return;
    onStartMatch(nextMatch);
  };

  const resolveRound = async (fighterA, fighterB) => {
    const a = fighterA || combat.a;
    const b = fighterB || combat.b;
    if (!a || !b) return;
    setLocalLoading(true);

    // Play opening warcries for both fighters
    const warcryA = await fetchWarcry(a.name);
    const warcryB = await fetchWarcry(b.name);
    
    // Play warcries in sequence
    if (warcryA) await playAudio(warcryA);
    if (warcryB) await playAudio(warcryB);

    // Simple deterministic fight
    let A = { ...a };
    let B = { ...b };
    let attacker = A.spd >= B.spd ? 'A' : 'B';
    let turns = 0;
    let totalDamageA = 0;
    let totalDamageB = 0;
    while (A.hp > 0 && B.hp > 0) {
      const damage = Math.max(1, (attacker === 'A' ? A.atk : B.atk) - (attacker === 'A' ? B.def : A.def));
      if (attacker === 'A') {
        B.hp -= damage; totalDamageA += damage;
      } else {
        A.hp -= damage; totalDamageB += damage;
      }
      turns++;
      attacker = attacker === 'A' ? 'B' : 'A';
    }
    const w = A.hp > 0 ? A : B;
    const l = w === A ? B : A;
    const winnerName = w.name;
    const loserName = l.name;
    setWinner(w);

    let text = '';
    try {
      text = await narrateRoundWinner(winnerName, loserName, state.round);
    } catch {
      text = 'doom...';
    }
    const avatarUrl = await fetchPokemonAvatar(winnerName).catch(() => null);
    pushDoomQuote({ pokemon: winnerName, text, round: state.round, avatarUrl });

    // Play winner's warcry
    const winnerWarcry = await fetchWarcry(winnerName);
    if (winnerWarcry) {
      await playAudio(winnerWarcry);
    }

    // Save battle to MongoDB
    try {
      await fetch('/api/battles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          round: state.round,
          fighter1: a,
          fighter2: b,
          winner: w,
          loser: l,
          stats: { 
            turns, 
            totalDamageA, 
            totalDamageB,
            winnerReason: totalDamageA > totalDamageB ? 'Superior attack' : 'Balanced',
          },
        }),
      });
    } catch (err) {
      console.warn('Failed to save battle to MongoDB:', err);
    }

    // Prepare winner audio URL for cheering (if available)
    if (w?.audioUrl) {
      setWinnerAudioUrl(w.audioUrl);
      setHasPlayedWinnerSound(false);
    } else {
      setWinnerAudioUrl(null);
    }

    // Build comic data for intro page
    const attackDelta = winnerName === a.name ? totalDamageA - totalDamageB : totalDamageB - totalDamageA;
    const defenseDelta = w.hp - l.hp;
    const fightStats = { winnerReason: attackDelta > 10 ? 'Superior attack' : 'Balanced', attackDelta, defenseDelta, turns };
    const comicData = { a, b, winner: w, loser: l, stats: fightStats };
    setLocalComicData(comicData);
    setPhase('intro-comic'); // start intro comic

    // Auto-advance comic phases (slower for audio and reading)
    timeoutRef.current = setTimeout(() => setPhase('fight-comic'), 4000);
    timeoutRef.current = setTimeout(() => setPhase('result-comic'), 8000);
    timeoutRef.current = setTimeout(() => setPhase('celebration'), 12000);


    setLocalLoading(false);
  };

  const onStartMatch = (match) => {
    if (!match.a || !match.b || isFighting) return; // Skip invalid matches or if already fighting
    // Start countdown instead of directly starting fight
    setCountdownMatch(match);
    setCountdownValue(5);
    setCountdownActive(true);
    setPhase('countdown');
  };

  const onContinueRound = () => {
    // Continue with the next match in the current round
    setPhase('bracket');
  };

  const onStartNextRound = () => {
    // Start the next round
    setCurrentPlayingRound(state.round);
    setPhase('bracket');
  };

  useEffect(() => {
    if (phase === 'fight' && currentPlayingRound !== null) {
      // Auto-resolve rounds when playing a complete round
      const timer = setTimeout(() => {
        resolveRound();
      }, 2000); // 2 seconds delay for user to see the setup
      return () => clearTimeout(timer);
    }
  }, [phase, currentPlayingRound]);

  useEffect(() => {
    if (phase === 'celebration') {
      // After celebration, advance the bracket
      const timer = setTimeout(() => {
        setIsFighting(false);
        setCountdownActive(false);
        setCountdownMatch(null);
        setCombat({ a: null, b: null });
        advanceBracket(winner);
        setPhase('bracket');
      }, 4000); // Wait for celebration to finish
      return () => clearTimeout(timer);
    }
  }, [phase, winner, advanceBracket]);

  // Auto-start the next fight from bracket when available (counts toward no overview path)
  useEffect(() => {
    if (phase === 'bracket' && state.currentMatch && !isFighting && !state.tournamentComplete) {
      // Clear any stale comic data and start the next match
      setLocalComicData(null);
      // Delay slightly to ensure state is settled
      const timer = setTimeout(() => {
        onStartMatch(state.currentMatch);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state.currentMatch, phase, isFighting, state.tournamentComplete]);



  // Countdown timer effect
  useEffect(() => {
    if (countdownActive && countdownValue > 0) {
      const timer = setTimeout(() => {
        setCountdownValue(countdownValue - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdownActive && countdownValue === 0) {
      // Countdown finished, start the fight
      if (countdownMatch) {
        setCombat({ a: countdownMatch.a, b: countdownMatch.b });
        setIsFighting(true);
        // Immediately resolve the fight with the current fighters
        setTimeout(() => resolveRound(countdownMatch.a, countdownMatch.b), 500);
      }
      // Reset countdown state
      setCountdownActive(false);
      setCountdownMatch(null);
    }
  }, [countdownActive, countdownValue, countdownMatch]);

  useEffect(() => {
    return () => {
      // cleanup
    };
  }, []);

  if (!state?.started) {
    return (
      <div className="game-notice">
        <p>Build two teams on the landing page, then start the match.</p>
      </div>
    );
  }

  if (state.tournamentComplete && state.winner) {
    return (
      <FinalWinner 
        winner={state.winner} 
        onRestart={endTournament}
      />
    );
  }

  if (state.tournamentComplete) {
    return (
      <div className="game-notice">
        Tournament Complete!
        <button onClick={endTournament} className="btn btn-primary">
          Back to Landing
        </button>
      </div>
    );
  }

  if (phase === 'countdown') {
    return (
      <CountdownOverlay
        value={countdownValue}
        onDone={() => {
          // This will be handled by the useEffect when countdownValue reaches 0
        }}
        label="Round Starting"
        fighters={countdownMatch ? [countdownMatch.a, countdownMatch.b] : []}
      />
    );
  }



  if (phase === 'bracket') {
    // Check if tournament is actually complete
    if (state.tournamentComplete) {
      return <div className="game-notice">Tournament Complete!</div>;
    }
    
    // Auto-start next round if needed
    if (!state.currentMatch && state.bracket && state.bracket.length > 0) {
      const currentRound = state.bracket.find(r => r.round === state.round);
      if (currentRound && currentRound.matches && currentRound.matches.some(m => !m.winner)) {
        startCurrentRound();
        return <div className="game-notice">Starting round {state.round}...</div>;
      }
    }
    
    // Auto-start countdown for next match if available
    if (state.currentMatch && !isFighting) {
      onStartMatch(state.currentMatch);
      return <div className="game-notice">Preparing match...</div>;
    }
    
    // Fallback
    return <div className="game-notice">Waiting to start...</div>;
  }

  if (phase === 'intro-comic') {
    if (!localComicData || !combat.a || !combat.b) {
      setPhase('bracket'); // Fallback to bracket if invalid
      return <div>Loading...</div>;
    }
    const { a, b } = localComicData;
    const panels = [
      { content: <div>Round {state.round}</div> },
      { content: <div>{a?.name}<br/><PokemonImage src={a?.image} alt={a?.name} className="comic-pokemon" style={{width:60,height:60}}/><br/>ATK: {a?.atk} DEF: {a?.def}<br/>HP: {a?.hp} SPD: {a?.spd}</div> },
      { content: <div>VS</div> },
      { content: <div>{b?.name}<br/><PokemonImage src={b?.image} alt={b?.name} className="comic-pokemon" style={{width:60,height:60}}/><br/>ATK: {b?.atk} DEF: {b?.def}<br/>HP: {b?.hp} SPD: {b?.spd}</div> }
    ];
    return <ComicPage panels={panels} />;
  }

  if (phase === 'fight-comic') {
    if (!localComicData || !combat.a || !combat.b) {
      setPhase('bracket'); // Fallback to bracket if invalid
      return <div>Loading...</div>;
    }
    const { a, b } = localComicData;
    const panels = [
      { content: <div>Fight Begins!</div> },
      { content: <div>{a?.name} vs {b?.name}<br/>Stats Comparison</div> },
      { content: <div>Attack: {a?.atk} / {b?.atk}<br/>Defense: {a?.def} / {b?.def}</div> },
      { content: <div>Let the battle rage!</div> }
    ];
    return <ComicPage panels={panels} />;
  }

  if (phase === 'result-comic') {
    if (!localComicData || !combat.a || !combat.b) {
      setPhase('bracket'); // Fallback to bracket if invalid
      return <div>Loading...</div>;
    }
    const { winner, loser, stats } = localComicData;
    const panels = [
      { content: <div>Winner: {winner?.name}</div> },
      { content: <div>{loser?.name} defeated</div> },
      { content: <div>{stats?.winnerReason}</div> },
      { content: <div>Attack: {stats?.attackDelta > 0 ? '+' : ''}{stats?.attackDelta}<br/>Defense: {stats?.defenseDelta > 0 ? '+' : ''}{stats?.defenseDelta}<br/>Turns: {stats?.turns}</div> }
    ];
    return <ComicPage panels={panels} winner={winner} loser={loser} />;
  }

  if (phase === 'celebration') {
    const latestQuote = state.doomQuotes[state.doomQuotes.length - 1];
    return <Celebration winner={{ name: latestQuote?.pokemon, avatarUrl: latestQuote?.avatarUrl }} doomQuote={latestQuote} />;
  }

  // fight phase: show current combat and let resolve automatically via intro/comic flow
  return (
    <div className="game-screen">
      {localLoading ? (
        <FightAnimation pokemonA={combat.a} pokemonB={combat.b} />
      ) : (
        <ErrorBoundary>
          <Arena activeA={combat.a} activeB={combat.b} doomQuotes={state.doomQuotes} winner={winner} winnerAudioUrl={winnerAudioUrl} />
        </ErrorBoundary>
      )}
      <div className="arena-controls">
        {winner && (
          <span className="winner-banner" style={{ color: 'var(--accent-primary)' }}>
            Winner: {typeof winner === 'string' ? winner : winner?.name}
          </span>
        )}
      </div>
    </div>
  );
}

