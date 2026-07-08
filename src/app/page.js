import LandingPage from './components/LandingPage';
import { getDbConnection } from './lib/db';

export default async function Home() {
  let initialDeposits = [];
  let mockUsers = [];
  
  try {
    const pool = await getDbConnection();
    const [deposits] = await pool.query('SELECT * FROM deposits WHERE status = "Terverifikasi"');
    initialDeposits = deposits.map(d => ({ ...d, weight: Number(d.weight) }));
    
    const [users] = await pool.query('SELECT * FROM users');
    mockUsers = users;
  } catch (err) {
    console.error('Error fetching data for landing page:', err);
  }

  return <LandingPage initialDeposits={initialDeposits} mockUsers={mockUsers} />;
}
