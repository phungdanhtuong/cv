import pg from 'pg';
import { config } from './env.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.database.url || `postgresql://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.name}`,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

let isConnected = false;

pool.on('connect', () => {
  isConnected = true;
});

pool.on('error', () => {
  isConnected = false;
});

export const query = async (text, params) => {
  if (!isConnected) {
    throw new Error('Database connection not available');
  }
  return pool.query(text, params);
};

export const getClient = () => pool.connect();
export const isDatabaseConnected = () => isConnected;

export default pool;
