'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { UserDashboard } from '../components/UserDashboard';

export default function UserPage() {
  const { role, unit, username, logout } = useAuth();
  const router = useRouter();
  
  const [deposits, setDeposits] = useState([]);
  const [neraca, setNeraca] = useState([]);
  const [buktiBayar, setBuktiBayar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'user') {
      router.push('/');
      return;
    }

    async function fetchData() {
      try {
        const [resDep, resNer, resBuk] = await Promise.all([
          fetch('/api/deposits?user=' + username),
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
        console.error('Failed to fetch user dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [role, username, unit, router]);

  if (role !== 'user') return null;
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

  const handleAddDeposit = async (deposit) => {
    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deposit)
      });
      const data = await res.json();
      if (data.success) {
        setDeposits(prev => [deposit, ...prev]);
      } else {
        alert('Gagal menambah setoran: ' + data.error);
      }
    } catch (err) {
      console.error('Add deposit error:', err);
    }
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
      console.error('Delete deposit error:', err);
    }
  };

  const handleAddBuktiBayar = async (bukti) => {
    try {
      const res = await fetch('/api/bukti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bukti)
      });
      const data = await res.json();
      if (data.success) {
        setBuktiBayar(prev => [bukti, ...prev]);
      } else {
        alert('Gagal mengunggah bukti bayar: ' + data.error);
      }
    } catch (err) {
      console.error('Add bukti error:', err);
    }
  };

  return (
    <UserDashboard 
      deposits={deposits} 
      neraca={neraca}
      buktiBayar={buktiBayar}
      onLogout={handleLogout} 
      onAddDeposit={handleAddDeposit}
      onDeleteDeposit={handleDeleteDeposit}
      onAddBuktiBayar={handleAddBuktiBayar}
      userUnit={unit}
      username={username}
    />
  );
}
