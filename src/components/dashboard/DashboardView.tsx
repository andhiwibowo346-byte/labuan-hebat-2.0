import React, { useState, useMemo } from 'react';
import {
  Box,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  HelpCircle,
  Layers,
  MapPin,
  Users,
  Calendar,
  Filter,
  RefreshCw,
  Plus,
  QrCode,
  FileSpreadsheet,
  ArrowUpRight,
  Clock,
  XCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AssetStatus } from '../../types';
import { formatCurrencyIDR } from '../../utils';

export const DashboardView: React.FC<{
  onOpenAddModal: () => void;
  onOpenQuickExcel?: () => void;
}> = ({ onOpenAddModal, onOpenQuickExcel }) => {
  const {
    assets,
    assetTypes,
    locations,
    employees,
    maintenanceRecords,
    setActiveTab,
    setSelectedAssetId,
    setFilterAssetTypeId,
    openScanner,
  } = useApp();

  // Filters state
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'month' | 'year'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filtered Assets based on Dashboard Filter Bar
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Type filter
      if (filterType !== 'all' && asset.asset_type_id !== filterType) return false;
      // Location filter
      if (filterLocation !== 'all' && asset.location_id !== filterLocation) return false;
      // Status filter
      if (filterStatus !== 'all' && asset.status !== filterStatus) return false;
      // Period filter (based on created_at or purchase_date)
      if (filterPeriod !== 'all') {
        const date = new Date(asset.created_at);
        const now = new Date();
        if (filterPeriod === 'today') {
          if (date.toDateString() !== now.toDateString()) return false;
        } else if (filterPeriod === 'month') {
          if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return false;
        } else if (filterPeriod === 'year') {
          if (date.getFullYear() !== now.getFullYear()) return false;
        }
      }
      return true;
    });
  }, [assets, filterType, filterLocation, filterStatus, filterPeriod]);

  // KPIs
  const totalAssets = filteredAssets.length;
  const activeAssets = filteredAssets.filter((a) => a.status === 'active').length;
  const inactiveAssets = filteredAssets.filter((a) => a.status === 'inactive').length;
  const damagedAssets = filteredAssets.filter((a) => a.status === 'damaged').length;
  const maintenanceAssets = filteredAssets.filter((a) => a.status === 'maintenance').length;
  const lostAssets = filteredAssets.filter((a) => a.status === 'lost').length;

  const totalTypes = assetTypes.length;
  const totalLocations = locations.length;
  const totalUsers = employees.length;

  // New assets this month
  const newThisMonth = assets.filter((a) => {
    const d = new Date(a.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Total valuation
  const totalValuation = useMemo(() => {
    return filteredAssets.reduce((acc, a) => acc + (a.purchase_cost || 0), 0);
  }, [filteredAssets]);

  // Asset Count by Type
  const assetsByType = useMemo(() => {
    return assetTypes.map((t) => {
      const count = filteredAssets.filter((a) => a.asset_type_id === t.id).length;
      const percentage = totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;
      return { ...t, count, percentage };
    }).sort((a, b) => b.count - a.count);
  }, [assetTypes, filteredAssets, totalAssets]);

  // Asset Count by Location (Top 5)
  const assetsByLocation = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAssets.forEach((a) => {
      if (a.location_id) {
        counts[a.location_id] = (counts[a.location_id] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([locId, count]) => {
        const loc = locations.find((l) => l.id === locId);
        return {
          id: locId,
          name: loc ? loc.name : 'Unknown Location',
          type: loc?.type,
          count,
          percentage: totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredAssets, locations, totalAssets]);

  // Monthly procurement trend (simulated/aggregated)
  const monthlyTrend = [
    { month: 'Apr', count: 4, cost: 42000000 },
    { month: 'Mei', count: 6, cost: 85000000 },
    { month: 'Jun', count: 8, cost: 110000000 },
    { month: 'Jul', count: 5, cost: 72000000 },
    { month: 'Ags', count: 11, cost: 165000000 },
    { month: 'Sep', count: filteredAssets.length, cost: totalValuation },
  ];

  // Active Maintenance Tickets
  const activeMaintenanceList = maintenanceRecords
    .filter((m) => m.status === 'in_progress' || m.status === 'scheduled')
    .slice(0, 4);

  const resetFilters = () => {
    setFilterPeriod('all');
    setFilterType('all');
    setFilterLocation('all');
    setFilterStatus('all');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl shadow-brand-950/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Box className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
              LABUAN HEBAT • ITAM ENTERPRISE
            </span>
            <span className="text-xs text-brand-300">v2.5 Release</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Dashboard Monitoring Aset IT
          </h1>
          <p className="text-xs md:text-sm text-brand-200/80 mt-1 max-w-xl">
            Sistem terpadu pencatatan, pemantauan inventaris hardware, SOP troubleshooting teknisi baru, dan pendataan kilat via Excel.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('tutorial')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-md border border-emerald-400/30 text-emerald-200 text-xs md:text-sm font-semibold transition-all hover:scale-105 shadow-sm"
          >
            <GraduationCap className="w-4 h-4 text-emerald-300" />
            <span>Tutorial & SOP IT</span>
          </button>

          {onOpenQuickExcel && (
            <button
              onClick={onOpenQuickExcel}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-semibold shadow-md shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Excel Cepat</span>
            </button>
          )}

          <button
            onClick={openScanner}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs md:text-sm font-semibold transition-all hover:scale-105 shadow-sm"
          >
            <QrCode className="w-4 h-4 text-brand-300" />
            <span>Scan QR</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs md:text-sm font-semibold shadow-lg shadow-brand-500/40 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aset</span>
          </button>
        </div>
      </div>

      {/* Onboarding & Quick Actions Card for New IT Staff */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-sky-950/20 border border-emerald-200/80 dark:border-emerald-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Portal Onboarding & Bantuan IT Baru LABUAN HEBAT</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                Penting
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Baru bergabung di tim IT? Akses modul <strong>Tutorial & SOP</strong> untuk panduan langkah pemecahan masalah ATM, PC/Laptop, Jaringan, Server, serta gunakan <strong>Import Excel Cepat</strong> untuk input inventaris masal.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('tutorial')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold shadow-sm hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Buka Tutorial IT</span>
          </button>
          {onOpenQuickExcel && (
            <button
              onClick={onOpenQuickExcel}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import Excel</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">
          <Filter className="w-4 h-4 text-brand-500" />
          <span>Filter Dashboard:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto flex-1">
          {/* Period Filter */}
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as any)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="all">Semua Periode</option>
            <option value="today">Hari Ini</option>
            <option value="month">Bulan Ini</option>
            <option value="year">Tahun 2026</option>
          </select>

          {/* Asset Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="all">Semua Jenis Aset</option>
            {assetTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="all">Semua Lokasi</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="maintenance">Maintenance</option>
            <option value="damaged">Rusak</option>
            <option value="inactive">Tidak Aktif</option>
            <option value="lost">Hilang</option>
          </select>
        </div>

        {(filterPeriod !== 'all' || filterType !== 'all' || filterLocation !== 'all' || filterStatus !== 'all') && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 10 KPI Cards (Requirements 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Seluruh Aset */}
        <div
          onClick={() => setActiveTab('assets')}
          className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500/50 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Seluruh Aset
            </span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalAssets}
            </span>
            <span className="text-[10px] font-semibold text-emerald-500 flex items-center">
              +100%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            Valuasi: {formatCurrencyIDR(totalValuation)}
          </p>
        </div>

        {/* 2. Aset Aktif */}
        <div
          onClick={() => {
            setFilterStatus('active');
            setActiveTab('assets');
          }}
          className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Aset Aktif
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {activeAssets}
            </span>
            <span className="text-[10px] font-semibold text-emerald-500">
              {totalAssets > 0 ? Math.round((activeAssets / totalAssets) * 100) : 0}%
            </span>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
            Siap beroperasi penuh
          </p>
        </div>

        {/* 3. Aset Dalam Maintenance */}
        <div
          onClick={() => {
            setFilterStatus('maintenance');
            setActiveTab('assets');
          }}
          className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/50 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Dalam Maintenance
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {maintenanceAssets}
            </span>
            <span className="text-[10px] font-semibold text-amber-500">
              {totalAssets > 0 ? Math.round((maintenanceAssets / totalAssets) * 100) : 0}%
            </span>
          </div>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
            Perbaikan / Servis berjalan
          </p>
        </div>

        {/* 4. Aset Rusak */}
        <div
          onClick={() => {
            setFilterStatus('damaged');
            setActiveTab('assets');
          }}
          className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-500/50 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Aset Rusak
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {damagedAssets}
            </span>
            <span className="text-[10px] font-semibold text-rose-500">
              {totalAssets > 0 ? Math.round((damagedAssets / totalAssets) * 100) : 0}%
            </span>
          </div>
          <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
            Memerlukan pergantian unit
          </p>
        </div>

        {/* 5. Aset Tidak Aktif */}
        <div
          onClick={() => {
            setFilterStatus('inactive');
            setActiveTab('assets');
          }}
          className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tidak Aktif
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {inactiveAssets}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {totalAssets > 0 ? Math.round((inactiveAssets / totalAssets) * 100) : 0}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Standby di gudang penyimpanan
          </p>
        </div>

        {/* 6. Aset Hilang */}
        <div
          onClick={() => {
            setFilterStatus('lost');
            setActiveTab('assets');
          }}
          className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500/50 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Aset Hilang
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {lostAssets}
            </span>
            <span className="text-[10px] font-semibold text-purple-500">
              {lostAssets} Unit
            </span>
          </div>
          <p className="text-[10px] text-purple-500 mt-1">
            Dalam investigasi audit
          </p>
        </div>

        {/* 7. Total Jenis Aset */}
        <div
          onClick={() => setActiveTab('asset_types')}
          className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500/50 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Jenis Aset
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalTypes}
            </span>
            <span className="text-[10px] font-semibold text-indigo-500 flex items-center">
              Custom Dynamic
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Kategori kustom terdefinisi
          </p>
        </div>

        {/* 8. Total Lokasi */}
        <div
          onClick={() => setActiveTab('locations')}
          className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500/50 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Lokasi
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalLocations}
            </span>
            <span className="text-[10px] font-semibold text-sky-500">
              Hierarki 4 Level
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Region & Cabang Terdaftar
          </p>
        </div>

        {/* 9. Total Pengguna */}
        <div
          onClick={() => setActiveTab('employees')}
          className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-500/50 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Pengguna
            </span>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalUsers}
            </span>
            <span className="text-[10px] font-semibold text-violet-500">
              Pegawai / Karyawan
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Penugasan kepemilikan aset
          </p>
        </div>

        {/* 10. Aset Baru Bulan Ini */}
        <div
          onClick={() => {
            setFilterPeriod('month');
            setActiveTab('assets');
          }}
          className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Aset Baru Bulan Ini
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              +{newThisMonth}
            </span>
            <span className="text-[10px] font-semibold text-emerald-500 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> Baru
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Pengadaan September 2026
          </p>
        </div>
      </div>

      {/* Visual Charts Grid (Requirement 3: Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Jumlah Aset Berdasarkan Jenis */}
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Jumlah Aset Berdasarkan Jenis
                </h3>
                <p className="text-xs text-slate-400">Distribusi inventaris IT perusahaan</p>
              </div>
              <button
                onClick={() => setActiveTab('asset_types')}
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1"
              >
                Kelola <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {assetsByType.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setFilterAssetTypeId(item.id);
                    setActiveTab('assets');
                  }}
                  className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-brand-500 transition-colors flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {item.count} unit ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Status Breakdown & Location Breakdown */}
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sebaran Aset Berdasarkan Status
                </h3>
                <p className="text-xs text-slate-400">Kesiapan operasional perangkat</p>
              </div>
            </div>

            {/* Visual Color Bar */}
            <div className="w-full h-4 rounded-xl overflow-hidden flex my-4 shadow-inner">
              <div
                style={{ width: `${(activeAssets / (totalAssets || 1)) * 100}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Aktif: ${activeAssets}`}
              />
              <div
                style={{ width: `${(maintenanceAssets / (totalAssets || 1)) * 100}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Maintenance: ${maintenanceAssets}`}
              />
              <div
                style={{ width: `${(damagedAssets / (totalAssets || 1)) * 100}%` }}
                className="bg-rose-500 h-full transition-all"
                title={`Rusak: ${damagedAssets}`}
              />
              <div
                style={{ width: `${(inactiveAssets / (totalAssets || 1)) * 100}%` }}
                className="bg-slate-400 h-full transition-all"
                title={`Tidak Aktif: ${inactiveAssets}`}
              />
              <div
                style={{ width: `${(lostAssets / (totalAssets || 1)) * 100}%` }}
                className="bg-purple-500 h-full transition-all"
                title={`Hilang: ${lostAssets}`}
              />
            </div>

            {/* Legend pills */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Aktif: {activeAssets}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Maintenance: {maintenanceAssets}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Rusak: {damagedAssets}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Tidak Aktif: {inactiveAssets}</span>
              </div>
            </div>

            {/* Location Section */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center justify-between">
                <span>Distribusi Berdasarkan Lokasi</span>
                <button
                  onClick={() => setActiveTab('locations')}
                  className="text-[11px] text-brand-600 dark:text-brand-400 font-medium hover:underline"
                >
                  Lihat Semua
                </button>
              </h4>
              <div className="space-y-2">
                {assetsByLocation.map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                      {loc.name}
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {loc.count} unit
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3: Aset yang Sedang Maintenance (Active Tickets) */}
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Aset Sedang Maintenance
                </h3>
                <p className="text-xs text-slate-400">Tiket perbaikan aktif tim teknisi</p>
              </div>
              <button
                onClick={() => setActiveTab('maintenance')}
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1"
              >
                Semua Tiket <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {activeMaintenanceList.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Tidak ada tiket maintenance aktif saat ini.
                </div>
              ) : (
                activeMaintenanceList.map((rec) => {
                  const asset = assets.find((a) => a.id === rec.asset_id);
                  return (
                    <div
                      key={rec.id}
                      onClick={() => {
                        if (asset) setSelectedAssetId(asset.id);
                        setActiveTab('assets');
                      }}
                      className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-amber-500/40 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                          {rec.maintenance_number}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          {rec.status === 'in_progress' ? 'Dalam Proses' : 'Terjadwal'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {asset?.name || rec.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {rec.issue_description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {rec.technician_name}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> {rec.scheduled_date}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Biaya Maintenance:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {formatCurrencyIDR(maintenanceRecords.reduce((acc, m) => acc + (m.cost || 0), 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Procurement Trend Bar Visual */}
      <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Aset yang Ditambahkan per Bulan (Tren Pengadaan)
            </h3>
            <p className="text-xs text-slate-400">Pertumbuhan inventaris IT 6 bulan terakhir</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/40">
            Tahun 2026
          </span>
        </div>

        <div className="grid grid-cols-6 gap-2 sm:gap-4 pt-6 items-end h-44">
          {monthlyTrend.map((m, idx) => {
            const heightPct = Math.min(100, Math.max(15, (m.count / 12) * 100));
            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {m.count}
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-hidden h-28 flex items-end">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-gradient-to-t from-brand-600 to-indigo-400 rounded-xl transition-all duration-500 group-hover:from-brand-500 group-hover:to-indigo-300 shadow-md shadow-brand-500/20"
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {m.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
