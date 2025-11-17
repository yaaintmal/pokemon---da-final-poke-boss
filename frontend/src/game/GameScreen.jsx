import React, { useEffect, useState, useRef } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import Arena from './Arena';
import FifaLineup from './FifaLineup';
import TournamentBracket from './TournamentBracket';
import FightAnimation from './FightAnimation';
import { narrateRoundWinner } from '../util/narration';
import { fetchPokemonAvatar } from '../util/avatar';
import ComicPage from './ComicPage';
import Celebration from './Celebration';
import ErrorBoundary from '../components/ErrorBoundary';
import PokemonImage from '../components/PokemonImage';
import TournamentOverview from './TournamentOverview';

export default function GameScreen() {
  const { state, advanceBracket, pushDoomQuote } = useGameState();
  const [phase, setPhase] = useState('bracket'); // 'bracket' -> 'intro-comic' -> 'fight-comic' -> 'result-comic' -> 'celebration' -> 'overview'
  const [localLoading, setLocalLoading] = useState(false);
  const [combat, setCombat] = useState({ a: null, b: null });
  const [winner, setWinner] = useState(null);
  const [localComicData, setLocalComicData] = useState(null);
  const [isFighting, setIsFighting] = useState(false);
  const [currentPlayingRound, setCurrentPlayingRound] = useState(null);
  const [winnerAudioUrl, setWinnerAudioUrl] = useState(null);
  const [hasPlayedWinnerSound, setHasPlayedWinnerSound] = useState(false);
  const timeoutRef = useRef(null);

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

  const resolveRound = async () => {
    const a = combat.a;
    const b = combat.b;
    if (!a || !b) return;
    setLocalLoading(true);

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
     timeoutRef.current = setTimeout(() => {
        advanceBracket(w);
        setLocalComicData(null);
        setIsFighting(false);
        setPhase('overview'); // Show tournament overview after round
      }, 16000);

    setLocalLoading(false);
  };

  const onStartMatch = (match) => {
    if (!match.a || !match.b || isFighting) return; // Skip invalid matches or if already fighting
    setCombat({ a: match.a, b: match.b });
    setIsFighting(true);
    // Always go to fight phase and wait for user to resolve
    setPhase('fight');
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

  // Auto-start the next fight when a currentMatch becomes available
  useEffect(() => {
    if (phase === 'bracket' && state.currentMatch && !isFighting) {
      // Clear any stale comic data and start the next match
      setLocalComicData(null);
      onStartMatch(state.currentMatch);
    }
  }, [state.currentMatch, phase, isFighting]);

  // Auto-start next fight from overview if currentMatch exists
  useEffect(() => {
    if (phase === 'overview' && state.currentMatch && !isFighting) {
      // Clear any stale comic data and start the next match
      setLocalComicData(null);
      onStartMatch(state.currentMatch);
    }
  }, [phase, state.currentMatch, isFighting]);

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

  if (phase === 'overview') {
    const isTournamentComplete = !state.currentMatch && state.bracket.every(r => r.matches.every(m => m.winner));
    return (
      <TournamentOverview
        bracket={state.bracket}
        round={state.round}
        onContinue={onContinueRound}
        onStartNextRound={onStartNextRound}
        isTournamentComplete={isTournamentComplete}
      />
    );
  }

  if (phase === 'bracket') {
    // Clear stale data
    if (localComicData) setLocalComicData(null);
    return <TournamentBracket onStartMatch={onStartMatch} onStartRound={startCurrentRound} isFighting={isFighting} />;
  }

  if (phase === 'intro-comic') {
    if (!localComicData || !combat.a || !combat.b) {
      setPhase('bracket'); // Fallback to bracket if invalid
      return <div>Loading...</div>;
    }
    const { a, b } = localComicData;
    const panels = [
      { content: <div>Round {state.round}<br/>King of the Ring</div> },
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
    return <ComicPage panels={panels} />;
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
        {phase === 'fight' && (
          <button className="arcade-btn" onClick={resolveRound} aria-label="Resolve round" title="Resolve round">
            <span className="arcade-icon" aria-hidden="true">⚡</span> Start Round
          </button>
        )}
        {winner && (
          <span className="winner-banner" style={{ color: 'var(--accent-primary)' }}>
            Winner: {typeof winner === 'string' ? winner : winner?.name}
          </span>
        )}
      </div>
    </div>
  );
}

