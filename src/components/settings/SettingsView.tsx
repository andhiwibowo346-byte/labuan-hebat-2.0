import React, { useState } from 'react';
import {
  Database,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Shield,
  FileCode,
  Check,
  Sun,
  Moon,
  Laptop,
  Palette,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
} from '../../services/supabaseClient';

export const SettingsView: React.FC = () => {
  const {
    assets,
    clearAllAssets,
    resetAllDataToDefault,
    exportDatabaseJSON,
    importDatabaseJSON,
    themeMode,
    setThemeMode,
    isDarkMode,
  } = useApp();

  const stored = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(stored.url);
  const [supabaseKey, setSupabaseKey] = useState(stored.anonKey);
  const [testingStatus, setTestingStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) return;

    setTestingStatus({ loading: true });
    const result = await testSupabaseConnection(supabaseUrl.trim(), supabaseKey.trim());
    setTestingStatus({ loading: false, success: result.success, message: result.message });

    if (result.success) {
      saveSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
    }
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setTestingStatus({ loading: false });
  };

  const handleCopySchema = () => {
    const sqlText = `-- Supabase PostgreSQL Schema Script (See supabase_schema.sql in root directory)`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleDownloadBackup = () => {
    const json = exportDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ITAM_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = importDatabaseJSON(content);
      if (success) {
        alert('Database berhasil dipulihkan dari file backup JSON!');
      } else {
        alert('Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Pengaturan Sistem & Database Supabase
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">
            CONFIGURATION
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Kelola mode tampilan Light & Dark, koneksi backend Supabase PostgreSQL, unduh skema SQL, dan backup inventaris
        </p>
      </div>

      {/* Card 0: Theme & Appearance (Light / Dark / System Mode) */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                Tema & Tampilan Antarmuka (Mode Light & Dark)
              </h2>
              <p className="text-xs text-slate-400">
                Pilih tema tampilan yang paling nyaman untuk mata dan pencahayaan lingkungan kerja Anda
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isDarkMode
                ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }`}
          >
            {isDarkMode ? 'Mode Gelap Aktif' : 'Mode Terang Aktif'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option 1: Light Mode */}
          <div
            onClick={() => setThemeMode('light')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between group ${
              themeMode === 'light'
                ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 shadow-md shadow-brand-500/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
            }`}
          >
            <div>
              {/* Preview UI Box */}
              <div className="w-full h-24 rounded-xl border border-slate-200 bg-white p-2 flex gap-1.5 shadow-sm overflow-hidden mb-3">
                <div className="w-1/4 h-full bg-slate-100 rounded flex flex-col gap-1 p-1">
                  <div className="w-full h-2 bg-brand-500 rounded-sm"></div>
                  <div className="w-3/4 h-1.5 bg-slate-200 rounded-sm"></div>
                  <div className="w-1/2 h-1.5 bg-slate-200 rounded-sm"></div>
                </div>
                <div className="flex-1 h-full flex flex-col gap-1.5">
                  <div className="w-full h-3 bg-slate-100 rounded flex items-center px-1">
                    <div className="w-1/3 h-1.5 bg-slate-300 rounded-sm"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 flex-1">
                    <div className="bg-slate-50 border border-slate-100 rounded p-1">
                      <div className="w-2/3 h-1.5 bg-slate-300 rounded-sm"></div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded p-1">
                      <div className="w-1/2 h-1.5 bg-emerald-300 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Mode Terang (Light)</span>
                </div>
                {themeMode === 'light' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Aktif
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Tampilan cerah berlatar putih bersih dengan kontras tajam. Optimal untuk pencahayaan kantor atau siang hari.
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setThemeMode('light');
              }}
              className={`mt-4 w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                themeMode === 'light'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-705'
              }`}
            >
              {themeMode === 'light' ? 'Sedang Digunakan' : 'Gunakan Mode Terang'}
            </button>
          </div>

          {/* Option 2: Dark Mode */}
          <div
            onClick={() => setThemeMode('dark')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between group ${
              themeMode === 'dark'
                ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 shadow-md shadow-brand-500/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
            }`}
          >
            <div>
              {/* Preview UI Box */}
              <div className="w-full h-24 rounded-xl border border-slate-800 bg-slate-950 p-2 flex gap-1.5 shadow-sm overflow-hidden mb-3">
                <div className="w-1/4 h-full bg-slate-900 rounded flex flex-col gap-1 p-1">
                  <div className="w-full h-2 bg-indigo-500 rounded-sm"></div>
                  <div className="w-3/4 h-1.5 bg-slate-800 rounded-sm"></div>
                  <div className="w-1/2 h-1.5 bg-slate-800 rounded-sm"></div>
                </div>
                <div className="flex-1 h-full flex flex-col gap-1.5">
                  <div className="w-full h-3 bg-slate-900 rounded flex items-center px-1">
                    <div className="w-1/3 h-1.5 bg-slate-700 rounded-sm"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 flex-1">
                    <div className="bg-slate-900/60 border border-slate-800 rounded p-1">
                      <div className="w-2/3 h-1.5 bg-slate-700 rounded-sm"></div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded p-1">
                      <div className="w-1/2 h-1.5 bg-emerald-500/40 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Mode Gelap (Dark)</span>
                </div>
                {themeMode === 'dark' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Aktif
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Tampilan bernuansa gelap slate modern. Mengurangi ketegangan mata saat cahaya redup dan hemat daya layar OLED/laptop.
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setThemeMode('dark');
              }}
              className={`mt-4 w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                themeMode === 'dark'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {themeMode === 'dark' ? 'Sedang Digunakan' : 'Gunakan Mode Gelap'}
            </button>
          </div>

          {/* Option 3: System Mode */}
          <div
            onClick={() => setThemeMode('system')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between group ${
              themeMode === 'system'
                ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 shadow-md shadow-brand-500/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
            }`}
          >
            <div>
              {/* Preview UI Box */}
              <div className="w-full h-24 rounded-xl border border-slate-300 dark:border-slate-700 p-0 flex shadow-sm overflow-hidden mb-3">
                {/* Left Half: Light */}
                <div className="w-1/2 h-full bg-white p-2 flex flex-col gap-1 border-r border-slate-200">
                  <div className="w-full h-2 bg-brand-500 rounded-sm"></div>
                  <div className="w-2/3 h-1.5 bg-slate-200 rounded-sm"></div>
                  <div className="w-full h-8 bg-slate-100 rounded mt-1"></div>
                </div>
                {/* Right Half: Dark */}
                <div className="w-1/2 h-full bg-slate-950 p-2 flex flex-col gap-1">
                  <div className="w-full h-2 bg-indigo-500 rounded-sm"></div>
                  <div className="w-2/3 h-1.5 bg-slate-800 rounded-sm"></div>
                  <div className="w-full h-8 bg-slate-900 rounded mt-1"></div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-brand-500/10 text-brand-500">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Otomatis (Sistem)</span>
                </div>
                {themeMode === 'system' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Aktif
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Menyesuaikan secara otomatis dengan tema sistem operasi perangkat Anda (Windows, macOS, iOS, atau Android).
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setThemeMode('system');
              }}
              className={`mt-4 w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                themeMode === 'system'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {themeMode === 'system' ? 'Sedang Digunakan' : 'Gunakan Otomatis'}
            </button>
          </div>
        </div>
      </div>

      {/* Card 1: Supabase PostgreSQL Connection */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                Koneksi Supabase PostgreSQL
              </h2>
              <p className="text-xs text-slate-400">
                Hubungkan aplikasi dengan database Supabase Cloud atau Local Instance
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              stored.isConfigured
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }`}
          >
            {stored.isConfigured ? 'Supabase Terhubung' : 'Mode Hybrid / Offline Cache'}
          </span>
        </div>

        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Project URL (Supabase API)
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Anon / Public API Key
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>
          </div>

          {testingStatus.message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                testingStatus.success
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
              }`}
            >
              {testingStatus.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{testingStatus.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-rose-500 hover:underline"
            >
              Hapus Konfigurasi Kustom
            </button>

            <button
              type="submit"
              disabled={testingStatus.loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-600/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingStatus.loading ? 'animate-spin' : ''}`} />
              <span>{testingStatus.loading ? 'Menguji...' : 'Uji & Simpan Koneksi'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Supabase Schema Preview & File Link */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                Skema Database Supabase PostgreSQL (`supabase_schema.sql`)
              </h2>
              <p className="text-xs text-slate-400">
                14 tabel: users, roles, asset_types, asset_fields, assets, asset_field_values, maintenance, audit trail & RLS
              </p>
            </div>
          </div>

          <a
            href="/supabase_schema.sql"
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 text-xs font-bold hover:bg-indigo-100"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .sql</span>
          </a>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 max-h-56">
          <p className="text-slate-500">-- Script migrasi DDL lengkap tersedia pada file supabase_schema.sql di workspace</p>
          <p className="text-brand-400 mt-2">CREATE TABLE IF NOT EXISTS public.asset_types (...);</p>
          <p className="text-brand-400">CREATE TABLE IF NOT EXISTS public.asset_fields (...);</p>
          <p className="text-brand-400">CREATE TABLE IF NOT EXISTS public.assets (...);</p>
          <p className="text-brand-400">CREATE TABLE IF NOT EXISTS public.asset_field_values (...);</p>
          <p className="text-emerald-400 mt-2">-- Row Level Security (RLS) policies</p>
          <p className="text-slate-400">ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;</p>
          <p className="text-slate-400">CREATE POLICY "Allow authenticated read on all itam tables" ...</p>
        </div>
      </div>

      {/* Card 3: Database Backup & Restore & Demo Reset */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
          Cadangan Data (Backup) & Pengelolaan Data Aset
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Download JSON Backup */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Download JSON Backup
            </span>
            <p className="text-[11px] text-slate-400">
              Simpan seluruh data aset, jenis, lokasi, dan pengguna ke dalam file backup
            </p>
            <button
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-brand-500" />
              <span>Download Backup</span>
            </button>
          </div>

          {/* Restore from JSON */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Pulihkan dari Backup
            </span>
            <p className="text-[11px] text-slate-400">
              Restore inventaris dari file backup JSON sebelumnya
            </p>
            <label className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 shadow-sm cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pilih File Backup</span>
              <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
            </label>
          </div>

          {/* Kosongkan Seluruh Data Aset */}
          <div className="p-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 space-y-3">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
              Kosongkan Semua Aset
            </span>
            <p className="text-[11px] text-slate-400">
              Hapus seluruh ({assets.length}) aset inventaris untuk mengosongkan data sistem
            </p>
            <button
              onClick={() => {
                if (assets.length === 0) {
                  alert('Inventaris aset saat ini sudah kosong.');
                  return;
                }
                if (confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus seluruh (${assets.length}) data aset, foto, dan riwayat pemeliharaan secara permanen?`)) {
                  clearAllAssets();
                  alert('Seluruh data aset berhasil dikosongkan!');
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Aset ({assets.length})</span>
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Reset Data ke Demo Awal
            </span>
            <p className="text-[11px] text-slate-400">
              Muat ulang seluruh data aset ke sampel standar perbankan
            </p>
            <button
              onClick={() => {
                if (confirm('Kembalikan seluruh data aset ke data demo awal?')) {
                  resetAllDataToDefault();
                  alert('Data aset telah direset ke demo default!');
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
