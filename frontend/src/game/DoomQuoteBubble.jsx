import React from 'react';

export default function DoomQuoteBubble({ pokemon, text, round, avatarUrl }) {
  if (!text) return null;
  return (
    <div className="doom-quote arcade" role="status" aria-label={`Doom quote after round ${round} by ${pokemon}`} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: '#111', color: '#0ff', boxShadow: '0 0 12px rgba(0,255,255,.6)', maxWidth: '90%', margin: '8px auto' }}>
      <div className="doom-avatar" aria-label={`${pokemon} avatar`} style={{ marginRight: 12 }}>
        <img src={avatarUrl || '/default-pokemon.png'} alt={`${pokemon} avatar`} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
      </div>
      <div className="doom-content" style={{ display: 'inline-block' }}>
        <div className="doom-meta" style={{ fontWeight: 700, fontFamily: 'monospace' }}>Round {round} • {pokemon}</div>
        <div className="doom-text" style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
      </div>
    </div>
  );
}
