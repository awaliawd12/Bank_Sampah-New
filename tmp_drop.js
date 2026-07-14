const mysql = require('mysql2/promise');

async function updateDb() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bank_sampah',
  });

  try {
    try {
      await pool.query('ALTER TABLE master_jenis_sampah DROP COLUMN harga_per_kg');
      console.log('Dropped harga_per_kg');
    } catch (e) {
      console.log('Column harga_per_kg already dropped or error:', e.message);
    }
    
    try {
      await pool.query('ALTER TABLE rekapitulasi_program DROP COLUMN anggaran_juta');
      console.log('Dropped anggaran_juta');
    } catch (e) {
      console.log('Column anggaran_juta already dropped or error:', e.message);
    }
    
    try {
      await pool.query('ALTER TABLE rekapitulasi_program DROP COLUMN penghematan_juta');
      console.log('Dropped penghematan_juta');
    } catch (e) {
      console.log('Column penghematan_juta already dropped or error:', e.message);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

updateDb();
