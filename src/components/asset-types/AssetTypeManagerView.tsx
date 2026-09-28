import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  MoveUp,
  MoveDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  Eye,
  Settings,
  Sparkles,
  ArrowRight,
  X,
  Type,
  Hash,
  Mail,
  Phone,
  AlignLeft,
  Calendar,
  Clock,
  List,
  Radio,
  CheckSquare,
  Image,
  File,
  Globe,
  Network,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AssetType, AssetFieldDefinition, CustomFieldType } from '../../types';
import { getFieldTypeLabel } from '../../utils';
import { IconRenderer } from '../common/IconRenderer';

export const AssetTypeManagerView: React.FC = () => {
  const {
    assetTypes,
    assets,
    addAssetType,
    updateAssetType,
    deleteAssetType,
    addFieldToAssetType,
    updateFieldInAssetType,
    deleteFieldFromAssetType,
    hasPermission,
    setActiveTab,
    setFilterAssetTypeId,
  } = useApp();

  const [selectedTypeId, setSelectedTypeId] = useState<string>(assetTypes[0]?.id || '');

  // Modal: Create New Asset Type
  const [isNewTypeModalOpen, setIsNewTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCode, setNewTypeCode] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [newTypeIcon, setNewTypeIcon] = useState('Box');
  const [newTypeColor, setNewTypeColor] = useState('#4f46e5');

  // Modal: Add Field to Asset Type
  const [isNewFieldModalOpen, setIsNewFieldModalOpen] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [fieldCode, setFieldCode] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldType>('text');
  const [isRequired, setIsRequired] = useState(false);
  const [isUnique, setIsUnique] = useState(false);
  const [fieldOptions, setFieldOptions] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [helpText, setHelpText] = useState('');

  // Edit Field state
  const [editingField, setEditingField] = useState<AssetFieldDefinition | null>(null);

  const selectedType = assetTypes.find((t) => t.id === selectedTypeId) || assetTypes[0];

  const fieldTypeIcons: Record<CustomFieldType, any> = {
    text: Type,
    number: Hash,
    email: Mail,
    phone: Phone,
    textarea: AlignLeft,
    date: Calendar,
    datetime: Clock,
    select: List,
    radio: Radio,
    checkbox: CheckSquare,
    image: Image,
    file: File,
    url: Globe,
    ip_address: Network,
  };

  const handleCreateType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim() || !newTypeCode.trim()) return;

    const created = addAssetType({
      name: newTypeName.trim(),
      code: newTypeCode.trim().toUpperCase(),
      description: newTypeDesc.trim(),
      icon: newTypeIcon,
      color: newTypeColor,
      is_active: true,
      fields: [
        {
          id: '',
          asset_type_id: '',
          field_name: 'Serial Number',
          field_code: 'serial_number',
          field_type: 'text',
          is_required: true,
          is_unique: true,
          sort_order: 1,
          placeholder: 'SN-XXXXX',
        },
      ],
    });

    setSelectedTypeId(created.id);
    setIsNewTypeModalOpen(false);
    setNewTypeName('');
    setNewTypeCode('');
    setNewTypeDesc('');
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim() || !selectedType) return;

    const code = fieldCode.trim() || fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const optionsArray = fieldOptions
      ? fieldOptions
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    addFieldToAssetType(selectedType.id, {
      field_name: fieldName.trim(),
      field_code: code,
      field_type: fieldType,
      is_required: isRequired,
      is_unique: isUnique,
      options: optionsArray,
      sort_order: selectedType.fields.length + 1,
      placeholder: placeholder.trim() || undefined,
      help_text: helpText.trim() || undefined,
    });

    setIsNewFieldModalOpen(false);
    setFieldName('');
    setFieldCode('');
    setFieldType('text');
    setIsRequired(false);
    setIsUnique(false);
    setFieldOptions('');
    setPlaceholder('');
    setHelpText('');
  };

  const handleUpdateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField || !selectedType) return;

    const optionsArray = fieldOptions
      ? fieldOptions
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    updateFieldInAssetType(selectedType.id, editingField.id, {
      field_name: fieldName.trim(),
      field_type: fieldType,
      is_required: isRequired,
      is_unique: isUnique,
      options: optionsArray,
      placeholder: placeholder.trim() || undefined,
      help_text: helpText.trim() || undefined,
    });

    setEditingField(null);
  };

  const openEditFieldModal = (field: AssetFieldDefinition) => {
    setEditingField(field);
    setFieldName(field.field_name);
    setFieldCode(field.field_code);
    setFieldType(field.field_type);
    setIsRequired(field.is_required);
    setIsUnique(field.is_unique);
    setFieldOptions(field.options?.join(', ') || '');
    setPlaceholder(field.placeholder || '');
    setHelpText(field.help_text || '');
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (!selectedType) return;
    const fields = [...selectedType.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const temp = fields[index];
    fields[index] = fields[targetIndex];
    fields[targetIndex] = temp;

    fields.forEach((f, i) => {
      f.sort_order = i + 1;
    });

    updateAssetType(selectedType.id, { fields });
  };

  const typeAssetsCount = assets.filter((a) => a.asset_type_id === selectedType?.id).length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Jenis Asset & Dynamic Custom Fields
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">
              CORE ENGINE
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Buat dan sesuaikan tipe aset (ATM, Server, PC, Laptop, EDC) beserta kolom kustom dinamis
          </p>
        </div>

        {hasPermission('manage_types') && (
          <button
            onClick={() => setIsNewTypeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs md:text-sm font-semibold shadow-md shadow-brand-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Jenis Aset Baru</span>
          </button>
        )}
      </div>

      {/* Main Layout: Left Sidebar Types List, Right Field Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Asset Types Selector (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daftar Jenis Aset ({assetTypes.length})
            </span>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {assetTypes.map((t) => {
              const count = assets.filter((a) => a.asset_type_id === t.id).length;
              const isSelected = selectedTypeId === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTypeId(t.id)}
                  className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-500/50 shadow-sm'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                      style={{ backgroundColor: t.color || '#4f46e5' }}
                    >
                      <IconRenderer name={t.icon} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white truncate">
                          {t.name}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                          {t.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {t.fields.length} dynamic fields • {count} aset terdata
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected
                        ? 'text-brand-600 dark:text-brand-400 translate-x-1'
                        : 'text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Dynamic Custom Field Builder for Selected Type (8 cols) */}
        {selectedType && (
          <div className="lg:col-span-8 space-y-6">
            {/* Type Header Info */}
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                  style={{ backgroundColor: selectedType.color || '#4f46e5' }}
                >
                  <IconRenderer name={selectedType.icon} className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {selectedType.name} ({selectedType.code})
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedType.description || 'Kategori kustom terdefinisi dalam sistem.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFilterAssetTypeId(selectedType.id);
                    setActiveTab('assets');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                >
                  Lihat {typeAssetsCount} Aset
                </button>

                {hasPermission('manage_types') && (
                  <button
                    onClick={() => setIsNewFieldModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Field</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Fields Table */}
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Dynamic Custom Fields ({selectedType.fields.length} Kolom)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Urutan dan konfigurasi kolom yang akan tampil saat menambah atau mengedit aset {selectedType.name}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {selectedType.fields.map((field, idx) => {
                  const Icon = fieldTypeIcons[field.field_type] || Type;

                  return (
                    <div
                      key={field.id}
                      className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between gap-3 hover:border-brand-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Sort Order buttons */}
                        <div className="flex flex-col gap-0.5 text-slate-400">
                          <button
                            onClick={() => moveField(idx, 'up')}
                            disabled={idx === 0}
                            className="hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                            title="Geser ke atas"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveField(idx, 'down')}
                            disabled={idx === selectedType.fields.length - 1}
                            className="hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                            title="Geser ke bawah"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Icon */}
                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {field.field_name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              [{field.field_code}]
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                            <span className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-semibold">
                              {getFieldTypeLabel(field.field_type)}
                            </span>
                            {field.is_required && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-bold">
                                REQUIRED
                              </span>
                            )}
                            {field.is_unique && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 font-bold">
                                UNIQUE
                              </span>
                            )}
                            {field.options && field.options.length > 0 && (
                              <span className="text-slate-400 truncate max-w-xs">
                                Opsi: {field.options.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {hasPermission('manage_types') && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditFieldModal(field)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg"
                            title="Edit Field"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus kolom '${field.field_name}' dari jenis aset ini?`)) {
                                deleteFieldFromAssetType(selectedType.id, field.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg"
                            title="Hapus Field"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Live Preview Box */}
            <div className="p-5 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-brand-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Live Form Preview (Tampilan Input Pengguna)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Pratinjau form dinamis secara instan
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {selectedType.fields.map((f) => (
                  <div key={f.id} className={f.field_type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      {f.field_name} {f.is_required && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder={f.placeholder || `Input ${f.field_name}...`}
                      className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: CREATE NEW ASSET TYPE */}
      {isNewTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Buat Jenis Aset IT Baru
            </h3>
            <form onSubmit={handleCreateType} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Jenis Aset <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTypeName}
                  onChange={(e) => {
                    setNewTypeName(e.target.value);
                    if (!newTypeCode) {
                      setNewTypeCode(e.target.value.slice(0, 4).toUpperCase());
                    }
                  }}
                  placeholder="Contoh: UPS, Access Point, Mesin EDC"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Kode Awalan (Tag Prefix) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTypeCode}
                  onChange={(e) => setNewTypeCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: UPS, AP, EDC"
                  className="w-full font-mono font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Deskripsi / Keterangan
                </label>
                <textarea
                  rows={2}
                  value={newTypeDesc}
                  onChange={(e) => setNewTypeDesc(e.target.value)}
                  placeholder="Penjelasan fungsi perangkat IT ini"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Ikon Lucide
                  </label>
                  <select
                    value={newTypeIcon}
                    onChange={(e) => setNewTypeIcon(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Box">Box / Standar</option>
                    <option value="Server">Server</option>
                    <option value="Printer">Printer</option>
                    <option value="Network">Router / Switch</option>
                    <option value="Camera">Camera CCTV</option>
                    <option value="CreditCard">Mesin EDC / ATM</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Monitor">Monitor / PC</option>
                    <option value="Smartphone">Smartphone</option>
                    <option value="HardDrive">Storage / HDD</option>
                    <option value="Wifi">Access Point / Wifi</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Warna Label
                  </label>
                  <input
                    type="color"
                    value={newTypeColor}
                    onChange={(e) => setNewTypeColor(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTypeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30"
                >
                  Buat Jenis Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT DYNAMIC FIELD */}
      {(isNewFieldModalOpen || editingField) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {editingField ? `Edit Kolom: ${editingField.field_name}` : `Tambah Field Baru untuk ${selectedType?.name}`}
            </h3>

            <form onSubmit={editingField ? handleUpdateField : handleAddField} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Field / Label Kolom <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fieldName}
                  onChange={(e) => {
                    setFieldName(e.target.value);
                    if (!editingField && !fieldCode) {
                      setFieldCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                    }
                  }}
                  placeholder="Contoh: TID, Alamat IP, Kapasitas RAM"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {!editingField && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Kode Field (Key Database) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fieldCode}
                    onChange={(e) => setFieldCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="tid / ip_address / ram_capacity"
                    className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}

              {/* 14 Field Types Selection Grid */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Tipe Data Field <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50">
                  {(
                    [
                      'text',
                      'number',
                      'email',
                      'phone',
                      'textarea',
                      'date',
                      'datetime',
                      'select',
                      'radio',
                      'checkbox',
                      'image',
                      'file',
                      'url',
                      'ip_address',
                    ] as CustomFieldType[]
                  ).map((t) => {
                    const Icon = fieldTypeIcons[t];
                    const isSelected = fieldType === t;

                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setFieldType(t)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-500/40'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="capitalize truncate">{getFieldTypeLabel(t)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Options input if select, radio, checkbox */}
              {(fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox') && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Daftar Pilihan (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={fieldOptions}
                    onChange={(e) => setFieldOptions(e.target.value)}
                    placeholder="Contoh: 8 GB, 16 GB, 32 GB, 64 GB"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}

              {/* Validation Checkboxes: Required & Unique */}
              <div className="flex items-center gap-6 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Required (Wajib diisi)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUnique}
                    onChange={(e) => setIsUnique(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Unique (Tidak boleh kembar)</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Placeholder Form
                  </label>
                  <input
                    type="text"
                    value={placeholder}
                    onChange={(e) => setPlaceholder(e.target.value)}
                    placeholder="10.10.10.10"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Petunjuk Pengisian (Help Text)
                  </label>
                  <input
                    type="text"
                    value={helpText}
                    onChange={(e) => setHelpText(e.target.value)}
                    placeholder="Masukkan IP statis VLAN"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewFieldModalOpen(false);
                    setEditingField(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30"
                >
                  {editingField ? 'Simpan Perubahan' : 'Tambahkan Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
