import React from 'react';
import {
  LayoutDashboard,
  Box,
  Layers,
  MapPin,
  Users,
  Wrench,
  FileSpreadsheet,
  BarChart3,
  Bell,
  Settings,
  X,
  Database,
  GraduationCap,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    assets,
    assetTypes,
    locations,
    employees,
    maintenanceRecords,
    notifications,
    isDarkMode,
    themeMode,
    setThemeMode,
  } = useApp();

  const activeMaintenanceCount = maintenanceRecords.filter((m) => m.status === 'in_progress').length;
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assets', label: 'Asset', icon: Box, badge: assets.length },
    { id: 'tutorial', label: 'Tutorial & SOP IT', icon: GraduationCap, badge: 'Baru', badgeColor: 'bg-emerald-500 text-white' },
    { id: 'asset_types', label: 'Jenis Asset', icon: Layers, badge: assetTypes.length },
    { id: 'locations', label: 'Lokasi', icon: MapPin, badge: locations.length },
    { id: 'employees', label: 'Pengguna', icon: Users, badge: employees.length },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, badge: activeMaintenanceCount > 0 ? activeMaintenanceCount : undefined, badgeColor: 'bg-amber-500 text-white' },
    { id: 'reports', label: 'Laporan & Export', icon: FileSpreadsheet },
    { id: 'statistics', label: 'Statistik', icon: BarChart3 },
    { id: 'notifications', label: 'Notifikasi', icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined, badgeColor: 'bg-rose-500 text-white' },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white uppercase">
                  LABUAN HEBAT
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  ITAM
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                IT Asset Management
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Main Menu
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all group ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Theme Switcher Footer */}
        <div className="px-3 py-2.5 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tema Tampilan
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {themeMode === 'system' ? 'Auto (Sistem)' : isDarkMode ? 'Mode Gelap' : 'Mode Terang'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                themeMode === 'light'
                  ? 'bg-white text-amber-600 shadow-sm font-bold border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Beralih ke Mode Terang (Light Mode)"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="text-[11px]">Terang</span>
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                themeMode === 'dark'
                  ? 'bg-slate-800 text-indigo-300 shadow-sm font-bold border border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Beralih ke Mode Gelap (Dark Mode)"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="text-[11px]">Gelap</span>
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('system')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                themeMode === 'system'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm font-bold border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Mengikuti Tema Sistem Perangkat (Auto)"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="text-[11px]">Sistem</span>
            </button>
          </div>
        </div>

        {/* Database Status Card */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-brand-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Supabase Engine
                </span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              PostgreSQL Hybrid Cache Active
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
