import React from 'react';
import '../styles/arcade.css';

export default function StartMenu({ onStartRound, disabled, currentRoundLabel }) {
  return (
    <div className="arcade-start-panel" aria-label="Start Round Panel">
      <div className="arcade-title">Round Prep</div>
      <div className="arcade-subtitle">{currentRoundLabel || 'Round'}</div>
      <button className="arcade-button" onClick={onStartRound} disabled={disabled}>
        START ROUND
      </button>
    </div>
  );
}