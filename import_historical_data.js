import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'bank_sampah',
  port: parseInt(process.env.DB_PORT || '3306', 10),
};

const neracaData = [
  // 2022
  { tahun: '2022', category: 'Anorganik', jenis: 'Kertas', timbulan: 0.035, dimanfaatkan: 0, residu_tpa: 0.035 },
  { tahun: '2022', category: 'Anorganik', jenis: 'Plastik', timbulan: 0.040, dimanfaatkan: 0, residu_tpa: 0.040 },
  { tahun: '2022', category: 'Organik', jenis: 'Sisa Makanan', timbulan: 0.148, dimanfaatkan: 0, residu_tpa: 0.148 },
  { tahun: '2022', category: 'Organik', jenis: 'Sampah Taman', timbulan: 0.173, dimanfaatkan: 0.065, residu_tpa: 0.108 },
  { tahun: '2022', category: 'Residu', jenis: 'Kaca', timbulan: 0.00251, dimanfaatkan: 0, residu_tpa: 0.00251 },
  { tahun: '2022', category: 'Residu', jenis: 'Kain', timbulan: 0.00198, dimanfaatkan: 0, residu_tpa: 0.00198 },
  { tahun: '2022', category: 'Residu', jenis: 'Karet', timbulan: 0.00159, dimanfaatkan: 0, residu_tpa: 0.00159 },
  { tahun: '2022', category: 'Residu', jenis: 'Logam', timbulan: 0.00159, dimanfaatkan: 0, residu_tpa: 0.00159 },
  // 2023
  { tahun: '2023', category: 'Anorganik', jenis: 'Kertas', timbulan: 0.028, dimanfaatkan: 0, residu_tpa: 0.028 },
  { tahun: '2023', category: 'Anorganik', jenis: 'Plastik', timbulan: 0.035, dimanfaatkan: 0, residu_tpa: 0.035 },
  { tahun: '2023', category: 'Organik', jenis: 'Sisa Makanan', timbulan: 0.143, dimanfaatkan: 0, residu_tpa: 0.143 },
  { tahun: '2023', category: 'Organik', jenis: 'Sampah Taman', timbulan: 0.150, dimanfaatkan: 0.065, residu_tpa: 0.085 },
  { tahun: '2023', category: 'Residu', jenis: 'Kaca', timbulan: 0.00224, dimanfaatkan: 0, residu_tpa: 0.00224 },
  { tahun: '2023', category: 'Residu', jenis: 'Kain', timbulan: 0.00177, dimanfaatkan: 0, residu_tpa: 0.00177 },
  { tahun: '2023', category: 'Residu', jenis: 'Karet', timbulan: 0.00142, dimanfaatkan: 0, residu_tpa: 0.00142 },
  { tahun: '2023', category: 'Residu', jenis: 'Logam', timbulan: 0.00142, dimanfaatkan: 0, residu_tpa: 0.00142 },
  // 2024
  { tahun: '2024', category: 'Anorganik', jenis: 'Kertas', timbulan: 0.022, dimanfaatkan: 0, residu_tpa: 0.022 },
  { tahun: '2024', category: 'Anorganik', jenis: 'Plastik', timbulan: 0.027, dimanfaatkan: 0, residu_tpa: 0.027 },
  { tahun: '2024', category: 'Organik', jenis: 'Sisa Makanan', timbulan: 0.128, dimanfaatkan: 0.128, residu_tpa: 0 },
  { tahun: '2024', category: 'Organik', jenis: 'Sampah Taman', timbulan: 0.106, dimanfaatkan: 0.106, residu_tpa: 0 },
  { tahun: '2024', category: 'Residu', jenis: 'Kaca', timbulan: 0.00190, dimanfaatkan: 0, residu_tpa: 0.00190 },
  { tahun: '2024', category: 'Residu', jenis: 'Kain', timbulan: 0.00150, dimanfaatkan: 0, residu_tpa: 0.00150 },
  { tahun: '2024', category: 'Residu', jenis: 'Karet', timbulan: 0.00120, dimanfaatkan: 0, residu_tpa: 0.00120 },
  { tahun: '2024', category: 'Residu', jenis: 'Logam', timbulan: 0.00120, dimanfaatkan: 0, residu_tpa: 0.00120 },
  // 2025
  { tahun: '2025', category: 'Anorganik', jenis: 'Kertas', timbulan: 0.019, dimanfaatkan: 0, residu_tpa: 0.019 },
  { tahun: '2025', category: 'Anorganik', jenis: 'Plastik', timbulan: 0.021, dimanfaatkan: 0, residu_tpa: 0.021 },
  { tahun: '2025', category: 'Organik', jenis: 'Sisa Makanan', timbulan: 0.120, dimanfaatkan: 0.12035, residu_tpa: -0.00035 },
  { tahun: '2025', category: 'Organik', jenis: 'Sampah Taman', timbulan: 0.102, dimanfaatkan: 0.101525, residu_tpa: 0.000475 },
  { tahun: '2025', category: 'Residu', jenis: 'Kaca', timbulan: 0.00142, dimanfaatkan: 0, residu_tpa: 0.00142 },
  { tahun: '2025', category: 'Residu', jenis: 'Kain', timbulan: 0.00133, dimanfaatkan: 0, residu_tpa: 0.00133 },
  { tahun: '2025', category: 'Residu', jenis: 'Karet', timbulan: 0.00090, dimanfaatkan: 0, residu_tpa: 0.00090 },
  { tahun: '2025', category: 'Residu', jenis: 'Logam', timbulan: 0.00090, dimanfaatkan: 0, residu_tpa: 0.00090 },
];

const programData = [
  // 2024
  { tahun: '2024', nama_program: 'Komposting Aerobik', jenis_sampah: 'Sampah Taman', jenis_kegiatan: 'Pemanfaatan', absolut_ton: 0.01, anggaran_juta: 3.5, penghematan_juta: 0.003 },
  { tahun: '2024', nama_program: 'AMS', jenis_sampah: 'Kertas', jenis_kegiatan: 'Pengurangan', absolut_ton: 0.00419, anggaran_juta: 100, penghematan_juta: 0.096 },
  { tahun: '2024', nama_program: 'Online Salary Slip', jenis_sampah: 'Kertas', jenis_kegiatan: 'Pengurangan', absolut_ton: 0.00052, anggaran_juta: 50, penghematan_juta: 0.012 },
  { tahun: '2024', nama_program: 'MAXIMO', jenis_sampah: 'Kertas', jenis_kegiatan: 'Pengurangan', absolut_ton: 0.01048, anggaran_juta: 5, penghematan_juta: 0.24 },
  { tahun: '2024', nama_program: 'Refillable Bottles', jenis_sampah: 'Plastik', jenis_kegiatan: 'Pengurangan', absolut_ton: 0.0252, anggaran_juta: 1, penghematan_juta: 1.44 },
  { tahun: '2024', nama_program: 'ECO LAZER', jenis_sampah: 'Sampah Taman + Sisa Makanan', jenis_kegiatan: 'Pemanfaatan', absolut_ton: 0.224, anggaran_juta: 3.5, penghematan_juta: 0.0672 },
  { tahun: '2024', nama_program: 'Komposting Masyarakat', jenis_sampah: 'Sampah Taman', jenis_kegiatan: 'Pemanfaatan', absolut_ton: 0.006, anggaran_juta: 1.5, penghematan_juta: 0.0018 },
  // 2025
  { tahun: '2025', nama_program: 'Komposting Aerobik', jenis_sampah: 'Sampah Taman', jenis_kegiatan: 'Pemanfaatan', absolut_ton: 0.01455, anggaran_juta: 3.5, penghematan_juta: 0.00436 },
  { tahun: '2025', nama_program: 'AMS', jenis_sampah: 'Kertas', jenis_kegiatan: 'Pengurangan', absolut_ton: 0.0021, anggaran_juta: 100, penghematan_juta: 0.048 },
  { tahun: '2025', nama_program: 'Online Salary Slip', jenis_sampah: 'Kertas', jenis_kegiatan: 'Pengurangan', absolut_ton: 0.00026, anggaran_juta: 50, penghematan_juta: 0.006 },
  { tahun: '2025', nama_program: 'MAXIMO', jenis_sampah: 'Kertas', jenis_kegiatan: 'Pengurangan', absolut_ton: 0.00524, anggaran_juta: 5, penghematan_juta: 0.12 },
  { tahun: '2025', nama_program: 'Refillable Bottles', jenis_sampah: 'Plastik', jenis_kegiatan: 'Pengurangan', absolut_ton: 0.0042, anggaran_juta: 1, penghematan_juta: 0.24 },
  { tahun: '2025', nama_program: 'ECO LAZER', jenis_sampah: 'Sampah Taman + Sisa Makanan', jenis_kegiatan: 'Pemanfaatan', absolut_ton: 0.09837, anggaran_juta: 3.5, penghematan_juta: 0.02951 },
  { tahun: '2025', nama_program: 'MAGPRO', jenis_sampah: 'Sampah Taman + Sisa Makanan', jenis_kegiatan: 'Pemanfaatan', absolut_ton: 0.10896, anggaran_juta: 2, penghematan_juta: 0.03269 },
  { tahun: '2025', nama_program: 'EatWise Order', jenis_sampah: 'Sisa Makanan', jenis_kegiatan: 'Pengurangan', absolut_ton: 0.00288, anggaran_juta: 9.6, penghematan_juta: 4.8 },
  { tahun: '2025', nama_program: 'Komposting Masyarakat', jenis_sampah: 'Sampah Taman', jenis_kegiatan: 'Pemanfaatan', absolut_ton: 0.0025, anggaran_juta: 1.5, penghematan_juta: 0.00075 },
  { tahun: '2025', nama_program: 'MAGGROW', jenis_sampah: 'Sampah Taman + Sisa Makanan', jenis_kegiatan: 'Pemanfaatan', absolut_ton: 0.022, anggaran_juta: 22.21, penghematan_juta: 0.0066 },
];

async function main() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    console.log('Connected to DB');

    // Create tables (just to be safe)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS neraca_sampah_tahunan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tahun VARCHAR(4) NOT NULL,
        category ENUM('Organik', 'Anorganik', 'Residu') NOT NULL,
        jenis VARCHAR(50) NOT NULL,
        timbulan DECIMAL(10,5) NOT NULL,
        dimanfaatkan DECIMAL(10,5) NOT NULL,
        residu_tpa DECIMAL(10,5) NOT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS rekapitulasi_program (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tahun VARCHAR(4) NOT NULL,
        nama_program VARCHAR(150) NOT NULL,
        jenis_sampah VARCHAR(100) NOT NULL,
        jenis_kegiatan ENUM('Pemanfaatan', 'Pengurangan') NOT NULL,
        absolut_ton DECIMAL(10,5) NOT NULL,
        anggaran_juta DECIMAL(10,2) NOT NULL,
        penghematan_juta DECIMAL(10,5) NOT NULL
      )
    `);

    // Clear existing data
    await connection.query('TRUNCATE TABLE neraca_sampah_tahunan');
    await connection.query('TRUNCATE TABLE rekapitulasi_program');

    // Insert neraca
    for (const data of neracaData) {
      await connection.query(
        'INSERT INTO neraca_sampah_tahunan (tahun, category, jenis, timbulan, dimanfaatkan, residu_tpa) VALUES (?, ?, ?, ?, ?, ?)',
        [data.tahun, data.category, data.jenis, data.timbulan, data.dimanfaatkan, data.residu_tpa]
      );
    }
    console.log('Inserted neraca_sampah_tahunan data');

    // Insert program
    for (const data of programData) {
      await connection.query(
        'INSERT INTO rekapitulasi_program (tahun, nama_program, jenis_sampah, jenis_kegiatan, absolut_ton, anggaran_juta, penghematan_juta) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [data.tahun, data.nama_program, data.jenis_sampah, data.jenis_kegiatan, data.absolut_ton, data.anggaran_juta, data.penghematan_juta]
      );
    }
    console.log('Inserted rekapitulasi_program data');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

main();
