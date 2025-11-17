import React from 'react';
import PokemonImage from '../components/PokemonImage';

function StatusTile({ pokemon, status }) {
  const isWinner = status === 'winner';
  return (
    <div
      className={`status-tile flex flex-col items-center p-3 rounded-lg border-2 ${
        isWinner
          ? 'bg-green-800 border-green-400 text-green-100'
          : 'bg-red-800 border-red-400 text-red-100'
      } shadow-lg`}
    >
      <PokemonImage src={pokemon?.image} alt={pokemon?.name} style={{ width: 48, height: 48 }} />
      <div className="text-xs font-bold mt-1">{pokemon?.name}</div>
      <div className="text-lg">{isWinner ? '🏆' : '💀'}</div>
    </div>
  );
}

export default function ComicPage({ panels, onNext, winner, loser }) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-90 grid grid-cols-2 grid-rows-2 gap-4 p-6 text-white font-mono">
      {panels.map((panel, i) => (
        <div
          key={i}
          className={`comic-panel flex flex-col items-center justify-center p-4 text-center text-sm bg-zinc-800 bg-opacity-80 rounded-lg shadow-2xl transform transition-all duration-500 hover:scale-105 animate-fade-in`}
          style={{ animationDelay: `${i * 0.2}s` }}
        >
          {panel.content}
        </div>
      ))}

      {/* Winner/Loser Status Tiles */}
      {(winner || loser) && (
        <div className="absolute top-6 left-6 flex gap-4">
          {winner && <StatusTile pokemon={winner} status="winner" />}
          {loser && <StatusTile pokemon={loser} status="loser" />}
        </div>
      )}

      {onNext && (
        <button
          onClick={onNext}
          className="absolute bottom-6 right-6 bg-amber-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-amber-400 transition-colors animate-pulse"
        >
          Next
        </button>
      )}
    </div>
  );
}