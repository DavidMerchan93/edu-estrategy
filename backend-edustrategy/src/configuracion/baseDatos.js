import pg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl:
    DATABASE_URL && !DATABASE_URL.includes('localhost') && !DATABASE_URL.includes('127.0.0.1')
      ? { rejectUnauthorized: false }
      : false,
});
