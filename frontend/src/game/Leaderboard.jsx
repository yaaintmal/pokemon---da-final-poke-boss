import React, { useEffect, useState } from 'react';

export default function Leaderboard({ isOpen, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    
    // Fetch leaderboard data
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await fetch('/api/pokemon-stats');
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        const data = await res.json();
        
        // Sort by wins descending
        const sorted = data
          .filter(p => p.wins > 0) // Only show Pokemon with wins
          .sort((a, b) => b.wins - a.wins)
          .slice(0, 15); // Top 15
        
        setLeaderboard(sorted);
      } catch (err) {
        console.warn('Failed to fetch leaderboard:', err);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Auto-scroll animation
  useEffect(() => {
    if (!isOpen || leaderboard.length === 0) return;

    const scrollInterval = setInterval(() => {
      setScrollPosition((prev) => (prev + 1) % (leaderboard.length * 60));
    }, 50);

    return () => clearInterval(scrollInterval);
  }, [isOpen, leaderboard]);

  if (!isOpen) return null;

  return (
    <div className="leaderboard-modal" onClick={onClose}>
      <div className="leaderboard-container" onClick={(e) => e.stopPropagation()}>
        <div className="leaderboard-header">
          <h2 className="leaderboard-title">🏆 HALL OF LEGENDS 🏆</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="leaderboard-content">
          {loading ? (
            <div className="loading-text">Loading legendary stats...</div>
          ) : leaderboard.length === 0 ? (
            <div className="empty-text">No battles recorded yet. Create history!</div>
          ) : (
            <div className="scroll-wrapper">
              <div 
                className="scroll-content"
                style={{ transform: `translateY(-${scrollPosition}px)` }}
              >
                {/* Duplicate entries for seamless loop */}
                {[...leaderboard, ...leaderboard].map((pokemon, idx) => (
                  <div key={idx} className="leaderboard-entry">
                    <div className="rank">
                      {idx < leaderboard.length ? `#${idx + 1}` : ''}
                    </div>
                    <div className="pokemon-name">
                      {pokemon.pokemonName || 'Unknown'}
                    </div>
                    <div className="stats-group">
                      <span className="wins">W: {pokemon.wins || 0}</span>
                      <span className="losses">L: {pokemon.losses || 0}</span>
                      <span className="winrate">
                        {pokemon.wins + pokemon.losses > 0
                          ? ((pokemon.wins / (pokemon.wins + pokemon.losses)) * 100).toFixed(0)
                          : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="leaderboard-footer">
          <p className="arcade-text">Press ESC or click outside to close</p>
        </div>
      </div>

      <style jsx>{`
        .leaderboard-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
        }

        .leaderboard-container {
          width: 90%;
          max-width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          border: 4px solid #f59e0b;
          box-shadow: 
            0 0 30px rgba(245, 158, 11, 0.6),
            inset 0 0 30px rgba(245, 158, 11, 0.1);
          display: flex;
            flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .leaderboard-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.15) 0px,
              rgba(0, 0, 0, 0.15) 2px,
              transparent 2px,
              transparent 4px
            );
          pointer-events: none;
          animation: scanlines 8s linear infinite;
          z-index: 1;
        }

        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }

        .leaderboard-header {
          position: relative;
          z-index: 10;
          padding: 20px;
          border-bottom: 3px solid #f59e0b;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.5);
        }

        .leaderboard-title {
          margin: 0;
          font-family: 'Press Start 2P', monospace;
          font-size: 18px;
          color: #f59e0b;
          text-shadow: 
            0 0 10px #f59e0b,
            2px 2px 0 rgba(0, 0, 0, 0.8);
          letter-spacing: 2px;
        }

        .close-btn {
          width: 40px;
          height: 40px;
          border: 3px solid #f59e0b;
          background: #f59e0b;
          color: #0f172a;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.1s;
          box-shadow: 0 4px 0 #b45309;
        }

        .close-btn:hover {
          background: #fbbf24;
          border-color: #fbbf24;
          box-shadow: 0 2px 0 #b45309;
          transform: translateY(2px);
        }

        .close-btn:active {
          box-shadow: 0 0 0 #b45309;
          transform: translateY(4px);
        }

        .leaderboard-content {
          position: relative;
          z-index: 10;
          flex: 1;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Courier New', monospace;
        }

        .loading-text,
        .empty-text {
          color: #f59e0b;
          font-size: 14px;
          text-align: center;
          font-weight: bold;
        }

        .scroll-wrapper {
          width: 100%;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .scroll-content {
          display: flex;
          flex-direction: column;
          gap: 0;
          transition: transform 0.05s linear;
        }

        .leaderboard-entry {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 20px;
          border-bottom: 1px solid rgba(245, 158, 11, 0.2);
          height: 60px;
          min-height: 60px;
          flex-shrink: 0;
          background: rgba(15, 23, 42, 0.6);
          transition: background 0.3s;
        }

        .leaderboard-entry:hover {
          background: rgba(245, 158, 11, 0.1);
        }

        .rank {
          font-family: 'Press Start 2P', monospace;
          font-size: 12px;
          color: #f59e0b;
          min-width: 50px;
          text-shadow: 0 0 5px rgba(245, 158, 11, 0.8);
          font-weight: bold;
        }

        .pokemon-name {
          flex: 1;
          font-size: 16px;
          font-weight: bold;
          color: #00ff88;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
          text-transform: capitalize;
          letter-spacing: 1px;
        }

        .stats-group {
          display: flex;
          gap: 20px;
          font-size: 12px;
          font-weight: bold;
        }

        .wins {
          color: #00ff00;
          text-shadow: 0 0 5px rgba(0, 255, 0, 0.8);
        }

        .losses {
          color: #ff6b6b;
          text-shadow: 0 0 5px rgba(255, 107, 107, 0.8);
        }

        .winrate {
          color: #00d4ff;
          text-shadow: 0 0 5px rgba(0, 212, 255, 0.8);
          min-width: 45px;
          text-align: right;
        }

        .leaderboard-footer {
          position: relative;
          z-index: 10;
          padding: 15px;
          text-align: center;
          border-top: 2px dashed #f59e0b;
          background: rgba(0, 0, 0, 0.5);
        }

        .arcade-text {
          margin: 0;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          color: #f59e0b;
          letter-spacing: 1px;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
