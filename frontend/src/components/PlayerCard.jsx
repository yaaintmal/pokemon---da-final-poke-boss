import React from 'react';

/**
 * PlayerCard - FIFA-style Pokémon player card with arcade theming
 * Shows Pokémon stats in a card format similar to FIFA Ultimate Team
 */
export default function PlayerCard({ pokemon, showButtons = false, onStatClick }) {
  if (!pokemon) {
    return (
      <div className="player-card" style={{ opacity: 0.5 }}>
        <div className="sprite">?</div>
        <div className="player-name">-</div>
      </div>
    );
  }

  const stats = pokemon.stats || {};
  const statLabels = [
    { key: 'hp', label: 'HP', short: 'HP' },
    { key: 'attack', label: 'Attack', short: 'ATK' },
    { key: 'defense', label: 'Defense', short: 'DEF' },
    { key: 'special-attack', label: 'Sp.Atk', short: 'SP.A' },
    { key: 'special-defense', label: 'Sp.Def', short: 'SP.D' },
    { key: 'speed', label: 'Speed', short: 'SPD' },
  ];

  return (
    <div className="player-card glow">
      <div style={{ position: 'relative' }}>
        {pokemon.image ? (
          <img src={pokemon.image} alt={pokemon.name} className="sprite" />
        ) : (
          <div className="sprite" style={{ backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            #{pokemon.id}
          </div>
        )}
        <div style={{ position: 'absolute', top: 4, right: 4, background: '#f59e0b', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
          #{pokemon.id}
        </div>
      </div>
      <div className="player-name">{pokemon.name}</div>
      
      {/* Stats grid */}
      <div className="player-stats" style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem', fontSize: '0.75rem' }}>
          {statLabels.map(({ key, short, label }) => {
            const val = stats[key] || 0;
            const barWidth = (val / 150) * 100; // Normalize to 150 as max for visual
            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>{short}</div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    background: val > 100 ? '#10b981' : val > 75 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.2s'
                  }} />
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>{val}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons (for battle) */}
      {showButtons && onStatClick && (
        <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem' }}>
          {statLabels.slice(1, 5).map(({ key, label, short }) => (
            <button
              key={key}
              onClick={() => onStatClick(key)}
              style={{
                background: '#16a34a',
                color: '#06101a',
                border: 'none',
                borderRadius: '4px',
                padding: '0.25rem',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.target.style.background = '#15803d'}
              onMouseLeave={(e) => e.target.style.background = '#16a34a'}
            >
              {short}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
