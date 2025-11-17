import React from 'react';

export default function PlayerCard({ pokemon, onStatClick = null, showButtons = false }) {
  if (!pokemon) {
    return (
      <div className="player-card flex items-center justify-center text-slate-400">
        <div>— Empty —</div>
      </div>
    );
  }

  const sprite = pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || '';
  const stats = pokemon.stats || pokemon.stats || {};

  return (
    <div className="player-card">
      <div className="text-left text-xs text-amber-200">#{pokemon.id}</div>
      <img className="sprite" src={sprite} alt={pokemon.name} />
      <div className="player-name">{pokemon.name}</div>
      <div className="player-stats">
        <div>HP: {stats.hp || stats['hp'] || (stats['hp'] && stats['hp']) || stats.hp}</div>
        <div>ATK: {stats.attack || stats['attack'] || 0}</div>
        <div>DEF: {stats.defense || stats['defense'] || 0}</div>
        <div>SPD: {stats.speed || stats['speed'] || 0}</div>
      </div>
      {showButtons && onStatClick && (
        <div className="mt-3 flex gap-2 justify-center">
          <button className="btn-arcade" onClick={() => onStatClick('attack')}>Attack</button>
          <button className="btn-arcade" onClick={() => onStatClick('defense')}>Defense</button>
          <button className="btn-arcade" onClick={() => onStatClick('speed')}>Speed</button>
          <button className="btn-arcade" onClick={() => onStatClick('hp')}>HP</button>
        </div>
      )}
    </div>
  );
}
