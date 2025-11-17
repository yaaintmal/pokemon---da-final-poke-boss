import React, { useEffect, useState } from 'react';
import { incrementHallOfFame } from '../util/api';
import PokemonImage from '../components/PokemonImage';
import PokemonStats from './PokemonStats';
import Leaderboard from './Leaderboard';

export default function FinalWinner({ winner, onRestart }) {
  const [cryUrl, setCryUrl] = useState(null);
  const [hasPlayedCry, setHasPlayedCry] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const audioRef = React.useRef(null);

  useEffect(() => {
    async function fetchCry() {
      if (!winner || !winner.name) return;
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${winner.name.toLowerCase()}`);
        if (!res.ok) throw new Error('Failed to fetch pokemon data');
        const data = await res.json();
        
        // Try latest cry first, then legacy
        const cry = data?.cries?.latest || data?.cries?.legacy;
        if (cry) {
          setCryUrl(cry);
        }
      } catch (err) {
        console.warn('Failed to fetch pokemon cry:', err);
      }
    }
    
    fetchCry();
  }, [winner]);

  // Persist hall of fame increment when a winner appears
  useEffect(() => {
    async function persistHallOfFame() {
      if (!winner || !winner.id) return;
      try {
        console.log('Winner object before API call:', winner);
        const data = await incrementHallOfFame(winner.id, winner.name);
        console.log('Hall of Fame increment data:', data);
      } catch (err) {
        console.error('Failed to persist hall of fame:', err);
      }
    }

    persistHallOfFame();
  }, [winner]);

  useEffect(() => {
    if (cryUrl && !hasPlayedCry && audioRef.current) {
      audioRef.current.play().catch(() => {
        console.warn('Failed to play cry sound');
      });
      setHasPlayedCry(true);
    }
  }, [cryUrl, hasPlayedCry]);

  if (!winner) {
    return <div className="game-notice">No winner found</div>;
  }

  console.log('Winner object before API call:', winner);

  return (
    <div className="final-winner-screen">
      <audio ref={audioRef} src={cryUrl} />
      
      <div className="winner-container">
        <h1 className="winner-title">TOURNAMENT CHAMPION</h1>
        
        <div className="winner-card">
          <div className="winner-image">
            {winner.image && (
              <img 
                src={winner.image} 
                alt={winner.name}
                className="winning-pokemon"
              />
            )}
          </div>
          
          <div className="winner-info">
            <h2 className="winner-name">{winner.name.toUpperCase()}</h2>
            <p className="winner-id">#{winner.id}</p>
          </div>
        </div>

        <div className="winner-stats">
          <div className="stat-item">
            <span className="stat-label">HP</span>
            <span className="stat-value">{winner.hp}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">ATK</span>
            <span className="stat-value">{winner.atk}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">DEF</span>
            <span className="stat-value">{winner.def}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">SP.A</span>
            <span className="stat-value">{winner.satk}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">SP.D</span>
            <span className="stat-value">{winner.sdef}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">SPD</span>
            <span className="stat-value">{winner.spd}</span>
          </div>
        </div>

        <PokemonStats pokemonName={winner.name} />

        <div className="button-group">
          <button onClick={() => setShowLeaderboard(true)} className="btn btn-arcade btn-leaderboard">
            HALL OF LEGENDS
          </button>
          <button onClick={onRestart} className="btn btn-arcade">
            PLAY AGAIN
          </button>
        </div>
      </div>

      <Leaderboard isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />

      <style jsx>{`
        .final-winner-screen {
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #27272a 0%, #3f3f46 50%, #27272a 100%);
          position: relative;
          overflow: hidden;
        }

        .final-winner-screen::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.1) 0px,
              rgba(0, 0, 0, 0.1) 2px,
              transparent 2px,
              transparent 4px
            );
          pointer-events: none;
          animation: scanlines 8s linear infinite;
        }

        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }

        .winner-container {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 600px;
          padding: 40px;
          background: rgba(15, 23, 42, 0.8);
          border: 3px solid #f59e0b;
          box-shadow: 
            0 0 20px rgba(245, 158, 11, 0.5),
            inset 0 0 20px rgba(245, 158, 11, 0.1);
          animation: pulse-border 2s ease-in-out infinite;
        }

        @keyframes pulse-border {
          0%, 100% { 
            box-shadow: 
              0 0 20px rgba(245, 158, 11, 0.5),
              inset 0 0 20px rgba(245, 158, 11, 0.1);
          }
          50% { 
            box-shadow: 
              0 0 40px rgba(245, 158, 11, 0.8),
              inset 0 0 40px rgba(245, 158, 11, 0.2);
          }
        }

        .winner-title {
          font-size: 2.5rem;
          font-weight: 900;
          color: #f59e0b;
          text-shadow: 
            0 0 10px #f59e0b,
            0 0 20px rgba(245, 158, 11, 0.5);
          margin-bottom: 30px;
          letter-spacing: 2px;
          animation: float-title 3s ease-in-out infinite;
        }

        @keyframes float-title {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .winner-card {
          background: rgba(30, 27, 75, 0.5);
          border: 2px solid #16a34a;
          padding: 30px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 0 15px rgba(22, 163, 74, 0.3);
        }

        .winner-image {
          flex-shrink: 0;
        }

        .winning-pokemon {
          width: 150px;
          height: 150px;
          image-rendering: pixelated;
          filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.6));
        }

        .winner-info {
          flex: 1;
        }

        .winner-name {
          font-size: 2rem;
          font-weight: 900;
          color: #16a34a;
          margin: 0;
          text-shadow: 0 0 10px rgba(22, 163, 74, 0.5);
        }

        .winner-id {
          font-size: 1.2rem;
          color: #a78bfa;
          margin: 5px 0 0 0;
        }

        .winner-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 30px;
          padding: 20px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #f59e0b;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #d1d5db;
          font-weight: 600;
          text-transform: uppercase;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 900;
          color: #16a34a;
          text-shadow: 0 0 10px rgba(22, 163, 74, 0.5);
        }

        .button-group {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 20px;
        }

        .btn-leaderboard {
          background: #0ff;
          color: #0f172a;
          border-color: #0ff;
          padding: 12px 26px;
          font-weight: 800;
          text-shadow: 0 0 6px #00ffd0;
          box-shadow: 0 4px 0 #0099cc, 0 6px 10px rgba(0, 255, 255, 0.25);
        }

        .btn-leaderboard:hover {
          background: #00ffff;
          border-color: #00ffff;
          transform: translateY(2px);
          box-shadow: 0 2px 0 #0099cc, 0 4px 6px rgba(0, 255, 255, 0.25);
        }

        .btn-arcade {
          padding: 15px 40px;
          font-size: 1.3rem;
          font-weight: 900;
          background: #f59e0b;
          color: #0f172a;
          border: 3px solid #f59e0b;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: 
            0 4px 0 #b45309,
            0 6px 10px rgba(0, 0, 0, 0.5);
          transition: all 0.1s;
        }

        .btn-arcade:hover {
          background: #fbbf24;
          border-color: #fbbf24;
          box-shadow: 
            0 2px 0 #b45309,
            0 4px 5px rgba(0, 0, 0, 0.5);
          transform: translateY(2px);
        }

        .btn-arcade:active {
          box-shadow: 
            0 0 0 #b45309,
            0 2px 5px rgba(0, 0, 0, 0.5);
          transform: translateY(4px);
        }
      `}</style>
    </div>
  );
}
