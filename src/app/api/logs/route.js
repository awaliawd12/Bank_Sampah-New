import { NextResponse } from 'next/server';
import { query } from '../../lib/db';

export async function GET(request) {
  try {
    const logs = await query('SELECT * FROM activity_log ORDER BY id DESC LIMIT 50');
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activity logs', details: error.message }, { status: 500 });
  }
}
