import React, { useEffect, useState } from 'react';

export default function PokemonStats({ pokemonName }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/pokemon-stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        
        // Find this pokemon's stats
        const pokemonStats = data.winRates?.[pokemonName];
        setStats(pokemonStats);
      } catch (err) {
        console.warn('Failed to fetch pokemon stats:', err);
      } finally {
        setLoading(false);
      }
    }
    
    if (pokemonName) {
      fetchStats();
    }
  }, [pokemonName]);

  if (loading) {
    return <div style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Loading stats...</div>;
  }

  if (!stats) {
    return <div style={{ color: '#d1d5db', fontSize: '0.9rem' }}>First tournament!</div>;
  }

  const totalMatches = stats.wins + stats.losses;
  const winRate = totalMatches > 0 ? Math.round((stats.wins / totalMatches) * 100) : 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '15px',
      padding: '15px',
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid #16a34a',
      marginTop: '20px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '5px' }}>VICTORIES</div>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#16a34a' }}>{stats.wins}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '5px' }}>DEFEATS</div>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ef4444' }}>{stats.losses}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '5px' }}>WIN RATE</div>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#f59e0b' }}>{winRate}%</div>
      </div>
    </div>
  );
}
