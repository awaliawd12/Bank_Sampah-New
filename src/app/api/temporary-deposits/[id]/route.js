import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db as firestore } from '../../../lib/firebase';
import { query } from '../../../lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const docRef = doc(firestore, 'temporary_deposits', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Data not found in temporary deposits (Firebase)' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: docSnap.data() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch temporary deposit from Firebase', details: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { status, alasan_penolakan, validator_name, category, jenis, pengelola, weight } = await request.json();

    const docRef = doc(firestore, 'temporary_deposits', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Data not found in temporary deposits (Firebase)' }, { status: 404 });
    }
    const data = docSnap.data();

    if (status === 'Ditolak') {
      await updateDoc(docRef, { 
        status, 
        alasan_penolakan: alasan_penolakan || '' 
      });
      
      await query(
        'INSERT INTO activity_log (timestamp, user, action, detail, type) VALUES (?, ?, ?, ?, ?)',
        [new Date().toISOString().replace('T', ' ').substring(0, 19), validator_name || 'Validator', 'Tolak Data (Barcode)', `${id} - ${alasan_penolakan}`, 'reject']
      );

      return NextResponse.json({ success: true, message: 'Data ditolak (Firebase updated)' });
    }
    
    if (status === 'Terverifikasi' || status === 'Tervalidasi') {
      const finalCategory = category || data.category;
      const finalJenis = jenis || data.jenis;
      const finalPengelola = pengelola || data.pengelola;
      const finalWeight = weight ? parseFloat(weight) : data.weight;
      const finalRemarks = `Divalidasi oleh: ${validator_name || 'Validator'}` + (data.remarks ? ` | ${data.remarks}` : '');
      
      // 1. Masukkan ke tabel utama MySQL 'deposits'
      await query(
        `INSERT INTO deposits (id, date, time, user, client, unit, category, jenis, pengelola, weight, status, remarks) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.id, data.date, data.time, data.user, data.client, data.unit, finalCategory, finalJenis, finalPengelola, finalWeight, 'Terverifikasi', finalRemarks]
      );
      
      // 2. Hapus dari Firebase temporary_deposits
      await deleteDoc(docRef);
      
      // 3. Log ke MySQL
      await query(
        'INSERT INTO activity_log (timestamp, user, action, detail, type) VALUES (?, ?, ?, ?, ?)',
        [new Date().toISOString().replace('T', ' ').substring(0, 19), validator_name || 'Validator', 'Verifikasi Data (Barcode)', `${id} - Status Terverifikasi`, 'verify']
      );

      return NextResponse.json({ success: true, message: 'Data tervalidasi dan dipindahkan ke MySQL' });
    }

    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update temporary deposit', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Hapus dari Firebase
    const docRef = doc(firestore, 'temporary_deposits', id);
    await deleteDoc(docRef);
    
    return NextResponse.json({ success: true, message: 'Deleted from Firebase' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete temporary deposit', details: error.message }, { status: 500 });
  }
}
