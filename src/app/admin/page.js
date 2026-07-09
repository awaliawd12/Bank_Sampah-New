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
  const [inventarisasi, setInventarisasi] = useState([]);
  const [rekapProgram, setRekapProgram] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'admin sis' && role !== 'admin llk') {
      router.push('/');
      return;
    }

    async function fetchData() {
      try {
        const [resDep, resTemp, resNer, resBuk, resInv, resRekap, resUsers, resClients] = await Promise.all([
          fetch('/api/deposits' + (unit ? `?unit=${unit}` : '')),
          fetch('/api/temporary-deposits' + (unit ? `?unit=${unit}` : '')),
          fetch('/api/neraca'),
          fetch('/api/bukti' + (unit ? `?unit=${unit}` : '')),
          fetch('/api/inventarisasi'),
          fetch('/api/rekap-program'),
          fetch('/api/users'),
          fetch('/api/clients')
        ]);

        const dataDep = await resDep.json();
        const dataTemp = await resTemp.json();
        const dataNer = await resNer.json();
        const dataBuk = await resBuk.json();
        const dataInv = await resInv.json();
        const dataRekap = await resRekap.json();
        const dataUsers = await resUsers.json();
        const dataClients = await resClients.json();

        let allDeposits = [];
        if (dataDep.success) allDeposits = [...allDeposits, ...dataDep.deposits];
        if (dataTemp.success) allDeposits = [...allDeposits, ...dataTemp.deposits];
        
        allDeposits.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateB - dateA;
        });

        setDeposits(allDeposits);
        if (dataNer.success) setNeraca(dataNer.neraca);
        if (dataBuk.success) setBuktiBayar(dataBuk.buktiBayar);
        if (dataUsers.success) setUsers(dataUsers.users);
        if (dataClients.success) setClients(dataClients.clients);
        
        if (Array.isArray(dataInv)) setInventarisasi(dataInv);
        if (Array.isArray(dataRekap)) setRekapProgram(dataRekap);
      } catch (err) {
        console.error('Failed to fetch admin data from MySQL backend APIs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [role, unit, router]);

  if (role !== 'admin sis' && role !== 'admin llk') return null;
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

  const handleUpdateBuktiStatus = async (id, status, remarks = '') => {
    try {
      const res = await fetch(`/api/bukti/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks })
      });
      const data = await res.json();
      if (data.success) {
        setBuktiBayar(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      } else {
        alert('Gagal mengupdate status bukti: ' + data.error);
      }
    } catch (err) {
      console.error('Update bukti status error:', err);
    }
  };

  return (
    <AdminDashboard 
      role={role}
      deposits={deposits} 
      neraca={neraca}
      buktiBayar={buktiBayar}
      inventarisasi={inventarisasi}
      rekapProgram={rekapProgram}
      users={users}
      clients={clients}
      onLogout={handleLogout} 
      onDeleteDeposit={handleDeleteDeposit}
      onUpdateStatus={handleUpdateStatus}
      onUpdateBuktiStatus={handleUpdateBuktiStatus}
      userUnit={unit}
    />
  );
}
