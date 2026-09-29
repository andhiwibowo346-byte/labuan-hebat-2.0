import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCheck,
  Table,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  ChevronRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  getStatusLabel,
  formatCurrencyIDR,
  formatDateIndonesian,
} from '../../utils';

export const ReportsExportView: React.FC = () => {
  const { assets, assetTypes, locations, employees, importAssetsBulk, hasPermission } = useApp();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  // ==================== EXPORT STATE ====================
  const [exportType, setExportType] = useState<string>('all');
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'asset_tag',
    'name',
    'serial_number',
    'status',
    'location',
    'employee',
    'purchase_date',
    'purchase_cost',
  ]);

  const currentTypeObj = assetTypes.find((t) => t.id === exportType);

  // Available columns to choose from based on selected type
  const availableColumns = useMemo(() => {
    const baseCols = [
      { id: 'asset_tag', label: 'Asset ID / Tag' },
      { id: 'asset_type', label: 'Jenis Aset' },
      { id: 'name', label: 'Nama Aset' },
      { id: 'serial_number', label: 'Serial Number' },
      { id: 'status', label: 'Status' },
      { id: 'location', label: 'Lokasi' },
      { id: 'employee', label: 'Nama Pengguna' },
      { id: 'nip', label: 'PN (Personal Number)' },
      { id: 'purchase_date', label: 'Tanggal Pengadaan' },
      { id: 'purchase_cost', label: 'Biaya Pengadaan' },
      { id: 'warranty_expiry', label: 'Batas Garansi' },
    ];

    if (currentTypeObj?.fields) {
      currentTypeObj.fields.forEach((f) => {
        baseCols.push({
          id: `custom_${f.field_code}`,
          label: `${f.field_name} (Custom)`,
        });
      });
    }

    return baseCols;
  }, [currentTypeObj]);

  const toggleColumn = (colId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const selectAllColumns = () => {
    setSelectedColumns(availableColumns.map((c) => c.id));
  };

  const deselectAllColumns = () => {
    setSelectedColumns(['asset_tag', 'name']);
  };

  // Assets to export
  const exportableAssets = useMemo(() => {
    return assets.filter((a) => (exportType === 'all' ? true : a.asset_type_id === exportType));
  }, [assets, exportType]);

  // Generate dataset based on selected columns
  const generateExportData = () => {
    return exportableAssets.map((asset) => {
      const type = assetTypes.find((t) => t.id === asset.asset_type_id);
      const loc = locations.find((l) => l.id === asset.location_id);
      const emp = employees.find((e) => e.id === asset.employee_id);

      const row: Record<string, any> = {};

      selectedColumns.forEach((colId) => {
        const colDef = availableColumns.find((c) => c.id === colId);
        const header = colDef?.label || colId;

        if (colId === 'asset_tag') row[header] = asset.asset_tag;
        else if (colId === 'asset_type') row[header] = type?.name || '';
        else if (colId === 'name') row[header] = asset.name;
        else if (colId === 'serial_number') row[header] = asset.serial_number || '-';
        else if (colId === 'status') row[header] = getStatusLabel(asset.status);
        else if (colId === 'location') row[header] = loc?.name || '-';
        else if (colId === 'employee') row[header] = emp?.full_name || '-';
        else if (colId === 'nip') row[header] = emp?.nip || '-';
        else if (colId === 'purchase_date') row[header] = asset.purchase_date || '-';
        else if (colId === 'purchase_cost') row[header] = asset.purchase_cost || 0;
        else if (colId === 'warranty_expiry') row[header] = asset.warranty_expiry || '-';
        else if (colId.startsWith('custom_')) {
          const fieldCode = colId.replace('custom_', '');
          row[header] = asset.custom_values?.[fieldCode] ?? '-';
        }
      });

      return row;
    });
  };

  const handleExecuteExport = () => {
    const data = generateExportData();
    const typeLabel = currentTypeObj ? currentTypeObj.name.replace(/\s+/g, '_') : 'Semua';
    const filename = `ITAM_Export_${typeLabel}_${new Date().toISOString().slice(0, 10)}`;

    if (exportFormat === 'excel') {
      exportToExcel(data, filename);
    } else if (exportFormat === 'csv') {
      exportToCSV(data, filename);
    } else if (exportFormat === 'pdf') {
      const headers = selectedColumns.map(
        (id) => availableColumns.find((c) => c.id === id)?.label || id
      );
      const rows = data.map((row) => headers.map((h) => String(row[h] ?? '')));
      exportToPDF(`Laporan Aset IT - ${currentTypeObj?.name || 'Seluruh Aset'}`, headers, rows, filename);
    }
  };

  // ==================== IMPORT STATE ====================
  const [importStep, setImportStep] = useState<1 | 2 | 3 | 4>(1);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importedRows, setImportedRows] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Asset Tag': 'ATM-991',
        'Nama Aset': 'ATM Cabang Juanda 01',
        'Jenis Aset': 'ATM',
        'Serial Number': 'SN-NCR-99881',
        Status: 'active',
        'Lokasi Code': 'RM-LBY-ATM',
        'Biaya Pengadaan': 175000000,
        TID: '99881122',
        'IP Address': '10.10.99.10',
      },
      {
        'Asset Tag': 'LAP-992',
        'Nama Aset': 'ThinkPad T14 Tim Audit',
        'Jenis Aset': 'Laptop',
        'Serial Number': 'PF-THK-88123',
        Status: 'active',
        'Lokasi Code': 'RM-IT-L2',
        'Biaya Pengadaan': 22000000,
        Merk: 'Lenovo ThinkPad',
        RAM: '16 GB DDR5',
      },
    ];
    exportToExcel(templateData, 'ITAM_Import_Template_Contoh');
  };

  // Upload file and parse with xlsx
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          alert('File Excel/CSV tidak memiliki data baris.');
          return;
        }

        setImportedRows(rawData);

        // Auto map columns
        const fileHeaders = Object.keys(rawData[0] as object);
        const autoMap: Record<string, string> = {};
        fileHeaders.forEach((header) => {
          const lower = header.toLowerCase();
          if (lower.includes('tag') || lower.includes('asset id')) autoMap[header] = 'asset_tag';
          else if (lower.includes('nama')) autoMap[header] = 'name';
          else if (lower.includes('serial') || lower.includes('sn')) autoMap[header] = 'serial_number';
          else if (lower.includes('status')) autoMap[header] = 'status';
          else if (lower.includes('biaya') || lower.includes('harga') || lower.includes('cost')) autoMap[header] = 'purchase_cost';
          else if (lower.includes('tid')) autoMap[header] = 'tid';
          else if (lower.includes('ip')) autoMap[header] = 'ip_address';
          else autoMap[header] = header;
        });

        setColumnMapping(autoMap);
        setImportStep(2);
      } catch (err: any) {
        alert(`Gagal membaca file: ${err.message}`);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Validation before import
  const handleValidateAndPreview = () => {
    const errors: string[] = [];
    const existingTags = new Set(assets.map((a) => a.asset_tag.toLowerCase()));
    const existingSNs = new Set(assets.filter((a) => a.serial_number).map((a) => a.serial_number.toLowerCase()));

    const seenInBatchTags = new Set<string>();

    importedRows.forEach((row, idx) => {
      const rowNum = idx + 2; // considering header
      const tag = row[Object.keys(columnMapping).find((k) => columnMapping[k] === 'asset_tag') || ''];
      const name = row[Object.keys(columnMapping).find((k) => columnMapping[k] === 'name') || ''];
      const sn = row[Object.keys(columnMapping).find((k) => columnMapping[k] === 'serial_number') || ''];

      if (!tag) {
        errors.push(`Baris ${rowNum}: Asset ID / Tag wajib diisi.`);
      } else {
        const lowerTag = String(tag).toLowerCase().trim();
        if (existingTags.has(lowerTag)) {
          errors.push(`Baris ${rowNum}: Asset ID '${tag}' duplikat dengan database.`);
        }
        if (seenInBatchTags.has(lowerTag)) {
          errors.push(`Baris ${rowNum}: Asset ID '${tag}' duplikat dalam berkas file.`);
        }
        seenInBatchTags.add(lowerTag);
      }

      if (!name) {
        errors.push(`Baris ${rowNum}: Nama Aset wajib diisi.`);
      }

      if (sn && existingSNs.has(String(sn).toLowerCase().trim())) {
        errors.push(`Baris ${rowNum}: Serial Number '${sn}' sudah digunakan.`);
      }
    });

    setImportErrors(errors);
    setImportStep(3);
  };

  const handleExecuteImport = () => {
    const assetsToInsert = importedRows.map((row) => {
      const tagKey = Object.keys(columnMapping).find((k) => columnMapping[k] === 'asset_tag') || '';
      const nameKey = Object.keys(columnMapping).find((k) => columnMapping[k] === 'name') || '';
      const snKey = Object.keys(columnMapping).find((k) => columnMapping[k] === 'serial_number') || '';
      const statusKey = Object.keys(columnMapping).find((k) => columnMapping[k] === 'status') || '';
      const costKey = Object.keys(columnMapping).find((k) => columnMapping[k] === 'purchase_cost') || '';

      const customVals: Record<string, any> = {};
      Object.entries(columnMapping).forEach(([fileCol, targetKey]) => {
        if (!['asset_tag', 'name', 'serial_number', 'status', 'purchase_cost'].includes(targetKey)) {
          customVals[targetKey] = row[fileCol];
        }
      });

      return {
        asset_tag: String(row[tagKey] || `IMP-${Date.now()}`),
        name: String(row[nameKey] || 'Imported Asset'),
        asset_type_id: assetTypes[0]?.id || 'type-atm',
        serial_number: row[snKey] ? String(row[snKey]) : '',
        status: (row[statusKey] as any) || 'active',
        purchase_cost: row[costKey] ? Number(row[costKey]) : undefined,
        custom_values: customVals,
      };
    });

    const result = importAssetsBulk(assetsToInsert as any);
    setImportSuccessCount(result.successCount);
    setImportStep(4);
  };

  const resetImportWizard = () => {
    setImportStep(1);
    setImportFile(null);
    setImportedRows([]);
    setColumnMapping({});
    setImportErrors([]);
    setImportSuccessCount(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Laporan, Export & Import Data Aset
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              MULTI-FORMAT
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Export fleksibel dengan pemilihan kolom dinamis dan import massal Excel/CSV
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'export'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'import'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: EXPORT DATA ==================== */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Options Card (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  1. Pilih Kategori & Format Export
                </h3>
                <p className="text-xs text-slate-400">
                  Tentukan jenis aset dan format output file yang diinginkan
                </p>
              </div>

              {/* Asset Type Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Kategori Aset
                </label>
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="all">Semua Jenis Aset ({assets.length} Unit)</option>
                  {assetTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({assets.filter((a) => a.asset_type_id === t.id).length} Unit)
                    </option>
                  ))}
                </select>
              </div>

              {/* Format Radio Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Format Output File
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: 'text-emerald-600' },
                    { id: 'csv', label: 'CSV (.csv)', icon: FileText, color: 'text-sky-600' },
                    { id: 'pdf', label: 'PDF (.pdf)', icon: FileCheck, color: 'text-rose-600' },
                  ].map((fmt) => {
                    const Icon = fmt.icon;
                    const isSelected = exportFormat === fmt.id;
                    return (
                      <button
                        type="button"
                        key={fmt.id}
                        onClick={() => setExportFormat(fmt.id as any)}
                        className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-500 text-brand-600 dark:text-brand-400 font-bold shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${fmt.color}`} />
                        <span className="text-xs">{fmt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExecuteExport}
                  disabled={selectedColumns.length === 0 || exportableAssets.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs md:text-sm shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File ({exportableAssets.length} Aset)</span>
                </button>
              </div>
            </div>

            {/* Right: Dynamic Column Chooser (7 cols) */}
            <div className="lg:col-span-7 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    2. Pilih Kolom yang Ingin Diexport
                  </h3>
                  <p className="text-xs text-slate-400">
                    Centang kolom standar maupun custom fields yang ingin disertakan
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={selectAllColumns}
                    className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                  >
                    Pilih Semua
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={deselectAllColumns}
                    className="text-slate-400 hover:underline"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {availableColumns.map((col) => {
                  const isChecked = selectedColumns.includes(col.id);

                  return (
                    <label
                      key={col.id}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-brand-50/50 dark:bg-brand-950/30 border-brand-500/40 text-slate-900 dark:text-white font-semibold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleColumn(col.id)}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-xs">{col.label}</span>
                    </label>
                  );
                })}
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{selectedColumns.length} kolom terpilih</span>
                <span className="font-mono">{exportableAssets.length} baris data siap dicetak</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: IMPORT WIZARD (EXCEL / CSV) ==================== */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Stepper Header */}
          <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
            {[
              { num: 1, title: 'Upload & Template' },
              { num: 2, title: 'Mapping Kolom' },
              { num: 3, title: 'Validasi & Preview' },
              { num: 4, title: 'Hasil Import' },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                    importStep === step.num
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : importStep > step.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {importStep > step.num ? '✓' : step.num}
                </span>
                <span
                  className={`hidden sm:inline text-xs font-semibold ${
                    importStep === step.num
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
                {idx < 3 && <ChevronRight className="hidden sm:inline w-4 h-4 text-slate-300 ml-auto mr-4" />}
              </div>
            ))}
          </div>

          {/* STEP 1: UPLOAD FILE & DOWNLOAD TEMPLATE */}
          {importStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Download Sample */}
              <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Langkah 1: Download Template Excel
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Gunakan file template terstandar yang sudah dilengkapi kolom-kolom utama agar proses import berjalan mulus.
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Template Excel (.xlsx)</span>
                </button>
              </div>

              {/* Card 2: Upload User File */}
              <div className="p-6 rounded-3xl border border-dashed border-brand-500/50 bg-brand-50/20 dark:bg-brand-950/20 rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Langkah 2: Upload File Excel / CSV
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Pilih file Excel (.xlsx, .xls) atau CSV yang berisi daftar aset
                  </p>
                </div>

                <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/30 transition-all hover:scale-105">
                  <span>Pilih Berkas File</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING */}
          {importStep === 2 && (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Langkah 3: Pemetaan Kolom (Column Mapping)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Hubungkan header kolom di file Excel Anda dengan field database di sistem
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.keys(columnMapping).map((fileCol) => (
                  <div
                    key={fileCol}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50"
                  >
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">
                      Header File Excel: <b className="text-slate-800 dark:text-slate-200 font-mono">{fileCol}</b>
                    </span>

                    <select
                      value={columnMapping[fileCol]}
                      onChange={(e) =>
                        setColumnMapping((prev) => ({ ...prev, [fileCol]: e.target.value }))
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
                    >
                      <option value="asset_tag">Asset Tag / ID (Unique)</option>
                      <option value="name">Nama Aset (Required)</option>
                      <option value="serial_number">Serial Number</option>
                      <option value="status">Status Operasional</option>
                      <option value="purchase_cost">Biaya Pengadaan</option>
                      <option value="tid">TID (Terminal ID)</option>
                      <option value="ip_address">IP Address</option>
                      <option value="ignore">-- Lewati / Jangan Import --</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={resetImportWizard}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Kembali
                </button>
                <button
                  onClick={handleValidateAndPreview}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/30"
                >
                  <span>Validasi & Preview Data</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & DUPLICATE VALIDATION */}
          {importStep === 3 && (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Langkah 4: Preview Data & Validasi Keunikan
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sistem mendeteksi {importedRows.length} baris data yang siap diimport
                  </p>
                </div>

                {importErrors.length > 0 ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    Ditemukan {importErrors.length} Kesalahan
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Semua Data Valid
                  </span>
                )}
              </div>

              {/* Errors Box */}
              {importErrors.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 space-y-1.5 text-xs max-h-48 overflow-y-auto">
                  <div className="font-bold flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Perbaiki error duplikasi berikut sebelum melanjutkan import:</span>
                  </div>
                  {importErrors.map((err, i) => (
                    <p key={i} className="pl-6 font-mono text-[11px]">• {err}</p>
                  ))}
                </div>
              )}

              {/* Preview Table (First 5 rows) */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      {Object.keys(columnMapping).map((col) => (
                        <th key={col} className="py-2.5 px-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {importedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                        {Object.keys(columnMapping).map((col) => (
                          <td key={col} className="py-2 px-3 text-slate-700 dark:text-slate-300">
                            {String(row[col] ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setImportStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Kembali ke Mapping
                </button>
                <button
                  onClick={handleExecuteImport}
                  disabled={importErrors.length > 0}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-brand-600/30"
                >
                  <span>Eksekusi Import Sekarang</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS FINISH */}
          {importStep === 4 && (
            <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Import Berhasil Selesai!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sebanyak <b>{importSuccessCount} aset baru</b> telah sukses dimasukkan ke dalam sistem database inventaris IT.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={resetImportWizard}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Import File Lainnya
                </button>
                <button
                  onClick={() => {
                    setActiveTab('export');
                  }}
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow"
                >
                  Lihat Hasil di Asset Table
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
