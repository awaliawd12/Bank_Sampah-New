import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { status, remarks } = await request.json();

    // Check if bukti exists
    const buktis = await query('SELECT * FROM bukti_bayar WHERE id = ?', [id]);
    if (!buktis || buktis.length === 0) {
      return NextResponse.json({ error: 'Bukti bayar not found' }, { status: 404 });
    }

    // Update bukti status
    await query(
      'UPDATE bukti_bayar SET status = ? WHERE id = ?',
      [status, id]
    );

    // Insert log
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const logAction = status === 'Lunas' ? 'Setujui Bukti Bayar' : 'Tolak Bukti Bayar';
    const logDetail = `Bukti ${id} - Status: ${status}${remarks ? ` (${remarks})` : ''}`;

    await query(
      'INSERT INTO activity_log (timestamp, user, action, detail, type) VALUES (?, ?, ?, ?, ?)',
      [timestamp, 'Admin', logAction, logDetail, status === 'Lunas' ? 'verify' : 'reject']
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bukti status', details: error.message }, { status: 500 });
  }
}
