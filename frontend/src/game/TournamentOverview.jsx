import React from 'react';

export default function TournamentOverview({
  bracket,
  round,
  onContinue,
  onStartNextRound,
  isTournamentComplete
}) {
  // Compute advancing and eliminated for current round
  const currentRoundData = bracket.find(r => r.round === round);
  const advancingThisRound = currentRoundData?.matches
    .filter(m => m.winner)
    .map(m => m.winner)
    .filter(Boolean) || [];

  const eliminatedThisRound = currentRoundData?.matches
    .filter(m => m.winner)
    .map(m => m === m.winner ? (m.a === m.winner ? m.b : m.a) : null)
    .filter(Boolean) || [];

  const hasUnfinishedMatches = currentRoundData?.matches.some(m => !m.winner) || false;
  const nextRoundExists = advancingThisRound.length > 1;

  return (
    <div className="tournament-overview" style={{
      padding: 20,
      background: '#111',
      color: '#fff',
      borderRadius: 8,
      maxWidth: 800,
      margin: '0 auto'
    }}>
      <h2 style={{
        color: '#0ff',
        fontFamily: 'Press Start 2P, monospace',
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center'
      }}>
        Tournament Overview - Round {round}
      </h2>

      {/* Current Round Matches */}
      <section style={{ marginBottom: 30 }}>
        <h3 style={{ color: '#ff0', marginBottom: 10 }}>Round {round} Matches</h3>
        <div style={{ display: 'grid', gap: 10 }}>
          {currentRoundData?.matches.map((match, idx) => (
            <div key={idx} style={{
              padding: 10,
              background: '#222',
              borderRadius: 4,
              border: '1px solid #555'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{match.a?.name || 'TBD'} vs {match.b?.name || 'TBD'}</span>
                <span style={{
                  color: match.winner ? '#0f0' : '#ff0',
                  fontWeight: 'bold'
                }}>
                  {match.winner ? `Winner: ${match.winner.name}` : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Advancing Pokemon */}
      {advancingThisRound.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h3 style={{ color: '#0f0', marginBottom: 10 }}>
            Advancing to {nextRoundExists ? `Round ${round + 1}` : 'Finals'}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {advancingThisRound.map((pokemon, idx) => (
              <div key={idx} style={{
                padding: '8px 12px',
                background: '#0f0',
                color: '#000',
                borderRadius: 4,
                fontWeight: 'bold'
              }}>
                {pokemon.name}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Eliminated Pokemon */}
      {eliminatedThisRound.length > 0 && (
        <section style={{ marginBottom: 30 }}>
          <h3 style={{ color: '#f00', marginBottom: 10 }}>Eliminated This Round</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {eliminatedThisRound.map((pokemon, idx) => (
              <div key={idx} style={{
                padding: '8px 12px',
                background: '#f00',
                color: '#fff',
                borderRadius: 4,
                textDecoration: 'line-through'
              }}>
                {pokemon.name}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', marginTop: 30 }}>
        {isTournamentComplete ? (
          <button
            onClick={onContinue}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            View Final Results
          </button>
        ) : hasUnfinishedMatches ? (
          <button
            onClick={onContinue}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Continue Round {round}
          </button>
        ) : nextRoundExists ? (
          <button
            onClick={onStartNextRound}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              background: '#ffc107',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Start Round {round + 1}
          </button>
        ) : (
          <button
            onClick={onContinue}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Tournament Complete
          </button>
        )}
      </div>
    </div>
  );
}