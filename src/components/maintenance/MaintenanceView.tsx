import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  DollarSign,
  User,
  Box,
  Image,
  ArrowRight,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MaintenanceRecord, MaintenanceStatus, MaintenanceType } from '../../types';
import {
  formatCurrencyIDR,
  formatDateIndonesian,
  getMaintenanceStatusLabel,
} from '../../utils';

export const MaintenanceView: React.FC = () => {
  const {
    maintenanceRecords,
    assets,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    setSelectedAssetId,
    setActiveTab,
    hasPermission,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);

  // Form Fields
  const [assetId, setAssetId] = useState('');
  const [title, setTitle] = useState('');
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>('corrective');
  const [technicianName, setTechnicianName] = useState('Dedi Kurniawan');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 10));
  const [issueDescription, setIssueDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [sparepartsUsed, setSparepartsUsed] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [status, setStatus] = useState<MaintenanceStatus>('in_progress');
  const [notes, setNotes] = useState('');
  const [beforePhotoUrl, setBeforePhotoUrl] = useState('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('');

  // KPIs
  const totalTickets = maintenanceRecords.length;
  const inProgressTickets = maintenanceRecords.filter((m) => m.status === 'in_progress').length;
  const completedTickets = maintenanceRecords.filter((m) => m.status === 'completed').length;
  const totalMaintenanceCost = maintenanceRecords.reduce((acc, m) => acc + (m.cost || 0), 0);

  const filteredRecords = useMemo(() => {
    return maintenanceRecords.filter((rec) => {
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
      if (typeFilter !== 'all' && rec.maintenance_type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const asset = assets.find((a) => a.id === rec.asset_id);
        const assetName = (asset?.name || '').toLowerCase();
        const tag = (asset?.asset_tag || '').toLowerCase();
        return (
          rec.maintenance_number.toLowerCase().includes(q) ||
          rec.title.toLowerCase().includes(q) ||
          rec.technician_name.toLowerCase().includes(q) ||
          rec.issue_description.toLowerCase().includes(q) ||
          assetName.includes(q) ||
          tag.includes(q)
        );
      }
      return true;
    });
  }, [maintenanceRecords, statusFilter, typeFilter, searchQuery, assets]);

  const openAddModal = () => {
    const defaultAsset = assets[0]?.id || '';
    setAssetId(defaultAsset);
    setTitle('');
    setMaintenanceType('corrective');
    setTechnicianName('Dedi Kurniawan');
    setScheduledDate(new Date().toISOString().slice(0, 10));
    setIssueDescription('');
    setActionTaken('');
    setSparepartsUsed('');
    setCost('');
    setStatus('in_progress');
    setNotes('');
    setBeforePhotoUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80');
    setAfterPhotoUrl('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !title.trim() || !issueDescription.trim()) return;

    const count = maintenanceRecords.length + 1;
    const maintenanceNumber = `MNT-2026-${String(count).padStart(4, '0')}`;

    const photos: any[] = [];
    if (beforePhotoUrl.trim()) {
      photos.push({
        id: `mp-b-${Date.now()}`,
        stage: 'before',
        url: beforePhotoUrl.trim(),
        caption: 'Kondisi fisik sebelum maintenance',
        uploaded_at: new Date().toISOString(),
      });
    }
    if (afterPhotoUrl.trim()) {
      photos.push({
        id: `mp-a-${Date.now()}`,
        stage: 'after',
        url: afterPhotoUrl.trim(),
        caption: 'Kondisi fisik setelah maintenance',
        uploaded_at: new Date().toISOString(),
      });
    }

    addMaintenanceRecord({
      asset_id: assetId,
      maintenance_number: maintenanceNumber,
      title: title.trim(),
      maintenance_type: maintenanceType,
      technician_name: technicianName.trim(),
      issue_description: issueDescription.trim(),
      action_taken: actionTaken.trim() || undefined,
      spareparts_used: sparepartsUsed.trim() || undefined,
      cost: cost ? Number(cost) : 0,
      status,
      scheduled_date: scheduledDate,
      completion_date: status === 'completed' ? new Date().toISOString().slice(0, 10) : undefined,
      notes: notes.trim() || undefined,
      photos,
    });

    setIsAddModalOpen(false);
  };

  const handleMarkCompleted = (rec: MaintenanceRecord) => {
    updateMaintenanceRecord(rec.id, {
      status: 'completed',
      completion_date: new Date().toISOString().slice(0, 10),
    });
    if (selectedRecord?.id === rec.id) {
      setSelectedRecord({
        ...selectedRecord,
        status: 'completed',
        completion_date: new Date().toISOString().slice(0, 10),
      });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sistem Maintenance & Pemeliharaan Aset
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              WORK ORDERS & REPAIR
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola work order, troubleshooting, pergantian sparepart, dan bukti foto sebelum/sesudah
          </p>
        </div>

        {hasPermission('manage_maintenance') && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs md:text-sm font-semibold shadow-md shadow-brand-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Tiket Maintenance</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Tiket
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalTickets}</p>
          <span className="text-[10px] text-slate-400">Riwayat seluruh perbaikan</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Sedang Berjalan
          </span>
          <p className="text-2xl font-black text-amber-500 mt-1">{inProgressTickets}</p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400">Aset dalam pengerjaan</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Selesai Diperbaiki
          </span>
          <p className="text-2xl font-black text-emerald-500 mt-1">{completedTickets}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Normal operasional</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Biaya Perbaikan
          </span>
          <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 truncate">
            {formatCurrencyIDR(totalMaintenanceCost)}
          </p>
          <span className="text-[10px] text-slate-400">Akumulasi pengeluaran</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. Tiket, Aset, Teknisi, Masalah..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs md:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="in_progress">Dalam Proses</option>
            <option value="scheduled">Terjadwal</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="all">Semua Jenis Maintenance</option>
            <option value="corrective">Corrective (Perbaikan Kerusakan)</option>
            <option value="preventive">Preventive (Pencegahan Berkala)</option>
          </select>
        </div>
      </div>

      {/* Maintenance Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecords.map((rec) => {
          const asset = assets.find((a) => a.id === rec.asset_id);

          return (
            <div
              key={rec.id}
              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:border-brand-500/40 transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                      {rec.maintenance_number}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {rec.maintenance_type}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      rec.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : rec.status === 'in_progress'
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {getMaintenanceStatusLabel(rec.status)}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {rec.title}
                </h3>

                {asset && (
                  <button
                    onClick={() => {
                      setSelectedAssetId(asset.id);
                      setActiveTab('assets');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline mt-1"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>
                      {asset.asset_tag} - {asset.name}
                    </span>
                  </button>
                )}

                <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold text-[10px] uppercase block">
                      Keluhan / Problem:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                      {rec.issue_description}
                    </p>
                  </div>

                  {rec.action_taken && (
                    <div>
                      <span className="text-slate-400 font-semibold text-[10px] uppercase block">
                        Tindakan Perbaikan:
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                        {rec.action_taken}
                      </p>
                    </div>
                  )}

                  {rec.spareparts_used && (
                    <div>
                      <span className="text-slate-400 font-semibold text-[10px] uppercase block">
                        Sparepart Terpakai:
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                        {rec.spareparts_used}
                      </p>
                    </div>
                  )}
                </div>

                {/* Photos Before / After preview */}
                {rec.photos && rec.photos.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Foto Bukti Kondisi (Sebelum & Sesudah):
                    </span>
                    <div className="flex gap-2">
                      {rec.photos.map((p) => (
                        <div
                          key={p.id}
                          className="w-20 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group shrink-0"
                        >
                          <img src={p.url} alt="" className="w-full h-full object-cover" />
                          <span className="absolute bottom-0.5 left-0.5 text-[8px] font-bold text-white bg-black/70 px-1 rounded uppercase">
                            {p.stage}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Footer Info & Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Teknisi / Biaya:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {rec.technician_name}
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 ml-2">
                    {formatCurrencyIDR(rec.cost)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {rec.status !== 'completed' && hasPermission('manage_maintenance') && (
                    <button
                      onClick={() => handleMarkCompleted(rec)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selesaikan</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedRecord(rec)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50"
                    title="Detail Lengkap Tiket"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: CREATE MAINTENANCE WORK ORDER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Buat Tiket Maintenance Baru
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Pilih Aset yang Bermasalah <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.asset_tag} - {a.name} ({a.serial_number || 'No SN'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Judul Pekerjaan Maintenance <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Perbaikan Card Reader ATM / Penggantian RAM Server"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Jenis Pemeliharaan
                  </label>
                  <select
                    value={maintenanceType}
                    onChange={(e) => setMaintenanceType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  >
                    <option value="corrective">Corrective (Perbaikan Kerusakan)</option>
                    <option value="preventive">Preventive (Pencegahan Rutin)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Teknisi Pelaksana
                  </label>
                  <input
                    type="text"
                    required
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Deskripsi Keluhan / Gejala Masalah <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Jelaskan kendala yang dialami perangkat secara detail"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Tindakan Teknisi (Jika sudah dilakukan)
                  </label>
                  <textarea
                    rows={2}
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    placeholder="Langkah troubleshooting atau tindakan yang diambil"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Sparepart yang Digunakan
                  </label>
                  <input
                    type="text"
                    value={sparepartsUsed}
                    onChange={(e) => setSparepartsUsed(e.target.value)}
                    placeholder="Contoh: Modul Card Reader / SSD 1TB"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Estimasi / Realisasi Biaya (IDR)
                  </label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 1500000"
                    className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    URL Foto Sebelum Maintenance
                  </label>
                  <input
                    type="url"
                    value={beforePhotoUrl}
                    onChange={(e) => setBeforePhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    URL Foto Sesudah Maintenance
                  </label>
                  <input
                    type="url"
                    value={afterPhotoUrl}
                    onChange={(e) => setAfterPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30"
                >
                  Buat Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
