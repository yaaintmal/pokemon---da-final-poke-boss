import React from 'react';
import PokemonImage from '../components/PokemonImage';

export default function CountdownOverlay({ value, onDone, label = "Round Starting", fighters = [], multipliers = { a: 1, b: 1 } }) {
  React.useEffect(() => {
    if (value === 0) {
      // Countdown finished, call onDone
      onDone();
    }
  }, [value, onDone]);

  const left = fighters[0];
  const right = fighters[1];
  const multA = multipliers?.a || 1;
  const multB = multipliers?.b || 1;

  return (
    <div
      className="countdown-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        zIndex: 1000,
        color: '#fff'
      }}
      aria-live="polite"
      aria-label={`Countdown: ${value}`}
    >
      <div
        className="countdown-label"
        style={{
          fontFamily: 'monospace',
          fontSize: '20px',
          marginBottom: '16px',
          color: 'var(--accent-primary)',
          textAlign: 'center'
        }}
      >
        {label}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '40px', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          {left ? (
            <>
              <PokemonImage src={left.image} alt={left.name} style={{ width: 64, height: 64 }} />
              <div style={{ fontFamily: 'monospace', fontSize: '12px', marginTop: '6px' }}>{left.name}</div>
              <div style={{ 
                fontFamily: 'monospace', 
                fontSize: '14px', 
                marginTop: '8px', 
                fontWeight: 'bold',
                color: multA > 1 ? '#00ff00' : multA < 1 ? '#ff6b6b' : '#ffffff',
                textShadow: `0 0 10px ${multA > 1 ? '#00ff00' : multA < 1 ? '#ff6b6b' : 'transparent'}`
              }}>
                {multA.toFixed(2)}x
              </div>
            </>
          ) : (
            <div style={{ width: 64, height: 64 }} />
          )}
        </div>

        <div
          className="countdown-number"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '120px',
            fontWeight: 'bold',
            color: 'var(--accent-primary)',
            textShadow: '0 0 20px rgba(245, 158, 11, 0.8)',
            lineHeight: 0.9,
            animation: 'countdown-pulse 1s infinite'
          }}
          aria-live="assertive"
        >
          {value}
        </div>

        <div style={{ textAlign: 'center' }}>
          {right ? (
            <>
              <PokemonImage src={right.image} alt={right.name} style={{ width: 64, height: 64 }} />
              <div style={{ fontFamily: 'monospace', fontSize: '12px', marginTop: '6px' }}>{right.name}</div>
              <div style={{ 
                fontFamily: 'monospace', 
                fontSize: '14px', 
                marginTop: '8px', 
                fontWeight: 'bold',
                color: multB > 1 ? '#00ff00' : multB < 1 ? '#ff6b6b' : '#ffffff',
                textShadow: `0 0 10px ${multB > 1 ? '#00ff00' : multB < 1 ? '#ff6b6b' : 'transparent'}`
              }}>
                {multB.toFixed(2)}x
              </div>
            </>
          ) : (
            <div style={{ width: 64, height: 64 }} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes countdown-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.07); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}