import React from 'react';

export default function FifaStatsOverlay({ pokemon, position }) {
  if (!pokemon) return null;

  const stats = [
    { name: 'HP', value: pokemon.hp, max: 255 },
    { name: 'Attack', value: pokemon.atk, max: 255 },
    { name: 'Defense', value: pokemon.def, max: 255 },
    { name: 'Sp. Attack', value: pokemon.satk || 0, max: 255 },
    { name: 'Sp. Defense', value: pokemon.sdef || 0, max: 255 },
    { name: 'Speed', value: pokemon.spd, max: 255 },
  ];

  const renderStars = (value, max) => {
    const stars = Math.round((value / max) * 5);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  return (
    <div className="fifa-overlay" style={{ position: 'absolute', top: position.top, left: position.left, zIndex: 1000 }}>
      <div className="overlay-card" style={{ background: 'linear-gradient(135deg, #007bff, #0056b3)', borderRadius: 12, padding: 16, color: '#fff', boxShadow: '0 8px 16px rgba(0,0,0,0.5)', minWidth: 200 }}>
        <h3 style={{ margin: 0, fontSize: 18, textAlign: 'center' }}>{pokemon.name}</h3>
        <img src={pokemon.image || '/pokemon-placeholder.png'} alt={pokemon.name} style={{ width: 80, height: 80, borderRadius: '50%', display: 'block', margin: '8px auto' }} />
        <div className="stats-list" style={{ marginTop: 12 }}>
          {stats.map((stat) => (
            <div key={stat.name} className="stat-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, flex: 1 }}>{stat.name}:</span>
              <span className="stars" style={{ fontSize: 16, color: '#ffd700', flex: 2, textAlign: 'center' }}>{renderStars(stat.value, stat.max)}</span>
              <span style={{ fontSize: 12, flex: 1, textAlign: 'right' }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}