import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  QrCode,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  Wrench,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Menu,
  GraduationCap,
  Laptop,
  Check,
  LogOut,
  UserCog,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { formatDateTimeIndonesian } from '../../utils';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenGlobalSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenGlobalSearch }) => {
  const {
    currentUser,
    logout,
    hasPermission,
    switchUserRole,
    isDarkMode,
    themeMode,
    setThemeMode,
    toggleDarkMode,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    openScanner,
    setSelectedAssetId,
    setActiveTab,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setIsThemeOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList: { role: UserRole; title: string; desc: string; icon: any; color: string }[] = [
    {
      role: 'super_admin',
      title: 'Super Admin',
      desc: 'Semua akses: custom field, users, settings',
      icon: ShieldCheck,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      role: 'it_admin',
      title: 'Admin IT',
      desc: 'Kelola aset, maintenance, upload, export',
      icon: ShieldCheck,
      color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60',
    },
    {
      role: 'technician',
      title: 'Technician',
      desc: 'Melihat aset, update maintenance, foto',
      icon: Wrench,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
    },
    {
      role: 'viewer',
      title: 'Viewer',
      desc: 'Hanya melihat data (read-only)',
      icon: Eye,
      color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800',
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="h-full px-3 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Mobile Brand & Global Search */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <span className="font-black text-[10px]">LH</span>
            </div>
            <span className="font-black text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white uppercase truncate max-w-[110px] sm:max-w-none">
              LABUAN HEBAT
            </span>
          </div>

          {/* Desktop Search Bar */}
          <button
            onClick={onOpenGlobalSearch}
            className="hidden sm:flex items-center gap-3 px-3.5 py-2 w-48 md:w-72 lg:w-80 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 hover:border-brand-500/50 dark:hover:border-brand-500/50 text-slate-400 dark:text-slate-500 transition-all group shadow-sm"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
            <span className="text-xs md:text-sm font-medium truncate">Cari Asset ID, SN, IP, TID...</span>
            <kbd className="hidden lg:inline-flex ml-auto text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500">
              Ctrl+K
            </kbd>
          </button>

          {/* Mobile Search Icon Button */}
          <button
            onClick={onOpenGlobalSearch}
            className="sm:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 hover:text-brand-500 shadow-sm"
            aria-label="Cari Aset"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* Quick QR Scanner Button */}
          <button
            onClick={openScanner}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/60 border border-brand-200/50 dark:border-brand-800/40 text-xs md:text-sm font-medium transition-colors shadow-sm"
            title="Scan QR Code Aset"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden md:inline">Scan QR</span>
          </button>

          {/* Quick Tutorial & SOP Button */}
          <button
            onClick={() => setActiveTab('tutorial')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/50 dark:border-emerald-800/40 text-xs md:text-sm font-medium transition-colors shadow-sm"
            title="Panduan Tutorial & SOP IT Baru"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Tutorial IT</span>
          </button>

          {/* Role Display / Switcher (Only Super Admin can switch/simulate, others have static badge) */}
          {currentUser?.role === 'super_admin' ? (
            <div className="relative" ref={roleRef}>
              <button
                onClick={() => setIsRoleOpen(!isRoleOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/40 hover:bg-brand-100/60 dark:hover:bg-brand-900/60 text-xs font-semibold text-brand-700 dark:text-brand-300 shadow-sm transition-all"
                title="Simulasi Hak Akses (Super Admin)"
              >
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                <span className="hidden md:inline uppercase text-[11px] tracking-wider text-slate-400">Role:</span>
                <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
              </button>

              {isRoleOpen && (
                <div className="absolute -right-8 sm:right-0 mt-2 w-[calc(100vw-32px)] max-w-xs sm:w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Simulasi Role (Admin)</p>
                    <p className="text-[11px] text-slate-500">Pilih role untuk menguji hak akses sistem</p>
                  </div>
                  <div className="space-y-1">
                    {rolesList.map((r) => {
                      const Icon = r.icon;
                      const isActive = currentUser?.role === r.role;
                      return (
                        <button
                          key={r.role}
                          onClick={() => {
                            switchUserRole(r.role);
                            setIsRoleOpen(false);
                          }}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                            isActive
                              ? 'bg-brand-500 text-white font-medium shadow-md shadow-brand-500/20'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : r.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                              {r.title}
                            </p>
                            <p className={`text-[11px] line-clamp-1 ${isActive ? 'text-brand-100' : 'text-slate-500 dark:text-slate-400'}`}>
                              {r.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/70 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm select-none" title="Role ditetapkan oleh Administrator">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="hidden md:inline uppercase text-[11px] tracking-wider text-slate-400">Role:</span>
              <span className="capitalize">{currentUser?.role ? currentUser.role.replace('_', ' ') : 'Guest'}</span>
            </div>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute -right-12 sm:right-0 mt-2 w-[calc(100vw-32px)] max-w-sm sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-3 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      Notifikasi
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-500">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-medium"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada notifikasi saat ini
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((n) => {
                      const Icon =
                        n.severity === 'error'
                          ? AlertCircle
                          : n.severity === 'warning'
                          ? AlertTriangle
                          : CheckCircle2;
                      const iconColor =
                        n.severity === 'error'
                          ? 'text-rose-500 bg-rose-500/10'
                          : n.severity === 'warning'
                          ? 'text-amber-500 bg-amber-500/10'
                          : 'text-emerald-500 bg-emerald-500/10';

                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.asset_id) {
                              setSelectedAssetId(n.asset_id);
                              setActiveTab('assets');
                            }
                            setIsNotifOpen(false);
                          }}
                          className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                            n.read
                              ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 opacity-75'
                              : 'bg-brand-50/50 dark:bg-brand-950/30 hover:bg-brand-50 dark:hover:bg-brand-950/50 border border-brand-100 dark:border-brand-900/30'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${iconColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {n.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {formatDateTimeIndonesian(n.created_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      setIsNotifOpen(false);
                    }}
                    className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Lihat Semua Notifikasi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Dropdown / Quick Switcher */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="flex items-center gap-1.5 p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title={`Tema saat ini: ${themeMode === 'system' ? 'Sistem (Auto)' : isDarkMode ? 'Mode Gelap' : 'Mode Terang'}`}
              aria-label="Pengaturan Tema"
            >
              {themeMode === 'system' ? (
                <Laptop className="w-5 h-5 text-brand-500" />
              ) : isDarkMode ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <span className="hidden xl:inline text-xs font-semibold capitalize text-slate-700 dark:text-slate-300">
                {themeMode === 'system' ? 'Auto' : isDarkMode ? 'Gelap' : 'Terang'}
              </span>
            </button>

            {isThemeOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5 z-50 animate-fade-in">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pilih Tema</p>
                </div>

                <button
                  onClick={() => {
                    setThemeMode('light');
                    setIsThemeOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    themeMode === 'light'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Mode Terang</span>
                  </div>
                  {themeMode === 'light' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>

                <button
                  onClick={() => {
                    setThemeMode('dark');
                    setIsThemeOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    themeMode === 'dark'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Mode Gelap</span>
                  </div>
                  {themeMode === 'dark' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>

                <button
                  onClick={() => {
                    setThemeMode('system');
                    setIsThemeOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    themeMode === 'system'
                      ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Laptop className="w-4 h-4 text-brand-500" />
                    <span>Sistem (Auto)</span>
                  </div>
                  {themeMode === 'system' && <Check className="w-3.5 h-3.5 text-brand-500" />}
                </button>
              </div>
            )}
          </div>

          {/* User profile dropdown */}
          {currentUser && (
            <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20"
                />
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PN: {currentUser.nip || '-'}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 z-50 animate-scale-up">
                  {/* User info header */}
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.email}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 uppercase tracking-wider">
                        {currentUser.role.replace('_', ' ')}
                      </span>
                      {currentUser.department && (
                        <span className="text-[10px] text-slate-400 truncate">
                          • {currentUser.department}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Navigation links */}
                  {hasPermission('manage_users') && (
                    <button
                      onClick={() => {
                        setActiveTab('user_management');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserCog className="w-4 h-4 text-brand-500" />
                      <span>Manajemen Pengguna</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-sky-500" />
                    <span>Pengaturan Sistem</span>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  {/* Logout button */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
