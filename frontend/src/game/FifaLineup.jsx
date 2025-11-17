import React from 'react';
import { useGameState } from '../contexts/GameStateContext';

export default function FifaLineup({ onStartTournament }) {
  const { state } = useGameState();

  const renderCard = (pokemon, team, index) => {
    const rating = Math.floor((pokemon.hp + pokemon.atk + pokemon.def + pokemon.spd) / 4);
    return (
      <div key={pokemon.id || index} className={`fifa-card ${team}`} style={{ borderRadius: 12, padding: 12, background: team === 'A' ? 'linear-gradient(135deg, #007bff, #0056b3)' : 'linear-gradient(135deg, #dc3545, #a71e2a)', color: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', minWidth: 150 }}>
        <img src={pokemon.image || '/pokemon-placeholder.png'} alt={pokemon.name} style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #fff' }} />
        <h3 style={{ margin: '8px 0', fontSize: 16 }}>{pokemon.name}</h3>
        <div className="stats" style={{ fontSize: 12 }}>
          <div>HP: {pokemon.hp}</div>
          <div>ATK: {pokemon.atk}</div>
          <div>DEF: {pokemon.def}</div>
          <div>SPD: {pokemon.spd}</div>
        </div>
        <div className="rating" style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>Rating: {rating}</div>
      </div>
    );
  };

  return (
    <div className="fifa-lineup" style={{ padding: 20, textAlign: 'center' }}>
      <h1 style={{ color: '#0ff', fontFamily: 'Press Start 2P, monospace' }}>Team Lineups</h1>
      <div className="teams" style={{ display: 'flex', justifyContent: 'space-around', gap: 20 }}>
        <div className="team" style={{ flex: 1 }}>
          <h2>Team A</h2>
          <div className="cards" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {state.teamA?.pokemons.map((p, i) => renderCard(p, 'A', i))}
          </div>
        </div>
        <div className="team" style={{ flex: 1 }}>
          <h2>Team B</h2>
          <div className="cards" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {state.teamB?.pokemons.map((p, i) => renderCard(p, 'B', i))}
          </div>
        </div>
      </div>
      <button onClick={onStartTournament} style={{ marginTop: 20, padding: '10px 20px', fontSize: 16, cursor: 'pointer' }}>Start Tournament</button>
    </div>
  );
}