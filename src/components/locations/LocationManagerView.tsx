import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Building,
  Home,
  Layers,
  Box,
  Search,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LocationNode, LocationType } from '../../types';

export const LocationManagerView: React.FC<{ onOpenQuickExcel?: () => void }> = ({
  onOpenQuickExcel,
}) => {
  const { locations, assets, addLocation, deleteLocation, setActiveTab, hasPermission } = useApp();

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'loc-reg-1': true,
    'loc-area-1': true,
    'loc-br-1': true,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [targetType, setTargetType] = useState<LocationType>('region');
  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim() || !locCode.trim()) return;

    addLocation({
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
    setLocName('');
    setLocCode('');
    setLocAddress('');
  };

  // Group locations hierarchically
  const regions = locations.filter((l) => l.type === 'region');
  const getAreas = (regionId: string) => locations.filter((l) => l.parent_id === regionId);
  const getBranches = (areaId: string) => locations.filter((l) => l.parent_id === areaId);
  const getRooms = (branchId: string) => locations.filter((l) => l.parent_id === branchId);

  const getAssetsCount = (locId: string) => {
    // Assets directly assigned to this location or child rooms
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

  const filteredLocations = searchQuery.trim()
    ? locations.filter(
        (l) =>
          l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Struktur & Manajemen Lokasi Aset
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400">
              4 LEVEL HIERARCHY
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Hierarki bertingkat: Region → Area → Cabang → Ruangan
          </p>
        </div>

        {hasPermission('manage_assets') && (
          <div className="flex items-center gap-2">
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

            <button
              onClick={() => {
                setSelectedParentId(null);
                setTargetType('region');
                setLocName('');
                setLocCode('');
                setLocAddress('');
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs md:text-sm font-semibold shadow-md shadow-brand-600/30 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Region Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari lokasi, cabang, atau ruangan..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs md:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Flat Search Results if searched */}
      {filteredLocations ? (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Hasil Pencarian Lokasi ({filteredLocations.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredLocations.map((loc) => (
              <div
                key={loc.id}
                className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400">
                      {loc.code}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {loc.type}
                    </span>
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
        /* Hierarchical Tree View */
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pohon Hierarki Lokasi Organisasi
            </span>
            <span className="text-[11px] text-slate-400">
              Total {locations.length} Node Lokasi
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
                          Region • {areas.length} Area • {regionAssetCount} Aset
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {hasPermission('manage_assets') && (
                        <button
                          onClick={() => openAddChildModal(region)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 text-xs font-semibold hover:bg-sky-100 border border-sky-200/50"
                          title="Tambah Area di bawah Region ini"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Area</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Level 2: Areas */}
                  {isRegionExpanded && (
                    <div className="p-3 pl-8 sm:pl-12 space-y-3">
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
                                      ({branches.length} Cabang • {areaAssetCount} Aset)
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {hasPermission('manage_assets') && (
                                    <button
                                      onClick={() => openAddChildModal(area)}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Cabang</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Level 3: Branches */}
                              {isAreaExpanded && (
                                <div className="p-3 pl-8 sm:pl-10 space-y-2 border-t border-slate-100 dark:border-slate-800">
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
                                              <button
                                                onClick={() => openAddChildModal(branch)}
                                                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                                              >
                                                <Plus className="w-3 h-3" />
                                                <span>Ruangan</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                        {/* Level 4: Rooms */}
                                        {isBranchExpanded && (
                                          <div className="p-2.5 pl-8 sm:pl-10 space-y-1.5 border-t border-slate-100 dark:border-slate-800/40">
                                            {rooms.map((room) => {
                                              const roomAssets = assets.filter(
                                                (a) => a.location_id === room.id
                                              );
                                              return (
                                                <div
                                                  key={room.id}
                                                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
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
                                                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                                                    {roomAssets.length} Aset
                                                  </span>
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

      {/* MODAL: ADD LOCATION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Tambah Node Lokasi ({targetType.toUpperCase()})
            </h3>

            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Lokasi / Cabang / Ruangan <span className="text-rose-500">*</span>
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
                  placeholder="Contoh: KC Semarang Pandanaran / Ruang Server Lt. 2"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                  placeholder="BR-SMG-01 / RM-SRV-02"
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Alamat Lengkap / Keterangan
                </label>
                <textarea
                  rows={2}
                  value={locAddress}
                  onChange={(e) => setLocAddress(e.target.value)}
                  placeholder="Alamat fisik jalan atau petunjuk gedung"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30"
                >
                  Simpan Lokasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
