import pg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pg;

/**
 * Pool de conexiones a PostgreSQL compartido por toda la aplicacion.
 * Usa SSL sin verificacion de certificado para compatibilidad con Railway.
 * @type {import('pg').Pool}
 */
const DATABASE_URL = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl:
    DATABASE_URL && !DATABASE_URL.includes('localhost') && !DATABASE_URL.includes('127.0.0.1')
      ? { rejectUnauthorized: false }
      : false,
});
