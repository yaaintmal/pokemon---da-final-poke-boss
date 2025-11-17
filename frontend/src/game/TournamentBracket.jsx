import React from 'react';
import StartMenu from './StartMenu';
import { useGameState } from '../contexts/GameStateContext';

export default function TournamentBracket({ onStartMatch, onStartRound, isFighting = false }) {
  const { state } = useGameState();

  const renderMatch = (match, round, index) => {
    const isCurrent = state.currentMatch && state.currentMatch.a === match.a && state.currentMatch.b === match.b;
    return (
      <div key={`${round.round}-${index}`} className={`match ${isCurrent ? 'current' : ''}`} style={{ border: '1px solid var(--border)', padding: 8, margin: 4, background: isCurrent ? 'var(--accent-muted)' : 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
        <div>{match.a?.name} vs {match.b?.name}</div>
        {match.winner && <div>Winner: {match.winner.name}</div>}
        {isCurrent && <button onClick={() => onStartMatch(match)} disabled={isFighting} style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)' }}>Fight!</button>}
      </div>
    );
  };

  return (
    <div className="tournament-bracket" style={{ padding: 20, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
       <h1 style={{ color: 'var(--accent-primary)', fontFamily: 'Press Start 2P, monospace', textAlign: 'center' }}>King of the Ring Bracket</h1>
       <div style={{ textAlign: 'center', marginBottom: 12 }}>
         <StartMenu onStartRound={onStartRound} disabled={isFighting} currentRoundLabel={`Round ${state.round}`} />
       </div>
      <div className="bracket" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {state.bracket.map((round) => (
          <div key={round.round} className="round" style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            <h3 style={{ color: 'var(--accent-primary)' }}>Round {round.round}</h3>
            {round.matches.map((match, i) => renderMatch(match, round.round, i))}
          </div>
        ))}
      </div>
      {state.winner && <div className="winner" style={{ textAlign: 'center', fontSize: 24, color: 'var(--accent-primary)' }}>Tournament Winner: {state.winner.name}</div>}
    </div>
  );
}