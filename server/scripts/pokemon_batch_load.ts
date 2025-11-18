#!/usr/bin/env node

// Batch loader for preloading all ~1000 Pokémon into MongoDB
// Run with: node scripts/pokemon_batch_load.ts

import { MongoClient } from 'mongodb';

const MONGO_URI: string = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME: string = 'pokedb';
const COL: string = 'pokemons';
const POKE_API: string = 'https://pokeapi.co/api/v2/pokemon/';
const BATCH_SIZE: number = 50;
const CONCURRENCY: number = 5;
const TOTAL: number = 1000; // Total Pokémon to preload

// Helper function to sleep between batches
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch and normalize a single Pokémon
async function fetchPokemon(id: number): Promise<any | null> {
  try {
    const url = `${POKE_API}${id}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();

    // Extract stats
    const stats: Record<string, number> = {};
    (d.stats || []).forEach((s: any) => { stats[s.stat.name] = s.base_stat; });

    // Types
    const types = (d.types || []).map((t: any) => t.type?.name).filter(Boolean);

    // Cry URLs (if available)
    const latest = d.cries?.latest || null;
    const legacy = d.cries?.legacy || null;
    const audioUrl = latest || legacy || null;

    return {
      _id: d.id,
      name: d.name,
      image: d.sprites?.front_default || '',
      hp: stats.hp || 0,
      atk: stats.attack || 0,
      def: stats.defense || 0,
      spa: stats['special-attack'] || 0,
      spd: stats['special-defense'] || 0,
      spe: stats.speed || 0,
      height: d.height || 0,
      weight: d.weight || 0,
      latest,
      legacy,
      audioUrl,
      types,
      cachedAt: new Date(),
    };
  } catch (error) {
    console.warn(`Failed to fetch Pokémon ${id}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

// Main batch loading function
async function main(): Promise<void> {
  console.log('Starting Pokémon batch load...');
  console.log(`Target: ${TOTAL} Pokémon`);
  console.log(`Batch size: ${BATCH_SIZE}, Concurrency: ${CONCURRENCY}`);

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('Connected to MongoDB');

  const db = client.db(DB_NAME);
  const coll = db.collection(COL);

  // Ensure index
  await coll.createIndex({ _id: 1 }, { unique: true });
  console.log('Database indexes ready');

  // Generate ID list
  const ids = Array.from({ length: TOTAL }, (_, i) => i + 1);
  let processed = 0;
  let errors = 0;

  // Process in batches
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(TOTAL / BATCH_SIZE)} (${batch[0]}-${batch[batch.length - 1]})`);

    // Fetch batch with concurrency control
    const promises = batch.map(id => fetchPokemon(id));
    const results = await Promise.all(promises);

    // Filter out nulls (failed fetches)
    const validResults = results.filter(r => r !== null);

    if (validResults.length > 0) {
      // Upsert batch
      const ops = validResults.map(p => ({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: p },
          upsert: true,
        },
      }));

      try {
        const result = await coll.bulkWrite(ops);
        console.log(`✓ Upserted ${validResults.length} Pokémon`);
        processed += validResults.length;
      } catch (error) {
        console.error('Bulk write error:', error instanceof Error ? error.message : String(error));
        errors += validResults.length;
      }
    }

    // Rate limiting delay
    if (i + BATCH_SIZE < ids.length) {
      console.log('Waiting before next batch...');
      await sleep(1000);
    }
  }

  console.log('\nBatch load complete!');
  console.log(`Processed: ${processed} Pokémon`);
  console.log(`Errors: ${errors}`);
  console.log(`Total in database: ${await coll.countDocuments()}`);

  await client.close();
  console.log('Disconnected from MongoDB');
}

// Run the script
main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});