import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Box, MapPin, User, ArrowRight, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getStatusColorClass, getStatusLabel } from '../../utils';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { assets, assetTypes, locations, employees, setSelectedAssetId, setActiveTab } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open modal
          const btn = document.querySelector('[aria-label="Cari Asset ID, SN, IP, TID..."]');
          (btn as HTMLElement)?.click();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const filteredAssets = trimmed
    ? assets.filter((asset) => {
        // Tag / Asset ID
        if (asset.asset_tag.toLowerCase().includes(trimmed)) return true;
        // Name
        if (asset.name.toLowerCase().includes(trimmed)) return true;
        // Serial Number
        if (asset.serial_number && asset.serial_number.toLowerCase().includes(trimmed)) return true;
        // User
        const emp = employees.find((e) => e.id === asset.employee_id);
        if (emp && (emp.full_name.toLowerCase().includes(trimmed) || emp.nip.includes(trimmed))) return true;
        // Location
        const loc = locations.find((l) => l.id === asset.location_id);
        if (loc && loc.name.toLowerCase().includes(trimmed)) return true;
        // Custom fields search (TID, IP, Hostname, etc.)
        if (asset.custom_values) {
          const matchCustom = Object.values(asset.custom_values).some((val) =>
            String(val || '').toLowerCase().includes(trimmed)
          );
          if (matchCustom) return true;
        }
        return false;
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-brand-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari Asset ID, Serial Number, Nama, IP, TID, Pengguna, Lokasi..."
            className="w-full bg-transparent text-sm md:text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-2">
          {!trimmed ? (
            <div className="py-10 text-center">
              <Box className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Ketik kata kunci untuk mencari di seluruh aset
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Contoh: <code className="text-brand-500 font-mono">ATM-001</code>,{' '}
                <code className="text-brand-500 font-mono">10.10.10.10</code>,{' '}
                <code className="text-brand-500 font-mono">Diebold</code>,{' '}
                <code className="text-brand-500 font-mono">Andhi</code>
              </p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tidak ada aset yang cocok dengan "{query}"
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Pastikan ejaan benar atau cari berdasarkan kriteria lainnya
              </p>
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const type = assetTypes.find((t) => t.id === asset.asset_type_id);
              const loc = locations.find((l) => l.id === asset.location_id);
              const emp = employees.find((e) => e.id === asset.employee_id);
              const statusStyle = getStatusColorClass(asset.status);

              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    setSelectedAssetId(asset.id);
                    setActiveTab('assets');
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand-500/40 hover:bg-brand-50/40 dark:hover:bg-brand-950/20 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                      {asset.primary_photo ? (
                        <img
                          src={asset.primary_photo}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Box className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                          {asset.asset_tag}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {asset.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {getStatusLabel(asset.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-1 truncate">
                        {type && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {type.name}
                          </span>
                        )}
                        {loc && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3" />
                            {loc.name}
                          </span>
                        )}
                        {emp && (
                          <span className="flex items-center gap-1 truncate">
                            <User className="w-3 h-3" />
                            {emp.full_name}
                          </span>
                        )}
                        {asset.custom_values?.ip_address && (
                          <span className="font-mono text-slate-400">
                            IP: {asset.custom_values.ip_address}
                          </span>
                        )}
                        {asset.custom_values?.tid && (
                          <span className="font-mono text-slate-400">
                            TID: {asset.custom_values.tid}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>{filteredAssets.length} hasil ditemukan</span>
          <span>Klik item untuk membuka detail aset</span>
        </div>
      </div>
    </div>
  );
};
