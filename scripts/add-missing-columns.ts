/**
 * Minimal script to safely add missing columns to the database.
 * Run with: npx ts-node --project tsconfig.node.json scripts/add-missing-columns.ts
 * (or just run the SQL directly in your DB client)
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  console.log('Adding missing columns to concept_cards...');
  
  await sql.unsafe(`
    ALTER TABLE concept_cards 
    ADD COLUMN IF NOT EXISTS section text,
    ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;
  `);
  
  console.log('Adding missing columns to learning_roadmaps...');
  await sql.unsafe(`
    ALTER TABLE learning_roadmaps 
    ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;
  `);

  console.log('Done!');
  await sql.end();
}

main().catch(console.error);
