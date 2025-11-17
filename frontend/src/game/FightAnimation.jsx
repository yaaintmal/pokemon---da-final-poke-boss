import React, { useState, useEffect } from 'react';

export default function FightAnimation({ pokemonA, pokemonB }) {
  const [phase, setPhase] = useState('intro'); // 'intro', 'charge', 'clash', 'finish'
  const [announcer, setAnnouncer] = useState('FIGHT!');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('charge'), 1000);
    const timer2 = setTimeout(() => setPhase('clash'), 3000);
    const timer3 = setTimeout(() => setPhase('finish'), 5000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  useEffect(() => {
    if (phase === 'clash') setAnnouncer('BOOM!');
    if (phase === 'finish') setAnnouncer('FINISH HIM!');
  }, [phase]);

  return (
    <div className="mk-arena" style={{ position: 'relative', width: '100%', height: '500px', background: 'linear-gradient(180deg, #000 0%, #111 50%, #000 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '5px solid #ff0000' }}>
      {/* Health Bars */}
      <div className="health-bar-a" style={{ position: 'absolute', top: 20, left: 20, width: 200, height: 20, background: '#333', border: '2px solid #fff' }}>
        <div style={{ width: '100%', height: '100%', background: '#00ff00', transition: 'width 0.5s' }}></div>
        <div style={{ position: 'absolute', top: 0, left: 0, color: '#fff', fontSize: 12, padding: 2 }}>{pokemonA?.name}</div>
      </div>
      <div className="health-bar-b" style={{ position: 'absolute', top: 20, right: 20, width: 200, height: 20, background: '#333', border: '2px solid #fff' }}>
        <div style={{ width: '100%', height: '100%', background: '#00ff00', transition: 'width 0.5s' }}></div>
        <div style={{ position: 'absolute', top: 0, right: 0, color: '#fff', fontSize: 12, padding: 2 }}>{pokemonB?.name}</div>
      </div>

      {/* Fighter A */}
      <div className={`fighter-a ${phase}`} style={{ position: 'absolute', left: '15%', top: '50%', transform: 'translateY(-50%)' }}>
        <img src={pokemonA?.image || '/pokemon-placeholder.png'} alt={pokemonA?.name} style={{ width: 150, height: 150, filter: phase === 'finish' ? 'grayscale(100%)' : 'none' }} />
        <div style={{ textAlign: 'center', color: '#fff', fontSize: 18, fontFamily: 'Press Start 2P, monospace' }}>{pokemonA?.name}</div>
      </div>

      {/* Fighter B */}
      <div className={`fighter-b ${phase}`} style={{ position: 'absolute', right: '15%', top: '50%', transform: 'translateY(-50%)' }}>
        <img src={pokemonB?.image || '/pokemon-placeholder.png'} alt={pokemonB?.name} style={{ width: 150, height: 150, filter: phase === 'finish' ? 'grayscale(100%)' : 'none' }} />
        <div style={{ textAlign: 'center', color: '#fff', fontSize: 18, fontFamily: 'Press Start 2P, monospace' }}>{pokemonB?.name}</div>
      </div>

      {/* Announcer */}
      <div className="announcer" style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 36, color: '#ff0000', fontFamily: 'Press Start 2P, monospace', textShadow: '0 0 10px #ff0000', animation: 'flash 0.5s infinite' }}>
        {announcer}
      </div>

      {/* Effects */}
      {phase === 'clash' && (
        <>
          <div className="explosion" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 100, height: 100, background: 'radial-gradient(circle, #ff4500 0%, transparent 70%)', borderRadius: '50%', animation: 'explode 0.5s ease-out' }}></div>
          <div className="particle" style={{ position: 'absolute', top: '30%', left: '40%', width: 20, height: 20, background: '#ffd700', borderRadius: '50%', animation: 'particleFly 1s ease-out' }}></div>
          <div className="particle" style={{ position: 'absolute', top: '60%', left: '60%', width: 15, height: 15, background: '#ff0000', borderRadius: '50%', animation: 'particleFly 1.2s ease-out' }}></div>
        </>
      )}

      <style>{`
        .mk-arena { animation: ${phase === 'clash' ? 'shake 0.5s ease-in-out' : 'none'}; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes explode { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
        @keyframes particleFly { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-100px) rotate(360deg); opacity: 0; } }
        .fighter-a.charge { animation: chargeRight 2s ease-in-out; }
        .fighter-b.charge { animation: chargeLeft 2s ease-in-out; }
        @keyframes chargeRight { 0% { transform: translateX(0); } 100% { transform: translateX(200px); } }
        @keyframes chargeLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-200px); } }
        .fighter-a.finish { animation: defeat 1s ease-out; }
        .fighter-b.finish { animation: defeat 1s ease-out; }
        @keyframes defeat { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(50px) rotate(90deg); } }
      `}</style>
    </div>
  );
}