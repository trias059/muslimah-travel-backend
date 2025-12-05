import pg from 'pg';

const { Pool } = pg;

const pool = new Pool(
  process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        },
        max: 10, 
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
);

pool.on('connect', () => {
  console.log('Database connected');
});

pool.on('error', (err) => {
  console.error('Database error:', err.message);
});

export default pool;