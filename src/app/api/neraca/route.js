import { NextResponse } from 'next/server';
import { query } from '../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    let sql = 'SELECT * FROM neraca_sampah';
    const params = [];
    if (month) {
      sql += ' WHERE month = ?';
      params.push(month);
    }

    const neraca = await query(sql, params);
    return NextResponse.json({ success: true, neraca });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch neraca data', details: error.message }, { status: 500 });
  }
}
