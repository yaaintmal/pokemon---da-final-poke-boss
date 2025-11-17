import React from 'react';
import DoomQuoteBubble from './DoomQuoteBubble';
import PokemonImage from '../components/PokemonImage';
import AudioPlayer from '../components/AudioPlayer';

export default function Arena({ activeA, activeB, doomQuotes, winner, winnerAudioUrl }) {
  const latest = doomQuotes[doomQuotes.length - 1];
  return (
    <div className="arena">
      <div className="fighter left">
        {activeA ? (
          <div className="card">
            <PokemonImage src={activeA.image} alt={activeA.name} />
            <div className="name">{activeA.name}</div>
            <div className="hp-bar" aria-label="HP">
              <div className="hp" style={{ width: `${(activeA.hp / activeA.maxHp) * 100}%` }} />
            </div>
          </div>
        ) : (
          <div className="card placeholder" />
        )}
      </div>
      <div className="arena-center" aria-label="Arena center">
        <div className="versus">VS</div>
      </div>
      <div className="fighter right">
        {activeB ? (
          <div className="card">
            <PokemonImage src={activeB.image} alt={activeB.name} />
            <div className="name">{activeB.name}</div>
            <div className="hp-bar" aria-label="HP">
              <div className="hp" style={{ width: `${(activeB.hp / activeB.maxHp) * 100}%` }} />
            </div>
          </div>
        ) : (
          <div className="card placeholder" />
        )}
      </div>
      <div className="doom-area" aria-label="Doom narration area" style={{ marginTop: 8 }}>
        {latest ? (
          <DoomQuoteBubble
            pokemon={latest.pokemon}
            text={latest.text}
            round={latest.round}
            avatarUrl={latest.avatarUrl}
          />
        ) : null}
      </div>
      {/* Winner audio playback (one-shot during cheering) */}
      {winner && winnerAudioUrl && (
        <AudioPlayer audioUrl={winnerAudioUrl} autoPlay={true} />
      )}
    </div>
  );
}
