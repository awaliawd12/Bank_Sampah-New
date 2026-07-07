'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../components/AdminDashboard';

export default function AdminPage() {
  const { role, unit, logout } = useAuth();
  const router = useRouter();
  
  const [deposits, setDeposits] = useState([]);
  const [neraca, setNeraca] = useState([]);
  const [buktiBayar, setBuktiBayar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'admin') {
      router.push('/');
      return;
    }

    async function fetchData() {
      try {
        const [resDep, resNer, resBuk] = await Promise.all([
          fetch('/api/deposits' + (unit ? `?unit=${unit}` : '')),
          fetch('/api/neraca'),
          fetch('/api/bukti' + (unit ? `?unit=${unit}` : ''))
        ]);

        const dataDep = await resDep.json();
        const dataNer = await resNer.json();
        const dataBuk = await resBuk.json();

        if (dataDep.success) setDeposits(dataDep.deposits);
        if (dataNer.success) setNeraca(dataNer.neraca);
        if (dataBuk.success) setBuktiBayar(dataBuk.buktiBayar);
      } catch (err) {
        console.error('Failed to fetch admin data from MySQL backend APIs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [role, unit, router]);

  if (role !== 'admin') return null;
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--ds-bg)', color: 'var(--ds-text)', fontFamily: 'sans-serif' }}>
        <h3>Loading dashboard...</h3>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleDeleteDeposit = async (id) => {
    try {
      const res = await fetch(`/api/deposits/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeposits(prev => prev.filter(d => d.id !== id));
      } else {
        alert('Gagal menghapus data: ' + data.error);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleUpdateStatus = async (id, status, remarks = '') => {
    try {
      const res = await fetch(`/api/deposits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks, adminUser: 'Admin' })
      });
      const data = await res.json();
      if (data.success) {
        setDeposits(prev => prev.map(d => d.id === id ? { ...d, status, remarks } : d));
      } else {
        alert('Gagal mengupdate status: ' + data.error);
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  return (
    <AdminDashboard 
      deposits={deposits} 
      neraca={neraca}
      buktiBayar={buktiBayar}
      onLogout={handleLogout} 
      onDeleteDeposit={handleDeleteDeposit}
      onUpdateStatus={handleUpdateStatus}
      userUnit={unit}
    />
  );
}
