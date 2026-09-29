import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  Smartphone,
  Phone,
  MapPin,
  Building,
  User,
  Trash2,
  Edit2,
  Download,
  Calendar,
  X,
  History,
  ShieldCheck,
  ChevronRight,
  Check,
  Sparkles,
  Printer,
  BadgeAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  EDCMovementRecord,
  EDCSubmission,
  EDCMovementType,
  EDCCondition,
  EDCSubmissionStatus,
} from '../../types';

export const EDCBRILinkView: React.FC = () => {
  const {
    edcMovements,
    addEDCMovement,
    updateEDCMovement,
    deleteEDCMovement,
    edcSubmissions,
    addEDCSubmission,
    updateEDCSubmission,
    deleteEDCSubmission,
    hasPermission,
    currentUser,
  } = useApp();

  // Active view tab: 'mutasi' | 'pengajuan' | 'stok'
  const [activeTab, setActiveTab] = useState<'mutasi' | 'pengajuan' | 'stok'>('mutasi');

  // Search & Filter for Mutasi
  const [searchMutasi, setSearchMutasi] = useState('');
  const [filterTypeMutasi, setFilterTypeMutasi] = useState<'all' | EDCMovementType>('all');
  const [filterCondition, setFilterCondition] = useState<'all' | EDCCondition>('all');

  // Search & Filter for Pengajuan
  const [searchPengajuan, setSearchPengajuan] = useState('');
  const [filterStatusPengajuan, setFilterStatusPengajuan] = useState<'all' | EDCSubmissionStatus>('all');

  // Modals state
  const [isAddMutasiOpen, setIsAddMutasiOpen] = useState(false);
  const [isAddPengajuanOpen, setIsAddPengajuanOpen] = useState(false);
  const [selectedSubmissionForFollowUp, setSelectedSubmissionForFollowUp] = useState<EDCSubmission | null>(null);
  const [selectedMutasiForDetail, setSelectedMutasiForDetail] = useState<EDCMovementRecord | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'mutasi' | 'pengajuan'; id: string; name: string } | null>(null);

  // Form states for Mutasi
  const [mutasiType, setMutasiType] = useState<EDCMovementType>('keluar');
  const [mutasiDate, setMutasiDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [mutasiSn, setMutasiSn] = useState('');
  const [mutasiTid, setMutasiTid] = useState('');
  const [mutasiMid, setMutasiMid] = useState('');
  const [mutasiModel, setMutasiModel] = useState('Pax D210 GPRS');
  const [mutasiAgentName, setMutasiAgentName] = useState('');
  const [mutasiAgentCode, setMutasiAgentCode] = useState('');
  const [mutasiAgentAddress, setMutasiAgentAddress] = useState('');
  const [mutasiAgentPhone, setMutasiAgentPhone] = useState('');
  const [mutasiPic, setMutasiPic] = useState(() => currentUser?.name || 'Petugas IT Cabang');
  const [mutasiCondition, setMutasiCondition] = useState<EDCCondition>('baik');
  const [mutasiAccessories, setMutasiAccessories] = useState<string[]>([
    'Adaptor/Charger',
    'Kabel Power',
    'Thermal Paper',
    'SIM Card',
  ]);
  const [mutasiSimProvider, setMutasiSimProvider] = useState('Telkomsel');
  const [mutasiSimNumber, setMutasiSimNumber] = useState('');
  const [mutasiReason, setMutasiReason] = useState('Pemasangan Agen Baru');
  const [mutasiNotes, setMutasiNotes] = useState('');

  // Form states for Pengajuan Baru
  const [subApplicantName, setSubApplicantName] = useState('');
  const [subBusinessName, setSubBusinessName] = useState('');
  const [subNik, setSubNik] = useState('');
  const [subPhone, setSubPhone] = useState('');
  const [subAddress, setSubAddress] = useState('');
  const [subBriUnit, setSubBriUnit] = useState('BRI Unit Labuan Kota');
  const [subDate, setSubDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [subTargetDate, setSubTargetDate] = useState('');
  const [subAssignedPic, setSubAssignedPic] = useState(() => currentUser?.name || 'Petugas IT Support');
  const [subNotes, setSubNotes] = useState('');

  // Follow-up modal state
  const [followUpStage, setFollowUpStage] = useState<EDCSubmissionStatus>('pengajuan_masuk');
  const [followUpAllocatedSn, setFollowUpAllocatedSn] = useState('');
  const [followUpAllocatedTid, setFollowUpAllocatedTid] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');

  // Notifications feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const totalMutasi = edcMovements.length;
    const totalKeluar = edcMovements.filter((m) => m.type === 'keluar').length;
    const totalMasuk = edcMovements.filter((m) => m.type === 'masuk').length;
    const activeSubmissions = edcSubmissions.filter((s) => !['terpasang_aktif', 'ditolak'].includes(s.status)).length;
    const completedSubmissions = edcSubmissions.filter((s) => s.status === 'terpasang_aktif').length;
    return { totalMutasi, totalKeluar, totalMasuk, activeSubmissions, completedSubmissions };
  }, [edcMovements, edcSubmissions]);

  // Filtered Mutasi
  const filteredMutasi = useMemo(() => {
    return edcMovements.filter((m) => {
      const matchSearch =
        m.serial_number.toLowerCase().includes(searchMutasi.toLowerCase()) ||
        m.tid.toLowerCase().includes(searchMutasi.toLowerCase()) ||
        m.agent_name.toLowerCase().includes(searchMutasi.toLowerCase()) ||
        (m.mid && m.mid.toLowerCase().includes(searchMutasi.toLowerCase())) ||
        m.pic_officer.toLowerCase().includes(searchMutasi.toLowerCase());
      const matchType = filterTypeMutasi === 'all' || m.type === filterTypeMutasi;
      const matchCondition = filterCondition === 'all' || m.condition === filterCondition;
      return matchSearch && matchType && matchCondition;
    });
  }, [edcMovements, searchMutasi, filterTypeMutasi, filterCondition]);

  // Filtered Pengajuan
  const filteredPengajuan = useMemo(() => {
    return edcSubmissions.filter((s) => {
      const matchSearch =
        s.applicant_name.toLowerCase().includes(searchPengajuan.toLowerCase()) ||
        s.business_name.toLowerCase().includes(searchPengajuan.toLowerCase()) ||
        s.bri_unit.toLowerCase().includes(searchPengajuan.toLowerCase()) ||
        s.phone.includes(searchPengajuan) ||
        (s.allocated_tid && s.allocated_tid.includes(searchPengajuan));
      const matchStatus = filterStatusPengajuan === 'all' || s.status === filterStatusPengajuan;
      return matchSearch && matchStatus;
    });
  }, [edcSubmissions, searchPengajuan, filterStatusPengajuan]);

  // Stage details helper
  const stageMeta: Record<EDCSubmissionStatus, { label: string; step: number; color: string; bg: string }> = {
    pengajuan_masuk: { label: '1. Berkas Masuk', step: 1, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30' },
    survei_kelayakan: { label: '2. Survei Usaha', step: 2, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
    approval_kanca: { label: '3. Approval Kanca', step: 3, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
    order_mesin: { label: '4. Alokasi EDC', step: 4, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    inisiasi_tid: { label: '5. Inisiasi TID', step: 5, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
    siap_distribusi: { label: '6. Siap Diantar', step: 6, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    terpasang_aktif: { label: '7. Terpasang Aktif', step: 7, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    ditolak: { label: 'Ditolak / Batal', step: 0, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
  };

  const handleOpenAddMutasi = (defaultType: EDCMovementType = 'keluar') => {
    setMutasiType(defaultType);
    setMutasiDate(new Date().toISOString().slice(0, 10));
    setMutasiSn('');
    setMutasiTid('');
    setMutasiMid('');
    setMutasiModel('Pax D210 GPRS');
    setMutasiAgentName('');
    setMutasiAgentCode('');
    setMutasiAgentAddress('');
    setMutasiAgentPhone('');
    setMutasiPic(currentUser?.name || 'Petugas IT Cabang');
    setMutasiCondition('baik');
    setMutasiAccessories(['Adaptor/Charger', 'Kabel Power', 'Thermal Paper', 'SIM Card']);
    setMutasiSimProvider('Telkomsel');
    setMutasiSimNumber('');
    setMutasiReason(defaultType === 'keluar' ? 'Pemasangan Agen Baru' : 'Penarikan Mesin Rusak');
    setMutasiNotes('');
    setIsAddMutasiOpen(true);
  };

  const handleSaveMutasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutasiSn.trim() || !mutasiTid.trim() || !mutasiAgentName.trim()) {
      alert('Nomor Seri (SN), TID, dan Nama Agen wajib diisi!');
      return;
    }

    addEDCMovement({
      type: mutasiType,
      date: new Date(mutasiDate).toISOString(),
      serial_number: mutasiSn.trim().toUpperCase(),
      tid: mutasiTid.trim(),
      mid: mutasiMid.trim() || undefined,
      model: mutasiModel,
      agent_name: mutasiAgentName.trim(),
      agent_code: mutasiAgentCode.trim() || undefined,
      agent_address: mutasiAgentAddress.trim() || 'Wilayah Kerja KC Labuan',
      agent_phone: mutasiAgentPhone.trim() || '-',
      pic_officer: mutasiPic.trim(),
      condition: mutasiCondition,
      accessories: mutasiAccessories,
      sim_card_provider: mutasiSimProvider,
      sim_card_number: mutasiSimNumber.trim() || undefined,
      reason: mutasiReason.trim(),
      notes: mutasiNotes.trim() || undefined,
    });

    setIsAddMutasiOpen(false);
    showToast(`Data mutasi EDC ${mutasiType === 'keluar' ? 'Keluar' : 'Masuk'} berhasil disimpan!`);
  };

  const handleOpenAddPengajuan = () => {
    setSubApplicantName('');
    setSubBusinessName('');
    setSubNik('');
    setSubPhone('');
    setSubAddress('');
    setSubBriUnit('BRI Unit Labuan Kota');
    setSubDate(new Date().toISOString().slice(0, 10));
    setSubTargetDate('');
    setSubAssignedPic(currentUser?.name || 'Petugas IT Support');
    setSubNotes('');
    setIsAddPengajuanOpen(true);
  };

  const handleSavePengajuan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subApplicantName.trim() || !subBusinessName.trim() || !subPhone.trim()) {
      alert('Nama Pemohon, Nama Usaha, dan No. Telepon wajib diisi!');
      return;
    }

    addEDCSubmission({
      applicant_name: subApplicantName.trim(),
      business_name: subBusinessName.trim(),
      nik: subNik.trim() || undefined,
      phone: subPhone.trim(),
      address: subAddress.trim() || 'Kecamatan Labuan',
      bri_unit: subBriUnit,
      submission_date: subDate,
      status: 'pengajuan_masuk',
      target_date: subTargetDate || undefined,
      assigned_pic: subAssignedPic.trim(),
      notes: subNotes.trim() || 'Berkas pengajuan agen BRILink baru diterima.',
    });

    setIsAddPengajuanOpen(false);
    showToast('Pengajuan agen baru EDC BRILink berhasil didaftarkan!');
  };

  const handleOpenFollowUp = (sub: EDCSubmission) => {
    setSelectedSubmissionForFollowUp(sub);
    setFollowUpStage(sub.status);
    setFollowUpAllocatedSn(sub.allocated_sn || '');
    setFollowUpAllocatedTid(sub.allocated_tid || '');
    setFollowUpNote('');
  };

  const handleSaveFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionForFollowUp) return;

    updateEDCSubmission(
      selectedSubmissionForFollowUp.id,
      {
        status: followUpStage,
        allocated_sn: followUpAllocatedSn.trim() || undefined,
        allocated_tid: followUpAllocatedTid.trim() || undefined,
      },
      followUpNote.trim() || `Tahapan pengajuan dialihkan ke ${stageMeta[followUpStage].label}`
    );

    setSelectedSubmissionForFollowUp(null);
    showToast('Tindak lanjut tahapan pengajuan berhasil diperbarui!');
  };

  const handleDeleteItem = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'mutasi') {
      deleteEDCMovement(itemToDelete.id);
      showToast('Data mutasi EDC berhasil dihapus.');
    } else {
      deleteEDCSubmission(itemToDelete.id);
      showToast('Data pengajuan agen berhasil dihapus.');
    }
    setItemToDelete(null);
  };

  const toggleAccessory = (acc: string) => {
    setMutasiAccessories((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  const exportToCSV = () => {
    if (activeTab === 'mutasi') {
      const headers = ['Tipe', 'Tanggal', 'SN', 'TID', 'Model', 'Nama Agen', 'No Telepon', 'PIC', 'Kondisi', 'Alasan'];
      const rows = filteredMutasi.map((m) => [
        m.type.toUpperCase(),
        m.date.slice(0, 10),
        m.serial_number,
        m.tid,
        m.model,
        `"${m.agent_name.replace(/"/g, '""')}"`,
        m.agent_phone,
        m.pic_officer,
        m.condition,
        `"${m.reason.replace(/"/g, '""')}"`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `mutasi_edc_brilink_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Nama Pemohon', 'Nama Usaha', 'No HP', 'Alamat', 'BRI Unit', 'Tgl Pengajuan', 'Status', 'TID', 'SN'];
      const rows = filteredPengajuan.map((s) => [
        `"${s.applicant_name.replace(/"/g, '""')}"`,
        `"${s.business_name.replace(/"/g, '""')}"`,
        s.phone,
        `"${s.address.replace(/"/g, '""')}"`,
        `"${s.bri_unit.replace(/"/g, '""')}"`,
        s.submission_date,
        s.status,
        s.allocated_tid || '-',
        s.allocated_sn || '-',
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `pengajuan_edc_brilink_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 text-xs font-bold animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Asset EDC BRILink</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  Operasional & Logistik
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Pendataan mesin EDC BRILink keluar & masuk agen serta tindak lanjut alur pengajuan calon agen baru.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenAddMutasi('keluar')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>EDC Keluar</span>
          </button>
          <button
            onClick={() => handleOpenAddMutasi('masuk')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>EDC Masuk</span>
          </button>
          <button
            onClick={handleOpenAddPengajuan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Pengajuan Baru</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Total Mutasi</span>
            <ArrowLeftRight className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalMutasi}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Riwayat penyerahan / penarikan</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-500">EDC Keluar</span>
            <ArrowUpRight className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            {stats.totalKeluar}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Diserahkan / terpasang di agen</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-500">EDC Masuk</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.totalMasuk}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Ditarik agen / stok gudang IT</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-500">Proses Pengajuan</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {stats.activeSubmissions}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Calon agen dalam tindak lanjut</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-500">Pengajuan Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.completedSubmissions}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Unit terpasang & aktif transaksi</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('mutasi')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'mutasi'
              ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Mutasi EDC Keluar - Masuk</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {edcMovements.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pengajuan')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'pengajuan'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tindak Lanjut Pengajuan Baru</span>
          {stats.activeSubmissions > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
              {stats.activeSubmissions}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: MUTASI KELUAR MASUK EDC */}
      {activeTab === 'mutasi' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchMutasi}
                onChange={(e) => setSearchMutasi(e.target.value)}
                placeholder="Cari SN, TID, Nama Agen, Model EDC, PIC..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  onClick={() => setFilterTypeMutasi('all')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    filterTypeMutasi === 'all'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterTypeMutasi('keluar')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    filterTypeMutasi === 'keluar'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-sky-600'
                  }`}
                >
                  EDC Keluar
                </button>
                <button
                  onClick={() => setFilterTypeMutasi('masuk')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    filterTypeMutasi === 'masuk'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-emerald-600'
                  }`}
                >
                  EDC Masuk
                </button>
              </div>

              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 shrink-0"
              >
                <option value="all">Semua Kondisi</option>
                <option value="baik">Kondisi Baik</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="rusak_total">Rusak Total</option>
                <option value="butuh_inisiasi">Butuh Inisiasi</option>
              </select>
            </div>
          </div>

          {/* Table / Cards List */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            {filteredMutasi.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Tidak ada catatan mutasi EDC ditemukan
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Klik tombol "EDC Keluar" atau "EDC Masuk" di atas untuk menambahkan catatan mutasi.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Tipe Mutasi</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Identitas EDC</th>
                      <th className="py-3 px-4">Agen BRILink / Penerima</th>
                      <th className="py-3 px-4">Kondisi & Aksesoris</th>
                      <th className="py-3 px-4">Alasan & Petugas</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredMutasi.map((item) => {
                      const isKeluar = item.type === 'keluar';
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                isKeluar
                                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              {isKeluar ? (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              )}
                              <span>{isKeluar ? 'EDC Keluar' : 'EDC Masuk'}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.date.slice(0, 10)}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {item.date.includes('T') ? item.date.slice(11, 16) : ''}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-mono text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>SN: {item.serial_number}</span>
                            </div>
                            <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                              TID: {item.tid} {item.mid ? `| MID: ${item.mid}` : ''}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.model}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {item.agent_name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 line-clamp-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span>{item.agent_address}</span>
                            </p>
                            {item.agent_phone && (
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 shrink-0" />
                                <span>{item.agent_phone}</span>
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                item.condition === 'baik'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : item.condition === 'rusak_ringan'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {item.condition.replace('_', ' ')}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                              Aksesoris: {item.accessories.join(', ') || '-'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                              {item.reason}
                            </p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>PIC: {item.pic_officer}</span>
                            </p>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedMutasiForDetail(item)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Lihat Tanda Terima / Detail"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              {hasPermission('delete_data') && (
                                <button
                                  onClick={() =>
                                    setItemToDelete({
                                      type: 'mutasi',
                                      id: item.id,
                                      name: `Mutasi ${item.serial_number} (${item.agent_name})`,
                                    })
                                  }
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="Hapus Data Mutasi"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TINDAK LANJUT PENGAJUAN BARU EDC */}
      {activeTab === 'pengajuan' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchPengajuan}
                onChange={(e) => setSearchPengajuan(e.target.value)}
                placeholder="Cari Nama Pemohon, Toko, BRI Unit, No HP, TID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <select
                value={filterStatusPengajuan}
                onChange={(e) => setFilterStatusPengajuan(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
              >
                <option value="all">Semua Status Tahapan</option>
                <option value="pengajuan_masuk">1. Berkas Masuk</option>
                <option value="survei_kelayakan">2. Survei Usaha</option>
                <option value="approval_kanca">3. Approval Kanca</option>
                <option value="order_mesin">4. Alokasi EDC</option>
                <option value="inisiasi_tid">5. Inisiasi TID</option>
                <option value="siap_distribusi">6. Siap Diantar</option>
                <option value="terpasang_aktif">7. Terpasang & Aktif</option>
                <option value="ditolak">Ditolak / Batal</option>
              </select>

              <button
                onClick={handleOpenAddPengajuan}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pengajuan</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPengajuan.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Tidak ada pengajuan agen BRILink ditemukan
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Klik tombol "Tambah Pengajuan" untuk memasukkan data calon agen yang mengajukan EDC baru.
                </p>
              </div>
            ) : (
              filteredPengajuan.map((sub) => {
                const meta = stageMeta[sub.status];
                const isFinished = sub.status === 'terpasang_aktif';
                const isRejected = sub.status === 'ditolak';

                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-4"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.bg} ${meta.color} mb-1.5`}
                          >
                            {meta.label}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {sub.applicant_name}
                          </h3>
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                            {sub.business_name}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] font-semibold text-slate-400 block">
                            Pengajuan: {sub.submission_date}
                          </span>
                          {sub.target_date && (
                            <span className="text-[10px] text-amber-500 font-medium block mt-0.5">
                              Target: {sub.target_date}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info details */}
                      <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Unit Supervisi:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{sub.bri_unit}</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">No. HP / WA:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{sub.phone}</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-2 line-clamp-1">
                        <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                        <span>{sub.address}</span>
                      </p>

                      {/* Allocated TID / SN if present */}
                      {(sub.allocated_tid || sub.allocated_sn) && (
                        <div className="p-2.5 mt-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Alokasi Mesin:</span>
                            <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                              TID: {sub.allocated_tid || '-'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Serial Number:</span>
                            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                              {sub.allocated_sn || '-'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Progress Step Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span>Progres Tahapan</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {isRejected ? 'Dibatalkan' : `${meta.step} dari 7 Tahap`}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isRejected
                                ? 'bg-rose-500 w-full'
                                : isFinished
                                ? 'bg-emerald-500 w-full'
                                : 'bg-gradient-to-r from-sky-500 to-indigo-600'
                            }`}
                            style={{
                              width: isRejected ? '100%' : `${(meta.step / 7) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Latest Follow up note */}
                      <div className="mt-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-amber-600 dark:text-amber-400 font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Catatan Tindak Lanjut Terakhir:</span>
                          </span>
                          <span>PIC: {sub.assigned_pic}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-xs italic leading-relaxed">
                          "{sub.notes}"
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                      <button
                        onClick={() => handleOpenFollowUp(sub)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Update Tindak Lanjut</span>
                      </button>

                      {hasPermission('delete_data') && (
                        <button
                          onClick={() =>
                            setItemToDelete({
                              type: 'pengajuan',
                              id: sub.id,
                              name: `Pengajuan ${sub.applicant_name} (${sub.business_name})`,
                            })
                          }
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Hapus Pengajuan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CATAT MUTASI EDC KELUAR / MASUK */}
      {/* ======================================================== */}
      {isAddMutasiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                    mutasiType === 'keluar' ? 'bg-sky-600' : 'bg-emerald-600'
                  }`}
                >
                  {mutasiType === 'keluar' ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Catat Mutasi EDC {mutasiType === 'keluar' ? 'Keluar' : 'Masuk'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Formulir serah terima dan pergerakan unit mesin EDC BRILink
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMutasiOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMutasi} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jenis Mutasi *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMutasiType('keluar');
                      setMutasiReason('Pemasangan Agen Baru');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      mutasiType === 'keluar'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>EDC Keluar (Ke Agen / Servis)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMutasiType('masuk');
                      setMutasiReason('Penarikan Mesin Rusak');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      mutasiType === 'masuk'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>EDC Masuk (Kembali / Dari Vendor)</span>
                  </button>
                </div>
              </div>

              {/* SN, TID, Model */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Serial Number (SN) *
                  </label>
                  <input
                    type="text"
                    value={mutasiSn}
                    onChange={(e) => setMutasiSn(e.target.value)}
                    placeholder="PAX-8829104"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white uppercase font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Terminal ID (TID) *
                  </label>
                  <input
                    type="text"
                    value={mutasiTid}
                    onChange={(e) => setMutasiTid(e.target.value)}
                    placeholder="68291024"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Model EDC
                  </label>
                  <select
                    value={mutasiModel}
                    onChange={(e) => setMutasiModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Pax D210 GPRS">Pax D210 GPRS</option>
                    <option value="Ingenico Move 2500">Ingenico Move 2500</option>
                    <option value="Newland N910 Smart EDC">Newland N910 Smart Android</option>
                    <option value="Pax A920 Smart EDC">Pax A920 Smart Android</option>
                    <option value="Verifone C680">Verifone C680</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Agen Name, Phone, Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Agen BRILink / Pemilik Toko *
                  </label>
                  <input
                    type="text"
                    value={mutasiAgentName}
                    onChange={(e) => setMutasiAgentName(e.target.value)}
                    placeholder="Toko Sembako Berkah / Ibu Siti Aminah"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={mutasiAgentPhone}
                    onChange={(e) => setMutasiAgentPhone(e.target.value)}
                    placeholder="0812-9845-xxxx"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Alamat Agen */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Lengkap Lokasi Agen
                </label>
                <input
                  type="text"
                  value={mutasiAgentAddress}
                  onChange={(e) => setMutasiAgentAddress(e.target.value)}
                  placeholder="Jl. Raya Labuan No. 12, Desa Caringin, Kec. Labuan"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Kondisi, Tanggal, PIC */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kondisi Mesin EDC
                  </label>
                  <select
                    value={mutasiCondition}
                    onChange={(e) => setMutasiCondition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="baik">Kondisi Baik / Normal</option>
                    <option value="rusak_ringan">Rusak Ringan (LCD/Tombol/Card Reader)</option>
                    <option value="rusak_total">Rusak Total / Mati Total</option>
                    <option value="butuh_inisiasi">Butuh Inisiasi Master Key</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Mutasi
                  </label>
                  <input
                    type="date"
                    value={mutasiDate}
                    onChange={(e) => setMutasiDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Petugas PIC IT
                  </label>
                  <input
                    type="text"
                    value={mutasiPic}
                    onChange={(e) => setMutasiPic(e.target.value)}
                    placeholder="Nama staf IT penyerah/penerima"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Kelengkapan Aksesoris */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kelengkapan Aksesoris Disertakan:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Adaptor/Charger',
                    'Kabel Power',
                    'Thermal Paper',
                    'Dus Box',
                    'SIM Card',
                    'Buku Panduan',
                    'Spanduk Agen',
                  ].map((acc) => {
                    const isChecked = mutasiAccessories.includes(acc);
                    return (
                      <button
                        type="button"
                        key={acc}
                        onClick={() => toggleAccessory(acc)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                          isChecked
                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/40 font-bold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                            isChecked ? 'bg-sky-600 text-white' : 'border border-slate-400'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span>{acc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alasan & Catatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alasan / Kategori Mutasi
                  </label>
                  <input
                    type="text"
                    value={mutasiReason}
                    onChange={(e) => setMutasiReason(e.target.value)}
                    placeholder="Contoh: Pemasangan Baru / Ganti Mesin Rusak / Tarik Agen Pasif"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={mutasiNotes}
                    onChange={(e) => setMutasiNotes(e.target.value)}
                    placeholder="Keterangan tambahan transaksi uji coba / kondisi"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMutasiOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-600/30"
                >
                  Simpan Mutasi EDC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: TAMBAH PENGAJUAN BARU EDC BRILINK */}
      {/* ======================================================== */}
      {isAddPengajuanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Pendaftaran Pengajuan Baru EDC BRILink
                  </h3>
                  <p className="text-xs text-slate-400">
                    Input data pemohon agen baru untuk pendataan dan pemantauan tindak lanjut
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPengajuanOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePengajuan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Calon Agen *
                  </label>
                  <input
                    type="text"
                    value={subApplicantName}
                    onChange={(e) => setSubApplicantName(e.target.value)}
                    placeholder="Contoh: Hj. Maryati"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Usaha / Toko *
                  </label>
                  <input
                    type="text"
                    value={subBusinessName}
                    onChange={(e) => setSubBusinessName(e.target.value)}
                    placeholder="Toko Kelontong Berkah Ibu"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NIK KTP
                  </label>
                  <input
                    type="text"
                    value={subNik}
                    onChange={(e) => setSubNik(e.target.value)}
                    placeholder="360112xxxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No. Handphone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    value={subPhone}
                    onChange={(e) => setSubPhone(e.target.value)}
                    placeholder="0813-xxxx-xxxx"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Usaha / Lokasi Agen
                </label>
                <input
                  type="text"
                  value={subAddress}
                  onChange={(e) => setSubAddress(e.target.value)}
                  placeholder="Kp. Karanganyar RT 02/03, Labuan"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    BRI Unit Supervisi
                  </label>
                  <select
                    value={subBriUnit}
                    onChange={(e) => setSubBriUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="BRI Unit Labuan Kota">BRI Unit Labuan Kota</option>
                    <option value="BRI Unit Panimbang">BRI Unit Panimbang</option>
                    <option value="BRI Unit Carita">BRI Unit Carita</option>
                    <option value="BRI Unit Menes">BRI Unit Menes</option>
                    <option value="BRI Unit Saketi">BRI Unit Saketi</option>
                    <option value="KC BRI Labuan">Kantor Cabang BRI Labuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Pengajuan
                  </label>
                  <input
                    type="date"
                    value={subDate}
                    onChange={(e) => setSubDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Awal Pengajuan
                </label>
                <textarea
                  rows={2}
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  placeholder="Kelengkapan berkas KTP, tabungan, estimasi omzet, dll."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddPengajuanOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30"
                >
                  Daftarkan Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: UPDATE TINDAK LANJUT TAHAPAN PENGAJUAN */}
      {/* ======================================================== */}
      {selectedSubmissionForFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-500 tracking-wider">
                  Update Progres Tindak Lanjut
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedSubmissionForFollowUp.applicant_name} - {selectedSubmissionForFollowUp.business_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubmissionForFollowUp(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFollowUp} className="space-y-4">
              {/* Select Stage */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ubah Tahapan Proses *
                </label>
                <select
                  value={followUpStage}
                  onChange={(e) => setFollowUpStage(e.target.value as EDCSubmissionStatus)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="pengajuan_masuk">1. Berkas Masuk (Verifikasi Dokumen)</option>
                  <option value="survei_kelayakan">2. Survei Kelayakan Usaha & Sinyal</option>
                  <option value="approval_kanca">3. Approval Persetujuan Pemimpin Cabang</option>
                  <option value="order_mesin">4. Alokasi / Pengambilan Unit EDC</option>
                  <option value="inisiasi_tid">5. Inisiasi TID & Injeksi Parameter</option>
                  <option value="siap_distribusi">6. Siap Diantar / Dipasang ke Lokasi</option>
                  <option value="terpasang_aktif">7. Selesai Terpasang & Aktif Transaksi</option>
                  <option value="ditolak">Ditolak / Dibatalkan</option>
                </select>
              </div>

              {/* Alokasi SN & TID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alokasi Terminal ID (TID)
                  </label>
                  <input
                    type="text"
                    value={followUpAllocatedTid}
                    onChange={(e) => setFollowUpAllocatedTid(e.target.value)}
                    placeholder="Contoh: 68291130"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alokasi Serial Number (SN)
                  </label>
                  <input
                    type="text"
                    value={followUpAllocatedSn}
                    onChange={(e) => setFollowUpAllocatedSn(e.target.value)}
                    placeholder="Contoh: PAX-8829115"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Follow Up Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Perkembangan Tindak Lanjut *
                </label>
                <textarea
                  rows={3}
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  placeholder="Tuliskan progres: hasil survei, kendala sinyal, nomor surat persetujuan, dll..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* History Timeline */}
              {selectedSubmissionForFollowUp.follow_up_history &&
                selectedSubmissionForFollowUp.follow_up_history.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Riwayat Tindak Lanjut Sebelumnya:
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {selectedSubmissionForFollowUp.follow_up_history.map((log) => (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px]"
                        >
                          <div className="flex items-center justify-between text-slate-400 mb-0.5">
                            <span className="font-semibold text-indigo-500">
                              {stageMeta[log.stage]?.label || log.stage}
                            </span>
                            <span>{log.date}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{log.notes}</p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Oleh: {log.updated_by}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedSubmissionForFollowUp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30"
                >
                  Simpan Tindak Lanjut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DETAIL TANDA TERIMA MUTASI EDC */}
      {/* ======================================================== */}
      {selectedMutasiForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tanda Terima Mutasi EDC BRILink
                </h3>
              </div>
              <button
                onClick={() => setSelectedMutasiForDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Jenis Mutasi
                  </span>
                  <span
                    className={`font-black text-sm uppercase ${
                      selectedMutasiForDetail.type === 'keluar' ? 'text-sky-600' : 'text-emerald-600'
                    }`}
                  >
                    EDC {selectedMutasiForDetail.type}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Tanggal
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedMutasiForDetail.date.slice(0, 10)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Serial Number:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedMutasiForDetail.serial_number}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Terminal ID (TID):</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                    {selectedMutasiForDetail.tid}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Model Mesin:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedMutasiForDetail.model}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Kondisi Unit:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                    {selectedMutasiForDetail.condition}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div>
                  <span className="text-[10px] text-slate-400 block">Nama Agen / Toko:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedMutasiForDetail.agent_name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Alamat:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedMutasiForDetail.agent_address}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Telepon / HP:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedMutasiForDetail.agent_phone || '-'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Aksesoris Disertakan:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedMutasiForDetail.accessories.join(', ') || '-'}
                </span>
              </div>

              {selectedMutasiForDetail.notes && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-700 dark:text-slate-300">
                  <span className="text-[10px] font-bold text-amber-600 uppercase block mb-0.5">
                    Catatan Mutasi
                  </span>
                  <p>{selectedMutasiForDetail.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
                <div>
                  <p className="text-[10px] text-slate-400 mb-8">Pihak Agen / Penerima</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    ( {selectedMutasiForDetail.agent_name.split(' ')[0]} )
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-8">Petugas IT / Pengelola</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    ( {selectedMutasiForDetail.pic_officer} )
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Tanda Terima</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: KONFIRMASI HAPUS */}
      {/* ======================================================== */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hapus Data {itemToDelete.type === 'mutasi' ? 'Mutasi EDC' : 'Pengajuan Agen'}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Apakah Anda yakin ingin menghapus data <b>{itemToDelete.name}</b>? Tindakan ini akan menghapus data dari sistem secara permanen.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
