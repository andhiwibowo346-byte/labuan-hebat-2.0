import React from 'react';
import {
  LayoutDashboard,
  Box,
  QrCode,
  GraduationCap,
  Menu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MobileBottomNavProps {
  onOpenSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenSidebar }) => {
  const { activeTab, setActiveTab, assets, openScanner, maintenanceRecords } = useApp();

  const activeMaintenanceCount = maintenanceRecords.filter((m) => m.status === 'in_progress').length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 shadow-2xl safe-area-pb transition-colors">
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'dashboard'
              ? 'text-brand-600 dark:text-brand-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {activeTab === 'dashboard' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Dashboard</span>
        </button>

        {/* Tab 2: Assets */}
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'assets'
              ? 'text-brand-600 dark:text-brand-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Box className="w-5 h-5" />
            {assets.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-500 text-white text-[9px] font-black px-1.5 rounded-full leading-tight">
                {assets.length}
              </span>
            )}
            {activeTab === 'assets' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Asset</span>
        </button>

        {/* Tab 3: Center Elevated Scan QR Button */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-5">
          <button
            onClick={openScanner}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/40 active:scale-95 transition-transform"
            aria-label="Scan QR Code Kamera"
            title="Scan QR Code Aset"
          >
            <QrCode className="w-6 h-6" />
          </button>
          <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 mt-0.5 tracking-tight">
            Scan QR
          </span>
        </div>

        {/* Tab 4: Tutorial IT */}
        <button
          onClick={() => setActiveTab('tutorial')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'tutorial'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <GraduationCap className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white text-[8px] font-bold px-1 rounded-full leading-none py-0.5">
              SOP
            </span>
            {activeTab === 'tutorial' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Tutorial</span>
        </button>

        {/* Tab 5: More Menu */}
        <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all active:scale-95"
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            {activeMaintenanceCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
};
