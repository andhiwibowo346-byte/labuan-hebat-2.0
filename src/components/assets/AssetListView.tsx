import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  Printer,
  QrCode,
  Eye,
  Edit,
  Trash2,
  Box,
  CheckSquare,
  Square,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  AlertCircle,
  ExternalLink,
  LayoutGrid,
  List,
  MapPin,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Asset, AssetStatus } from '../../types';
import {
  getStatusColorClass,
  getStatusLabel,
  exportToExcel,
  exportToCSV,
} from '../../utils';

interface AssetListViewProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (asset: Asset) => void;
  onOpenQuickExcel?: () => void;
}

export const AssetListView: React.FC<AssetListViewProps> = ({
  onOpenAddModal,
  onOpenEditModal,
  onOpenQuickExcel,
}) => {
  const {
    assets,
    assetTypes,
    locations,
    employees,
    deleteAsset,
    deleteAssets,
    setSelectedAssetId,
    openPrintLabels,
    hasPermission,
    filterAssetTypeId,
    setFilterAssetTypeId,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>(filterAssetTypeId || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sorting state
  const [sortField, setSortField] = useState<'asset_tag' | 'name' | 'created_at' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete Confirmation Modal state
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);

  // View Mode: auto (cards on mobile, table on desktop), table, cards
  const [viewMode, setViewMode] = useState<'auto' | 'table' | 'cards'>('auto');

  // Sync external filter type if set from dashboard
  React.useEffect(() => {
    if (filterAssetTypeId) {
      setSelectedType(filterAssetTypeId);
      setFilterAssetTypeId(null);
    }
  }, [filterAssetTypeId, setFilterAssetTypeId]);

  // Filtering
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Type
      if (selectedType !== 'all' && asset.asset_type_id !== selectedType) return false;
      // Status
      if (selectedStatus !== 'all' && asset.status !== selectedStatus) return false;
      // Location
      if (selectedLocation !== 'all' && asset.location_id !== selectedLocation) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const tag = asset.asset_tag.toLowerCase();
        const name = asset.name.toLowerCase();
        const sn = (asset.serial_number || '').toLowerCase();
        const emp = employees.find((e) => e.id === asset.employee_id);
        const empName = (emp?.full_name || '').toLowerCase();
        const loc = locations.find((l) => l.id === asset.location_id);
        const locName = (loc?.name || '').toLowerCase();

        // Custom field search (e.g. TID, IP, Hostname)
        const customMatch = asset.custom_values
          ? Object.values(asset.custom_values).some((v) => String(v || '').toLowerCase().includes(q))
          : false;

        return (
          tag.includes(q) ||
          name.includes(q) ||
          sn.includes(q) ||
          empName.includes(q) ||
          locName.includes(q) ||
          customMatch
        );
      }
      return true;
    });
  }, [assets, selectedType, selectedStatus, selectedLocation, searchQuery, employees, locations]);

  // Sorting
  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sortField === 'asset_tag') {
        valA = a.asset_tag;
        valB = b.asset_tag;
      } else if (sortField === 'name') {
        valA = a.name;
        valB = b.name;
      } else if (sortField === 'status') {
        valA = a.status;
        valB = b.status;
      } else {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredAssets, sortField, sortOrder]);

  // Pagination slice
  const totalPages = Math.ceil(sortedAssets.length / pageSize) || 1;
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAssets.slice(start, start + pageSize);
  }, [sortedAssets, currentPage, pageSize]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedAssets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedAssets.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSort = (field: 'asset_tag' | 'name' | 'created_at' | 'status') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Bulk actions
  const handleBatchPrintQR = () => {
    const targets = assets.filter((a) => selectedIds.includes(a.id));
    if (targets.length > 0) {
      openPrintLabels(targets);
    }
  };

  const handleExportSelectedExcel = () => {
    const targets = assets.filter((a) => (selectedIds.length > 0 ? selectedIds.includes(a.id) : true));
    const exportData = targets.map((a) => {
      const type = assetTypes.find((t) => t.id === a.asset_type_id);
      const loc = locations.find((l) => l.id === a.location_id);
      const emp = employees.find((e) => e.id === a.employee_id);
      return {
        'Asset ID': a.asset_tag,
        Jenis: type?.name || '',
        'Nama Aset': a.name,
        'Serial Number': a.serial_number || '',
        Status: getStatusLabel(a.status),
        Lokasi: loc?.name || '',
        'Nama Pengguna': emp?.full_name || '',
        'PN Pengguna': emp?.nip || '',
        'Biaya Pengadaan': a.purchase_cost || 0,
        'Tanggal Pengadaan': a.purchase_date || '',
        ...(a.custom_values || {}),
      };
    });
    exportToExcel(exportData, `ITAM_Aset_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportSelectedCSV = () => {
    const targets = assets.filter((a) => (selectedIds.length > 0 ? selectedIds.includes(a.id) : true));
    const exportData = targets.map((a) => {
      const type = assetTypes.find((t) => t.id === a.asset_type_id);
      const loc = locations.find((l) => l.id === a.location_id);
      const emp = employees.find((e) => e.id === a.employee_id);
      return {
        'Asset ID': a.asset_tag,
        Jenis: type?.name || '',
        'Nama Aset': a.name,
        'Serial Number': a.serial_number || '',
        Status: getStatusLabel(a.status),
        Lokasi: loc?.name || '',
        'Nama Pengguna': emp?.full_name || '',
        'PN Pengguna': emp?.nip || '',
      };
    });
    exportToCSV(exportData, `ITAM_Aset_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Asset Management
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Daftar lengkap seluruh aset IT ({filteredAssets.length} aset terdata)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Tampilan Tabel Lengkap"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Tampilan Kartu HP"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {hasPermission('export_data') && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportSelectedExcel}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
                title="Export ke Excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Excel</span>
              </button>
              <button
                onClick={handleExportSelectedCSV}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
                title="Export ke CSV"
              >
                <FileText className="w-4 h-4 text-sky-600" />
                <span className="hidden sm:inline">CSV</span>
              </button>
            </div>
          )}

          {hasPermission('manage_assets') && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {onOpenQuickExcel && (
                <button
                  onClick={onOpenQuickExcel}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-semibold shadow-md shadow-emerald-600/25 transition-all active:scale-95"
                  title="Tambah Banyak Aset Langsung via File Excel atau Copy-Paste Spreadsheet"
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0" />
                  <span><span className="hidden sm:inline">Import </span>Excel</span>
                </button>
              )}

              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs md:text-sm font-semibold shadow-md shadow-brand-600/30 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span><span className="hidden sm:inline">Tambah </span>Aset</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari Asset ID, SN, Nama, IP, TID, User..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Type */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs md:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="all">Semua Jenis Aset ({assets.length})</option>
            {assetTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({assets.filter((a) => a.asset_type_id === t.id).length})
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs md:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="maintenance">Maintenance</option>
            <option value="damaged">Rusak</option>
            <option value="inactive">Tidak Aktif</option>
            <option value="lost">Hilang</option>
          </select>

          {/* Filter Location */}
          <select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs md:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="all">Semua Lokasi</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Action Toolbar if items selected */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/50 animate-slide-up">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-brand-700 dark:text-brand-300">
                {selectedIds.length} aset dipilih
              </span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 underline ml-2"
              >
                Batalkan
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchPrintQR}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5 text-brand-500" />
                <span>Cetak Label QR ({selectedIds.length})</span>
              </button>

              {hasPermission('export_data') && (
                <button
                  onClick={handleExportSelectedExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-50"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Export Terpilih</span>
                </button>
              )}

              {hasPermission('delete_data') && (
                <button
                  onClick={() => setIsBatchDeleteModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all"
                  title="Hapus aset yang dipilih"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Terpilih ({selectedIds.length})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Table & Cards Container (Responsive as per Requirement 4) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Mobile Card Grid View */}
        <div
          className={`p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 ${
            viewMode === 'table' ? 'hidden' : viewMode === 'cards' ? 'grid' : 'grid md:hidden'
          }`}
        >
          {paginatedAssets.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              <Box className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">Tidak ada aset ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian atau filter Anda</p>
            </div>
          ) : (
            paginatedAssets.map((asset) => {
              const type = assetTypes.find((t) => t.id === asset.asset_type_id);
              const loc = locations.find((l) => l.id === asset.location_id);
              const emp = employees.find((e) => e.id === asset.employee_id);
              const statusStyle = getStatusColorClass(asset.status);
              const isSelected = selectedIds.includes(asset.id);

              return (
                <div
                  key={asset.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Card Top: Checkbox, Tag, Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <button
                        onClick={() => toggleSelectOne(asset.id)}
                        className="p-1 -ml-1 text-slate-400 hover:text-brand-600 shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-brand-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedAssetId(asset.id)}
                        className="font-mono font-bold text-xs text-brand-600 dark:text-brand-400 hover:underline truncate"
                      >
                        {asset.asset_tag}
                      </button>
                      {type && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                          {type.name}
                        </span>
                      )}
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${statusStyle}`}>
                      {getStatusLabel(asset.status)}
                    </span>
                  </div>

                  {/* Card Body: Thumbnail & Details */}
                  <div className="flex gap-3 items-start">
                    {asset.primary_photo ? (
                      <img
                        src={asset.primary_photo}
                        alt={asset.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0 cursor-pointer shadow-sm"
                        onClick={() => setSelectedAssetId(asset.id)}
                      />
                    ) : (
                      <div
                        onClick={() => setSelectedAssetId(asset.id)}
                        className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 cursor-pointer"
                      >
                        <Box className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4
                        onClick={() => setSelectedAssetId(asset.id)}
                        className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-brand-600"
                      >
                        {asset.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        SN: <span className="font-mono text-slate-600 dark:text-slate-300">{asset.serial_number || '-'}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {loc && (
                          <span className="flex items-center gap-1 truncate max-w-[130px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{loc.name}</span>
                          </span>
                        )}
                        {emp && (
                          <span className="flex items-center gap-1 truncate max-w-[130px]">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{emp.full_name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Quick Actions */}
                  <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-200/60 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(asset.created_at).toLocaleDateString('id-ID')}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedAssetId(asset.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openPrintLabels([asset])}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                        title="Cetak Label QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      {hasPermission('manage_assets') && (
                        <button
                          onClick={() => onOpenEditModal(asset)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Asset"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {hasPermission('delete_data') && (
                        <button
                          onClick={() => setAssetToDelete(asset)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                          title="Hapus Asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div
          className={`overflow-x-auto ${
            viewMode === 'cards' ? 'hidden' : viewMode === 'table' ? 'block' : 'hidden md:block'
          }`}
        >
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            {/* Table Header: Asset ID | Jenis | Nama | Serial Number | Lokasi | Pengguna | Status | Foto | Aksi */}
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-10 text-center">
                  <button onClick={handleSelectAll} className="p-0.5">
                    {selectedIds.length > 0 && selectedIds.length === paginatedAssets.length ? (
                      <CheckSquare className="w-4 h-4 text-brand-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th
                  onClick={() => handleSort('asset_tag')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Asset ID</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3 px-4">Jenis</th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nama Aset</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Lokasi</th>
                <th className="py-3 px-4">Pengguna</th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Foto</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Box className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-sm">Tidak ada aset ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian atau filter Anda</p>
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((asset) => {
                  const type = assetTypes.find((t) => t.id === asset.asset_type_id);
                  const loc = locations.find((l) => l.id === asset.location_id);
                  const emp = employees.find((e) => e.id === asset.employee_id);
                  const statusStyle = getStatusColorClass(asset.status);
                  const isSelected = selectedIds.includes(asset.id);

                  return (
                    <tr
                      key={asset.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => toggleSelectOne(asset.id)} className="p-0.5">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* Asset ID */}
                      <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedAssetId(asset.id)}
                          className="hover:underline flex items-center gap-1.5"
                        >
                          <span>{asset.asset_tag}</span>
                        </button>
                      </td>

                      {/* Jenis */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: `${type?.color || '#4f46e5'}15`,
                            color: type?.color || '#4f46e5',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: type?.color || '#4f46e5' }}
                          />
                          {type?.name || 'Aset'}
                        </span>
                      </td>

                      {/* Nama Aset */}
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                        <div
                          onClick={() => setSelectedAssetId(asset.id)}
                          className="cursor-pointer hover:text-brand-500 truncate"
                          title={asset.name}
                        >
                          {asset.name}
                        </div>
                        {asset.custom_values?.ip_address && (
                          <span className="text-[10px] font-mono text-slate-400 block truncate">
                            IP: {asset.custom_values.ip_address}
                          </span>
                        )}
                        {asset.custom_values?.tid && (
                          <span className="text-[10px] font-mono text-slate-400 block truncate">
                            TID: {asset.custom_values.tid}
                          </span>
                        )}
                      </td>

                      {/* Serial Number */}
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {asset.serial_number || '-'}
                      </td>

                      {/* Lokasi */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {loc ? loc.name : '-'}
                      </td>

                      {/* Pengguna */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {emp ? (
                          <div>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {emp.full_name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">PN: {emp.nip}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum ditugaskan</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                          {getStatusLabel(asset.status)}
                        </span>
                      </td>

                      {/* Foto */}
                      <td className="py-3 px-4 text-center">
                        {asset.primary_photo ? (
                          <div
                            onClick={() => setSelectedAssetId(asset.id)}
                            className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 mx-auto cursor-pointer hover:scale-110 transition-transform shadow-sm"
                          >
                            <img
                              src={asset.primary_photo}
                              alt={asset.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">-</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Detail */}
                          <button
                            onClick={() => setSelectedAssetId(asset.id)}
                            className="p-1.5 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Lihat Detail Asset"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print QR Label */}
                          <button
                            onClick={() => openPrintLabels([asset])}
                            className="p-1.5 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Cetak QR Code Label"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          {hasPermission('manage_assets') && (
                            <button
                              onClick={() => onOpenEditModal(asset)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Asset"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          {hasPermission('delete_data') && (
                            <button
                              onClick={() => setAssetToDelete(asset)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Hapus Asset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Tampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>dari {sortedAssets.length} aset</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-800 dark:text-slate-200">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog Modal */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Hapus Aset {assetToDelete.asset_tag}?
            </h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Apakah Anda yakin ingin menghapus aset <b>{assetToDelete.name}</b>? Tindakan ini akan menghapus riwayat audit dan data terkait lainnya secara permanen.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setAssetToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteAsset(assetToDelete.id);
                  setAssetToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Delete Confirmation Modal */}
      {isBatchDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Hapus {selectedIds.length} Aset Terpilih?
            </h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Apakah Anda yakin ingin menghapus <b>{selectedIds.length} aset</b> yang dipilih? Semua riwayat perbaikan, foto, dan dokumen aset ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteAssets(selectedIds);
                  setSelectedIds([]);
                  setIsBatchDeleteModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30"
              >
                Hapus {selectedIds.length} Aset Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
