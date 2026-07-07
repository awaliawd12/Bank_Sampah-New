-- SQL Schema Initialization for Bank Sampah (Powercycle)

CREATE DATABASE IF NOT EXISTS bank_sampah;
USE bank_sampah;

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'User') NOT NULL,
  unit VARCHAR(50) NOT NULL,
  joinDate DATE NOT NULL,
  status ENUM('Aktif', 'Non-Aktif') DEFAULT 'Aktif'
);

-- 2. clients
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  address TEXT,
  contact VARCHAR(50),
  joinDate DATE NOT NULL
);

-- 3. deposits
CREATE TABLE IF NOT EXISTS deposits (
  id VARCHAR(50) PRIMARY KEY,
  date VARCHAR(10) NOT NULL,
  time VARCHAR(8) NOT NULL,
  user VARCHAR(100) NOT NULL,
  client VARCHAR(150) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  category ENUM('Organik', 'Anorganik', 'Residu') NOT NULL,
  jenis VARCHAR(50) NOT NULL,
  pengelola VARCHAR(100) NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  status ENUM('Pending', 'Terverifikasi', 'Ditolak') DEFAULT 'Pending',
  remarks TEXT
);

-- 4. neraca_sampah
CREATE TABLE IF NOT EXISTS neraca_sampah (
  id VARCHAR(50) PRIMARY KEY,
  month VARCHAR(7) NOT NULL,
  category ENUM('Organik', 'Anorganik', 'Residu') NOT NULL,
  jenis VARCHAR(50) NOT NULL,
  timbulan DECIMAL(10,2) NOT NULL,
  dimanfaatkan DECIMAL(10,2) NOT NULL
);

-- 5. bukti_bayar
CREATE TABLE IF NOT EXISTS bukti_bayar (
  id VARCHAR(50) PRIMARY KEY,
  month VARCHAR(7) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  no_bukti VARCHAR(50) NOT NULL UNIQUE,
  status ENUM('Pending', 'Lunas') DEFAULT 'Pending',
  img_url LONGTEXT
);

-- 6. activity_log
CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp VARCHAR(20) NOT NULL,
  user VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  detail TEXT,
  type VARCHAR(20) NOT NULL
);


-- POPULATE INITIAL MOCK DATA --

INSERT INTO users (id, name, email, password, role, unit, joinDate, status) VALUES
('U001', 'aby', 'aby@pln.co.id', 'aby', 'User', 'Wonogiri', '2025-01-10', 'Aktif'),
('U002', 'test', 'test@pln.co.id', 'test', 'User', 'Banjarnegara', '2025-01-15', 'Aktif'),
('U003', 'hakim', 'hakim@pln.co.id', 'hakim', 'User', 'Wonogiri', '2025-02-01', 'Aktif'),
('U004', 'admin', 'tri@pln.co.id', 'admin', 'Admin', 'Wonogiri', '2025-01-05', 'Aktif')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO clients (id, name, address, contact, joinDate) VALUES
('C001', 'UP3 Jakarta Selatan', 'Jl. M.H. Thamrin No. 1, Jakarta Pusat', '021-5555001', '2025-01-15'),
('C002', 'UP3 Jakarta Utara', 'Jl. Ancol Barat No. 5, Jakarta Utara', '021-5555002', '2025-02-10'),
('C003', 'UP3 Bekasi', 'Jl. Ahmad Yani No. 12, Bekasi', '021-5555003', '2025-01-20'),
('C004', 'UP3 Tangerang', 'Jl. Sudirman No. 8, Tangerang', '021-5555004', '2025-03-05'),
('C005', 'UP3 Bogor', 'Jl. Pajajaran No. 22, Bogor', '0251-555005', '2025-02-20')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO deposits (id, date, time, user, client, unit, category, jenis, pengelola, weight, status, remarks) VALUES
('D001', '2026-07-02', '08:30', 'aby', 'UP3 Jakarta Selatan', 'Wonogiri', 'Organik', 'Sisa Makanan', 'TPA Winong', 15.5, 'Terverifikasi', ''),
('D002', '2026-07-02', '09:15', 'test', 'UP3 Jakarta Utara', 'Banjarnegara', 'Anorganik', 'Plastik', 'TPA Winong', 8.2, 'Terverifikasi', ''),
('D003', '2026-07-02', '10:00', 'hakim', 'UP3 Bekasi', 'Wonogiri', 'Organik', 'Daun', 'TPA Winong', 22.0, 'Pending', ''),
('D004', '2026-07-01', '08:00', 'aby', 'UP3 Tangerang', 'Wonogiri', 'Anorganik', 'Botol', 'TPA Winong', 12.5, 'Terverifikasi', ''),
('D005', '2026-07-01', '11:30', 'test', 'UP3 Bogor', 'Banjarnegara', 'Residu', 'Lainnya', 'TPA Winong', 18.0, 'Terverifikasi', ''),
('D006', '2026-07-01', '14:00', 'hakim', 'UP3 Jakarta Selatan', 'Wonogiri', 'Residu', 'Lainnya', 'TPA Winong', 9.8, 'Ditolak', 'Data tidak lengkap'),
('D007', '2026-06-30', '08:45', 'aby', 'UP3 Jakarta Utara', 'Wonogiri', 'Organik', 'Sisa Makanan', 'TPA Winong', 25.3, 'Terverifikasi', ''),
('D008', '2026-06-30', '13:20', 'test', 'UP3 Bekasi', 'Banjarnegara', 'Anorganik', 'Kertas', 'TPA Winong', 14.7, 'Terverifikasi', ''),
('D009', '2026-06-29', '09:00', 'hakim', 'UP3 Tangerang', 'Wonogiri', 'Organik', 'Daun', 'TPA Winong', 20.0, 'Terverifikasi', ''),
('D010', '2026-06-29', '10:30', 'aby', 'UP3 Bogor', 'Wonogiri', 'Residu', 'Lainnya', 'TPA Winong', 6.5, 'Terverifikasi', '')
ON DUPLICATE KEY UPDATE user=user;

INSERT INTO neraca_sampah (id, month, category, jenis, timbulan, dimanfaatkan) VALUES
('N1', '2026-07', 'Organik', 'Sisa Makanan', 40.8, 35.5),
('N2', '2026-07', 'Organik', 'Daun', 22.0, 20.0),
('N3', '2026-07', 'Anorganik', 'Botol', 12.5, 10.0),
('N4', '2026-07', 'Anorganik', 'Plastik', 8.2, 5.0),
('N5', '2026-07', 'Residu', 'Lainnya', 18.0, 0)
ON DUPLICATE KEY UPDATE month=month;

INSERT INTO bukti_bayar (id, month, unit, no_bukti, status, img_url) VALUES
('B1', '2026-06', 'Wonogiri', 'INV-WON-202606', 'Lunas', 'https://via.placeholder.com/400x600?text=Bukti+Bayar+Wonogiri+Jun+2026'),
('B2', '2026-06', 'Banjarnegara', 'INV-BAN-202606', 'Lunas', 'https://via.placeholder.com/400x600?text=Bukti+Bayar+Banjarnegara+Jun+2026'),
('B3', '2026-07', 'Wonogiri', 'INV-WON-202607', 'Pending', NULL)
ON DUPLICATE KEY UPDATE month=month;

INSERT INTO activity_log (id, timestamp, user, action, detail, type) VALUES
(1, '2026-07-02 10:00:15', 'hakim', 'Input Data Sampah', 'Organik (Daun) 22.0 kg - TPA Winong', 'input'),
(2, '2026-07-02 09:15:22', 'test', 'Input Data Sampah', 'Anorganik (Plastik) 8.2 kg - TPA Winong', 'input'),
(3, '2026-07-02 08:30:10', 'aby', 'Input Data Sampah', 'Organik (Sisa Makanan) 15.5 kg - TPA Winong', 'input'),
(4, '2026-07-01 16:45:00', 'tri', 'Verifikasi Data', 'D004 - Anorganik (Botol) 12.5 kg - Status Terverifikasi', 'verify'),
(5, '2026-07-01 15:30:00', 'tri', 'Tolak Data', 'D006 - Residu (Lainnya) 9.8 kg - Data tidak valid', 'reject')
ON DUPLICATE KEY UPDATE timestamp=timestamp;
