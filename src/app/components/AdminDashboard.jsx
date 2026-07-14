import { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, Trash2, Users, Building2, FileText,
  BarChart2, Activity, Settings, LogOut, Menu,
  Search, Package, Scale, ChevronLeft, ChevronRight,
  Database, FileCheck, CheckCircle, Leaf, Recycle, Eye, Upload
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import {
  formatWeight, formatWeightTon, TODAY,
  KATEGORI_SAMPAH
} from '../lib/mockData';
import { MasterDataManagement } from './MasterDataManagement';
import { exportToPDF, exportToExcel } from '../lib/exportUtils';


const DAFTAR_BULAN = [
  { id: '01', nama: 'Januari' },
  { id: '02', nama: 'Februari' },
  { id: '03', nama: 'Maret' },
  { id: '04', nama: 'April' },
  { id: '05', nama: 'Mei' },
  { id: '06', nama: 'Juni' },
  { id: '07', nama: 'Juli' },
  { id: '08', nama: 'Agustus' },
  { id: '09', nama: 'September' },
  { id: '10', nama: 'Oktober' },
  { id: '11', nama: 'November' },
  { id: '12', nama: 'Desember' }
];

const PLNLogo = ({ size = 36 }) => {
  const customLogoUrl = '/Logo.png';
  if (customLogoUrl) {
    return <img src={customLogoUrl} alt="Logo" style={{ height: size, maxWidth: '100%', objectFit: 'contain' }} />;
  }
  return null;
};

function filterDataBerdasarkanWaktu(dataList, rentangWaktu) {
  const tanggalHariIni = new Date(TODAY);
  
  return dataList.filter(item => {
    if (!item.date) return false;
    const tanggalItem = new Date(item.date);
    
    if (rentangWaktu === 'hari') {
      return item.date === TODAY;
    }
    if (rentangWaktu === 'minggu') {
      const selisihWaktu = tanggalHariIni.getTime() - tanggalItem.getTime();
      const selisihHari = selisihWaktu / (1000 * 3600 * 24);
      return selisihHari >= 0 && selisihHari <= 7;
    }
    if (rentangWaktu === 'bulan') {
      return tanggalItem.getMonth() === tanggalHariIni.getMonth() && 
             tanggalItem.getFullYear() === tanggalHariIni.getFullYear();
    }
    return true; 
  });
}

function StatusBadge({ status }) {
  const cfg = {
    'Terverifikasi': { bg: 'rgba(16, 185, 129, 0.08)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.2)' },
    'Pending': { bg: 'rgba(245, 158, 11, 0.08)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.2)' },
    'Menunggu Validasi': { bg: 'rgba(59, 130, 246, 0.08)', color: '#2563EB', border: '1px solid rgba(59, 130, 246, 0.2)' },
    'Ditolak': { bg: 'rgba(239, 68, 68, 0.08)', color: '#b91c1c', border: '1px solid rgba(239, 68, 68, 0.2)' },
    'Aktif': { bg: 'rgba(16, 185, 129, 0.08)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.2)' },
    'Non-Aktif': { bg: 'rgba(100, 116, 139, 0.08)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.2)' },
    'Lunas': { bg: 'rgba(16, 185, 129, 0.08)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.2)' },
    'Menunggu Konfirmasi Admin': { bg: 'rgba(99, 102, 241, 0.08)', color: '#4338CA', border: '1px solid rgba(99, 102, 241, 0.2)' },
    'Disetujui': { bg: 'rgba(16, 185, 129, 0.08)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.2)' },
  };
  const { bg, color, border } = cfg[status] || { bg: 'rgba(100, 116, 139, 0.08)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.2)' };
  return (
    <span style={{ 
      background: bg, 
      color, 
      border,
      padding: '4px 10px', 
      borderRadius: '9999px', 
      fontSize: '0.72rem', 
      fontWeight: 700, 
      whiteSpace: 'nowrap', 
      display: 'inline-block' 
    }}>
      {status}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: 20, 
      padding: '20px', 
      boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', 
      border: '1px solid var(--ds-border)' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ 
          backgroundColor: bg, 
          borderRadius: 14, 
          width: 48, 
          height: 48, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexShrink: 0 
        }}>
          <Icon size={22} style={{ color }} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--ds-text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{value}</p>
        </div>
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 10;

export function AdminDashboard({ role, deposits, neraca, buktiBayar, inventarisasi = [], rekapProgram = [], users = [], clients = [], onLogout, onDeleteDeposit, onUpdateStatus, onUpdateBuktiStatus, userUnit }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [selectedBulan, setSelectedBulan] = useState('2026-07');
  const [selectedTahunHistoris, setSelectedTahunHistoris] = useState('2025');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [laporanFilter, setLaporanFilter] = useState('semua');
  const [activeKwitansiPopup, setActiveKwitansiPopup] = useState(null);
  const [selectedTahunBukti, setSelectedTahunBukti] = useState('2026');
  
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    setSelectedRow(null);
  }, [currentPage, tablePage, dateFilter, categoryFilter, searchQuery, selectedBulan, selectedTahunHistoris]);

  const [editingItem, setEditingItem] = useState(null);
  const [editFormType, setEditFormType] = useState('');
  const [editFormData, setEditFormData] = useState({});

  const handleEdit = (item, type) => {
    setEditingItem(item.id);
    setEditFormType(type);
    setEditFormData(item);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      if (editFormType === 'deposit') endpoint = `/api/deposits/${editingItem}`;
      if (editFormType === 'client') endpoint = `/api/clients/${editingItem}`;
      if (editFormType === 'neraca') endpoint = `/api/neraca/${editingItem}`;
      if (editFormType === 'inventarisasi') endpoint = `/api/inventarisasi/${editingItem}`;
      if (editFormType === 'rekap') endpoint = `/api/rekap-program/${editingItem}`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      
      if (res.ok) {
        alert('Data berhasil diperbarui. Halaman akan dimuat ulang.');
        window.location.reload();
      } else {
        alert('Gagal memperbarui data.');
      }
    } catch (err) {
      alert('Terjadi kesalahan.');
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      let endpoint = '';
      if (type === 'deposit') endpoint = `/api/deposits/${id}`;
      if (type === 'client') endpoint = `/api/clients/${id}`;
      if (type === 'neraca') endpoint = `/api/neraca/${id}`;
      if (type === 'inventarisasi') endpoint = `/api/inventarisasi/${id}`;
      if (type === 'rekap') endpoint = `/api/rekap-program/${id}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        alert('Data berhasil dihapus. Halaman akan dimuat ulang.');
        window.location.reload();
      } else {
        alert('Gagal menghapus data.');
      }
    } catch (err) {
      alert('Terjadi kesalahan.');
    }
  };

  const unitDeposits = useMemo(() => deposits.filter(d => !userUnit || d.unit === userUnit), [deposits, userUnit]);
  const unitBuktiBayar = useMemo(() => buktiBayar.filter(b => !userUnit || b.unit === userUnit), [buktiBayar, userUnit]);

  const todayDeposits = useMemo(() => unitDeposits.filter(d => d.date === TODAY), [unitDeposits]);
  const totalWeight = useMemo(() => unitDeposits.reduce((s, d) => s + (Number(d.weight) || 0), 0), [unitDeposits]);
  const organikWeight = useMemo(() => unitDeposits.filter(d => d.category === 'Organik').reduce((s, d) => s + (Number(d.weight) || 0), 0), [unitDeposits]);
  const anorganikWeight = useMemo(() => unitDeposits.filter(d => d.category === 'Anorganik').reduce((s, d) => s + (Number(d.weight) || 0), 0), [unitDeposits]);
  const residuWeight = useMemo(() => unitDeposits.filter(d => d.category === 'Residu').reduce((s, d) => s + (Number(d.weight) || 0), 0), [unitDeposits]);

  // PERBAIKAN: Membuat rentang 7 hari kalender asli mundur berturut-turut dari TODAY
  const dailyChartData = useMemo(() => {
    const dataGrafik = [];
    const basisTanggal = new Date(TODAY);

    // Iterasi mundur 7 hari kalender berturut-turut
    for (let i = 6; i >= 0; i--) {
      const d = new Date(basisTanggal);
      d.setDate(basisTanggal.getDate() - i);
      
      const stringKeyTanggal = d.toISOString().split('T')[0];
      const labelFormatIndo = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

      // Ambil seluruh timbulan transaksi di tanggal tersebut
      const transaksiHariIni = unitDeposits.filter(dep => dep.date === stringKeyTanggal);
      const beratOrganik = transaksiHariIni.filter(dep => dep.category === 'Organik').reduce((s, dep) => s + (Number(dep.weight) || 0), 0);
      const beratAnorganik = transaksiHariIni.filter(dep => dep.category === 'Anorganik').reduce((s, dep) => s + (Number(dep.weight) || 0), 0);
      const beratResidu = transaksiHariIni.filter(dep => dep.category === 'Residu').reduce((s, dep) => s + (Number(dep.weight) || 0), 0);

      dataGrafik.push({
        date: labelFormatIndo,
        Organik: Number(beratOrganik.toFixed(1)),
        Anorganik: Number(beratAnorganik.toFixed(1)),
        Residu: Number(beratResidu.toFixed(1))
      });
    }
    return dataGrafik;
  }, [unitDeposits]);

  const pieData = [
    { name: 'Organik', value: +Number(organikWeight).toFixed(1), color: '#10B981' },
    { name: 'Anorganik', value: +Number(anorganikWeight).toFixed(1), color: '#0891B2' },
    { name: 'Residu', value: +Number(residuWeight).toFixed(1), color: '#F59E0B' },
  ];

  const filteredDeposits = useMemo(() => {
    return unitDeposits.filter(d => {
      const q = searchQuery.toLowerCase();
      if (q && !d.pengelola.toLowerCase().includes(q)) return false;
      if (dateFilter && d.date !== dateFilter) return false;
      if (categoryFilter && d.category !== categoryFilter) return false;
      return true;
    });
  }, [unitDeposits, searchQuery, dateFilter, categoryFilter]);

  const totalTablePages = useMemo(() => {
    return Math.ceil(filteredDeposits.length / ITEMS_PER_PAGE);
  }, [filteredDeposits]);

  const paginatedDeposits = useMemo(() => {
    return filteredDeposits.slice((tablePage - 1) * ITEMS_PER_PAGE, tablePage * ITEMS_PER_PAGE);
  }, [filteredDeposits, tablePage]);

  const sidebarItems = role === 'admin sis' ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pengelola-data', label: 'Manajemen Pengguna & Unit', icon: Users },
    { id: 'master-data', label: 'Data Master', icon: Settings },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'waste-monitoring', label: 'Monitoring Sampah', icon: Trash2 },
    { id: 'reports', label: 'Laporan', icon: FileText },
    { id: 'neraca', label: 'Neraca Sampah Bulanan', icon: Database },
    { id: 'inventarisasi', label: 'Inventarisasi Historis', icon: FileCheck },
    { id: 'rekap-program', label: 'Rekap Program Historis', icon: CheckCircle },
    { id: 'bukti-bayar', label: 'Bukti Bayar', icon: Recycle },
  ];

  const pageTitles = {
    dashboard: 'Dashboard', 'waste-monitoring': 'Monitoring Sampah',
    'pengelola-data': 'Manajemen Pengguna & Unit',
    'master-data': 'Manajemen Data Master',
    reports: 'Laporan', neraca: 'Neraca Sampah Bulanan',
    'bukti-bayar': 'Bukti Bayar',
    inventarisasi: 'Inventarisasi Sampah Historis (2021-2026)',
    'rekap-program': 'Rekapitulasi Program Pengelolaan Sampah',
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
    setTablePage(1);
  };

  const Pagination = ({ page, total, onChange, totalItems }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, flexWrap: 'wrap', gap: 12 }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)', fontWeight: 500 }}>
        Halaman {page} dari {total || 1} ({totalItems} data)
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
          style={{ padding: '8px 12px', border: '1px solid var(--ds-border)', borderRadius: 10, background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.45 : 1, display: 'flex', alignItems: 'center', color: 'var(--ds-text)' }}>
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(total, 5) }, (_, i) => {
          const p = total <= 5 ? i + 1 : Math.max(1, Math.min(total - 4, page - 2)) + i;
          return (
            <button key={p} onClick={() => onChange(p)}
              style={{ padding: '8px 14px', border: `1.5px solid ${p === page ? 'var(--ds-accent)' : 'var(--ds-border)'}`, borderRadius: 10, background: p === page ? 'var(--ds-accent)' : 'white', color: p === page ? 'white' : 'var(--ds-text)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: p === page ? 700 : 500, transition: 'all 0.2s' }}>
              {p}
            </button>
          );
        })}
        <button onClick={() => onChange(Math.min(total, page + 1))} disabled={page === total || total === 0}
          style={{ padding: '8px 12px', border: '1px solid var(--ds-border)', borderRadius: 10, background: 'white', cursor: page === total || total === 0 ? 'not-allowed' : 'pointer', opacity: page === total || total === 0 ? 0.45 : 1, display: 'flex', alignItems: 'center', color: 'var(--ds-text)' }}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard title="Total Unit PLN" value={clients.length} icon={Building2} color="#0891B2" bg="rgba(8, 145, 178, 0.08)" />
        <StatCard title="Input Hari Ini" value={todayDeposits.length} icon={Package} color="#10B981" bg="rgba(16, 185, 129, 0.08)" />
        <StatCard title="Total Berat" value={formatWeight(totalWeight)} icon={Scale} color="#6366F1" bg="rgba(99, 102, 241, 0.08)" />
      </div>

      {role !== 'admin sis' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <StatCard title="Sampah Organik" value={formatWeight(organikWeight)} icon={Database} color="#10B981" bg="rgba(16, 185, 129, 0.05)" />
            <StatCard title="Sampah Anorganik" value={formatWeight(anorganikWeight)} icon={Database} color="var(--ds-accent)" bg="rgba(8, 145, 178, 0.05)" />
            <StatCard title="Sampah Residu" value={formatWeight(residuWeight)} icon={Database} color="#F59E0B" bg="rgba(245, 158, 11, 0.05)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '2fr 1fr', gap: 24 }}>
            <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 24, letterSpacing: '-0.3px' }}>Setoran Harian – 7 Hari Terakhir</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--ds-text-muted)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--ds-text-muted)' }} />
                    <Tooltip cursor={{ fill: 'rgba(8, 145, 178, 0.02)' }} contentStyle={{ background: 'var(--ds-dark)', border: 'none', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', color: '#fff' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="Organik" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} barSize={32} />
                    <Bar dataKey="Anorganik" stackId="a" fill="var(--ds-accent)" />
                    <Bar dataKey="Residu" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 24, letterSpacing: '-0.3px' }}>Komposisi Sampah</h3>
              <div style={{ height: 260, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--ds-dark)', border: 'none', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', color: '#fff' }} formatter={(value) => `${value} Kg`} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 20, letterSpacing: '-0.3px' }}>Log Pencatatan Sampah Terbaru</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Tanggal</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Pengguna</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kategori</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Jenis</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Berat</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {unitDeposits.slice(0, 5).map((d, i) => (
                <tr key={d.id} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                  <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.date}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.user}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ background: d.category === 'Organik' ? 'rgba(16, 185, 129, 0.08)' : d.category === 'Anorganik' ? 'rgba(8, 145, 178, 0.08)' : 'rgba(245, 158, 11, 0.08)', color: d.category === 'Organik' ? '#047857' : d.category === 'Anorganik' ? '#0891B2' : '#b45309', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                      {d.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.jenis}</td>
                  <td style={{ padding: '14px 18px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ds-text)' }}>{Number(d.weight).toFixed(1)} Kg</td>
                  <td style={{ padding: '14px 18px' }}><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderWasteMonitoring = () => (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ds-text-muted)' }} />
            <input type="text" placeholder="Cari klien..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setTablePage(1); }}
              style={{ width: '100%', padding: '11px 14px 11px 40px', border: '1.5px solid var(--ds-border)', borderRadius: 12, fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', color: 'var(--ds-text)' }} />
          </div>
          <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setTablePage(1); }}
            style={{ padding: '11px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 12, fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', color: 'var(--ds-text)', background: 'white' }} />
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setTablePage(1); }}
            style={{ padding: '11px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 12, fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', color: 'var(--ds-text)', background: 'white' }}>
            <option value="">Semua Kategori</option>
            {KATEGORI_SAMPAH.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)', fontWeight: 600 }}>Aksi:</span>
        <button disabled={!selectedRow} onClick={() => selectedRow && handleEdit(selectedRow, 'deposit')} style={{ padding: '8px 16px', background: selectedRow ? '#F1F5F9' : '#F8FAFC', color: selectedRow ? '#0F172A' : '#94A3B8', border: '1px solid var(--ds-border)', borderRadius: 8, cursor: selectedRow ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Edit</button>
        <button disabled={!selectedRow} onClick={() => selectedRow && handleDelete(selectedRow.id, 'deposit')} style={{ padding: '8px 16px', background: selectedRow ? '#FEE2E2' : '#F8FAFC', color: selectedRow ? '#EF4444' : '#94A3B8', border: '1px solid var(--ds-border)', borderRadius: 8, cursor: selectedRow ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Hapus</button>
        {selectedRow && selectedRow.status === 'Pending' && onUpdateStatus && (
          <>
            <div style={{ width: 1, height: 24, background: 'var(--ds-border)', margin: '0 8px' }} />
            <button onClick={() => { onUpdateStatus(selectedRow.id, 'Terverifikasi'); setSelectedRow(null); }} style={{ padding: '8px 16px', background: '#D1FAE5', color: '#047857', border: '1px solid var(--ds-border)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Terima</button>
            <button onClick={() => { onUpdateStatus(selectedRow.id, 'Ditolak'); setSelectedRow(null); }} style={{ padding: '8px 16px', background: '#FEE2E2', color: '#B91C1C', border: '1px solid var(--ds-border)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Tolak</button>
          </>
        )}
      </div>
      <div style={{ overflowX: 'auto', minHeight: 400 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 18px', width: 40 }}></th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Tanggal/Waktu</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Unit</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kategori</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Jenis</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Pengelola</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Berat</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDeposits.map((d, i) => (
              <tr key={d.id} onClick={() => setSelectedRow(selectedRow?.id === d.id ? null : d)} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: selectedRow?.id === d.id ? '#F0F9FF' : (i % 2 === 0 ? 'white' : '#FAFCFD'), cursor: 'pointer', transition: 'background 0.2s' }}>
                <td style={{ padding: '14px 18px' }}>
                  <input type="radio" checked={selectedRow?.id === d.id} onChange={() => setSelectedRow(d)} style={{ cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.date} <span style={{ color: 'var(--ds-text-muted)', fontSize: '0.8rem' }}>{d.time}</span></td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.unit}</td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{ background: d.category === 'Organik' ? 'rgba(16, 185, 129, 0.08)' : d.category === 'Anorganik' ? 'rgba(8, 145, 178, 0.08)' : 'rgba(245, 158, 11, 0.08)', color: d.category === 'Organik' ? '#047857' : d.category === 'Anorganik' ? '#0891B2' : '#b45309', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                    {d.category}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.jenis}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.pengelola}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ds-text)' }}>{Number(d.weight).toFixed(1)} Kg</td>
                <td style={{ padding: '14px 18px' }}><StatusBadge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={tablePage} total={totalTablePages} onChange={setTablePage} totalItems={filteredDeposits.length} />
    </div>
  );

  const renderLaporan = () => {
    const filteredLaporanDeposits = filterDataBerdasarkanWaktu(unitDeposits, laporanFilter);

    // 1. Pengelompokan Data Per Pengelola
    const grouped = filteredLaporanDeposits.reduce((acc, d) => {
      if (!acc[d.pengelola]) {
        acc[d.pengelola] = { total: 0, count: 0, Organik: 0, Anorganik: 0, Residu: 0 };
      }
      acc[d.pengelola].total += (Number(d.weight) || 0);
      acc[d.pengelola].count += 1;
      acc[d.pengelola][d.category] += (Number(d.weight) || 0);
      return acc;
    }, {});

    const grandTotalOrganik = Object.values(grouped).reduce((s, d) => s + d.Organik, 0);
    const grandTotalAnorganik = Object.values(grouped).reduce((s, d) => s + d.Anorganik, 0);
    const grandTotalResidu = Object.values(grouped).reduce((s, d) => s + d.Residu, 0);

    // 2. Pembuatan Data Kronologis Untuk Grafik Tren Laporan
    const trendDataMap = new Map();
    filteredLaporanDeposits.forEach(d => {
      const entri = trendDataMap.get(d.date) || { date: d.date, Organik: 0, Anorganik: 0, Residu: 0 };
      entri[d.category] += (Number(d.weight) || 0);
      trendDataMap.set(d.date, entri);
    });

    const reportTrendChartData = Array.from(trendDataMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        ...item,
        // Format label sumbu X agar lebih rapi dibaca
        labelTanggal: new Date(item.date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      }));

    const subtextLabel = laporanFilter === 'hari' ? 'Hari Ini' : laporanFilter === 'minggu' ? 'Minggu Ini' : laporanFilter === 'bulan' ? 'Bulan Ini' : 'Semua';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Panel Filter Dropdown Laporan */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', background: 'white', padding: '12px 20px', borderRadius: 12, border: '1px solid var(--ds-border)', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ds-text-muted)' }}>Filter Waktu Laporan:</label>
          <select value={laporanFilter} onChange={e => setLaporanFilter(e.target.value)}
            style={{ padding: '6px 12px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.82rem', outline: 'none', background: '#F8FAFC', color: 'var(--ds-text)', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
            <option value="semua">Semua Periode</option>
            <option value="hari">Hari Ini</option>
            <option value="minggu">Minggu Ini</option>
            <option value="bulan">Bulan Ini</option>
          </select>
        </div>

        {/* Top Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <div style={{ background: '#D1FAE5', borderRadius: 20, padding: 24, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Leaf size={22} color="#047857" />
              <p style={{ fontSize: '0.88rem', color: '#047857', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organik ({subtextLabel})</p>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#065F46', margin: 0 }}>{formatWeightTon(grandTotalOrganik)}</h3>
          </div>
          <div style={{ background: 'rgba(8, 145, 178, 0.08)', borderRadius: 20, padding: 24, border: '1px solid rgba(8, 145, 178, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Recycle size={22} color="#0891B2" />
              <p style={{ fontSize: '0.88rem', color: '#0891B2', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Anorganik ({subtextLabel})</p>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0e7490', margin: 0 }}>{formatWeightTon(grandTotalAnorganik)}</h3>
          </div>
          <div style={{ background: '#FEF3C7', borderRadius: 20, padding: 24, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Trash2 size={22} color="#b45309" />
              <p style={{ fontSize: '0.88rem', color: '#b45309', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Residu ({subtextLabel})</p>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#92400E', margin: 0 }}>{formatWeightTon(grandTotalResidu)}</h3>
          </div>
        </div>

        {/* PERBAIKAN: Penambahan Grafik Tren Baru di Halaman Laporan */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 20, letterSpacing: '-0.3px' }}>Grafik Tren Volume Timbulan Sampah ({subtextLabel})</h3>
          <div style={{ height: 280 }}>
            {reportTrendChartData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ds-text-muted)', fontSize: '0.9rem' }}>Tidak ada data aktivitas untuk membuat kurva tren.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportTrendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrganik" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorAnorganik" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0891B2" stopOpacity={0.2}/><stop offset="95%" stopColor="#0891B2" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorResidu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/><stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="labelTanggal" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--ds-text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--ds-text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--ds-dark)', border: 'none', borderRadius: 12, color: '#fff' }} formatter={(val) => `${val} Kg`} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Area type="monotone" dataKey="Organik" stroke="#10B981" fillOpacity={1} fill="url(#colorOrganik)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Anorganik" stroke="#0891B2" fillOpacity={1} fill="url(#colorAnorganik)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Residu" stroke="#F59E0B" fillOpacity={1} fill="url(#colorResidu)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tabel Pengelola Rincian */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 20, letterSpacing: '-0.3px' }}>Rincian Per Unit / Pengelola</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Pengelola</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Total Transaksi</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Organik</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Anorganik</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Residu</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--ds-text)' }}>Total Berat</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([pengelola, data], i) => (
                  <tr key={pengelola} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--ds-text)' }}>{pengelola}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{data.count}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#10B981', fontWeight: 600 }}>{formatWeightTon(data.Organik)}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#0891B2', fontWeight: 600 }}>{formatWeightTon(data.Anorganik)}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#F59E0B', fontWeight: 600 }}>{formatWeightTon(data.Residu)}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--ds-text)' }}>{formatWeightTon(data.total)}</td>
                  </tr>
                ))}
                {Object.keys(grouped).length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--ds-text-muted)' }}>Tidak ada data laporan untuk rentang waktu ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderNeraca = () => {
    const filteredNeraca = neraca.filter(n => {
      const matchMonth = n.month === selectedBulan;
      const matchUnit = !userUnit || n.unit === userUnit;
      return matchMonth && matchUnit;
    });

    return (
      <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, letterSpacing: '-0.3px' }}>
              Neraca Sampah Bulanan - Unit {userUnit || 'Semua Unit'}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--ds-text-muted)' }}>
              Menampilkan data timbulan dan pemanfaatan sampah sesuai periode
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={() => {
              const dataToExport = filteredNeraca.map(n => [n.category, n.jenis, Number(n.timbulan).toFixed(1), Number(n.dimanfaatkan).toFixed(1), `${(Number(n.dimanfaatkan) / Number(n.timbulan) * 100 || 0).toFixed(1)}%`]);
              exportToPDF('Laporan Neraca Sampah', ['Kategori', 'Jenis Sampah', 'Timbulan (Kg)', 'Dimanfaatkan (Kg)', 'Persentase'], dataToExport, { periode: selectedBulan });
            }} style={{ background: '#EF4444', color: 'white', padding: '8px 14px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>PDF</button>
            <button onClick={() => {
              const dataToExport = filteredNeraca.map(n => ({ Kategori: n.category, 'Jenis Sampah': n.jenis, 'Timbulan (Kg)': Number(n.timbulan), 'Dimanfaatkan (Kg)': Number(n.dimanfaatkan), 'Persentase (%)': (Number(n.dimanfaatkan) / Number(n.timbulan) * 100 || 0).toFixed(1) }));
              exportToExcel('Laporan_Neraca_Sampah', dataToExport);
            }} style={{ background: '#10B981', color: 'white', padding: '8px 14px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>Excel</button>
            <select value={selectedBulan} onChange={e => setSelectedBulan(e.target.value)}
              style={{ padding: '8px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.88rem', outline: 'none', background: 'white', fontFamily: 'inherit', color: 'var(--ds-text)', cursor: 'pointer' }}>
              <option value="2026-07">Juli 2026</option>
              <option value="2026-06">Juni 2026</option>
            </select>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kategori</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Jenis Sampah</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Timbulan (Kg)</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Yang Dimanfaatkan (Kg)</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Persentase</th>
              </tr>
            </thead>
            <tbody>
              {filteredNeraca.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--ds-text-muted)', fontSize: '0.9rem' }}>
                    Tidak ada data neraca sampah untuk unit dan periode ini.
                  </td>
                </tr>
              ) : (
                filteredNeraca.map((n, i) => {
                  const timb = Number(n.timbulan) || 0;
                  const diman = Number(n.dimanfaatkan) || 0;
                  const perc = timb > 0 ? (diman / timb) * 100 : 0;
                  return (
                    <tr key={n.id} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                      <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{n.category}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ds-text)' }}>{n.jenis}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{timb.toFixed(1)}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#047857', fontWeight: 600 }}>{diman.toFixed(1)}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--ds-text)' }}>{perc.toFixed(1)}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBuktiBayar = () => (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, letterSpacing: '-0.3px' }}>Bukti Bayar Tahunan</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--ds-text-muted)' }}>Kelola status persetujuan kwitansi bulanan per tahun</p>
        </div>
        
        <select value={selectedTahunBukti} onChange={e => setSelectedTahunBukti(e.target.value)}
          style={{ padding: '9px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.88rem', outline: 'none', background: 'white', color: 'var(--ds-text)', fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="2026">Tahun 2026</option>
          <option value="2025">Tahun 2025</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14 }}>
        {DAFTAR_BULAN.map(bulan => {
          const targetKey = `${selectedTahunBukti}-${bulan.id}`;
          const b = unitBuktiBayar.find(item => item.month === targetKey);

          return (
            <div key={bulan.id} style={{ border: '1px solid var(--ds-border)', borderRadius: 12, padding: '14px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--ds-text)', display: 'block', marginBottom: 4 }}>{bulan.nama}</span>
                {b ? <StatusBadge status={b.status} /> : <span style={{ fontSize: '0.72rem', color: 'var(--ds-text-muted)', fontWeight: 500 }}>Belum Ada Data</span>}
              </div>
              
              <div style={{ marginTop: 4 }}>
                {b && b.img_url ? (
                  <button onClick={() => setActiveKwitansiPopup(b)} 
                    style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#E0F2FE', color: '#0284C7', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.target.style.background = '#BAE6FD'}
                    onMouseLeave={e => e.target.style.background = '#E0F2FE'}
                  >
                    <Eye size={12} /> Tinjau Kwitansi
                  </button>
                ) : (
                  <button disabled style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#F1F5F9', color: '#94A3B8', border: '1px solid var(--ds-border)', padding: '8px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 500, cursor: 'not-allowed' }}>
                    Klien Belum Upload
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderInventarisasi = () => (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, letterSpacing: '-0.3px' }}>Inventarisasi Sampah Historis</h3>
        <select value={selectedTahunHistoris} onChange={e => setSelectedTahunHistoris(e.target.value)}
          style={{ padding: '8px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.88rem', outline: 'none', background: 'white', fontFamily: 'inherit', color: 'var(--ds-text)' }}>
          <option value="2026">Tahun 2026</option>
          <option value="2025">Tahun 2025</option>
          <option value="2024">Tahun 2024</option>
          <option value="2023">Tahun 2023</option>
          <option value="2022">Tahun 2022</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)', fontWeight: 600 }}>Aksi:</span>
        <button disabled={!selectedRow} onClick={() => selectedRow && handleEdit(selectedRow, 'inventarisasi')} style={{ padding: '8px 16px', background: selectedRow ? '#F1F5F9' : '#F8FAFC', color: selectedRow ? '#0F172A' : '#94A3B8', border: '1px solid var(--ds-border)', borderRadius: 8, cursor: selectedRow ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Edit</button>
        <button disabled={!selectedRow} onClick={() => selectedRow && handleDelete(selectedRow.id, 'inventarisasi')} style={{ padding: '8px 16px', background: selectedRow ? '#FEE2E2' : '#F8FAFC', color: selectedRow ? '#EF4444' : '#94A3B8', border: '1px solid var(--ds-border)', borderRadius: 8, cursor: selectedRow ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Hapus</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 18px', width: 40 }}></th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kategori</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Jenis Sampah</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Timbulan (Ton)</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Dimanfaatkan (Ton)</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Residu ke TPA (Ton)</th>
            </tr>
          </thead>
          <tbody>
            {inventarisasi.filter(inv => inv.tahun === selectedTahunHistoris).map((inv, i) => (
              <tr key={inv.id} onClick={() => setSelectedRow(selectedRow?.id === inv.id ? null : inv)} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: selectedRow?.id === inv.id ? '#F0F9FF' : (i % 2 === 0 ? 'white' : '#FAFCFD'), cursor: 'pointer', transition: 'background 0.2s' }}>
                <td style={{ padding: '14px 18px' }}>
                  <input type="radio" checked={selectedRow?.id === inv.id} onChange={() => setSelectedRow(inv)} style={{ cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{inv.category}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ds-text)' }}>{inv.jenis}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{Number(inv.timbulan).toFixed(3)}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#047857', fontWeight: 600 }}>{Number(inv.dimanfaatkan).toFixed(3)}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#DC2626', fontWeight: 600 }}>{Number(inv.residu_tpa).toFixed(3)}</td>
              </tr>
            ))}
            {inventarisasi.filter(inv => inv.tahun === selectedTahunHistoris).length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--ds-text-muted)' }}>Belum ada data inventarisasi untuk tahun ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRekapProgram = () => (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, letterSpacing: '-0.3px' }}>Rekapitulasi Program Pengelolaan Sampah</h3>
        <select value={selectedTahunHistoris} onChange={e => setSelectedTahunHistoris(e.target.value)}
          style={{ padding: '8px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.88rem', outline: 'none', background: 'white', fontFamily: 'inherit', color: 'var(--ds-text)' }}>
          <option value="2026">Tahun 2026</option>
          <option value="2025">Tahun 2025</option>
          <option value="2024">Tahun 2024</option>
          <option value="2023">Tahun 2023</option>
          <option value="2022">Tahun 2022</option>
          <option value="2021">Tahun 2021</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)', fontWeight: 600 }}>Aksi:</span>
        <button disabled={!selectedRow} onClick={() => selectedRow && handleEdit(selectedRow, 'rekap')} style={{ padding: '8px 16px', background: selectedRow ? '#F1F5F9' : '#F8FAFC', color: selectedRow ? '#0F172A' : '#94A3B8', border: '1px solid var(--ds-border)', borderRadius: 8, cursor: selectedRow ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Edit</button>
        <button disabled={!selectedRow} onClick={() => selectedRow && handleDelete(selectedRow.id, 'rekap')} style={{ padding: '8px 16px', background: selectedRow ? '#FEE2E2' : '#F8FAFC', color: selectedRow ? '#EF4444' : '#94A3B8', border: '1px solid var(--ds-border)', borderRadius: 8, cursor: selectedRow ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Hapus</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 18px', width: 40 }}></th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Nama Program</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Jenis Sampah</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kegiatan</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Absolut (Ton)</th>
            </tr>
          </thead>
          <tbody>
            {rekapProgram.filter(rp => rp.tahun === selectedTahunHistoris).map((rp, i) => (
              <tr key={rp.id} onClick={() => setSelectedRow(selectedRow?.id === rp.id ? null : rp)} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: selectedRow?.id === rp.id ? '#F0F9FF' : (i % 2 === 0 ? 'white' : '#FAFCFD'), cursor: 'pointer', transition: 'background 0.2s' }}>
                <td style={{ padding: '14px 18px' }}>
                  <input type="radio" checked={selectedRow?.id === rp.id} onChange={() => setSelectedRow(rp)} style={{ cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ds-text)' }}>{rp.nama_program}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{rp.jenis_sampah}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', background: rp.jenis_kegiatan === 'Pemanfaatan' ? '#ECFCCB' : '#DBEAFE', color: rp.jenis_kegiatan === 'Pemanfaatan' ? '#4D7C0F' : '#1D4ED8', fontWeight: 600 }}>{rp.jenis_kegiatan}</span>
                </td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#047857', fontWeight: 700 }}>{Number(rp.absolut_ton).toFixed(3)}</td>
              </tr>
            ))}
            {rekapProgram.filter(rp => rp.tahun === selectedTahunHistoris).length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--ds-text-muted)' }}>Belum ada rekapitulasi program untuk tahun ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--ds-bg)', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(12, 26, 46, 0.4)',
            zIndex: 45,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* Sidebar Container */}
      <div className="sidebar-container" style={{
        width: 260, background: 'var(--ds-dark)', color: 'white', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, zIndex: 50, transition: 'left 0.3s ease',
        boxShadow: '4px 0 30px rgba(0,0,0,0.15)'
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: 'white', padding: 6, borderRadius: 8, display: 'flex' }}><PLNLogo size={28} /></div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, lineHeight: 1.2, letterSpacing: '-0.5px' }}>Powercycle</h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--ds-accent-light)', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {role ? (role === 'admin sis' ? 'Admin SIS' : 'Admin LLK') : 'Admin Portal'} • {userUnit || 'Pusat'}
            </p>
          </div>
        </div>

        <div style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button key={item.id} onClick={() => navigateTo(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  background: isActive ? 'rgba(8, 145, 178, 0.15)' : 'transparent', border: 'none', borderRadius: 12,
                  color: isActive ? 'white' : 'rgba(255,255,255,0.65)', cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.88rem', fontWeight: isActive ? 700 : 500, transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}>
                <Icon size={18} style={{ color: isActive ? 'var(--ds-accent-light)' : 'currentColor' }} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin 0.3s ease' }}>
        <header style={{ background: 'white', padding: '16px 28px', borderBottom: '1px solid var(--ds-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ds-text)', display: 'none' }}>
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', letterSpacing: '-0.5px' }}>{pageTitles[currentPage]}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ds-text-muted)', fontWeight: 500 }}>Bank Sampah Digital {userUnit ? `• Unit ${userUnit}` : ''}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'var(--ds-text)', color: 'white', padding: '8px 18px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Administrator
            </div>

            <button onClick={() => setShowLogoutConfirm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '9999px',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
              onMouseEnter={e => e.target.style.background = '#FCA5A5'}
              onMouseLeave={e => e.target.style.background = '#FEE2E2'}
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </header>

        <main style={{ padding: 28, flex: 1 }}>
          {currentPage === 'dashboard' && renderDashboard()}
          {currentPage === 'waste-monitoring' && renderWasteMonitoring()}
          {currentPage === 'reports' && renderLaporan()}
          {currentPage === 'neraca' && renderNeraca()}
          {currentPage === 'inventarisasi' && renderInventarisasi()}
          {currentPage === 'rekap-program' && renderRekapProgram()}
          {currentPage === 'bukti-bayar' && renderBuktiBayar()}
          
          {currentPage === 'master-data' && <MasterDataManagement />}

          {currentPage === 'pengelola-data' && (
            <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 20, letterSpacing: '-0.3px' }}>Data Pengelola</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Nama Pengelola</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Total Sampah Dikelola (Kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(deposits.reduce((acc, dep) => {
                      acc[dep.pengelola] = (acc[dep.pengelola] || 0) + Number(dep.weight);
                      return acc;
                    }, {})).map(([pengelola, total], i) => (
                      <tr key={pengelola} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ds-text)' }}>{pengelola}</td>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#047857', fontWeight: 600 }}>{total.toFixed(2)} Kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Pop-up Modal Tinjau Kwitansi Admin */}
      {activeKwitansiPopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 26, 46, 0.6)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 440, borderRadius: '1.5rem', padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--ds-text)', letterSpacing: '-0.5px' }}>Tinjau Kwitansi Pembayaran</h3>
              <button onClick={() => setActiveKwitansiPopup(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--ds-text-muted)', fontWeight: 'bold' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)' }}>Unit Kerja: <strong style={{ color: 'var(--ds-text)' }}>{activeKwitansiPopup.unit}</strong></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)' }}>No. Invoice: <strong style={{ fontFamily: 'monospace', color: 'var(--ds-text)' }}>{activeKwitansiPopup.no_bukti}</strong></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)' }}>Status Saat Ini: <StatusBadge status={activeKwitansiPopup.status} /></div>
              
              <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--ds-border)', background: '#F8FAFC', padding: 8 }}>
                <img src={activeKwitansiPopup.img_url} alt="Kwitansi Pembayaran" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 320, objectFit: 'contain' }} />
              </div>
            </div>

            {activeKwitansiPopup.status === 'Pending' && onUpdateBuktiStatus && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <button onClick={() => { onUpdateBuktiStatus(activeKwitansiPopup.id, 'Lunas'); setActiveKwitansiPopup(null); }}
                  style={{ flex: 1, padding: '12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                >Setujui Pembayaran</button>
                <button onClick={() => { const reason = prompt('Alasan penolakan:'); if (reason) { onUpdateBuktiStatus(activeKwitansiPopup.id, 'Ditolak', reason); setActiveKwitansiPopup(null); } }}
                  style={{ flex: 1, padding: '12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                >Tolak</button>
              </div>
            )}
            
            <button onClick={() => setActiveKwitansiPopup(null)} style={{ width: '100%', padding: '12px', background: '#F1F5F9', color: 'var(--ds-text)', border: '1px solid var(--ds-border)', borderRadius: '9999px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}>
              Kembali
            </button>
          </div>
        </div>
      )}

      {editingItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 26, 46, 0.6)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 500, borderRadius: '1.5rem', padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', letterSpacing: '-0.5px' }}>Edit Data</h3>
              <button onClick={() => setEditingItem(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--ds-text-muted)' }}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: 'grid', gap: 16 }}>
              {Object.keys(editFormData).filter(k => k !== 'id' && k !== 'user' && k !== 'client' && k !== 'unit' && k !== 'timestamp').map(key => (
                <div key={key}>
                  <label style={{ display: 'block', color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, textTransform: 'capitalize', letterSpacing: '0.5px' }}>{key.replace('_', ' ')}</label>
                  <input type={key === 'weight' || key === 'timbulan' || key === 'dimanfaatkan' || key === 'residu_tpa' || key === 'absolut_ton' ? 'number' : key === 'date' ? 'date' : 'text'} step="any"
                    value={editFormData[key] || ''} 
                    onChange={e => setEditFormData({ ...editFormData, [key]: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.9rem', outline: 'none', background: '#F8FAFC', color: 'var(--ds-text)', fontFamily: 'inherit' }} 
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setEditingItem(null)} style={{ flex: 1, padding: '14px', background: 'white', color: 'var(--ds-text)', border: '1.5px solid var(--ds-border)', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>Batal</button>
                <button type="submit" style={{ flex: 1, padding: '14px', background: 'var(--ds-text)', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 26, 46, 0.6)', backdropFilter: 'blur(4px)', animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 380, borderRadius: '1.5rem', padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <LogOut size={32} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', letterSpacing: '-0.5px' }}>Konfirmasi Logout</h3>
              <p style={{ margin: '8px 0 0', color: 'var(--ds-text-muted)', fontSize: '0.9rem' }}>Apakah Anda yakin ingin keluar dari akun?</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, padding: '14px', background: 'white', color: 'var(--ds-text)', border: '1.5px solid var(--ds-border)', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.background = '#F1F5F9'; }}
                onMouseLeave={e => { e.target.style.background = 'white'; }}
              >Batal</button>
              <button onClick={() => { setShowLogoutConfirm(false); onLogout(); }} style={{ flex: 1, padding: '14px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.background = '#DC2626'}
                onMouseLeave={e => e.target.style.background = '#EF4444'}
              >Logout</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .sidebar-container { left: 0; }
        .main-content { margin-left: 260px; }
        .sidebar-overlay { display: none !important; }
        
        @media (max-width: 1024px) {
          .sidebar-container { left: ${sidebarOpen ? '0' : '-260px'} !important; }
          .main-content { margin-left: 0 !important; }
          .sidebar-toggle { display: block !important; }
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}