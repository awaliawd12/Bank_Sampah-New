import { getDbConnection } from './src/app/lib/db.js';

async function main() {
  try {
    const pool = await getDbConnection();
    console.log('Connected to MySQL');

    // Add Banjarnegara back to clients
    await pool.query(
      `INSERT INTO clients (id, name, address, contact, joinDate) VALUES ('C002', 'PLTA Banjarnegara', 'Banjarnegara', '-', '2021-01-01') ON DUPLICATE KEY UPDATE name=name;`
    );
    console.log('Added Banjarnegara to clients.');

    console.log('Database update completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
