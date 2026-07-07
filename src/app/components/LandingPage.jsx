'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Recycle, Leaf, Factory, TrendingUp, ArrowRight, BarChart3,
  Users, Scale, ChevronDown, Menu, X, MapPin, Phone, Mail, ArrowUp,
  Zap, ShieldCheck, Globe
} from 'lucide-react';
import {
  BarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  initialDeposits, UNIT_LIST, formatWeight, formatWeightTon,
  monthlyChartData, mockUsers
} from '../lib/mockData';

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.round(start * 10) / 10);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const PLNLogo = ({ size = 36 }) => {
  const customLogoUrl = '/Logo.png';
  if (customLogoUrl) {
    return <img src={customLogoUrl} alt="Logo Powercycle" style={{ height: size, maxWidth: '100%', objectFit: 'contain' }} />;
  }
  return null;
};

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeUnit, setActiveUnit] = useState('all');
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      setShowTopBtn(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = useMemo(() => {
    const filteredDeposits = activeUnit === 'all'
      ? initialDeposits
      : initialDeposits.filter(d => d.unit === activeUnit);

    const totalWeight = filteredDeposits.reduce((s, d) => s + d.weight, 0);
    const organikWeight = filteredDeposits.filter(d => d.category === 'Organik').reduce((s, d) => s + d.weight, 0);
    const anorganikWeight = filteredDeposits.filter(d => d.category === 'Anorganik').reduce((s, d) => s + d.weight, 0);
    const residuWeight = filteredDeposits.filter(d => d.category === 'Residu').reduce((s, d) => s + d.weight, 0);
    const totalTransactions = filteredDeposits.length;
    const totalUsers = activeUnit === 'all'
      ? mockUsers.filter(u => u.role === 'User').length
      : mockUsers.filter(u => u.role === 'User' && u.unit === activeUnit).length;

    return { totalWeight, organikWeight, anorganikWeight, residuWeight, totalTransactions, totalUsers };
  }, [activeUnit]);

  const unitStats = useMemo(() => {
    return UNIT_LIST.map(unit => {
      const unitDeposits = initialDeposits.filter(d => d.unit === unit);
      const totalWeight = unitDeposits.reduce((s, d) => s + d.weight, 0);
      const totalTransactions = unitDeposits.length;
      const nasabah = mockUsers.filter(u => u.unit === unit && u.role === 'User').length;
      return { unit, totalWeight, totalTransactions, nasabah };
    });
  }, []);

  const pieData = [
    { name: 'Organik', value: +Number(stats.organikWeight).toFixed(1), color: '#10B981' },
    { name: 'Anorganik', value: +Number(stats.anorganikWeight).toFixed(1), color: '#0891B2' },
    { name: 'Residu', value: +Number(stats.residuWeight).toFixed(1), color: '#F59E0B' },
  ];

  const animatedTotal = useCountUp(stats.totalWeight, 1500);
  const animatedTransactions = useCountUp(stats.totalTransactions, 1200);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="landing-root">
      <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          <a href="#hero" className="header-brand">
            <span className="header-logo-wrap">
              <PLNLogo size={30} />
            </span>
            <span className="header-brand-text">
              <span className="brand-name">Powercycle</span>
              <span className="brand-tagline">Bank Sampah Digital</span>
            </span>
          </a>

          <nav className="header-nav-desktop">
            <a href="#hero" className="nav-link active">Beranda</a>
            <a href="#tentang" className="nav-link">Tentang</a>
            <a href="#statistik" className="nav-link">Statistik</a>
            <a href="#unit" className="nav-link">Unit</a>
            <a href="#kontak" className="nav-link">Kontak</a>
          </nav>

          <div className="header-actions">
            <button className="btn-login" onClick={() => router.push('/login')}>
              Masuk <ArrowRight size={16} />
            </button>
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu">
            <a href="#hero" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Beranda</a>
            <a href="#tentang" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Tentang</a>
            <a href="#statistik" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Statistik</a>
            <a href="#unit" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Unit</a>
            <a href="#kontak" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Kontak</a>
            <button className="btn-login mobile" onClick={() => router.push('/login')}>
              Masuk <ArrowRight size={16} />
            </button>
          </div>
        )}
      </header>

      <section id="hero" className="hero-section">
        <div className="hero-bg-effects" aria-hidden="true">
          <div className="hero-glow hero-glow-1" />
          <div className="hero-glow hero-glow-2" />
          <div className="hero-glow hero-glow-3" />
        </div>

        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge animate-fade-up">
              <Recycle size={14} />
              <span>Bank Sampah Digital PLTA</span>
            </div>

            <h1 className="hero-title animate-fade-up delay-1">
              Kelola Sampah{' '}
              <span className="hero-title-accent">Lestarikan Lingkungan.</span>
            </h1>

            <p className="hero-description animate-fade-up delay-2">
              Mengangkat semangat pengelolaan sampah yang berkelanjutan, 
              terintegrasi, dan terukur dari wilayah PLTA Mrica, Banjarnegara.
            </p>

            <div className="hero-cta animate-fade-up delay-3">
              <a href="#tentang" className="btn-secondary-hero">
                Tentang Kami
              </a>
              <a href="#statistik" className="btn-primary-hero">
                Lihat Statistik <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="hero-right animate-fade-up delay-3">
            <div className="hero-stats-card featured">
              <div className="hero-card-tag">
                <BarChart3 size={14} />
                Ringkasan Data
              </div>
              <h3 className="hero-card-title">Total Pengelolaan Sampah</h3>
              <div className="hero-stats-grid">
                <div className="hero-stat-item">
                  <span className="hero-stat-value">{formatWeightTon(animatedTotal).split(' ')[0]}</span>
                  <span className="hero-stat-label">Ton Terkelola</span>
                </div>
                <div className="hero-stat-item">
                  <span className="hero-stat-value">{Math.round(animatedTransactions)}</span>
                  <span className="hero-stat-label">Transaksi</span>
                </div>
                <div className="hero-stat-item">
                  <span className="hero-stat-value">{UNIT_LIST.length}</span>
                  <span className="hero-stat-label">Unit Aktif</span>
                </div>
              </div>
            </div>

            <div className="hero-stats-card">
              <div className="hero-card-tag">
                <Recycle size={14} />
                Komposisi
              </div>
              <div className="hero-stats-grid">
                <div className="hero-stat-item">
                  <span className="hero-stat-value" style={{ color: '#10B981' }}>{Number(stats.organikWeight).toFixed(1)}</span>
                  <span className="hero-stat-label">Kg Organik</span>
                </div>
                <div className="hero-stat-item">
                  <span className="hero-stat-value" style={{ color: '#0891B2' }}>{Number(stats.anorganikWeight).toFixed(1)}</span>
                  <span className="hero-stat-label">Kg Anorganik</span>
                </div>
                <div className="hero-stat-item">
                  <span className="hero-stat-value" style={{ color: '#F59E0B' }}>{Number(stats.residuWeight).toFixed(1)}</span>
                  <span className="hero-stat-label">Kg Residu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <a href="#tentang" className="scroll-indicator" aria-label="Scroll down">
          <ChevronDown size={20} />
        </a>
      </section>

      <section id="tentang" className="section-tentang">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <span className="badge-line" />Tentang Kami
            </span>
            <h2 className="section-title">
              Apa itu <span className="text-accent">Powercycle?</span>
            </h2>
            <p className="section-subtitle">
              Powercycle adalah sistem bank sampah digital yang dikembangkan untuk mendukung
              pengelolaan sampah di wilayah PLTA Mrica. Platform ini memudahkan pencatatan,
              monitoring, dan pelaporan data sampah dari berbagai unit secara real-time.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                <Leaf size={28} />
              </div>
              <h3 className="feature-title">Ramah Lingkungan</h3>
              <p className="feature-desc">Mendukung pengelolaan sampah yang berkelanjutan dan terukur untuk mengurangi dampak lingkungan secara signifikan.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'rgba(8,145,178,0.1)', color: '#0891B2' }}>
                <BarChart3 size={28} />
              </div>
              <h3 className="feature-title">Real-time Monitoring</h3>
              <p className="feature-desc">Pantau data sampah secara real-time dengan visualisasi grafik yang informatif dan mudah dipahami oleh semua pihak.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                <Factory size={28} />
              </div>
              <h3 className="feature-title">Multi Unit</h3>
              <p className="feature-desc">Mendukung pencatatan dari berbagai unit operasional dengan data yang terpisah namun terintegrasi dalam satu platform.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="statistik" className="section-statistik">
        <div className="section-container">
          <div className="section-header center">
            <span className="section-badge light">
              <span className="badge-line light" />Statistik
            </span>
            <h2 className="section-title light">
              Data Pengelolaan <span className="text-accent">Sampah</span>
            </h2>
            <p className="section-subtitle light">
              Statistik pengumpulan dan pengelolaan sampah dari seluruh unit operasional Bank Sampah Powercycle.
            </p>
          </div>

          <div className="unit-filter">
            <button
              className={`filter-btn ${activeUnit === 'all' ? 'active' : ''}`}
              onClick={() => setActiveUnit('all')}
            >
              Semua Unit
            </button>
            {UNIT_LIST.map(unit => (
              <button
                key={unit}
                className={`filter-btn ${activeUnit === unit ? 'active' : ''}`}
                onClick={() => setActiveUnit(unit)}
              >
                {unit}
              </button>
            ))}
          </div>

          <div className="stats-grid">
            <div className="stat-card glass">
              <div className="stat-icon-wrap green">
                <Scale size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{formatWeightTon(stats.totalWeight)}</span>
                <span className="stat-label">Total Berat Sampah</span>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon-wrap blue">
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalTransactions}</span>
                <span className="stat-label">Total Transaksi</span>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon-wrap amber">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalUsers}</span>
                <span className="stat-label">Nasabah Aktif</span>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon-wrap purple">
                <Recycle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{UNIT_LIST.length}</span>
                <span className="stat-label">Unit Operasional</span>
              </div>
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-card glass">
              <h3 className="chart-title">Tren Bulanan (Kg)</h3>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ background: '#1A2940', border: 'none', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', color: '#fff' }}
                      labelStyle={{ color: '#94A3B8' }}
                      formatter={(value) => [`${value} Kg`, 'Berat']}
                    />
                    <Bar dataKey="berat" fill="url(#barGradientDS)" radius={[8, 8, 0, 0]} barSize={36} />
                    <defs>
                      <linearGradient id="barGradientDS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0891B2" />
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card glass">
              <h3 className="chart-title">Komposisi Sampah</h3>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1A2940', border: 'none', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', color: '#fff' }}
                      formatter={(value) => `${value} Kg`}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: 13 }}
                      formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.6)' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="unit" className="section-unit">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <span className="badge-line" />Unit Operasional
            </span>
            <h2 className="section-title">
              Statistik Per <span className="text-accent">Unit</span>
            </h2>
            <p className="section-subtitle">
              Data ringkasan pengelolaan sampah dari setiap unit operasional Bank Sampah Powercycle.
            </p>
          </div>

          <div className="unit-cards">
            {unitStats.map((us, index) => (
              <div key={us.unit} className="unit-card" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="unit-card-header">
                  <div className="unit-card-icon">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="unit-card-name">{us.unit}</h3>
                    <p className="unit-card-sub">Unit Bank Sampah</p>
                  </div>
                </div>
                <div className="unit-card-stats">
                  <div className="unit-stat-item">
                    <span className="unit-stat-val">{formatWeightTon(us.totalWeight)}</span>
                    <span className="unit-stat-lbl">Total Berat</span>
                  </div>
                  <div className="unit-stat-item">
                    <span className="unit-stat-val">{us.totalTransactions}</span>
                    <span className="unit-stat-lbl">Transaksi</span>
                  </div>
                  <div className="unit-stat-item">
                    <span className="unit-stat-val">{us.nasabah}</span>
                    <span className="unit-stat-lbl">Nasabah</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-cta">
        <div className="section-container">
          <div className="cta-card">
            <div className="cta-bg-effects" aria-hidden="true">
              <div className="cta-glow cta-glow-1" />
              <div className="cta-glow cta-glow-2" />
            </div>
            <div className="cta-content">
              <h2 className="cta-title">Mulai kelola data sampah Anda</h2>
              <p className="cta-desc">
                Masuk ke dashboard untuk mencatat, memantau, dan mengelola data sampah dari unit Anda secara real-time.
              </p>
              <div className="cta-buttons">
                <button className="btn-cta-primary" onClick={() => router.push('/login')}>
                  Login Sekarang <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="kontak" className="landing-footer">
        <div className="footer-gradient-line" aria-hidden="true" />
        <div className="section-container">
          <div className="footer-grid">
            <div className="footer-brand-col">
              <a href="#hero" className="footer-brand">
                <PLNLogo size={28} />
                <span className="footer-brand-text">
                  <span className="brand-name">Powercycle</span>
                  <span className="brand-tagline">Bank Sampah Digital</span>
                </span>
              </a>
              <p className="footer-desc">
                Platform digital untuk pencatatan, monitoring, dan pelaporan pengelolaan
                sampah yang terintegrasi di wilayah PLTA Mrica.
              </p>
            </div>

            <div className="footer-nav-col">
              <h4 className="footer-col-title">Navigasi</h4>
              <ul className="footer-links">
                <li><a href="#hero">Beranda</a></li>
                <li><a href="#tentang">Tentang</a></li>
                <li><a href="#statistik">Statistik</a></li>
                <li><a href="#unit">Unit</a></li>
              </ul>
            </div>

            <div className="footer-contact-col">
              <h4 className="footer-col-title">Kontak</h4>
              <ul className="footer-contact-list">
                <li>
                  <MapPin size={16} className="footer-contact-icon" />
                  <span>PLTA Mrica, Banjarnegara, Jawa Tengah</span>
                </li>
                <li>
                  <Phone size={16} className="footer-contact-icon" />
                  <span>(0286) 123456</span>
                </li>
                <li>
                  <Mail size={16} className="footer-contact-icon" />
                  <span>banksampah@pltamrica.co.id</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 Powercycle — PLTA Mrica. Semua hak dilindungi.</p>
            <a href="#hero" className="back-to-top">
              Kembali ke atas
              <span className="back-to-top-icon">↑</span>
            </a>
          </div>
        </div>
      </footer>

      <button
        className={`floating-top-btn ${showTopBtn ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Kembali ke atas"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}
