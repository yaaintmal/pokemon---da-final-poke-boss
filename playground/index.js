#!/usr/bin/env node
/*
 Pokémon Quartett - CLI game (ESM)
 Uses `pokedex-promise-v2` to fetch Pokémon data and compare stats.

Usage: node index.js
*/

import Pokedex from 'pokedex-promise-v2';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const P = new Pokedex();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let _allPokemonNames = null;

// Load all Pokemon names with pagination (limit per request tuned for reliability)
async function fetchAllPokemons(limitPerCall = 500) {
  const names = [];
  let offset = 0;
  let total = Infinity;
  try {
    while (names.length < total) {
      const res = await P.getPokemonsList(limitPerCall, offset);
      if (!res || !res.results) break;
      names.push(...res.results.map(p => p.name));
      total = res.count != null ? res.count : names.length;
      offset += limitPerCall;
      // Break if API returns fewer results than requested
      if (res.results.length < limitPerCall) break;
    }
    _allPokemonNames = names;
  } catch (err) {
    console.warn('Warning: could not fetch full Pokémon list, will retry later:', err.message);
    throw err;
  }
}

async function ensurePokemonsLoaded() {
  if (!_allPokemonNames) {
    await fetchAllPokemons();
  }
}

function filterNames(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return _allPokemonNames || [];
  return (_allPokemonNames || []).filter(n => n.toLowerCase().includes(q));
}

// Improved picker: show all if few matches, else pages
async function selectPokemon(label) {
  await ensurePokemonsLoaded();
  while (true) {
    const input = await question(`Enter Pokemon name or partial for ${label} (or 'list' to see all): `);
    const trimmed = input.trim();
    if (!trimmed) continue;

    if (trimmed.toLowerCase() === 'q' || trimmed.toLowerCase() === 'quit') {
      throw new Error('User quit selection');
    }

    if (trimmed.toLowerCase() === 'list') {
      // Show a sample of all Pokemon
      const sample = (_allPokemonNames || []).slice(0, 50);
      console.log('Sample of all Pokemon:', sample.join(', '), '...');
      continue;
    }

    const matches = filterNames(trimmed);
    if (matches.length === 0) {
      console.log('No matches. Try a broader term.');
      continue;
    }

    if (matches.length === 1) {
      return matches[0];
    }

    if (matches.length <= 50) {
      // Show all matches
      console.log('Matches:');
      matches.forEach((name, idx) => {
        console.log(`  ${idx + 1}) ${name}`);
      });
      const pick = await question('Choose a number from above: ');
      const n = parseInt((pick || '').trim(), 10);
      if (n >= 1 && n <= matches.length) {
        return matches[n - 1];
      }
    } else {
      // Too many, show pages
      let page = 0;
      const pageSize = 50;
      while (true) {
        const display = matches.slice(page * pageSize, (page + 1) * pageSize);
        console.log(`Matches for ${label} (Page ${page + 1}):`);
        display.forEach((name, idx) => {
          console.log(`  ${idx + 1 + page * pageSize}) ${name}`);
        });
        console.log(`-- page ${page + 1} of ${Math.ceil(matches.length / pageSize)} --`);
        console.log("Commands: number to select, 'n' next page, 'p' prev page, 'q' quit");

        const cmd = await question(`Choose a number or command: `);
        const c = cmd.trim();
        if (c.toLowerCase() === 'q') throw new Error('User quit selection');
        if (c.toLowerCase() === 'n') {
          if ((page + 1) * pageSize < matches.length) page++;
          continue;
        }
        if (c.toLowerCase() === 'p') {
          if (page > 0) page--;
          continue;
        }
        const num = parseInt(c, 10);
        if (num >= 1 && num <= matches.length) {
          return matches[num - 1];
        }
        console.log('Invalid input.');
      }
    }
  }
}

function question(prompt) {
    return new Promise((resolve) => rl.question(prompt, resolve));
}

function pickRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function statsToMap(statsArray) {
    const map = {};
    statsArray.forEach((s) => {
        map[s.stat.name] = s.base_stat;
    });
    return map;
}

function formatPokemonShort(p) {
    const stats = statsToMap(p.stats);
    return {
        id: p.id,
        name: p.name,
        hp: stats.hp || 0,
        attack: stats.attack || 0,
        defense: stats.defense || 0,
        specialAttack: stats['special-attack'] || 0,
        specialDefense: stats['special-defense'] || 0,
        speed: stats.speed || 0,
    };
}

function printPokemon(p) {
    console.log(`#${p.id} - ${capitalize(p.name)}`);
    console.log(`  HP:  ${p.hp}`);
    console.log(`  ATK: ${p.attack}`);
    console.log(`  DEF: ${p.defense}`);
    console.log(`  S.ATK: ${p.specialAttack}`);
    console.log(`  S.DEF: ${p.specialDefense}`);
    console.log(`  SPD:  ${p.speed}`);
}

function capitalize(s) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function compareByKey(a, b, key) {
    if (a[key] > b[key]) return 1;
    if (a[key] < b[key]) return -1;
    return 0;
}

async function fetchPokemon(id) {
    try {
        const res = await P.getPokemonByName(id);
        return formatPokemonShort(res);
    } catch (err) {
        throw new Error(`Failed to fetch Pokémon ${id}: ${err.message}`);
    }
}



async function playRound() {
    try {
        const nameA = await selectPokemon('Player A');
        const nameB = await selectPokemon('Player B');

        console.log('\nFetching Pokémon data...');
        const [a, b] = await Promise.all([fetchPokemon(nameA), fetchPokemon(nameB)]);

    console.log('\nPlayer A:');
    printPokemon(a);

    console.log('\nPlayer B:');
    printPokemon(b);

    console.log('\nChoose a stat to compare:');
    console.log('  1) HP');
    console.log('  2) Attack');
    console.log('  3) Defense');
    console.log('  4) Special Attack');
    console.log('  5) Special Defense');
    console.log('  6) Speed');

    const choice = await question('Enter number (1-6) [default 2]: ');
    const idx = (choice.trim() === '') ? '2' : choice.trim();
    const mapping = {
        '1': 'hp',
        '2': 'attack',
        '3': 'defense',
        '4': 'specialAttack',
        '5': 'specialDefense',
        '6': 'speed',
    };

    const key = mapping[idx] || 'attack';

    console.log(`\nComparing by ${key}...`);
    const result = compareByKey(a, b, key);

        console.log(`\n${capitalize(a.name)} has ${a[key]} vs ${capitalize(b.name)}'s ${b[key]}`);

        if (result > 0) console.log('\n=> Player A wins this round!');
        else if (result < 0) console.log('\n=> Player B wins this round!');
        else console.log('\n=> It\'s a tie!');
    } catch (err) {
        throw err;
    }
}

async function main() {
    console.log('Pokémon Quartett - CLI game');
    console.log('Select from all Pokémon in PokeAPI and compare stats.');
    console.log('Fetches data from pokéapi via pokedex-promise-v2.');

    console.log('Loading full Pokémon list...');
    await ensurePokemonsLoaded();

    while (true) {
        const ans = await question('\nPress Enter to select two Pokémon, or type `q` to quit: ');
        const s = ans.trim().toLowerCase();
        if (s === 'q' || s === 'quit' || s === 'exit') break;

        try {
            await playRound();
        } catch (err) {
            console.error('Error:', err.message);
        }
    }

    console.log('\nThanks for playing!');
    rl.close();
}

// ESM-friendly entry point check
if (process.argv[1] === __filename) {
    main().catch((err) => {
        console.error('Unexpected error:', err);
        process.exit(1);
    });
}

export { P };