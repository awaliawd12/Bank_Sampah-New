export const TODAY = '2026-07-02';
export const CURRENT_MONTH = '2026-07';

export const UNIT_LIST = [
  'Wonogiri',
  'Banjarnegara'
];

export const CLIENT_LIST = [
  'UP3 Jakarta Selatan',
  'UP3 Jakarta Utara',
  'UP3 Bekasi',
  'UP3 Tangerang',
  'UP3 Bogor',
];

export const KATEGORI_SAMPAH = ['Organik', 'Anorganik', 'Residu'];
export const JENIS_SAMPAH = ['Botol', 'Plastik', 'Kertas', 'Logam', 'Kaca', 'Daun', 'Sisa Makanan', 'Lainnya'];
export const PENGELOLA_LIST = ['TPA Winong'];

export const mockUsers = [
  { id: 'U001', name: 'aby', email: 'aby@pln.co.id', role: 'User', unit: 'Wonogiri', joinDate: '2025-01-10', status: 'Aktif' },
  { id: 'U002', name: 'test', email: 'test@pln.co.id', role: 'User', unit: 'Banjarnegara', joinDate: '2025-01-15', status: 'Aktif' },
  { id: 'U003', name: 'hakim', email: 'hakim@pln.co.id', role: 'User', unit: 'Wonogiri', joinDate: '2025-02-01', status: 'Aktif' },
  { id: 'U004', name: 'tri', email: 'tri@pln.co.id', role: 'Admin', unit: 'Wonogiri', joinDate: '2025-01-05', status: 'Aktif' },
];

export const mockClients = [
  { id: 'C001', name: 'UP3 Jakarta Selatan', address: 'Jl. M.H. Thamrin No. 1, Jakarta Pusat', contact: '021-5555001', joinDate: '2025-01-15' },
  { id: 'C002', name: 'UP3 Jakarta Utara', address: 'Jl. Ancol Barat No. 5, Jakarta Utara', contact: '021-5555002', joinDate: '2025-02-10' },
  { id: 'C003', name: 'UP3 Bekasi', address: 'Jl. Ahmad Yani No. 12, Bekasi', contact: '021-5555003', joinDate: '2025-01-20' },
  { id: 'C004', name: 'UP3 Tangerang', address: 'Jl. Sudirman No. 8, Tangerang', contact: '021-5555004', joinDate: '2025-03-05' },
  { id: 'C005', name: 'UP3 Bogor', address: 'Jl. Pajajaran No. 22, Bogor', contact: '0251-555005', joinDate: '2025-02-20' },
];

export const mockActivityLog = [
  { id: 1, timestamp: '2026-07-02 10:00:15', user: 'hakim', action: 'Input Data Sampah', detail: 'Organik (Daun) 22.0 kg - TPA Winong', type: 'input' },
  { id: 2, timestamp: '2026-07-02 09:15:22', user: 'test', action: 'Input Data Sampah', detail: 'Anorganik (Plastik) 8.2 kg - TPA Winong', type: 'input' },
  { id: 3, timestamp: '2026-07-02 08:30:10', user: 'aby', action: 'Input Data Sampah', detail: 'Organik (Sisa Makanan) 15.5 kg - TPA Winong', type: 'input' },
  { id: 4, timestamp: '2026-07-01 16:45:00', user: 'tri', action: 'Verifikasi Data', detail: 'D004 - Anorganik (Botol) 12.5 kg - Status Terverifikasi', type: 'verify' },
  { id: 5, timestamp: '2026-07-01 15:30:00', user: 'tri', action: 'Tolak Data', detail: 'D006 - Residu (Lainnya) 9.8 kg - Data tidak valid', type: 'reject' },
];

export const initialDeposits = [
  { id: 'D001', date: '2026-07-02', time: '08:30', user: 'aby', client: 'UP3 Jakarta Selatan', unit: 'Wonogiri', category: 'Organik', jenis: 'Sisa Makanan', pengelola: 'TPA Winong', weight: 15.5, status: 'Terverifikasi', remarks: '' },
  { id: 'D002', date: '2026-07-02', time: '09:15', user: 'test', client: 'UP3 Jakarta Utara', unit: 'Banjarnegara', category: 'Anorganik', jenis: 'Plastik', pengelola: 'TPA Winong', weight: 8.2, status: 'Terverifikasi', remarks: '' },
  { id: 'D003', date: '2026-07-02', time: '10:00', user: 'hakim', client: 'UP3 Bekasi', unit: 'Wonogiri', category: 'Organik', jenis: 'Daun', pengelola: 'TPA Winong', weight: 22.0, status: 'Pending', remarks: '' },
  { id: 'D004', date: '2026-07-01', time: '08:00', user: 'aby', client: 'UP3 Tangerang', unit: 'Wonogiri', category: 'Anorganik', jenis: 'Botol', pengelola: 'TPA Winong', weight: 12.5, status: 'Terverifikasi', remarks: '' },
  { id: 'D005', date: '2026-07-01', time: '11:30', user: 'test', client: 'UP3 Bogor', unit: 'Banjarnegara', category: 'Residu', jenis: 'Lainnya', pengelola: 'TPA Winong', weight: 18.0, status: 'Terverifikasi', remarks: '' },
  { id: 'D006', date: '2026-07-01', time: '14:00', user: 'hakim', client: 'UP3 Jakarta Selatan', unit: 'Wonogiri', category: 'Residu', jenis: 'Lainnya', pengelola: 'TPA Winong', weight: 9.8, status: 'Ditolak', remarks: 'Data tidak lengkap' },
  { id: 'D007', date: '2026-06-30', time: '08:45', user: 'aby', client: 'UP3 Jakarta Utara', unit: 'Wonogiri', category: 'Organik', jenis: 'Sisa Makanan', pengelola: 'TPA Winong', weight: 25.3, status: 'Terverifikasi', remarks: '' },
  { id: 'D008', date: '2026-06-30', time: '13:20', user: 'test', client: 'UP3 Bekasi', unit: 'Banjarnegara', category: 'Anorganik', jenis: 'Kertas', pengelola: 'TPA Winong', weight: 14.7, status: 'Terverifikasi', remarks: '' },
  { id: 'D009', date: '2026-06-29', time: '09:00', user: 'hakim', client: 'UP3 Tangerang', unit: 'Wonogiri', category: 'Organik', jenis: 'Daun', pengelola: 'TPA Winong', weight: 20.0, status: 'Terverifikasi', remarks: '' },
  { id: 'D010', date: '2026-06-29', time: '10:30', user: 'aby', client: 'UP3 Bogor', unit: 'Wonogiri', category: 'Residu', jenis: 'Lainnya', pengelola: 'TPA Winong', weight: 6.5, status: 'Terverifikasi', remarks: '' },
];

export const initialNeracaSampah = [
  { id: 'N1', month: '2026-07', category: 'Organik', jenis: 'Sisa Makanan', timbulan: 40.8, dimanfaatkan: 35.5 },
  { id: 'N2', month: '2026-07', category: 'Organik', jenis: 'Daun', timbulan: 22.0, dimanfaatkan: 20.0 },
  { id: 'N3', month: '2026-07', category: 'Anorganik', jenis: 'Botol', timbulan: 12.5, dimanfaatkan: 10.0 },
  { id: 'N4', month: '2026-07', category: 'Anorganik', jenis: 'Plastik', timbulan: 8.2, dimanfaatkan: 5.0 },
  { id: 'N5', month: '2026-07', category: 'Residu', jenis: 'Lainnya', timbulan: 18.0, dimanfaatkan: 0 },
];

export const initialBuktiBayar = [
  { id: 'B1', month: '2026-06', unit: 'Wonogiri', no_bukti: 'INV-WON-202606', status: 'Lunas', img_url: 'https://via.placeholder.com/400x600?text=Bukti+Bayar+Wonogiri+Jun+2026' },
  { id: 'B2', month: '2026-06', unit: 'Banjarnegara', no_bukti: 'INV-BAN-202606', status: 'Lunas', img_url: 'https://via.placeholder.com/400x600?text=Bukti+Bayar+Banjarnegara+Jun+2026' },
  { id: 'B3', month: '2026-07', unit: 'Wonogiri', no_bukti: 'INV-WON-202607', status: 'Pending', img_url: null },
];

export const monthlyChartData = [
  { bulan: 'Jan', berat: 320.5 },
  { bulan: 'Feb', berat: 285.3 },
  { bulan: 'Mar', berat: 410.8 },
  { bulan: 'Apr', berat: 375.2 },
  { bulan: 'Mei', berat: 430.0 },
  { bulan: 'Jun', berat: 390.6 },
  { bulan: 'Jul', berat: 172.5 }, // sum of initial deposits
];

export const formatWeight = (value) => {
  const num = Number(value);
  return isNaN(num) ? '0.0 Kg' : `${num.toFixed(1)} Kg`;
};

export const formatWeightTon = (valueKg) => {
  const num = Number(valueKg);
  return isNaN(num) ? '0.000 Ton' : `${(num / 1000).toFixed(3)} Ton`;
};
