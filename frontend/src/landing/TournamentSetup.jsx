import React, { useEffect, useState } from 'react';
import FifaStatsOverlay from '../game/FifaStatsOverlay';

// Tournament setup: select size, then pick Pokemon
export default function TournamentSetup({ onParticipantsReady }) {
  const [pokelist, setPokelist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState(null); // 8,16,32,64
  const [selected, setSelected] = useState([]);
  const [hoveredPokemon, setHoveredPokemon] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });

  // Load Pokemon data
  useEffect(() => {
    async function fetchList() {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=50', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = await Promise.all(
          data.results.map(async (p) => {
            try {
              const d = await fetch(p.url).then((r) => r.json());
              const stats = d?.stats || [];
              const getStat = (name) => stats.find(s => s.stat.name === name)?.base_stat || 0;
              return {
                name: p.name,
                image: d?.sprites?.front_default || '',
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
        // Fallback data
        setPokelist([
          { name: 'Pikachu', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', id: 25, hp: 35, maxHp: 35, atk: 55, def: 40, satk: 50, sdef: 50, spd: 90 },
          { name: 'Charizard', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', id: 6, hp: 78, maxHp: 78, atk: 84, def: 78, satk: 109, sdef: 85, spd: 100 },
          { name: 'Squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png', id: 7, hp: 44, maxHp: 44, atk: 48, def: 65, satk: 50, sdef: 64, spd: 43 },
          { name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png', id: 1, hp: 45, maxHp: 45, atk: 49, def: 49, satk: 65, sdef: 65, spd: 45 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchList();
  }, []);

  // When selected reaches size, notify parent
  useEffect(() => {
    if (size && selected.length === size) {
      onParticipantsReady(selected);
    }
  }, [selected, size, onParticipantsReady]);

  const selectSize = (newSize) => {
    setSize(newSize);
    setSelected([]);
  };

  const addPokemon = (poke) => {
    if (selected.length >= size) return;
    if (selected.find((p) => p.name === poke.name)) return; // no duplicates
    setSelected([...selected, poke]);
  };

  const removePokemon = (idx) => {
    const newSelected = [...selected];
    newSelected.splice(idx, 1);
    setSelected(newSelected);
  };

  const randomize = () => {
    if (!size || pokelist.length < size) return;
    const shuffled = pokelist.slice().sort(() => Math.random() - 0.5);
    setSelected(shuffled.slice(0, size));
  };

  const reset = () => {
    setSelected([]);
  };

  const handleMouseEnter = (poke, event) => {
    const rect = event.target.getBoundingClientRect();
    setHoverPosition({ top: rect.top - 250, left: rect.left + rect.width / 2 - 100 });
    setHoveredPokemon(poke);
  };

  const handleMouseLeave = () => {
    setHoveredPokemon(null);
  };

  if (!size) {
    return (
      <div style={{ padding: 20, textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <h1 style={{ color: 'var(--accent-primary)', fontFamily: 'Press Start 2P, monospace', marginBottom: 40 }}>King of the Ring</h1>
        <p style={{ marginBottom: 40, fontSize: 18 }}>Select tournament size:</p>
        <div style={{ display: 'flex', gap: 20 }}>
          {[8, 16, 32, 64].map((s) => (
            <button key={s} onClick={() => selectSize(s)} style={{ padding: '20px 30px', fontSize: 24, borderRadius: 8, background: 'var(--accent-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer' }}>
              {s} Pokemon
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="landing-50-50" style={{ padding: 20 }}>
      {/* Top Buttons */}
      <div className="top-buttons" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={randomize} style={{ padding: '12px 20px', fontSize: 16, borderRadius: 8, background: 'var(--accent-primary)', color: 'var(--bg-primary)' }}>Random Select</button>
        <button onClick={reset} style={{ padding: '12px 20px', fontSize: 16, borderRadius: 8, background: 'var(--error)', color: 'var(--text-primary)' }}>Reset</button>
        <span style={{ color: 'var(--accent-primary)', fontFamily: 'Press Start 2P, monospace' }}>Selected: {selected.length}/{size}</span>
      </div>

      {/* Selected Pokemon */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: '#0ff', fontFamily: 'Press Start 2P, monospace', fontSize: 14, margin: '0 0 8px 0' }}>Selected Participants</h2>
        <div className="slots" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Array.from({ length: size }, (_, i) => (
            <div key={`slot-${i}`} className="slot" style={{ width: 90, height: 90, borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
              {selected[i] ? (
                <div style={{ textAlign: 'center', position: 'relative' }}>
                  <img src={selected[i].image || '/pokemon-placeholder.png'} alt={selected[i].name} style={{ width: 60, height: 60 }} />
                  <div style={{ fontSize: 10, marginTop: 2, textTransform: 'capitalize' }}>{selected[i].name}</div>
                  <button onClick={() => removePokemon(i)} style={{ position: 'absolute', top: -5, right: -5, width: 20, height: 20, borderRadius: '50%', background: 'var(--error)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: 12 }}>×</button>
                </div>
              ) : (
                <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Empty</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div className="gallery" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20, color: 'var(--text-secondary)' }}>Loading Pokemon...</div>
        ) : pokelist.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20, color: 'var(--error)' }}>Failed to load Pokemon. Using fallback data.</div>
        ) : (
          pokelist.map((p, idx) => (
            <div key={idx} className="card" onClick={() => addPokemon(p)} onMouseEnter={(e) => handleMouseEnter(p, e)} onMouseLeave={handleMouseLeave} style={{ cursor: 'pointer', padding: 6, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              {p.image ? <img src={p.image} alt={p.name} style={{ width: 90, height: 90, objectFit: 'contain' }} /> : <div style={{ width: 90, height: 90, background: 'var(--bg-primary)' }} />}
              <div style={{ fontSize: 12, textAlign: 'center', marginTop: 4, fontFamily: 'monospace' }}>{p.name}</div>
            </div>
          ))
        )}
      </div>

      <FifaStatsOverlay pokemon={hoveredPokemon} position={hoverPosition} />
    </div>
  );
}