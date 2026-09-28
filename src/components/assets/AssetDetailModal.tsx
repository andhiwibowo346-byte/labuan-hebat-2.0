import React, { useState } from 'react';
import {
  X,
  QrCode,
  Edit,
  Wrench,
  FileText,
  Clock,
  Camera,
  Download,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Tag,
  Shield,
  Upload,
  Trash2,
  Maximize2,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  History,
  Layers,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import { Asset, AssetPhoto } from '../../types';
import {
  formatCurrencyIDR,
  formatDateIndonesian,
  formatDateTimeIndonesian,
  getStatusColorClass,
  getStatusLabel,
} from '../../utils';

interface AssetDetailModalProps {
  assetId: string;
  onClose: () => void;
  onEdit: (asset: Asset) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ assetId, onClose, onEdit }) => {
  const {
    assets,
    assetTypes,
    locations,
    employees,
    maintenanceRecords,
    assetHistory,
    addAssetPhoto,
    deleteAssetPhoto,
    addAssetDocument,
    deleteAssetDocument,
    openPrintLabels,
    hasPermission,
    setActiveTab,
  } = useApp();

  const asset = assets.find((a) => a.id === assetId);

  // Active Tab: 'overview' | 'photos' | 'documents' | 'maintenance' | 'history' | 'qr'
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'photos' | 'documents' | 'maintenance' | 'history' | 'qr'>('overview');

  // Lightbox state
  const [lightboxPhoto, setLightboxPhoto] = useState<AssetPhoto | null>(null);

  // Upload Photo Modal state
  const [isUploadPhotoOpen, setIsUploadPhotoOpen] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('Foto Depan');
  const [photoUrl, setPhotoUrl] = useState('');

  // Upload Document Modal state
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<'pdf' | 'excel' | 'word' | 'txt' | 'other'>('pdf');
  const [docFileName, setDocFileName] = useState('');

  if (!asset) return null;

  const type = assetTypes.find((t) => t.id === asset.asset_type_id);
  const loc = locations.find((l) => l.id === asset.location_id);
  const emp = employees.find((e) => e.id === asset.employee_id);
  const statusStyle = getStatusColorClass(asset.status);

  // Maintenance records for this asset
  const assetMaintenance = maintenanceRecords.filter((m) => m.asset_id === asset.id);

  // Audit trail history for this asset
  const historyEntries = assetHistory.filter((h) => h.asset_id === asset.id);

  // Handle Photo Upload
  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;
    addAssetPhoto(asset.id, {
      url: photoUrl.trim(),
      caption: photoCaption,
    });
    setPhotoUrl('');
    setIsUploadPhotoOpen(false);
  };

  // Handle Document Upload
  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docFileName.trim()) return;
    addAssetDocument(asset.id, {
      title: docTitle.trim(),
      file_name: docFileName.trim(),
      file_type: docType,
      url: '#',
      file_size: '1.2 MB',
    });
    setDocTitle('');
    setDocFileName('');
    setIsUploadDocOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-mono font-black text-xs sm:text-sm border border-brand-500/20 shrink-0">
              {asset.asset_tag.slice(0, 3)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                  {asset.asset_tag}
                </span>
                <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-none">
                  {asset.name}
                </h2>
                <span
                  className={`text-[10px] sm:text-xs font-semibold px-2 py-0.2 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                >
                  {getStatusLabel(asset.status)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Jenis: <b className="text-slate-700 dark:text-slate-300">{type?.name || 'Aset'}</b> | Terdaftar:{' '}
                {formatDateIndonesian(asset.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openPrintLabels([asset])}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
              title="Cetak Label QR Code"
            >
              <Printer className="w-3.5 h-3.5 text-brand-500" />
              <span>Cetak QR</span>
            </button>

            {hasPermission('manage_assets') && (
              <button
                onClick={() => onEdit(asset)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-3 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Ringkasan & Custom Fields', icon: Layers },
            { id: 'photos', label: `Galeri Foto (${asset.photos?.length || 0})`, icon: Camera },
            { id: 'documents', label: `Dokumen (${asset.documents?.length || 0})`, icon: FileText },
            { id: 'maintenance', label: `Maintenance (${assetMaintenance.length})`, icon: Wrench },
            { id: 'history', label: `Audit Trail (${historyEntries.length})`, icon: History },
            { id: 'qr', label: 'QR Code Tag', icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs md:text-sm font-semibold whitespace-nowrap border-b-2 transition-all shrink-0 ${
                  isActive
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          {/* TAB 1: OVERVIEW & DYNAMIC CUSTOM FIELDS */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Photo & Fast Summary Card */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row gap-5 items-center">
                <div className="w-full md:w-48 h-36 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-300 dark:border-slate-700 relative group">
                  {asset.primary_photo ? (
                    <img
                      src={asset.primary_photo}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <Camera className="w-8 h-8 mb-1 opacity-50" />
                      <span className="text-[11px]">Belum ada foto</span>
                    </div>
                  )}
                  {asset.primary_photo && (
                    <button
                      onClick={() =>
                        setLightboxPhoto({
                          id: 'primary',
                          asset_id: asset.id,
                          url: asset.primary_photo!,
                          caption: asset.name,
                          uploaded_at: '',
                        })
                      }
                      className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Serial Number
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5 block truncate">
                      {asset.serial_number || '-'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Lokasi Terpasang
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5 block truncate">
                      {loc ? loc.name : '-'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Penanggung Jawab / User
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5 block truncate">
                      {emp ? emp.full_name : 'Belum Ditugaskan'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Biaya Pengadaan
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate">
                      {formatCurrencyIDR(asset.purchase_cost)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tanggal Pembelian
                    </span>
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                      {formatDateIndonesian(asset.purchase_date)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Batas Garansi (Warranty)
                    </span>
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                      {formatDateIndonesian(asset.warranty_expiry)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Custom Fields Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Spesifikasi & Dynamic Custom Fields ({type?.name})
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {type?.fields.length || 0} Kolom Kustom
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {type?.fields.map((field) => {
                    const value = asset.custom_values?.[field.field_code];
                    const isFilled = value !== undefined && value !== null && value !== '';

                    return (
                      <div
                        key={field.id}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {field.field_name}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                            {field.field_type}
                          </span>
                        </div>

                        <div className="mt-1">
                          {isFilled ? (
                            field.field_type === 'ip_address' ? (
                              <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-lg border border-brand-200/50">
                                {value}
                              </span>
                            ) : field.field_type === 'textarea' ? (
                              <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                                {value}
                              </p>
                            ) : (
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 break-words">
                                {String(value)}
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-slate-400 italic">- Belum diisi -</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes / Keterangan */}
              {asset.notes && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs">
                  <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
                    Catatan Internal
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{asset.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FOTO GALLERY & LIGHTBOX (Requirement 5) */}
          {activeSubTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Galeri Dokumentasi Foto Aset
                  </h3>
                  <p className="text-xs text-slate-400">
                    Foto fisik: depan, belakang, nomor seri, kondisi instalasi
                  </p>
                </div>

                <button
                  onClick={() => setIsUploadPhotoOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Foto</span>
                </button>
              </div>

              {(!asset.photos || asset.photos.length === 0) ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <Camera className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Belum ada foto yang diupload
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload foto kondisi aset untuk melengkapi dokumentasi inventaris
                  </p>
                  <button
                    onClick={() => setIsUploadPhotoOpen(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-semibold text-xs border border-brand-200"
                  >
                    Upload Foto Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {asset.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-video shadow-sm"
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => deleteAssetPhoto(asset.id, photo.id)}
                            className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 shadow"
                            title="Hapus Foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-white leading-tight">
                            {photo.caption}
                          </p>
                          <button
                            onClick={() => setLightboxPhoto(photo)}
                            className="text-[10px] text-brand-300 hover:underline flex items-center gap-1 mt-1 font-semibold"
                          >
                            <Maximize2 className="w-3 h-3" /> Perbesar Foto
                          </button>
                        </div>
                      </div>

                      <div className="absolute bottom-2 left-2 right-2 group-hover:hidden">
                        <span className="text-[10px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md truncate block">
                          {photo.caption}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOKUMEN & LAMPIRAN (Requirement 5) */}
          {activeSubTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Dokumen & Berkas Pendukung Aset
                  </h3>
                  <p className="text-xs text-slate-400">
                    BAST, invoice, garansi, surat pemeliharaan, dan spesifikasi teknis
                  </p>
                </div>

                <button
                  onClick={() => setIsUploadDocOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Dokumen</span>
                </button>
              </div>

              {(!asset.documents || asset.documents.length === 0) ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Belum ada dokumen yang dilampirkan
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload file PDF, Excel, Word, atau Berita Acara Serah Terima (BAST)
                  </p>
                  <button
                    onClick={() => setIsUploadDocOpen(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-semibold text-xs border border-brand-200"
                  >
                    Upload Dokumen Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {asset.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-sm hover:border-brand-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          {doc.file_type === 'excel' ? (
                            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {doc.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {doc.file_name} • {doc.file_size || '1.2 MB'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => alert(`Mengunduh berkas: ${doc.file_name}`)}
                          className="p-2 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                          title="Download Dokumen"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAssetDocument(asset.id, doc.id)}
                          className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                          title="Hapus Dokumen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HISTORI MAINTENANCE (Requirement 7) */}
          {activeSubTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Histori Perbaikan & Maintenance
                  </h3>
                  <p className="text-xs text-slate-400">
                    Catatan pemeliharaan berkala, troubleshooting, dan penggantian sparepart
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    setActiveTab('maintenance');
                  }}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  Kelola Modul Maintenance <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {assetMaintenance.length === 0 ? (
                <div className="py-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Tidak ada riwayat perbaikan tercatat
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Aset dalam kondisi prima</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assetMaintenance.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                            {rec.maintenance_number}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {rec.title}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {rec.status === 'completed' ? 'Selesai' : 'Dalam Proses'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl">
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                            Keluhan / Masalah:
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                            {rec.issue_description}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                            Tindakan Teknisi:
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                            {rec.action_taken || '-'}
                          </p>
                        </div>
                        {rec.spareparts_used && (
                          <div>
                            <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                              Sparepart Terpakai:
                            </span>
                            <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                              {rec.spareparts_used}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                            Biaya Perbaikan:
                          </span>
                          <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {formatCurrencyIDR(rec.cost)}
                          </p>
                        </div>
                      </div>

                      {/* Before / After Photos */}
                      {rec.photos && rec.photos.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Dokumentasi Foto Maintenance (Sebelum / Sesudah):
                          </span>
                          <div className="flex items-center gap-3">
                            {rec.photos.map((p) => (
                              <div
                                key={p.id}
                                className="w-24 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group cursor-pointer"
                                onClick={() =>
                                  setLightboxPhoto({
                                    id: p.id,
                                    asset_id: asset.id,
                                    url: p.url,
                                    caption: `${p.stage === 'before' ? 'Foto Sebelum' : 'Foto Sesudah'}: ${p.caption || ''}`,
                                    uploaded_at: p.uploaded_at,
                                  })
                                }
                              >
                                <img src={p.url} alt="" className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/70 px-1 py-0.5 rounded capitalize">
                                  {p.stage}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>Teknisi: <b>{rec.technician_name}</b></span>
                        <span>Tanggal: {formatDateIndonesian(rec.scheduled_date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUDIT TRAIL / CHANGE HISTORY (Requirement 8) */}
          {activeSubTab === 'history' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Riwayat Perubahan & Audit Trail
                </h3>
                <p className="text-xs text-slate-400">
                  Semua aktivitas perubahan status, alamat IP, penugasan, dan upload file tercatat secara otomatis
                </p>
              </div>

              {historyEntries.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs">Belum ada riwayat aktivitas tercatat.</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {historyEntries.map((h) => (
                    <div key={h.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-white dark:ring-slate-900"></span>

                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            {h.user_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDateTimeIndonesian(h.created_at)}
                          </span>
                        </div>

                        {h.field_changed ? (
                          <div className="text-xs mt-1 text-slate-600 dark:text-slate-300">
                            Mengubah <b className="text-slate-900 dark:text-white">{h.field_changed}</b>:
                            {h.old_value && (
                              <span className="line-through text-rose-500 mx-1.5 font-mono">
                                {h.old_value}
                              </span>
                            )}
                            <span className="text-slate-400">→</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold mx-1.5 font-mono">
                              {h.new_value}
                            </span>
                          </div>
                        ) : null}

                        {h.remarks && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                            "{h.remarks}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: QR CODE TAG (Requirement 6) */}
          {activeSubTab === 'qr' && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="p-6 bg-white rounded-3xl border-2 border-slate-200 shadow-xl inline-block text-center max-w-sm">
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100 mb-3">
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 tracking-wider">IT ASSET TAG</p>
                    <p className="text-sm font-extrabold text-slate-900">{asset.asset_tag}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-50 text-brand-600 font-bold">
                    {type?.code || 'ITAM'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl flex justify-center">
                  <QRCodeSVG
                    value={JSON.stringify({
                      tag: asset.asset_tag,
                      name: asset.name,
                      sn: asset.serial_number,
                      type: type?.name,
                    })}
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div className="mt-3 text-left">
                  <p className="text-xs font-bold text-slate-900 truncate">{asset.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                    SN: {asset.serial_number || 'N/A'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Milik PT Perusahaan TBK • Scan untuk verifikasi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => openPrintLabels([asset])}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs md:text-sm font-semibold shadow-md shadow-brand-600/30"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Label Stiker QR</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute -top-10 right-0 text-white p-2 hover:opacity-80"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.caption}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <p className="text-white text-sm font-semibold mt-3 text-center">
              {lightboxPhoto.caption}
            </p>
          </div>
        </div>
      )}

      {/* UPLOAD PHOTO MODAL */}
      {isUploadPhotoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Upload Foto Dokumentasi Aset
            </h3>
            <form onSubmit={handlePhotoSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Kategori Foto
                </label>
                <select
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Foto Depan">Foto Depan</option>
                  <option value="Foto Belakang">Foto Belakang</option>
                  <option value="Foto Serial Number">Foto Serial Number</option>
                  <option value="Foto Kondisi Fisik">Foto Kondisi Fisik</option>
                  <option value="Foto Instalasi Kabel">Foto Instalasi Kabel</option>
                  <option value="Foto Kelengkapan Aksesoris">Foto Kelengkapan Aksesoris</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  URL Gambar (atau Unsplash Demo)
                </label>
                <input
                  type="url"
                  required
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80')}
                    className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    + Sample ATM
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80')}
                    className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    + Sample Laptop
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadPhotoOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30"
                >
                  Simpan Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {isUploadDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Upload Dokumen Aset
            </h3>
            <form onSubmit={handleDocSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Judul Dokumen
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Contoh: Berita Acara Serah Terima (BAST)"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama File
                </label>
                <input
                  type="text"
                  required
                  value={docFileName}
                  onChange={(e) => setDocFileName(e.target.value)}
                  placeholder="BAST_ATM_001.pdf"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tipe File
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="word">Word Document</option>
                  <option value="txt">Text File</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadDocOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30"
                >
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
