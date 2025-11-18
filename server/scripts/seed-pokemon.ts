#!/usr/bin/env node
import { MongoClient } from 'mongodb';
import { Pokemon } from '../types.js';

const MONGO_URL: string = process.env.MONGO_URL || 'mongodb://localhost:27017';
const MONGO_DB: string = process.env.MONGO_DB || 'pokemon_battles';

async function seedPokemon(): Promise<void> {
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db(MONGO_DB);
    const pokemonCollection = db.collection('pokemon');
    
    console.log('Fetching Pokemon list from PokéAPI...');
    const listRes = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0');
    if (!listRes.ok) throw new Error('Failed to fetch Pokemon list');
    const listData = await listRes.json();
    
    console.log(`Found ${listData.results.length} Pokemon. Fetching details...`);
    
    // Fetch Pokemon details in batches to avoid overwhelming the API
    const batchSize = 50;
    let processedCount = 0;

    for (let i = 0; i < listData.results.length; i += batchSize) {
      const batch = listData.results.slice(i, i + batchSize);
      const pokemonDataPromises = batch.map(async (p: any): Promise<Pokemon | null> => {
        try {
          const res = await fetch(p.url);
          if (!res.ok) throw new Error(`Failed to fetch ${p.name}`);
          const data = await res.json();

          // Extract stats
          const stats: Record<string, number> = {};
          data.stats?.forEach((s: any) => {
            stats[s.stat.name] = s.base_stat;
          });

          // Extract cry URLs
          const cries = {
            latest: data.cries?.latest || null,
            legacy: data.cries?.legacy || null,
          };

          return {
            id: data.id,
            name: data.name,
            image: data.sprites?.front_default || null,
            stats: {
              hp: stats.hp || 0,
              attack: stats.attack || 0,
              defense: stats.defense || 0,
              'special-attack': stats['special-attack'] || 0,
              'special-defense': stats['special-defense'] || 0,
              speed: stats.speed || 0,
            },
            cries: cries,
            height: data.height || 0,
            weight: data.weight || 0,
            types: data.types?.map((t: any) => t.type.name) || [],
            abilities: data.abilities?.map((a: any) => a.ability.name) || [],
            baseExperience: data.base_experience || 0,
            createdAt: new Date(),
          };
        } catch (err) {
          console.warn(`Failed to process ${p.name}:`, (err as Error).message);
          return null;
        }
      });
      
      const pokemonBatch = (await Promise.all(pokemonDataPromises)).filter((p): p is Pokemon => p !== null);

      if (pokemonBatch.length > 0) {
        // Upsert: update if exists, insert if not
        const operations = pokemonBatch.map(p => ({
          updateOne: {
            filter: { id: p.id },
            update: { $set: p },
            upsert: true,
          }
        }));

        await pokemonCollection.bulkWrite(operations);
        processedCount += pokemonBatch.length;
        console.log(`Processed ${processedCount}/${listData.results.length} Pokemon...`);
      }

      // Small delay between batches to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    // Create index on id for faster lookups
    await pokemonCollection.createIndex({ id: 1 });
    await pokemonCollection.createIndex({ name: 1 });

    console.log(`✅ Successfully seeded ${processedCount} Pokemon to MongoDB!`);
  } catch (err) {
    console.error('❌ Error seeding Pokemon:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedPokemon();
