import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy initialization - only create connection when first used
let _db: ReturnType<typeof drizzle> | null = null;

function initializeDatabase() {
  if (_db) return _db;

  // Check for database URL
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured in environment variables');
  }

  try {
    // Create the connection
    const connectionString = process.env.DATABASE_URL;
    const client = postgres(connectionString, { 
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    _db = drizzle(client, { schema });
    return _db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error('Database initialization failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Export getter that initializes on first access
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const database = initializeDatabase();
    return (database as unknown as Record<string, unknown>)[prop as string];
  }
});
