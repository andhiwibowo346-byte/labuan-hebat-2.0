import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Box, Upload, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Asset, AssetStatus, CustomFieldType } from '../../types';

interface AssetFormModalProps {
  isOpen: boolean;
  assetToEdit?: Asset | null;
  onClose: () => void;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  assetToEdit,
  onClose,
}) => {
  const { assetTypes, locations, employees, assets, addAsset, updateAsset } = useApp();

  const isEditMode = Boolean(assetToEdit);

  // Form states
  const [assetTypeId, setAssetTypeId] = useState<string>('');
  const [assetTag, setAssetTag] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [status, setStatus] = useState<AssetStatus>('active');
  const [locationId, setLocationId] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [purchaseCost, setPurchaseCost] = useState<number | ''>('');
  const [warrantyExpiry, setWarrantyExpiry] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [primaryPhoto, setPrimaryPhoto] = useState<string>('');

  // Dynamic Custom Values state
  const [customValues, setCustomValues] = useState<Record<string, any>>({});

  // Validation Error message
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) return;

    if (assetToEdit) {
      setAssetTypeId(assetToEdit.asset_type_id);
      setAssetTag(assetToEdit.asset_tag);
      setName(assetToEdit.name);
      setSerialNumber(assetToEdit.serial_number || '');
      setStatus(assetToEdit.status);
      setLocationId(assetToEdit.location_id || '');
      setEmployeeId(assetToEdit.employee_id || '');
      setPurchaseDate(assetToEdit.purchase_date || '');
      setPurchaseCost(assetToEdit.purchase_cost || '');
      setWarrantyExpiry(assetToEdit.warranty_expiry || '');
      setNotes(assetToEdit.notes || '');
      setPrimaryPhoto(assetToEdit.primary_photo || '');
      setCustomValues(assetToEdit.custom_values || {});
      setErrorMsg(null);
    } else {
      // Create mode
      const defaultType = assetTypes[0]?.id || '';
      setAssetTypeId(defaultType);

      // Auto generate tag based on type code
      const currentTypeObj = assetTypes.find((t) => t.id === defaultType);
      const prefix = currentTypeObj?.code || 'AST';
      const count = assets.filter((a) => a.asset_type_id === defaultType).length + 1;
      setAssetTag(`${prefix}-${String(count).padStart(3, '0')}`);

      setName('');
      setSerialNumber('');
      setStatus('active');
      setLocationId(locations[0]?.id || '');
      setEmployeeId('');
      setPurchaseDate(new Date().toISOString().slice(0, 10));
      setPurchaseCost('');
      setWarrantyExpiry('');
      setNotes('');
      setPrimaryPhoto('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80');
      setCustomValues({});
      setErrorMsg(null);
    }
  }, [isOpen, assetToEdit, assetTypes]);

  // When asset type changes in Create mode, auto-generate asset tag
  const handleTypeChange = (newTypeId: string) => {
    setAssetTypeId(newTypeId);
    if (!isEditMode) {
      const typeObj = assetTypes.find((t) => t.id === newTypeId);
      const prefix = typeObj?.code || 'AST';
      const count = assets.filter((a) => a.asset_type_id === newTypeId).length + 1;
      setAssetTag(`${prefix}-${String(count).padStart(3, '0')}`);
      setCustomValues({});
    }
  };

  const handleCustomFieldChange = (fieldCode: string, value: any) => {
    setCustomValues((prev) => ({
      ...prev,
      [fieldCode]: value,
    }));
  };

  const currentType = assetTypes.find((t) => t.id === assetTypeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Basic validation
    if (!assetTag.trim()) {
      setErrorMsg('Asset ID / Tag wajib diisi.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Nama Aset wajib diisi.');
      return;
    }

    // 2. Uniqueness check on asset_tag
    const duplicateTag = assets.find(
      (a) => a.asset_tag.toLowerCase() === assetTag.trim().toLowerCase() && a.id !== assetToEdit?.id
    );
    if (duplicateTag) {
      setErrorMsg(`Asset ID '${assetTag}' sudah digunakan oleh aset: ${duplicateTag.name}`);
      return;
    }

    // 3. Dynamic fields validation: Required & Unique checks
    if (currentType?.fields) {
      for (const field of currentType.fields) {
        const val = customValues[field.field_code];

        // Required check
        if (field.is_required) {
          if (val === undefined || val === null || String(val).trim() === '') {
            setErrorMsg(`Kolom '${field.field_name}' wajib diisi.`);
            return;
          }
        }

        // Unique check
        if (field.is_unique && val && String(val).trim() !== '') {
          const duplicate = assets.find(
            (a) =>
              a.asset_type_id === assetTypeId &&
              a.id !== assetToEdit?.id &&
              a.custom_values?.[field.field_code] &&
              String(a.custom_values[field.field_code]).toLowerCase().trim() ===
                String(val).toLowerCase().trim()
          );
          if (duplicate) {
            setErrorMsg(
              `Nilai '${val}' pada kolom '${field.field_name}' sudah terdaftar pada aset: ${duplicate.asset_tag} (${duplicate.name})!`
            );
            return;
          }
        }
      }
    }

    if (isEditMode && assetToEdit) {
      updateAsset(
        assetToEdit.id,
        {
          asset_type_id: assetTypeId,
          asset_tag: assetTag.trim(),
          name: name.trim(),
          serial_number: serialNumber.trim(),
          status,
          location_id: locationId || undefined,
          employee_id: employeeId || undefined,
          purchase_date: purchaseDate || undefined,
          purchase_cost: purchaseCost ? Number(purchaseCost) : undefined,
          warranty_expiry: warrantyExpiry || undefined,
          notes: notes.trim(),
          primary_photo: primaryPhoto.trim() || undefined,
          custom_values: customValues,
        },
        'Memperbarui data dan spesifikasi aset'
      );
    } else {
      addAsset(
        {
          asset_type_id: assetTypeId,
          asset_tag: assetTag.trim(),
          name: name.trim(),
          serial_number: serialNumber.trim(),
          status,
          location_id: locationId || undefined,
          employee_id: employeeId || undefined,
          purchase_date: purchaseDate || undefined,
          purchase_cost: purchaseCost ? Number(purchaseCost) : undefined,
          warranty_expiry: warrantyExpiry || undefined,
          notes: notes.trim(),
          primary_photo: primaryPhoto.trim() || undefined,
          custom_values: customValues,
        },
        primaryPhoto
          ? [
              {
                id: `p-${Date.now()}`,
                asset_id: '',
                url: primaryPhoto,
                caption: 'Foto Utama Unit',
                uploaded_at: new Date().toISOString(),
              },
            ]
          : []
      );
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {isEditMode ? `Edit Aset: ${assetToEdit?.asset_tag}` : 'Tambah Aset IT Baru'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Lengkapi informasi umum dan dynamic custom fields
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-slide-up">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Informasi Dasar */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              1. Informasi Identitas Aset
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Asset Type */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Jenis Aset <span className="text-rose-500">*</span>
                </label>
                <select
                  disabled={isEditMode}
                  value={assetTypeId}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                >
                  {assetTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset Tag / ID */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Asset ID / Tag <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  placeholder="Contoh: ATM-001"
                  className="w-full font-mono font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-brand-600 dark:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Status Operasional <span className="text-rose-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AssetStatus)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="active">Aktif</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="damaged">Rusak</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="lost">Hilang</option>
                  <option value="disposed">Dilelang / Afkir</option>
                </select>
              </div>

              {/* Nama Aset */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Aset <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: ATM Menara Sudirman 01 / MacBook Pro 16 M3"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Serial Number */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Serial Number (SN)
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="SN123456 / C02G9981MD6R"
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Lokasi */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Lokasi Terpasang
                </label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Pilih Lokasi --</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pengguna / Employee */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ditugaskan Kepada (Pengguna)
                </label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Belum Ditugaskan --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} (PN: {emp.nip}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Foto Utama URL */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  URL Foto Utama
                </label>
                <input
                  type="url"
                  value={primaryPhoto}
                  onChange={(e) => setPrimaryPhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: DYNAMIC CUSTOM FIELDS (Fitur Utama Requirement 2) */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  2. Dynamic Custom Fields ({currentType?.name})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Field dinamis sesuai konfigurasi tipe aset tanpa perubahan struktur database
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold">
                {currentType?.fields.length || 0} Dynamic Columns
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentType?.fields.map((field) => {
                const val = customValues[field.field_code] ?? '';

                return (
                  <div
                    key={field.id}
                    className={`p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 ${
                      field.field_type === 'textarea' ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <span>{field.field_name}</span>
                        {field.is_required && <span className="text-rose-500">*</span>}
                      </label>
                      <div className="flex items-center gap-1.5">
                        {field.is_unique && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600">
                            UNIQUE
                          </span>
                        )}
                        <span className="text-[9px] font-mono uppercase text-slate-400">
                          {field.field_type}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Field Renderer according to field_type */}
                    {field.field_type === 'textarea' ? (
                      <textarea
                        rows={2}
                        value={val}
                        onChange={(e) => handleCustomFieldChange(field.field_code, e.target.value)}
                        placeholder={field.placeholder || ''}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    ) : field.field_type === 'select' ? (
                      <select
                        value={val}
                        onChange={(e) => handleCustomFieldChange(field.field_code, e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">-- Pilih {field.field_name} --</option>
                        {field.options?.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.field_type === 'radio' ? (
                      <div className="flex flex-wrap gap-3 mt-1">
                        {field.options?.map((opt, i) => (
                          <label key={i} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <input
                              type="radio"
                              name={field.field_code}
                              checked={val === opt}
                              onChange={() => handleCustomFieldChange(field.field_code, opt)}
                              className="text-brand-600 focus:ring-brand-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.field_type === 'checkbox' ? (
                      <label className="flex items-center gap-2 mt-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={(e) => handleCustomFieldChange(field.field_code, e.target.checked)}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Aktifkan / Checklist</span>
                      </label>
                    ) : field.field_type === 'date' ? (
                      <input
                        type="date"
                        value={val}
                        onChange={(e) => handleCustomFieldChange(field.field_code, e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    ) : field.field_type === 'datetime' ? (
                      <input
                        type="datetime-local"
                        value={val}
                        onChange={(e) => handleCustomFieldChange(field.field_code, e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    ) : field.field_type === 'number' ? (
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => handleCustomFieldChange(field.field_code, e.target.value)}
                        placeholder={field.placeholder || ''}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    ) : field.field_type === 'ip_address' ? (
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleCustomFieldChange(field.field_code, e.target.value)}
                        placeholder={field.placeholder || '10.10.10.10'}
                        className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    ) : (
                      <input
                        type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : 'text'}
                        value={val}
                        onChange={(e) => handleCustomFieldChange(field.field_code, e.target.value)}
                        placeholder={field.placeholder || ''}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    )}

                    {field.help_text && (
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {field.help_text}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Finansial & Garansi */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              3. Finansial & Masa Garansi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Biaya Pengadaan (IDR)
                </label>
                <input
                  type="number"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: 175000000"
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tanggal Pengadaan
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Batas Waktu Garansi (Warranty)
                </label>
                <input
                  type="date"
                  value={warrantyExpiry}
                  onChange={(e) => setWarrantyExpiry(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Catatan / Keterangan Umum
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan kondisi fisik, kelengkapan, dll."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isEditMode ? 'Simpan Perubahan' : 'Tambahkan Aset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
