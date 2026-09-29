import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { AssetListView } from './components/assets/AssetListView';
import { AssetDetailModal } from './components/assets/AssetDetailModal';
import { AssetFormModal } from './components/assets/AssetFormModal';
import { AssetTypeManagerView } from './components/asset-types/AssetTypeManagerView';
import { LocationManagerView } from './components/locations/LocationManagerView';
import { EmployeeManagerView } from './components/employees/EmployeeManagerView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { ReportsExportView } from './components/reports/ReportsExportView';
import { StatisticsView } from './components/statistics/StatisticsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { SettingsView } from './components/settings/SettingsView';
import { ITTutorialView } from './components/tutorial/ITTutorialView';
import { QuickExcelImportModal } from './components/assets/QuickExcelImportModal';
import { QRScannerModal } from './components/qr/QRScannerModal';
import { PrintLabelsModal } from './components/qr/PrintLabelsModal';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { LoginView } from './components/auth/LoginView';
import { UserManagerView } from './components/users/UserManagerView';
import { EDCBRILinkView } from './components/edc/EDCBRILinkView';
import { Asset } from './types';

const MainAppContent: React.FC = () => {
  const { activeTab, selectedAssetId, setSelectedAssetId, isAuthenticated, currentUser } = useApp();

  // If not logged in, render the login page
  if (!isAuthenticated || !currentUser) {
    return <LoginView />;
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // Asset Add / Edit modal state
  const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

  // Quick Excel Import modal state
  const [isQuickExcelOpen, setIsQuickExcelOpen] = useState(false);
  const [quickExcelEntity, setQuickExcelEntity] = useState<'assets' | 'employees' | 'locations'>('assets');

  const handleOpenQuickExcel = (entity: 'assets' | 'employees' | 'locations' = 'assets') => {
    setQuickExcelEntity(entity);
    setIsQuickExcelOpen(true);
  };

  const handleOpenAddAsset = () => {
    setAssetToEdit(null);
    setIsAssetFormOpen(true);
  };

  const handleOpenEditAsset = (asset: Asset) => {
    setAssetToEdit(asset);
    setIsAssetFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all">
        {/* Top Header */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenAddModal={handleOpenAddAsset}
              onOpenQuickExcel={() => handleOpenQuickExcel('assets')}
            />
          )}
          {activeTab === 'assets' && (
            <AssetListView
              onOpenAddModal={handleOpenAddAsset}
              onOpenEditModal={handleOpenEditAsset}
              onOpenQuickExcel={() => handleOpenQuickExcel('assets')}
            />
          )}
          {activeTab === 'edc_brilink' && <EDCBRILinkView />}
          {activeTab === 'tutorial' && <ITTutorialView />}
          {activeTab === 'asset_types' && <AssetTypeManagerView />}
          {activeTab === 'locations' && (
            <LocationManagerView onOpenQuickExcel={() => handleOpenQuickExcel('locations')} />
          )}
          {activeTab === 'employees' && (
            <EmployeeManagerView onOpenQuickExcel={() => handleOpenQuickExcel('employees')} />
          )}
          {activeTab === 'maintenance' && <MaintenanceView />}
          {activeTab === 'reports' && <ReportsExportView />}
          {activeTab === 'statistics' && <StatisticsView />}
          {activeTab === 'user_management' && <UserManagerView />}
          {activeTab === 'notifications' && <NotificationsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenSidebar={() => setIsSidebarOpen(true)} />

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />

      <AssetFormModal
        isOpen={isAssetFormOpen}
        assetToEdit={assetToEdit}
        onClose={() => {
          setIsAssetFormOpen(false);
          setAssetToEdit(null);
        }}
      />

      <QuickExcelImportModal
        isOpen={isQuickExcelOpen}
        defaultEntityType={quickExcelEntity}
        onClose={() => setIsQuickExcelOpen(false)}
      />

      {selectedAssetId && (
        <AssetDetailModal
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
          onEdit={(asset) => {
            setSelectedAssetId(null);
            handleOpenEditAsset(asset);
          }}
        />
      )}

      <QRScannerModal />
      <PrintLabelsModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
