import { getDbConnection } from './src/app/lib/db.js';

async function main() {
  try {
    const pool = await getDbConnection();
    console.log('Connected to MySQL');

    // Drop unused tables
    await pool.query('DROP TABLE IF EXISTS activity_log;');
    console.log('Dropped activity_log table.');

    // Ensure PLTA Wonogiri is the only client
    await pool.query('DELETE FROM clients WHERE id != "C001";');
    console.log('Cleaned up clients (only PLTA Wonogiri remains).');
    
    // Ensure we don't have unnecessary users
    await pool.query('DELETE FROM users WHERE role NOT IN ("Admin", "User");');
    console.log('Cleaned up users.');

    console.log('Database cleanup completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
