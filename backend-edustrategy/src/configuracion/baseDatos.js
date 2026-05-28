import pg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pg;

/**
 * Pool de conexiones a PostgreSQL compartido por toda la aplicacion.
 * Usa SSL sin verificacion de certificado para compatibilidad con Railway.
 * @type {import('pg').Pool}
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
