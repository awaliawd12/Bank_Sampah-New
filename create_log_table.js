const mysql = require('mysql2/promise');
async function run() {
  const pool = mysql.createPool({ host: '127.0.0.1', user: 'root', password: '', database: 'bank_sampah' });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      timestamp VARCHAR(20) NOT NULL,
      user VARCHAR(100) NOT NULL,
      action VARCHAR(100) NOT NULL,
      detail TEXT,
      type VARCHAR(20) NOT NULL
    )
  `);
  console.log('Created activity_log table');
  process.exit(0);
}
run().catch(console.error);
