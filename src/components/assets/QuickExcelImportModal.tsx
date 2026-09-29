import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Clipboard,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  Layers,
  ArrowRight,
  RefreshCw,
  Info,
  Check,
  Users,
  MapPin,
  Box,
  Sliders,
  FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { Asset, AssetType, AssetStatus, LocationNode, Employee } from '../../types';
import { exportToExcel, exportToCSV } from '../../utils';

export type ImportEntityType = 'assets' | 'employees' | 'locations';

interface QuickExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAssetTypeId?: string;
  defaultEntityType?: ImportEntityType;
}

export const QuickExcelImportModal: React.FC<QuickExcelImportModalProps> = ({
  isOpen,
  onClose,
  defaultAssetTypeId,
  defaultEntityType = 'assets',
}) => {
  const {
    assetTypes,
    locations,
    employees,
    assets,
    importAssetsBulk,
    importLocationsBulk,
    importEmployeesBulk,
  } = useApp();

  const [entityType, setEntityType] = useState<ImportEntityType>(defaultEntityType);
  const [activeMode, setActiveMode] = useState<'upload' | 'paste' | 'template'>('upload');
  const [selectedAssetTypeId, setSelectedAssetTypeId] = useState<string>(
    defaultAssetTypeId || (assetTypes[0]?.id ?? '')
  );

  // Direct paste text
  const [pastedText, setPastedText] = useState('');

  // Upload file info
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Parsed raw rows
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);

  // Manual column mapping overrides: [fileHeader]: targetField
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [showMappingConfig, setShowMappingConfig] = useState(false);

  // Auto generate tag / code / ID if empty
  const [autoGenTag, setAutoGenTag] = useState(true);

  // Import feedback
  const [importResult, setImportResult] = useState<{
    success: boolean;
    count: number;
    errors: string[];
  } | null>(null);

  const currentType = assetTypes.find((t) => t.id === selectedAssetTypeId) || assetTypes[0];

  // 1. Download tailored Template for Excel or CSV
  const handleDownloadTemplate = (format: 'xlsx' | 'csv') => {
    let templateData: Record<string, any>[] = [];
    let filename = '';

    if (entityType === 'assets') {
      if (!currentType) return;
      filename = `Template_${currentType.name.replace(/\s+/g, '_')}_LABUAN_HEBAT`;

      const baseRow: Record<string, any> = {
        'Asset ID (Tag)': `AST-${currentType.code}-001`,
        'Nama Aset': `${currentType.name} Unit 01`,
        'Serial Number': `SN${Math.floor(10000000 + Math.random() * 90000000)}`,
        Status: 'active',
        'Biaya Pengadaan': 15000000,
        'Tanggal Pengadaan': new Date().toISOString().slice(0, 10),
        'Masa Garansi': '2028-12-31',
        Lokasi: locations[0]?.name || 'Kantor Pusat - Server Room',
        Pengguna: employees[0]?.full_name || '',
        Catatan: 'Pengadaan unit baru kondisi prima',
      };

      // Inject all dynamic custom fields for this asset type
      currentType.fields.forEach((f) => {
        let exampleVal: any = '-';
        if (f.field_type === 'number') exampleVal = 100;
        else if (f.field_type === 'date') exampleVal = '2024-01-15';
        else if (f.field_type === 'ip_address') exampleVal = '192.168.1.50';
        else if (f.field_type === 'select') exampleVal = f.options?.[0] || 'Opsi 1';
        else if (f.field_name.toLowerCase().includes('ram')) exampleVal = '16 GB DDR4';
        else if (f.field_name.toLowerCase().includes('storage')) exampleVal = '512 GB NVMe SSD';
        else if (f.field_name.toLowerCase().includes('processor')) exampleVal = 'Intel Core i7-12700';
        else if (f.field_name.toLowerCase().includes('os')) exampleVal = 'Windows 11 Pro 64-bit';
        else if (f.field_name.toLowerCase().includes('tid')) exampleVal = 'ATM882101';
        else if (f.field_name.toLowerCase().includes('cabang')) exampleVal = 'Cabang Utama';
        else if (f.field_name.toLowerCase().includes('merk') || f.field_name.toLowerCase().includes('brand')) exampleVal = 'Dell';
        else if (f.field_name.toLowerCase().includes('model')) exampleVal = 'Latitude 5430';
        else exampleVal = `Contoh ${f.field_name}`;

        baseRow[f.field_name] = exampleVal;
      });

      const row2 = { ...baseRow };
      row2['Asset ID (Tag)'] = `AST-${currentType.code}-002`;
      row2['Nama Aset'] = `${currentType.name} Unit 02`;
      row2['Serial Number'] = `SN${Math.floor(10000000 + Math.random() * 90000000)}`;

      templateData = [baseRow, row2];
    } else if (entityType === 'employees') {
      filename = 'Template_Pengguna_Karyawan_LABUAN_HEBAT';
      templateData = [
        {
          'Nama Lengkap': 'Ahmad Fauzi',
          'PN (Personal Number)': '00385610',
          Email: 'ahmad.fauzi@perusahaan.co.id',
          Departemen: 'Information Technology',
          Jabatan: 'IT Support Specialist',
          'Nomor Telepon': '081234567890',
          Lokasi: locations[0]?.name || 'Kantor Pusat',
          Status: 'active',
        },
        {
          'Nama Lengkap': 'Siti Rahmawati',
          'PN (Personal Number)': '00385622',
          Email: 'siti.rahmawati@perusahaan.co.id',
          Departemen: 'Operasional & Layanan',
          Jabatan: 'Supervisor Operasional',
          'Nomor Telepon': '081298765432',
          Lokasi: locations[1]?.name || 'Cabang Sudirman',
          Status: 'active',
        },
      ];
    } else if (entityType === 'locations') {
      filename = 'Template_Lokasi_Ruangan_LABUAN_HEBAT';
      templateData = [
        {
          'Nama Lokasi': 'Kantor Cabang Senayan',
          'Kode Lokasi': 'CAB-SNY',
          'Tipe Lokasi': 'branch',
          'Induk Lokasi (Parent)': 'Region 1 - Jabodetabek',
          Alamat: 'Jl. Asia Afrika No. 8, Senayan, Jakarta Pusat',
        },
        {
          'Nama Lokasi': 'Ruang Server & UPS',
          'Kode Lokasi': 'R-SRV-SNY',
          'Tipe Lokasi': 'room',
          'Induk Lokasi (Parent)': 'Kantor Cabang Senayan',
          Alamat: 'Lantai 2 Ruang 204',
        },
      ];
    }

    if (format === 'xlsx') {
      exportToExcel(templateData, filename);
    } else {
      exportToCSV(templateData, filename);
    }
  };

  // 2. Parse File (.xlsx, .xls, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        if (data.length === 0) {
          alert('File Excel/CSV tidak memiliki data baris.');
          return;
        }

        setRawRows(data);
        autoMapHeaders(data);
      } catch (err: any) {
        alert(`Gagal membaca file: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  // 3. Parse Pasted Text (TSV from Excel, CSV, Semicolon)
  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;

    try {
      const lines = pastedText.trim().split(/\r\n|\r|\n/);
      if (lines.length < 2) {
        alert('Teks harus memiliki minimal baris header dan 1 baris data.');
        return;
      }

      // Detect separator
      const firstLine = lines[0];
      const sep = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

      const headers = firstLine.split(sep).map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const rows: Record<string, any>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(sep).map((v) => v.trim().replace(/^["']|["']$/g, ''));
        const rowObj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] ?? '';
        });
        rows.push(rowObj);
      }

      if (rows.length === 0) {
        alert('Tidak ada baris data valid yang terbaca.');
        return;
      }

      setRawRows(rows);
      autoMapHeaders(rows);
      setImportResult(null);
    } catch (err: any) {
      alert(`Gagal memproses teks: ${err.message}`);
    }
  };

  // Auto detect headers
  const autoMapHeaders = (data: Record<string, any>[]) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0] || {});
    const map: Record<string, string> = {};

    headers.forEach((h) => {
      const lower = h.toLowerCase().trim();
      if (lower.includes('tag') || lower.includes('asset id') || lower.includes('kode aset')) {
        map[h] = 'asset_tag';
      } else if (lower.includes('nama aset') || lower === 'nama' || lower === 'name') {
        map[h] = 'name';
      } else if (lower.includes('serial') || lower.includes('sn') || lower.includes('no seri')) {
        map[h] = 'serial_number';
      } else if (lower.includes('status')) {
        map[h] = 'status';
      } else if (lower.includes('biaya') || lower.includes('harga') || lower.includes('cost')) {
        map[h] = 'purchase_cost';
      } else if (lower.includes('tanggal pengadaan') || lower.includes('tgl pengadaan') || lower.includes('purchase date')) {
        map[h] = 'purchase_date';
      } else if (lower.includes('garansi') || lower.includes('warranty')) {
        map[h] = 'warranty_expiry';
      } else if (lower.includes('lokasi') || lower.includes('location') || lower.includes('ruangan')) {
        map[h] = 'location_id';
      } else if (
        lower.includes('pengguna') ||
        lower.includes('user') ||
        lower.includes('nip') ||
        lower.includes('pn') ||
        lower.includes('personal number') ||
        lower.includes('karyawan')
      ) {
        map[h] = 'employee_id';
      } else if (lower.includes('catatan') || lower.includes('keterangan') || lower.includes('notes')) {
        map[h] = 'notes';
      } else {
        // Match custom fields by code or name
        const matchField = currentType?.fields.find(
          (f) =>
            f.field_code.toLowerCase() === lower ||
            f.field_name.toLowerCase() === lower ||
            lower.includes(f.field_name.toLowerCase())
        );
        if (matchField) {
          map[h] = matchField.field_code;
        } else {
          map[h] = h;
        }
      }
    });

    setColumnMapping(map);
  };

  // 4. Validate & Process Rows
  const processedData = useMemo(() => {
    if (rawRows.length === 0) return { validCount: 0, errors: [], assetsData: [], employeesData: [], locationsData: [] };

    const errors: string[] = [];

    if (entityType === 'assets') {
      const validAssets: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'photos' | 'documents'>[] = [];
      const existingTags = new Set(assets.map((a) => a.asset_tag.toLowerCase()));
      const existingSNs = new Set(assets.filter((a) => a.serial_number).map((a) => a.serial_number.toLowerCase()));
      const batchTags = new Set<string>();

      rawRows.forEach((row, idx) => {
        const rowNum = idx + 1;
        let tag = '';
        let name = '';
        let sn = '';
        let status: AssetStatus = 'active';
        let cost = 0;
        let purchaseDate = new Date().toISOString().slice(0, 10);
        let warrantyExpiry = '';
        let notes = '';
        let locName = '';
        let empName = '';
        const customValues: Record<string, any> = {};

        Object.entries(row).forEach(([colHeader, val]) => {
          const mappedKey = columnMapping[colHeader] || colHeader.toLowerCase().trim();
          const strVal = String(val ?? '').trim();

          if (mappedKey === 'asset_tag' || mappedKey.includes('tag')) {
            tag = strVal;
          } else if (mappedKey === 'name' || mappedKey.includes('nama')) {
            name = strVal;
          } else if (mappedKey === 'serial_number' || mappedKey.includes('sn')) {
            sn = strVal;
          } else if (mappedKey === 'status') {
            const s = strVal.toLowerCase();
            if (['active', 'aktif'].includes(s)) status = 'active';
            else if (['inactive', 'nonaktif', 'tidak aktif'].includes(s)) status = 'inactive';
            else if (['maintenance', 'pemeliharaan', 'perbaikan'].includes(s)) status = 'maintenance';
            else if (['damaged', 'rusak'].includes(s)) status = 'damaged';
            else if (['lost', 'hilang'].includes(s)) status = 'lost';
            else status = 'active';
          } else if (mappedKey === 'purchase_cost') {
            const num = Number(strVal.replace(/[^0-9.-]+/g, ''));
            cost = isNaN(num) ? 0 : num;
          } else if (mappedKey === 'purchase_date') {
            purchaseDate = strVal || new Date().toISOString().slice(0, 10);
          } else if (mappedKey === 'warranty_expiry') {
            warrantyExpiry = strVal;
          } else if (mappedKey === 'notes') {
            notes = strVal;
          } else if (mappedKey === 'location_id') {
            locName = strVal;
          } else if (mappedKey === 'employee_id') {
            empName = strVal;
          } else {
            // Find field code if exists
            const matchedField = currentType?.fields.find(
              (f) => f.field_code === mappedKey || f.field_name.toLowerCase() === colHeader.toLowerCase()
            );
            if (matchedField) {
              customValues[matchedField.field_code] = strVal;
              customValues[matchedField.field_name] = strVal;
            } else {
              customValues[colHeader] = strVal;
            }
          }
        });

        // Fallback auto tag
        if (!tag && autoGenTag) {
          const typeCode = currentType?.code || 'AST';
          tag = `${typeCode}-${Math.floor(10000 + Math.random() * 90000)}`;
        }

        if (!tag) {
          errors.push(`Baris ${rowNum}: Asset ID (Tag) kosong.`);
          return;
        }

        if (batchTags.has(tag.toLowerCase())) {
          errors.push(`Baris ${rowNum}: Asset ID '${tag}' duplikat dalam file.`);
          return;
        }

        if (existingTags.has(tag.toLowerCase())) {
          errors.push(`Baris ${rowNum}: Asset ID '${tag}' sudah terdaftar di sistem.`);
          return;
        }

        if (sn && existingSNs.has(sn.toLowerCase())) {
          errors.push(`Baris ${rowNum}: Serial Number '${sn}' sudah terdaftar di sistem.`);
          return;
        }

        batchTags.add(tag.toLowerCase());
        if (sn) existingSNs.add(sn.toLowerCase());

        // Match Location
        let locationId = locations[0]?.id || '';
        if (locName) {
          const matchLoc = locations.find(
            (l) => l.name.toLowerCase() === locName.toLowerCase() || l.code.toLowerCase() === locName.toLowerCase()
          );
          if (matchLoc) locationId = matchLoc.id;
        }

        // Match Employee
        let employeeId: string | undefined = undefined;
        if (empName) {
          const matchEmp = employees.find(
            (e) =>
              e.full_name.toLowerCase().includes(empName.toLowerCase()) ||
              (e.nip && e.nip.toLowerCase() === empName.toLowerCase())
          );
          if (matchEmp) employeeId = matchEmp.id;
        }

        validAssets.push({
          asset_tag: tag,
          name: name || `${currentType?.name || 'Aset'} ${tag}`,
          asset_type_id: selectedAssetTypeId,
          status,
          serial_number: sn || '',
          location_id: locationId,
          employee_id: employeeId,
          purchase_date: purchaseDate,
          purchase_cost: cost,
          warranty_expiry: warrantyExpiry,
          notes: notes || `Import cepat via Excel/CSV (${new Date().toLocaleDateString('id-ID')})`,
          custom_values: customValues,
        });
      });

      return {
        validCount: validAssets.length,
        errors,
        assetsData: validAssets,
        employeesData: [],
        locationsData: [],
      };
    } else if (entityType === 'employees') {
      const validEmployees: Omit<Employee, 'id'>[] = [];
      const existingEmails = new Set(employees.map((e) => e.email.toLowerCase()));

      rawRows.forEach((row, idx) => {
        const rowNum = idx + 1;
        const name = String(row['Nama Lengkap'] || row['Nama'] || row['name'] || '').trim();
        const nip = String(
          row['PN'] ||
          row['pn'] ||
          row['Personal Number'] ||
          row['PN (Personal Number)'] ||
          row['NIP'] ||
          row['nip'] ||
          `PN-${Math.floor(100000 + Math.random() * 900000)}`
        ).trim();
        const email = String(
          row['Email'] || row['email'] || `${name.toLowerCase().replace(/\s+/g, '.')}@perusahaan.co.id`
        ).trim();
        const dept = String(row['Departemen'] || row['department'] || 'General').trim();
        const title = String(row['Jabatan'] || row['job_title'] || 'Staff').trim();
        const phone = String(row['Nomor Telepon'] || row['Telepon'] || row['phone'] || '-').trim();

        if (!name) {
          errors.push(`Baris ${rowNum}: Nama lengkap karyawan kosong.`);
          return;
        }

        if (existingEmails.has(email.toLowerCase())) {
          errors.push(`Baris ${rowNum}: Email '${email}' sudah terdaftar.`);
          return;
        }

        existingEmails.add(email.toLowerCase());

        validEmployees.push({
          employee_id: nip,
          full_name: name,
          nip,
          email,
          department: dept,
          job_title: title,
          phone,
          status: 'active',
        });
      });

      return {
        validCount: validEmployees.length,
        errors,
        assetsData: [],
        employeesData: validEmployees,
        locationsData: [],
      };
    } else {
      // Locations
      const validLocations: Omit<LocationNode, 'id'>[] = [];
      const existingCodes = new Set(locations.map((l) => l.code.toLowerCase()));

      rawRows.forEach((row, idx) => {
        const rowNum = idx + 1;
        const name = String(row['Nama Lokasi'] || row['Nama'] || row['name'] || '').trim();
        const code = String(row['Kode Lokasi'] || row['code'] || `LOC-${Math.floor(1000 + Math.random() * 9000)}`).trim();
        const typeStr = String(row['Tipe Lokasi'] || row['type'] || 'room').toLowerCase().trim();
        const addr = String(row['Alamat'] || row['address'] || '').trim();

        let type: 'region' | 'area' | 'branch' | 'room' = 'room';
        if (['region', 'area', 'branch', 'room'].includes(typeStr)) {
          type = typeStr as any;
        }

        if (!name) {
          errors.push(`Baris ${rowNum}: Nama lokasi kosong.`);
          return;
        }

        if (existingCodes.has(code.toLowerCase())) {
          errors.push(`Baris ${rowNum}: Kode lokasi '${code}' sudah terdaftar.`);
          return;
        }

        existingCodes.add(code.toLowerCase());

        validLocations.push({
          name,
          code: code.toUpperCase(),
          type,
          address: addr || undefined,
        });
      });

      return {
        validCount: validLocations.length,
        errors,
        assetsData: [],
        employeesData: [],
        locationsData: validLocations,
      };
    }
  }, [rawRows, entityType, columnMapping, assets, employees, locations, autoGenTag, selectedAssetTypeId, currentType]);

  // Execute Import
  const handleExecuteImport = () => {
    if (processedData.validCount === 0) {
      alert('Tidak ada data baris yang valid untuk diimpor.');
      return;
    }

    if (entityType === 'assets') {
      const res = importAssetsBulk(processedData.assetsData);
      setImportResult({
        success: res.successCount > 0,
        count: res.successCount,
        errors: res.errors,
      });
    } else if (entityType === 'employees') {
      const res = importEmployeesBulk(processedData.employeesData);
      setImportResult({
        success: res.successCount > 0,
        count: res.successCount,
        errors: res.errors,
      });
    } else if (entityType === 'locations') {
      const res = importLocationsBulk(processedData.locationsData);
      setImportResult({
        success: res.successCount > 0,
        count: res.successCount,
        errors: res.errors,
      });
    }

    setTimeout(() => {
      onClose();
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setRawRows([]);
    setPastedText('');
    setUploadedFileName(null);
    setColumnMapping({});
    setImportResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg md:text-xl font-black tracking-tight truncate">
                  Import Data Cepat Excel & CSV
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 uppercase tracking-wider">
                  LABUAN HEBAT
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-100 truncate mt-0.5">
                Dukung seluruh field standar & custom field dinamis (.xlsx, .csv, copy-paste)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entity Type Switcher & Method Tabs */}
        <div className="px-3.5 sm:px-6 py-3 sm:py-4 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
              Jenis Data:
            </span>
            <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setEntityType('assets');
                  resetForm();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  entityType === 'assets'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Aset IT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEntityType('employees');
                  resetForm();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  entityType === 'employees'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Pengguna / Karyawan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEntityType('locations');
                  resetForm();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  entityType === 'locations'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Lokasi</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveMode('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'upload'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>

            <button
              onClick={() => setActiveMode('paste')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'paste'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Copy-Paste Excel</span>
            </button>

            <button
              onClick={() => setActiveMode('template')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'template'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Template</span>
            </button>
          </div>
        </div>

        {/* If entityType === 'assets', select Asset Type */}
        {entityType === 'assets' && (
          <div className="px-6 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Tipe Aset yang Diimpor:
              </span>
              <select
                value={selectedAssetTypeId}
                onChange={(e) => {
                  setSelectedAssetTypeId(e.target.value);
                  resetForm();
                }}
                className="px-3 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-sm"
              >
                {assetTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.fields.length} Custom Fields: {t.fields.map((f) => f.field_name).join(', ')})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Mendukung semua custom field tipe ini
            </span>
          </div>
        )}

        {/* Main Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Mode 1: Upload File */}
          {activeMode === 'upload' && (
            <div className="space-y-4">
              <div className="p-8 border-2 border-dashed border-emerald-500/40 dark:border-emerald-500/30 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/10 text-center flex flex-col items-center justify-center hover:border-emerald-500 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100">
                  {uploadedFileName ? uploadedFileName : 'Pilih File Excel (.xlsx, .xls) atau File CSV (.csv)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                  Sistem otomatis mendeteksi baris, header kolom, dan seluruh custom field untuk data{' '}
                  <span className="font-semibold text-emerald-600">
                    {entityType === 'assets' ? currentType?.name : entityType === 'employees' ? 'Karyawan' : 'Lokasi'}
                  </span>.
                </p>

                <label className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 cursor-pointer transition-all hover:scale-105">
                  <Upload className="w-4 h-4" />
                  <span>Pilih File Dari Komputer (.xlsx, .xls, .csv)</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Mode 2: Direct Clipboard Paste */}
          {activeMode === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tempel Baris Data dari Excel / Google Sheets (Ctrl+V):
                </span>
                <span className="text-[11px] text-slate-400">
                  Mendukung pemisah Tab (Excel), Koma (CSV), atau Titik Koma (;)
                </span>
              </div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={
                  entityType === 'assets'
                    ? `Contoh:\nAsset ID\tNama Aset\tSerial Number\tStatus\tBiaya\tLokasi\tPengguna\nAST-001\tATM Senayan\tSN100234\tactive\t15000000\nAST-002\tPC Teller\tSN100235\tactive\t8500000`
                    : `Contoh:\nNama Lengkap\tPN\tEmail\tDepartemen\tJabatan\nBudi Santoso\t00385617\tbudi@bri.co.id\tIT\tStaf IT`
                }
                className="w-full h-36 p-3.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Proses Data Teks</span>
                </button>
                {rawRows.length > 0 && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs font-semibold text-rose-500 hover:underline"
                  >
                    Hapus Input
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mode 3: Template Download */}
          {activeMode === 'template' && (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>
                    Download Template{' '}
                    {entityType === 'assets'
                      ? `Lengkap Khusus ${currentType?.name}`
                      : entityType === 'employees'
                      ? 'Master Pengguna / Karyawan'
                      : 'Master Lokasi & Ruangan'}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                  {entityType === 'assets' ? (
                    <>
                      Template ini memuat seluruh kolom standar ditambah custom field milik {currentType?.name}:{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {currentType?.fields.map((f) => f.field_name).join(', ') || 'Standar'}
                      </span>.
                    </>
                  ) : (
                    'Template resmi dengan contoh data yang valid siap diisi dan di-upload kembali.'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('xlsx')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Format Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('csv')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Format CSV (.csv)</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Validation & Preview Table */}
          {rawRows.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Preview Data ({rawRows.length} Baris Ditemukan)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    {processedData.validCount} Valid Siap Impor
                  </span>
                  {processedData.errors.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                      {processedData.errors.length} Error
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {entityType === 'assets' && (
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoGenTag}
                        onChange={(e) => setAutoGenTag(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Generate Asset ID jika kosong</span>
                    </label>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowMappingConfig(!showMappingConfig)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{showMappingConfig ? 'Sembunyikan Pemetaan' : 'Konfigurasi Kolom'}</span>
                  </button>
                </div>
              </div>

              {/* Column Mapping Inspector */}
              {showMappingConfig && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3 animate-fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Pemetaan Kolom File ke Kolom Database LABUAN HEBAT:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Semua custom field dapat dicocokkan di sini
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {Object.keys(rawRows[0] || {}).map((fileHeader) => (
                      <div
                        key={fileHeader}
                        className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                      >
                        <span className="font-mono truncate max-w-[120px]" title={fileHeader}>
                          {fileHeader}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-bold text-emerald-600 truncate max-w-[120px]">
                          {columnMapping[fileHeader] || fileHeader}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error messages if any */}
              {processedData.errors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 space-y-1 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Ditemukan kesalahan baris data:</span>
                  </div>
                  {processedData.errors.map((err, i) => (
                    <div key={i} className="pl-5 text-[11px]">
                      • {err}
                    </div>
                  ))}
                </div>
              )}

              {/* Table Preview */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-64 overflow-y-auto bg-white dark:bg-slate-900 shadow-inner">
                {entityType === 'assets' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-2.5 pl-4">#</th>
                        <th className="p-2.5">Asset ID</th>
                        <th className="p-2.5">Nama Aset</th>
                        <th className="p-2.5">Serial Number</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Biaya (IDR)</th>
                        <th className="p-2.5 pr-4">Custom Fields Terisi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                      {processedData.assetsData.slice(0, 15).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2.5 pl-4 text-slate-400">{i + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                            {row.asset_tag}
                          </td>
                          <td className="p-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">
                            {row.name}
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">
                            {row.serial_number || '-'}
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                              {row.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">
                            {row.purchase_cost?.toLocaleString('id-ID') || '0'}
                          </td>
                          <td className="p-2.5 pr-4 text-slate-500 truncate max-w-[220px]">
                            {Object.entries(row.custom_values || {})
                              .filter(([k]) => !k.includes('_'))
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' | ') || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {entityType === 'employees' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-2.5 pl-4">#</th>
                        <th className="p-2.5">Nama Lengkap</th>
                        <th className="p-2.5">PN (Personal Number)</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Departemen</th>
                        <th className="p-2.5 pr-4">Jabatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                      {processedData.employeesData.slice(0, 15).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2.5 pl-4 text-slate-400 font-mono">{i + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                            {row.full_name}
                          </td>
                          <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">
                            {row.nip}
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400 font-mono">
                            {row.email}
                          </td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">
                            {row.department}
                          </td>
                          <td className="p-2.5 pr-4 text-slate-500">
                            {row.job_title}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {entityType === 'locations' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-2.5 pl-4">#</th>
                        <th className="p-2.5">Nama Lokasi</th>
                        <th className="p-2.5">Kode</th>
                        <th className="p-2.5">Tipe Hierarki</th>
                        <th className="p-2.5 pr-4">Alamat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                      {processedData.locationsData.slice(0, 15).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2.5 pl-4 text-slate-400 font-mono">{i + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                            {row.name}
                          </td>
                          <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">
                            {row.code}
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400">
                              {row.type}
                            </span>
                          </td>
                          <td className="p-2.5 pr-4 text-slate-500">
                            {row.address || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {processedData.validCount > 15 && (
                <p className="text-[11px] text-slate-400 text-center italic">
                  Menampilkan 15 baris pertama dari total {processedData.validCount} baris siap diimpor.
                </p>
              )}
            </div>
          )}

          {/* Success / Error notification banner */}
          {importResult && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 ${
                importResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              {importResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div className="text-xs">
                <span className="font-bold">
                  {importResult.success
                    ? `Berhasil mengimpor ${importResult.count} data ke sistem LABUAN HEBAT!`
                    : 'Gagal mengimpor data.'}
                </span>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {importResult.success
                    ? 'Data telah tersimpan rapi. Menutup modal...'
                    : importResult.errors.join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
          <button
            type="button"
            onClick={resetForm}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Reset Data Input
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={processedData.validCount === 0}
              onClick={handleExecuteImport}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                processedData.validCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-105'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Impor {processedData.validCount} Data Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
