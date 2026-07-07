import mysql from 'mysql2/promise';

let pool;

export async function getDbConnection() {
  if (pool) return pool;

  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'bank_sampah',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  try {
    pool = mysql.createPool(config);
    // Test the pool connection to verify MySQL is running
    const connection = await pool.getConnection();
    connection.release();
    console.log('MySQL Database pool connected successfully.');
    return pool;
  } catch (error) {
    console.error('MySQL database connection failed. Make sure MySQL is running and DB credentials in .env.local are correct.', error.message);
    pool = null;
    throw error;
  }
}

export async function query(sql, params) {
  try {
    const db = await getDbConnection();
    const [results] = await db.execute(sql, params);
    return results;
  } catch (error) {
    console.error(`Database query error [${sql}]:`, error.message);
    throw error;
  }
}
