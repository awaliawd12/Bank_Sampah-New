import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Check if deposit exists
    const deposits = await query('SELECT * FROM deposits WHERE id = ?', [id]);
    if (!deposits || deposits.length === 0) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    const deposit = deposits[0];

    // Delete deposit
    await query('DELETE FROM deposits WHERE id = ?', [id]);

    // Insert log
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await query(
      'INSERT INTO activity_log (timestamp, user, action, detail, type) VALUES (?, ?, ?, ?, ?)',
      [timestamp, deposit.user, 'Hapus Data Sampah', `Hapus transaksi ${id} - ${deposit.weight} kg`, 'delete']
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete deposit', details: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { status, remarks, adminUser } = await request.json();

    // Check if deposit exists
    const deposits = await query('SELECT * FROM deposits WHERE id = ?', [id]);
    if (!deposits || deposits.length === 0) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    const deposit = deposits[0];

    // Update deposit status
    await query(
      'UPDATE deposits SET status = ?, remarks = ? WHERE id = ?',
      [status, remarks || '', id]
    );

    // Insert log for verification
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const logAction = status === 'Terverifikasi' ? 'Verifikasi Data' : 'Tolak Data';
    const logDetail = `${id} - ${deposit.category} (${deposit.jenis}) ${deposit.weight} kg - Status ${status} ${remarks ? `(${remarks})` : ''}`;
    
    await query(
      'INSERT INTO activity_log (timestamp, user, action, detail, type) VALUES (?, ?, ?, ?, ?)',
      [timestamp, adminUser || 'Admin', logAction, logDetail, status === 'Terverifikasi' ? 'verify' : 'reject']
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update deposit status', details: error.message }, { status: 500 });
  }
}
