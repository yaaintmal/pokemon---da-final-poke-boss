import React, { useEffect, useState } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import FifaStatsOverlay from '../game/FifaStatsOverlay';

// Tekken-like 50:50 gallery landing using poke-api style
export default function TwoTeamBuilder({ onTeamsReady }) {
  const [pokelist, setPokelist] = useState([]);
  const [teamA, setTeamA] = useState(Array(4).fill(null));
  const [teamB, setTeamB] = useState(Array(4).fill(null));

  const [hoveredPokemon, setHoveredPokemon] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });
  const { state } = useGameState();

  // Load a subset of Pokemon data mirroring poke-api.js example
  useEffect(() => {
    async function fetchList() {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=120');
        const data = await res.json();
        const items = await Promise.all(
          data.results.map(async (p) => {
            try {
              const d = await fetch(p.url).then((r) => r.json());
              const stats = d?.stats || [];
              const getStat = (name) => stats.find(s => s.stat.name === name)?.base_stat || 0;
               // Randomly choose between latest and legacy cries (if available)
               const latestCry = d?.latest ?? null;
               const legacyCry = d?.legacy ?? null;
               const cryPool = [latestCry, legacyCry].filter(Boolean);
               const chosenCry = cryPool.length > 0
                 ? cryPool[Math.floor(Math.random() * cryPool.length)]
                 : null;
               return {
                 name: p.name,
                 image: d?.sprites?.front_default || '',
                 audioUrl: chosenCry,
                 id: d?.id,
                 hp: getStat('hp'),
                 maxHp: getStat('hp'),
                 atk: getStat('attack'),
                 def: getStat('defense'),
                 satk: getStat('special-attack'),
                 sdef: getStat('special-defense'),
                 spd: getStat('speed'),
               };
            } catch {
              return { name: p.name, image: '', id: null, hp: 100, maxHp: 100, atk: 12, def: 8, satk: 0, sdef: 0, spd: 10 };
            }
          })
        );
        setPokelist(items);
      } catch (e) {
        console.warn('Failed to fetch poke-api for landing gallery', e);
      }
    }
    fetchList();
  }, []);

  const fillSlot = (team, idx, poke) => {
    if (!poke) return;
    if (team === 'A') {
      const arr = [...teamA];
      // avoid duplicates in A
      if (arr.find((x) => x?.name === poke.name)) return;
      const pos = arr.findIndex((x) => x === null);
      if (pos >= 0) {
        arr[pos] = poke;
        setTeamA(arr);
      }
    } else {
      const arr = [...teamB];
      if (arr.find((x) => x?.name === poke.name)) return;
      const pos = arr.findIndex((x) => x === null);
      if (pos >= 0) {
        arr[pos] = poke;
        setTeamB(arr);
      }
    }
  };

  // When both teams are full, notify parent and navigate to game
  useEffect(() => {
    const filledA = teamA.every((p) => p != null);
    const filledB = teamB.every((p) => p != null);
    if (filledA && filledB) {
      onTeamsReady({ pokemons: teamA }, { pokemons: teamB });
    }
  }, [teamA, teamB, onTeamsReady]);

  // Randomize: pick 4 for specified team from the available list
  const randomizeTeam = (team) => {
    if (pokelist.length < 4) return;
    const shuffled = pokelist.slice().sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4);
    if (team === 'A') {
      setTeamA(selected);
    } else {
      setTeamB(selected);
    }
  };

  const reset = () => {
    setTeamA(Array(4).fill(null));
    setTeamB(Array(4).fill(null));
  };

  const handleMouseEnter = (poke, event) => {
    const rect = event.target.getBoundingClientRect();
    setHoverPosition({ top: rect.top - 250, left: rect.left + rect.width / 2 - 100 });
    setHoveredPokemon(poke);
  };

  const handleMouseLeave = () => {
    setHoveredPokemon(null);
  };

  // Simple click-to-fill from the visible gallery, assigned to the clicked side
  const onCardClick = (poke, team) => {
    fillSlot(team, team === 'A' ? teamA.findIndex((p) => p === null) : teamB.findIndex((p) => p === null), poke);
  };

  return (
    <div className="landing-50-50" style={{ padding: 20 }}>
      {/* Top Buttons */}
      <div className="top-buttons" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => randomizeTeam('A')} style={{ padding: '12px 20px', fontSize: 16, borderRadius: 8, background: '#007bff', color: '#fff' }}>Random Team A</button>
        <button onClick={() => randomizeTeam('B')} style={{ padding: '12px 20px', fontSize: 16, borderRadius: 8, background: '#dc3545', color: '#fff' }}>Random Team B</button>
        <button onClick={reset} style={{ padding: '12px 20px', fontSize: 16, borderRadius: 8, background: '#6c757d', color: '#fff' }}>Reset</button>
      </div>

      {/* Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: Team A Panel */}
        <section className="panel" aria-label="Team A Builder" style={{ padding: 12, borderRadius: 8, background: '#111', border: '1px solid #333' }}>
          <h2 style={{ color: '#0ff', fontFamily: 'Press Start 2P, monospace', fontSize: 14, margin: '0 0 8px 0' }}>Team A</h2>
          <div className="slots" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {teamA.map((p, i) => (
              <div key={`a-slot-${i}`} className="slot" style={{ width: 90, height: 90, borderRadius: 8, border: '1px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
                {p ? (
                  <div style={{ textAlign: 'center' }}>
                    <img src={p.image || '/pokemon-placeholder.png'} alt={p.name} style={{ width: 60, height: 60 }} />
                    <div style={{ fontSize: 10, marginTop: 2, textTransform: 'capitalize' }}>{p.name}</div>
                  </div>
                ) : (
                  <span style={{ color: '#888', fontSize: 12 }}>Empty</span>
                )}
              </div>
            ))}
          </div>
          <div className="gallery" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
            {pokelist.map((p, idx) => (
              <div key={`a-${idx}`} className="card" onClick={() => onCardClick(p, 'A')} onMouseEnter={(e) => handleMouseEnter(p, e)} onMouseLeave={handleMouseLeave} style={{ cursor: 'pointer', padding: 6, borderRadius: 6, border: '1px solid #333', background: '#151515' }}>
                {p.image ? <img src={p.image} alt={p.name} style={{ width: 90, height: 90, objectFit: 'contain' }} /> : <div style={{ width: 90, height: 90, background: '#222' }} />}
                <div style={{ fontSize: 12, textAlign: 'center', marginTop: 4, fontFamily: 'monospace' }}>{p.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Team B Panel */}
        <section className="panel" aria-label="Team B Builder" style={{ padding: 12, borderRadius: 8, background: '#111', border: '1px solid #333' }}>
          <h2 style={{ color: '#0ff', fontFamily: 'Press Start 2P, monospace', fontSize: 14, margin: '0 0 8px 0' }}>Team B</h2>
          <div className="slots" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {teamB.map((p, i) => (
              <div key={`b-slot-${i}`} className="slot" style={{ width: 90, height: 90, borderRadius: 8, border: '1px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
                {p ? (
                  <div style={{ textAlign: 'center' }}>
                    <img src={p.image || '/pokemon-placeholder.png'} alt={p.name} style={{ width: 60, height: 60 }} />
                    <div style={{ fontSize: 10, marginTop: 2, textTransform: 'capitalize' }}>{p.name}</div>
                  </div>
                ) : (
                  <span style={{ color: '#888', fontSize: 12 }}>Empty</span>
                )}
              </div>
            ))}
          </div>
          <div className="gallery" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
            {pokelist.map((p, idx) => (
              <div key={`b-${idx}`} className="card" onClick={() => onCardClick(p, 'B')} onMouseEnter={(e) => handleMouseEnter(p, e)} onMouseLeave={handleMouseLeave} style={{ cursor: 'pointer', padding: 6, borderRadius: 6, border: '1px solid #333', background: '#151515' }}>
                {p.image ? <img src={p.image} alt={p.name} style={{ width: 90, height: 90, objectFit: 'contain' }} /> : <div style={{ width: 90, height: 90, background: '#222' }} />}
                <div style={{ fontSize: 12, textAlign: 'center', marginTop: 4, fontFamily: 'monospace' }}>{p.name}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <style>{`
        @font-face { font-family: 'Press Start 2P Local'; src: url('/fonts/PressStart2P.ttf'); font-weight: normal; font-style: normal; }
      `}</style>
      <FifaStatsOverlay pokemon={hoveredPokemon} position={hoverPosition} />
    </div>
  );
}
