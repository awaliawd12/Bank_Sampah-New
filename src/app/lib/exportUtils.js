import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function exportToPDF(title, columns, data, metadata = {}) {
  const doc = new jsPDF('landscape');
  
  // Title
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  
  // Metadata (e.g., Periode, Cetak Tanggal)
  doc.setFontSize(10);
  let startY = 25;
  if (metadata.periode) {
    doc.text(`Periode: ${metadata.periode}`, 14, startY);
    startY += 6;
  }
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, startY);
  startY += 10;

  // Table
  doc.autoTable({
    startY,
    head: [columns],
    body: data,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [8, 145, 178] },
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
}

export function exportToExcel(title, data) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
  XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`);
}
