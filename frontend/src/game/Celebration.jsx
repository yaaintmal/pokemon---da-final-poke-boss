import React from 'react';

export default function Celebration({ winner, doomQuote }) {
  return (
    <div className="celebration" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(42, 42, 42, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      color: 'var(--text-primary)',
      fontFamily: 'Press Start 2P, monospace',
      animation: 'celebrate 7s ease-in-out'
    }}>
      <div className="winner-pokemon" style={{
        fontSize: '48px',
        color: 'var(--accent-primary)',
        textShadow: '0 0 10px var(--accent-muted)',
        marginBottom: '20px'
      }}>
        {winner?.name}
      </div>
      {winner?.avatarUrl && (
        <img src={winner.avatarUrl} alt={winner.name} style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '5px solid var(--accent-primary)',
          boxShadow: '0 0 20px var(--accent-muted)',
          marginBottom: '20px',
          animation: 'bounce 1s infinite alternate'
        }} />
      )}
      <div className="doom-quote" style={{
        fontSize: '24px',
        textAlign: 'center',
        maxWidth: '600px',
        background: 'var(--bg-secondary)',
        padding: '20px',
        border: '2px solid var(--error)',
        borderRadius: '10px',
        boxShadow: '0 0 15px var(--accent-subtle)'
      }}>
        {doomQuote?.text || 'Victory!'}
      </div>
    </div>
  );
}