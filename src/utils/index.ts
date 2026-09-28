import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AssetStatus, MaintenanceStatus, CustomFieldType } from '../types';

export function formatCurrencyIDR(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndonesian(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateTimeIndonesian(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function getStatusLabel(status: AssetStatus): string {
  const map: Record<AssetStatus, string> = {
    active: 'Aktif',
    inactive: 'Tidak Aktif',
    damaged: 'Rusak',
    maintenance: 'Maintenance',
    lost: 'Hilang',
    disposed: 'Dilelang / Afkir',
  };
  return map[status] || status;
}

export function getStatusColorClass(status: AssetStatus): { bg: string; text: string; dot: string; border: string } {
  switch (status) {
    case 'active':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-500/20' };
    case 'maintenance':
      return { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', border: 'border-amber-500/20' };
    case 'damaged':
      return { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500', border: 'border-rose-500/20' };
    case 'inactive':
      return { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-500', border: 'border-slate-500/20' };
    case 'lost':
      return { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500', border: 'border-purple-500/20' };
    case 'disposed':
      return { bg: 'bg-zinc-500/10', text: 'text-zinc-600 dark:text-zinc-400', dot: 'bg-zinc-500', border: 'border-zinc-500/20' };
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-500', border: 'border-slate-500/20' };
  }
}

export function getMaintenanceStatusLabel(status: MaintenanceStatus): string {
  const map: Record<MaintenanceStatus, string> = {
    scheduled: 'Terjadwal',
    in_progress: 'Dalam Proses',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };
  return map[status] || status;
}

export function getFieldTypeLabel(type: CustomFieldType): string {
  const map: Record<CustomFieldType, string> = {
    text: 'Text',
    number: 'Number (Angka)',
    email: 'Email',
    phone: 'Nomor Telepon',
    textarea: 'Textarea (Paragraf)',
    date: 'Date (Tanggal)',
    datetime: 'Date & Time',
    select: 'Dropdown / Select',
    radio: 'Radio Button',
    checkbox: 'Checkbox',
    image: 'Image (Gambar)',
    file: 'File / Dokumen',
    url: 'URL / Link Web',
    ip_address: 'IP Address',
  };
  return map[type] || type;
}

// Export utilities
export function exportToExcel(data: Record<string, any>[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToCSV(data: Record<string, any>[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string
) {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Dicetak pada: ${formatDateTimeIndonesian(new Date().toISOString())} | IT Asset Management System`, 14, 25);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 30,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save(`${filename}.pdf`);
}
