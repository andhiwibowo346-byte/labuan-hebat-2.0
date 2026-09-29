import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Building,
  Home,
  Layers,
  Search,
  FileSpreadsheet,
  AlertTriangle,
  X,
  CheckCircle2,
  Building2,
  DoorOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LocationNode, LocationType } from '../../types';

export const LocationManagerView: React.FC<{ onOpenQuickExcel?: () => void }> = ({
  onOpenQuickExcel,
}) => {
  const { locations, assets, addLocation, deleteLocation, hasPermission } = useApp();

  // Tab mode: 'units' (Daftar Unit Kerja) or 'hierarchy' (Pohon Hirarki Lengkap)
  const [activeView, setActiveView] = useState<'units' | 'hierarchy'>('units');

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'loc-reg-lbn': true,
    'loc-area-lbn': true,
    'loc-br-lbn': true,
    'loc-br-crg': true,
    'loc-br-cbl': true,
    'loc-br-mns': true,
    'loc-br-sbg': true,
    'loc-br-cks': true,
  });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<LocationNode | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [targetType, setTargetType] = useState<LocationType>('room');
  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast / feedback message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Open modal for adding a room or sub-location under a specific parent
  const openAddChildModal = (parent: LocationNode) => {
    setSelectedParentId(parent.id);
    const nextType: Record<LocationType, LocationType> = {
      region: 'area',
      area: 'branch',
      branch: 'room',
      room: 'room',
    };
    setTargetType(nextType[parent.type]);
    setLocName('');
    setLocCode('');
    setLocAddress('');
    setIsAddModalOpen(true);
  };

  // Open modal specifically for adding a new Unit Kerja
  const openAddUnitModal = () => {
    // Find or fallback to primary area
    const primaryArea = locations.find((l) => l.type === 'area') || locations.find((l) => l.type === 'region') || null;
    setSelectedParentId(primaryArea?.id || null);
    setTargetType('branch');
    setLocName('');
    setLocCode('');
    setLocAddress('');
    setIsAddUnitModalOpen(true);
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim() || !locCode.trim()) return;

    const newLoc = addLocation({
      name: locName.trim(),
      code: locCode.trim().toUpperCase(),
      type: targetType,
      parent_id: selectedParentId,
      address: locAddress.trim() || undefined,
    });

    if (selectedParentId) {
      setExpandedNodes((prev) => ({ ...prev, [selectedParentId]: true }));
    }

    setIsAddModalOpen(false);
    setIsAddUnitModalOpen(false);
    setLocName('');
    setLocCode('');
    setLocAddress('');
    showFeedback('success', `Lokasi "${newLoc.name}" (${newLoc.code}) berhasil ditambahkan!`);
  };

  const handleConfirmDelete = () => {
    if (!locationToDelete) return;
    const name = locationToDelete.name;
    const code = locationToDelete.code;
    deleteLocation(locationToDelete.id);
    setLocationToDelete(null);
    showFeedback('success', `Lokasi/Unit Kerja "${name}" [${code}] berhasil dihapus.`);
  };

  // Group locations hierarchically
  const regions = locations.filter((l) => l.type === 'region');
  const getAreas = (regionId: string) => locations.filter((l) => l.parent_id === regionId);
  const getBranches = (areaId: string) => locations.filter((l) => l.parent_id === areaId);
  const getRooms = (branchId: string) => locations.filter((l) => l.parent_id === branchId);

  // All Unit Kerja (branches) across all areas
  const allUnitKerja = locations.filter((l) => l.type === 'branch');

  const getAssetsCount = (locId: string) => {
    const allChildIds = [locId];
    const findChildren = (pid: string) => {
      const children = locations.filter((l) => l.parent_id === pid);
      children.forEach((c) => {
        allChildIds.push(c.id);
        findChildren(c.id);
      });
    };
    findChildren(locId);

    return assets.filter((a) => a.location_id && allChildIds.includes(a.location_id)).length;
  };

  // Count sub-nodes that will be affected by deleting this location
  const getDescendantCount = (locId: string) => {
    let count = 0;
    const countChildren = (pid: string) => {
      const children = locations.filter((l) => l.parent_id === pid);
      count += children.length;
      children.forEach((c) => countChildren(c.id));
    };
    countChildren(locId);
    return count;
  };

  const filteredLocations = searchQuery.trim()
    ? locations.filter(
        (l) =>
          l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const filteredUnits = searchQuery.trim()
    ? allUnitKerja.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.address && u.address.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allUnitKerja;

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Toast Feedback Alert */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border shadow-xl flex items-center gap-3 text-xs md:text-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/90 border-rose-500/30 text-rose-800 dark:text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Manajemen Lokasi & Unit Kerja
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              BRI KANCA LABUAN
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola Kantor Cabang (BO), Kantor Unit Kerja (Caringin, Cibaliung, Menes, Sobang, Cikeusik), serta ruangan kerja.
          </p>
        </div>

        {hasPermission('manage_assets') && (
          <div className="flex flex-wrap items-center gap-2">
            {onOpenQuickExcel && (
              <button
                onClick={onOpenQuickExcel}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
                title="Import Lokasi & Ruangan via Excel / CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Import Excel / CSV</span>
              </button>
            )}

            {/* Tombol Tambah Unit Kerja */}
            <button
              onClick={openAddUnitModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs md:text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Building2 className="w-4 h-4" />
              <span>+ Tambah Unit Kerja</span>
            </button>

            {/* Tombol Tambah Lokasi Lain */}
            <button
              onClick={() => {
                setSelectedParentId(null);
                setTargetType('region');
                setLocName('');
                setLocCode('');
                setLocAddress('');
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs md:text-sm font-semibold shadow-md shadow-brand-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lokasi</span>
            </button>
          </div>
        )}
      </div>

      {/* View Switcher Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Toggle View */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl max-w-fit border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveView('units')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'units'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Daftar Unit Kerja BRI ({allUnitKerja.length})</span>
          </button>
          <button
            onClick={() => setActiveView('hierarchy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'hierarchy'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Pohon Hirarki Lengkap ({locations.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Unit Kerja, kode, atau ruangan..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs md:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: DAFTAR UNIT KERJA BRI (BO LABUAN & KANTOR UNIT) */}
      {/* ======================================================== */}
      {activeView === 'units' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Unit Kerja Operasional BRI Labuan ({filteredUnits.length} Unit)
            </h2>
            <span className="text-[11px] text-slate-400">
              Termasuk BO LABUAN, Unit Caringin, Cibaliung, Menes, Sobang, Cikeusik
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnits.map((unit) => {
              const rooms = getRooms(unit.id);
              const assetCount = getAssetsCount(unit.id);
              const isBO = unit.name.toUpperCase().includes('BO LABUAN') || unit.code.includes('BO');

              return (
                <div
                  key={unit.id}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                            isBO
                              ? 'bg-gradient-to-tr from-brand-600 to-indigo-600'
                              : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                          }`}
                        >
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              isBO
                                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {isBO ? 'Branch Office (BO)' : 'BRI Unit'}
                          </span>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight mt-1">
                            {unit.name}
                          </h3>
                          <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                            {unit.code}
                          </span>
                        </div>
                      </div>

                      {/* Delete Unit Kerja Button */}
                      {hasPermission('manage_assets') && (
                        <button
                          onClick={() => setLocationToDelete(unit)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                          title={`Hapus Unit Kerja ${unit.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {unit.address && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">
                        {unit.address}
                      </p>
                    )}

                    {/* Stats pills */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-center">
                        <span className="text-[10px] text-slate-400 block">Ruangan</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                          {rooms.length}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-center">
                        <span className="text-[10px] text-slate-400 block">Total Aset</span>
                        <span className="text-sm font-black text-brand-600 dark:text-brand-400 font-mono">
                          {assetCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rooms list in this unit */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto pr-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <span>Ruangan / Lokasi</span>
                        <span>Aset</span>
                      </div>

                      {rooms.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2 text-center">
                          Belum ada ruangan terdaftar di unit ini.
                        </p>
                      ) : (
                        rooms.map((room) => {
                          const roomAssets = assets.filter((a) => a.location_id === room.id).length;
                          return (
                            <div
                              key={room.id}
                              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs group/room"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <DoorOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                  {room.name}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                  [{room.code}]
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {roomAssets}
                                </span>

                                {hasPermission('manage_assets') && (
                                  <button
                                    onClick={() => setLocationToDelete(room)}
                                    className="p-1 text-slate-300 hover:text-rose-500 rounded opacity-0 group-hover/room:opacity-100 transition-opacity"
                                    title={`Hapus ${room.name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Bottom card button: Add room inside this unit */}
                    {hasPermission('manage_assets') && (
                      <button
                        onClick={() => openAddChildModal(unit)}
                        className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 text-slate-600 dark:text-slate-400 hover:text-brand-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all bg-white dark:bg-slate-900"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Ruangan di {unit.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: POHON HIRARKI LENGKAP (TREE VIEW)               */}
      {/* ======================================================== */}
      {activeView === 'hierarchy' && (
        <div className="space-y-4">
          {filteredLocations ? (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Hasil Pencarian Lokasi ({filteredLocations.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400">
                          {loc.code}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {loc.type}
                          </span>
                          {hasPermission('manage_assets') && (
                            <button
                              onClick={() => setLocationToDelete(loc)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Hapus lokasi ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                        {loc.name}
                      </h4>
                      {loc.address && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{loc.address}</p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Aset terdaftar:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {getAssetsCount(loc.id)} unit
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Struktur Organisasi & Lokasi Berjenjang
                </span>
                <span className="text-[11px] text-slate-400">
                  Total {locations.length} Lokasi Terdaftar
                </span>
              </div>

              <div className="space-y-3">
                {regions.map((region) => {
                  const isRegionExpanded = expandedNodes[region.id];
                  const areas = getAreas(region.id);
                  const regionAssetCount = getAssetsCount(region.id);

                  return (
                    <div
                      key={region.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 overflow-hidden"
                    >
                      {/* Level 1: Region */}
                      <div className="p-3.5 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleExpand(region.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {isRegionExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>

                          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                            <MapPin className="w-4 h-4" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">
                                {region.name}
                              </span>
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 font-bold">
                                {region.code}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Region / Supervisi • {areas.length} Area • {regionAssetCount} Aset
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {hasPermission('manage_assets') && (
                            <>
                              <button
                                onClick={() => openAddChildModal(region)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 text-xs font-semibold hover:bg-sky-100 border border-sky-200/50"
                                title="Tambah Area di bawah Region ini"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Area</span>
                              </button>

                              <button
                                onClick={() => setLocationToDelete(region)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                title="Hapus Region ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Level 2: Areas */}
                      {isRegionExpanded && (
                        <div className="p-3 pl-6 sm:pl-10 space-y-3">
                          {areas.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">
                              Belum ada area di region ini. Klik "+ Area" untuk menambahkan.
                            </p>
                          ) : (
                            areas.map((area) => {
                              const isAreaExpanded = expandedNodes[area.id];
                              const branches = getBranches(area.id);
                              const areaAssetCount = getAssetsCount(area.id);

                              return (
                                <div
                                  key={area.id}
                                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                                >
                                  <div className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => toggleExpand(area.id)}
                                        className="p-1 text-slate-400 hover:text-slate-600"
                                      >
                                        {isAreaExpanded ? (
                                          <ChevronDown className="w-4 h-4" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4" />
                                        )}
                                      </button>
                                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                        <Layers className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <span className="font-semibold text-xs text-slate-900 dark:text-white">
                                          {area.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 ml-2">
                                          ({branches.length} Unit Kerja • {areaAssetCount} Aset)
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      {hasPermission('manage_assets') && (
                                        <>
                                          <button
                                            onClick={() => openAddChildModal(area)}
                                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100"
                                          >
                                            <Plus className="w-3 h-3" />
                                            <span>Unit Kerja</span>
                                          </button>

                                          <button
                                            onClick={() => setLocationToDelete(area)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                            title="Hapus Area ini"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Level 3: Unit Kerja (Branches) */}
                                  {isAreaExpanded && (
                                    <div className="p-3 pl-6 sm:pl-8 space-y-2 border-t border-slate-100 dark:border-slate-800">
                                      {branches.map((branch) => {
                                        const isBranchExpanded = expandedNodes[branch.id];
                                        const rooms = getRooms(branch.id);
                                        const branchAssetCount = getAssetsCount(branch.id);

                                        return (
                                          <div
                                            key={branch.id}
                                            className="rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30"
                                          >
                                            <div className="p-2.5 flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <button
                                                  onClick={() => toggleExpand(branch.id)}
                                                  className="p-1 text-slate-400 hover:text-slate-600"
                                                >
                                                  {isBranchExpanded ? (
                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                  ) : (
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                  )}
                                                </button>
                                                <Building className="w-4 h-4 text-emerald-500" />
                                                <div>
                                                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                                                    {branch.name}
                                                  </span>
                                                  <span className="text-[10px] text-slate-400 ml-2">
                                                    ({rooms.length} Ruangan • {branchAssetCount} Aset)
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-1">
                                                {hasPermission('manage_assets') && (
                                                  <>
                                                    <button
                                                      onClick={() => openAddChildModal(branch)}
                                                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                                                    >
                                                      <Plus className="w-3 h-3" />
                                                      <span>Ruangan</span>
                                                    </button>

                                                    <button
                                                      onClick={() => setLocationToDelete(branch)}
                                                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                                      title="Hapus Unit Kerja ini"
                                                    >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                  </>
                                                )}
                                              </div>
                                            </div>

                                            {/* Level 4: Rooms */}
                                            {isBranchExpanded && (
                                              <div className="p-2.5 pl-6 sm:pl-8 space-y-1.5 border-t border-slate-100 dark:border-slate-800/40">
                                                {rooms.map((room) => {
                                                  const roomAssets = assets.filter(
                                                    (a) => a.location_id === room.id
                                                  );
                                                  return (
                                                    <div
                                                      key={room.id}
                                                      className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs group/room"
                                                    >
                                                      <div className="flex items-center gap-2">
                                                        <Home className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-slate-700 dark:text-slate-300">
                                                          {room.name}
                                                        </span>
                                                        <span className="font-mono text-[10px] text-slate-400">
                                                          [{room.code}]
                                                        </span>
                                                      </div>

                                                      <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                                                          {roomAssets.length} Aset
                                                        </span>
                                                        {hasPermission('manage_assets') && (
                                                          <button
                                                            onClick={() => setLocationToDelete(room)}
                                                            className="p-1 text-slate-400 hover:text-rose-600 rounded opacity-0 group-hover/room:opacity-100 transition-opacity"
                                                            title="Hapus ruangan ini"
                                                          >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                          </button>
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH UNIT KERJA (BO & KANTOR UNIT)              */}
      {/* ======================================================== */}
      {isAddUnitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tambah Unit Kerja BRI Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddUnitModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Unit Kerja <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={locName}
                  onChange={(e) => {
                    setLocName(e.target.value);
                    if (!locCode) {
                      const clean = e.target.value.toUpperCase().replace(/\s+/g, '-');
                      setLocCode(clean.startsWith('UNIT-') ? clean : `UNIT-${clean.slice(0, 5)}`);
                    }
                  }}
                  placeholder="Contoh: UNIT PANIMBANG / UNIT CARITA"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Kode Unit Kerja <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={locCode}
                  onChange={(e) => setLocCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: UNIT-PNB / UNIT-CRT"
                  className="w-full font-mono text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Alamat Lengkap Unit Kerja
                </label>
                <textarea
                  rows={2}
                  value={locAddress}
                  onChange={(e) => setLocAddress(e.target.value)}
                  placeholder="Jl. Raya Panimbang Km. 2, Panimbang, Pandeglang"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUnitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                >
                  Simpan Unit Kerja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH LOKASI / RUANGAN UMUM                      */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah Lokasi ({targetType.toUpperCase()})
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Lokasi / Ruangan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={locName}
                  onChange={(e) => {
                    setLocName(e.target.value);
                    if (!locCode) {
                      setLocCode(
                        e.target.value
                          .slice(0, 8)
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, '-')
                      );
                    }
                  }}
                  placeholder="Contoh: Ruang Server IT / Gallery ATM"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Kode Lokasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={locCode}
                  onChange={(e) => setLocCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: RM-SRV-01"
                  className="w-full font-mono text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Alamat / Keterangan
                </label>
                <textarea
                  rows={2}
                  value={locAddress}
                  onChange={(e) => setLocAddress(e.target.value)}
                  placeholder="Keterangan fisik atau lantai gedung"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/30"
                >
                  Simpan Lokasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: KONFIRMASI HAPUS LOKASI / UNIT KERJA              */}
      {/* ======================================================== */}
      {locationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-rose-200 dark:border-rose-900/50">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white text-center">
              Hapus {locationToDelete.type === 'branch' ? 'Unit Kerja' : 'Lokasi'}?
            </h3>

            <div className="my-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {locationToDelete.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kode:</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                  {locationToDelete.code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tipe Node:</span>
                <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {locationToDelete.type}
                </span>
              </div>
              {getDescendantCount(locationToDelete.id) > 0 && (
                <div className="flex justify-between text-amber-600 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <span>Sub-lokasi terkait:</span>
                  <span>{getDescendantCount(locationToDelete.id)} ruangan/sub-lokasi</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Aset di lokasi ini:</span>
                <span className="font-mono font-bold">{getAssetsCount(locationToDelete.id)} unit</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6">
              Penghapusan akan menghapus lokasi ini beserta seluruh sub-lokasi di dalamnya. Aset yang terdaftar akan ditandai belum memiliki lokasi.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocationToDelete(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-md shadow-rose-600/30"
              >
                Ya, Hapus Lokasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
