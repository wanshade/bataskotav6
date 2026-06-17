import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });

async function testDb() {
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 30));

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set!');
    return;
  }

  try {
    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client);

    // Test query
    const result = await db.execute('SELECT NOW() as now');
    console.log('✅ Database connected:', result);

    await client.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testDb();
