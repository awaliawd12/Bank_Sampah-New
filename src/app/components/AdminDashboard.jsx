import { useState, useMemo } from 'react';
import {
  LayoutDashboard, Trash2, Users, Building2, FileText,
  BarChart2, Activity, Settings, LogOut, Menu,
  Search, Package, Scale, ChevronLeft, ChevronRight,
  Database, FileCheck, CheckCircle, Leaf, Recycle
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import {
  mockUsers, mockClients, mockActivityLog,
  monthlyChartData, formatWeight, formatWeightTon, TODAY,
  KATEGORI_SAMPAH
} from '../lib/mockData';

const PLNLogo = ({ size = 36 }) => {
  const customLogoUrl = '/Logo.png';
  if (customLogoUrl) {
    return <img src={customLogoUrl} alt="Logo" style={{ height: size, maxWidth: '100%', objectFit: 'contain' }} />;
  }
  return null;
};

function StatusBadge({ status }) {
  const cfg = {
    'Terverifikasi': { bg: 'rgba(16, 185, 129, 0.08)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.2)' },
    'Pending': { bg: 'rgba(245, 158, 11, 0.08)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.2)' },
    'Ditolak': { bg: 'rgba(239, 68, 68, 0.08)', color: '#b91c1c', border: '1px solid rgba(239, 68, 68, 0.2)' },
    'Aktif': { bg: 'rgba(16, 185, 129, 0.08)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.2)' },
    'Non-Aktif': { bg: 'rgba(100, 116, 139, 0.08)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.2)' },
    'Lunas': { bg: 'rgba(16, 185, 129, 0.08)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.2)' },
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

export function AdminDashboard({ deposits, neraca, buktiBayar, onLogout, onDeleteDeposit, onUpdateStatus, userUnit }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [selectedBulan, setSelectedBulan] = useState('2026-06');

  const unitDeposits = useMemo(() => deposits.filter(d => !userUnit || d.unit === userUnit), [deposits, userUnit]);
  const unitBuktiBayar = useMemo(() => buktiBayar.filter(b => !userUnit || b.unit === userUnit), [buktiBayar, userUnit]);

  const todayDeposits = useMemo(() => unitDeposits.filter(d => d.date === TODAY), [unitDeposits]);
  const totalWeight = useMemo(() => unitDeposits.reduce((s, d) => s + d.weight, 0), [unitDeposits]);
  const organikWeight = useMemo(() => unitDeposits.filter(d => d.category === 'Organik').reduce((s, d) => s + d.weight, 0), [unitDeposits]);
  const anorganikWeight = useMemo(() => unitDeposits.filter(d => d.category === 'Anorganik').reduce((s, d) => s + d.weight, 0), [unitDeposits]);
  const residuWeight = useMemo(() => unitDeposits.filter(d => d.category === 'Residu').reduce((s, d) => s + d.weight, 0), [unitDeposits]);

  const dailyChartData = useMemo(() => {
    const map = new Map();
    unitDeposits.forEach(d => {
      const e = map.get(d.date) || { Organik: 0, Anorganik: 0, Residu: 0 };
      e[d.category] += d.weight;
      map.set(d.date, e);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, data]) => ({
        date: new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        ...data
      }));
  }, [unitDeposits]);

  const pieData = [
    { name: 'Organik', value: +Number(organikWeight).toFixed(1), color: '#10B981' },
    { name: 'Anorganik', value: '#0891B2', color: '#0891B2' },
    { name: 'Residu', value: +Number(residuWeight).toFixed(1), color: '#F59E0B' },
  ];

  const filteredDeposits = useMemo(() => {
    return unitDeposits.filter(d => {
      const q = searchQuery.toLowerCase();
      if (q && !d.user.toLowerCase().includes(q) && !d.client.toLowerCase().includes(q)) return false;
      if (dateFilter && d.date !== dateFilter) return false;
      if (categoryFilter && d.category !== categoryFilter) return false;
      return true;
    });
  }, [unitDeposits, searchQuery, dateFilter, categoryFilter]);

  const filteredBukti = useMemo(() => {
    return unitBuktiBayar.filter(b => b.month === selectedBulan);
  }, [unitBuktiBayar, selectedBulan]);

  const totalTablePages = Math.ceil(filteredDeposits.length / ITEMS_PER_PAGE);
  const paginatedDeposits = filteredDeposits.slice((tablePage - 1) * ITEMS_PER_PAGE, tablePage * ITEMS_PER_PAGE);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'waste-monitoring', label: 'Monitoring Sampah', icon: Trash2 },
    { id: 'user-data', label: 'Data Pengguna', icon: Users },
    { id: 'client-data', label: 'Data Pengelola', icon: Building2 },
    { id: 'reports', label: 'Laporan', icon: FileText },
    { id: 'neraca', label: 'Neraca Sampah', icon: Database },
    { id: 'graphs', label: 'Grafik', icon: BarChart2 },
    { id: 'activity-log', label: 'Log Aktivitas', icon: Activity },
    { id: 'bukti-bayar', label: 'Bukti Bayar', icon: FileCheck },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  const pageTitles = {
    dashboard: 'Dashboard', 'waste-monitoring': 'Monitoring Sampah',
    'user-data': 'Data Pengguna', 'client-data': 'Data Pengelola',
    reports: 'Laporan', neraca: 'Neraca Sampah', graphs: 'Grafik',
    'activity-log': 'Log Aktivitas', 'bukti-bayar': 'Bukti Bayar', settings: 'Pengaturan',
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
        <StatCard title="Total Pengguna" value={mockUsers.length} icon={Users} color="var(--ds-accent)" bg="rgba(8, 145, 178, 0.08)" />
        <StatCard title="Total Pengelola" value={mockClients.length} icon={Building2} color="#0891B2" bg="rgba(8, 145, 178, 0.08)" />
        <StatCard title="Input Hari Ini" value={todayDeposits.length} icon={Package} color="#10B981" bg="rgba(16, 185, 129, 0.08)" />
        <StatCard title="Total Berat" value={formatWeight(totalWeight)} icon={Scale} color="#6366F1" bg="rgba(99, 102, 241, 0.08)" />
      </div>

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
            <input type="text" placeholder="Cari pengguna atau klien..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setTablePage(1); }}
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

      <div style={{ overflowX: 'auto', minHeight: 400 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Tanggal/Waktu</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Pengguna</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Klien</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Unit</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kategori</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Jenis</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Pengelola</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Berat</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDeposits.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.date} <span style={{ color: 'var(--ds-text-muted)', fontSize: '0.8rem' }}>{d.time}</span></td>
                <td style={{ padding: '14px 18px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.user}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.client}</td>
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
                <td style={{ padding: '14px 18px' }}>
                  {d.status === 'Pending' && onUpdateStatus && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => onUpdateStatus(d.id, 'Terverifikasi')}
                        style={{ background: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Terima
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(d.id, 'Ditolak')}
                        style={{ background: '#EF4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={tablePage} total={totalTablePages} onChange={setTablePage} totalItems={filteredDeposits.length} />
    </div>
  );

  const renderLaporan = () => {
    const grouped = unitDeposits.reduce((acc, d) => {
      if (!acc[d.pengelola]) {
        acc[d.pengelola] = { total: 0, count: 0, Organik: 0, Anorganik: 0, Residu: 0 };
      }
      acc[d.pengelola].total += d.weight;
      acc[d.pengelola].count += 1;
      acc[d.pengelola][d.category] += d.weight;
      return acc;
    }, {});

    const grandTotalOrganik = Object.values(grouped).reduce((s, d) => s + d.Organik, 0);
    const grandTotalAnorganik = Object.values(grouped).reduce((s, d) => s + d.Anorganik, 0);
    const grandTotalResidu = Object.values(grouped).reduce((s, d) => s + d.Residu, 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <div style={{ background: '#D1FAE5', borderRadius: 20, padding: 24, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Leaf size={22} color="#047857" />
              <p style={{ fontSize: '0.88rem', color: '#047857', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sampah Organik</p>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#065F46', margin: 0 }}>{formatWeightTon(grandTotalOrganik)} Ton</h3>
          </div>
          <div style={{ background: 'rgba(8, 145, 178, 0.08)', borderRadius: 20, padding: 24, border: '1px solid rgba(8, 145, 178, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Recycle size={22} color="#0891B2" />
              <p style={{ fontSize: '0.88rem', color: '#0891B2', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sampah Anorganik</p>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0e7490', margin: 0 }}>{formatWeightTon(grandTotalAnorganik)} Ton</h3>
          </div>
          <div style={{ background: '#FEF3C7', borderRadius: 20, padding: 24, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Trash2 size={22} color="#b45309" />
              <p style={{ fontSize: '0.88rem', color: '#b45309', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sampah Residu</p>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#92400E', margin: 0 }}>{formatWeightTon(grandTotalResidu)} Ton</h3>
          </div>
        </div>

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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderNeraca = () => (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 20, letterSpacing: '-0.3px' }}>Neraca Sampah - Periode {selectedBulan}</h3>
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
            {neraca.filter(n => n.month === selectedBulan).map((n, i) => {
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBuktiBayar = () => (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, letterSpacing: '-0.3px' }}>Bukti Bayar Bulanan</h3>
        <select value={selectedBulan} onChange={e => setSelectedBulan(e.target.value)}
          style={{ padding: '8px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.88rem', outline: 'none', background: 'white', fontFamily: 'inherit', color: 'var(--ds-text)' }}>
          <option value="2026-06">Juni 2026</option>
          <option value="2026-07">Juli 2026</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {filteredBukti.length === 0 ? (
          <p style={{ color: 'var(--ds-text-muted)', fontSize: '0.9rem', margin: 0 }}>Tidak ada bukti bayar untuk bulan ini.</p>
        ) : filteredBukti.map(b => (
          <div key={b.id} style={{ border: '1px solid var(--ds-border)', borderRadius: 16, overflow: 'hidden', background: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--ds-border)', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ds-text)' }}>{b.no_bukti}</span>
              <StatusBadge status={b.status} />
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ margin: '0 0 14px 0', fontSize: '0.85rem', color: 'var(--ds-text-muted)', fontWeight: 500 }}>Unit: <strong>{b.unit}</strong></p>
              {b.img_url ? (
                <div style={{ width: '100%', height: 200, background: '#F1F5F9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={b.img_url} alt="Bukti" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <div style={{ width: '100%', height: 200, background: '#F1F5F9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ds-text-muted)', fontSize: '0.85rem' }}>
                  Belum ada dokumentasi
                </div>
              )}
            </div>
          </div>
        ))}
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

      {/* Sidebar with var(--ds-dark) and Derap Serayu highlights */}
      <div className="sidebar-container" style={{
        width: 260, background: 'var(--ds-dark)', color: 'white', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, zIndex: 50, transition: 'left 0.3s ease',
        boxShadow: '4px 0 30px rgba(0,0,0,0.15)'
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: 'white', padding: 6, borderRadius: 8, display: 'flex' }}><PLNLogo size={28} /></div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, lineHeight: 1.2, letterSpacing: '-0.5px' }}>Powercycle</h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--ds-accent-light)', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Admin Dashboard</p>
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

        <div style={{ padding: '20px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', width: '100%',
              background: 'transparent', border: 'none', borderRadius: 12, color: '#FCA5A5',
              cursor: 'pointer', textAlign: 'left', fontSize: '0.88rem', fontWeight: 600, transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.08)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin 0.3s ease' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'var(--ds-text)', color: 'white', padding: '8px 18px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Administrator
            </div>
          </div>
        </header>

        <main style={{ padding: 28, flex: 1 }}>
          {currentPage === 'dashboard' && renderDashboard()}
          {currentPage === 'waste-monitoring' && renderWasteMonitoring()}
          {currentPage === 'reports' && renderLaporan()}
          {currentPage === 'neraca' && renderNeraca()}
          {currentPage === 'bukti-bayar' && renderBuktiBayar()}

          {currentPage === 'user-data' && (
            <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 20, letterSpacing: '-0.3px' }}>Data Pengguna Sistem</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Nama Lengkap</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Email</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Role</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Unit</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Bergabung</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.filter(u => !userUnit || u.unit === userUnit).map((u, i) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ds-text)' }}>{u.name}</td>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{u.email}</td>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{u.role}</td>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{u.unit}</td>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{u.joinDate}</td>
                        <td style={{ padding: '14px 18px' }}><StatusBadge status={u.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentPage === 'client-data' && (
            <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 20, letterSpacing: '-0.3px' }}>Data Klien / Pengelola</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Nama Pengelola</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Alamat</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kontak</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Bergabung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockClients.map((c, i) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ds-text)' }}>{c.name}</td>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{c.address}</td>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{c.contact}</td>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{c.joinDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentPage === 'graphs' && (
            <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 24, letterSpacing: '-0.3px' }}>Trend Berat Sampah (Tahun 2026)</h3>
              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBeratDS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0891B2" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0891B2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--ds-text-muted)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--ds-text-muted)' }} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                    <Tooltip contentStyle={{ background: 'var(--ds-dark)', border: 'none', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', color: '#fff' }} formatter={(value) => `${value} Kg`} />
                    <Area type="monotone" dataKey="berat" stroke="#0891B2" fillOpacity={1} fill="url(#colorBeratDS)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {currentPage === 'activity-log' && (
            <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 20, letterSpacing: '-0.3px' }}>Log Aktivitas Sistem</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Waktu Kejadian</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Pengguna</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Aktivitas</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Detail Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockActivityLog.map((log, i) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                        <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{log.timestamp}</td>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ds-text)' }}>{log.user}</td>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem' }}>
                          <span style={{ background: 'rgba(8, 145, 178, 0.08)', color: '#0891B2', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>{log.action}</span>
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text-muted)' }}>{log.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentPage === 'settings' && (
            <div style={{ background: 'white', borderRadius: '1.5rem', padding: 32, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)', maxWidth: 600 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 24, letterSpacing: '-0.3px' }}>Pengaturan Sistem</h3>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Aplikasi</label>
                  <input type="text" defaultValue="Powercycle" style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.9rem', outline: 'none', background: '#F8FAFC', color: 'var(--ds-text)', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Administrator</label>
                  <input type="email" defaultValue="admin.mrica@pln.co.id" style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.9rem', outline: 'none', background: '#F8FAFC', color: 'var(--ds-text)', fontFamily: 'inherit' }} />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button onClick={() => alert('Pengaturan Disimpan!')} style={{ padding: '12px 24px', background: 'var(--ds-text)', color: 'white', border: 'none', borderRadius: '9999px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                    onMouseEnter={e => e.target.style.background = 'var(--ds-accent)'}
                    onMouseLeave={e => e.target.style.background = 'var(--ds-text)'}
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .sidebar-container { left: 0; }
        .main-content { margin-left: 260px; }
        .sidebar-overlay { display: none !important; }
        
        @media (max-width: 1024px) {
          .sidebar-container { left: ${sidebarOpen ? '0' : '-260px'} !important; }
          .main-content { margin-left: 0 !important; }
          .sidebar-toggle { display: block !important; }
          .sidebar-overlay { display: block !important; }
        }
      `}} />
    </div>
  );
}
