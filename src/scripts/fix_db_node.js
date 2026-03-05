const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  try {
    await sql`
      ALTER TABLE learner_profile 
      ADD COLUMN IF NOT EXISTS skill_score real DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS preferred_depth text DEFAULT 'balanced' NOT NULL,
      ADD COLUMN IF NOT EXISTS preferred_languages jsonb DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS interest_domains jsonb DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS recent_activity_score real DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS last_signal_at timestamp;
    `;
    await sql`
      ALTER TABLE user_concept_progress 
      ADD COLUMN IF NOT EXISTS understanding_score real DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS recall_score real DEFAULT 0.0;
    `;
    await sql`
      ALTER TABLE skill_signals 
      ADD COLUMN IF NOT EXISTS concept_id uuid REFERENCES concept_cards(id);
    `;
    console.log('Database updated successfully');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

run();
