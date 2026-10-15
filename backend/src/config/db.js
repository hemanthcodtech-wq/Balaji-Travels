import { neon, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ WARNING: DATABASE_URL is not set in environment variables. Please add your Neon DB connection string to backend/.env');
}

// neon sql tagged template executor
export const sql = connectionString ? neon(connectionString) : null;

export const testConnection = async () => {
  if (!sql) {
    console.error('❌ Neon DB connection string missing.');
    return false;
  }
  try {
    const result = await sql`SELECT 1 as connected`;
    if (result && result.length > 0) {
      console.log('✅ Connected to Neon Postgres database successfully.');
      return true;
    }
  } catch (error) {
    console.error('❌ Error connecting to Neon DB:', error.message);
    return false;
  }
};
