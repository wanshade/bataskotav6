// Simple script to apply database migration
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigration() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('🔌 Connecting to database...');
  const sql = postgres(DATABASE_URL);

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'drizzle', '0001_add_booking_id.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Applying migration: Add booking_id column...');
    
    // Execute the migration
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration applied successfully!');
    console.log('📊 Database schema updated with booking_id field');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 If the column already exists, you can ignore this error.');
  } finally {
    await sql.end();
  }
}

applyMigration();
