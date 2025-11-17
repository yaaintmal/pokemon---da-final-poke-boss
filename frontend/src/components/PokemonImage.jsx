import React, { useState } from 'react';

export default function PokemonImage({ src, alt, className }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className={`pokemon-placeholder ${className || ''}`} aria-label="Image not available">
        {/* Lightweight fallback - replace with a real placeholder if you have one */}
        <span role="img" aria-label="pokemon">🎴</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}