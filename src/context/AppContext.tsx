import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Asset,
  AssetType,
  Employee,
  LocationNode,
  MaintenanceRecord,
  AssetHistory,
  AppNotification,
  NotificationType,
  UserProfile,
  UserRole,
  AssetFieldDefinition,
  TutorialItem,
  ThemeMode,
} from '../types';
import {
  CURRENT_USER,
  MOCK_USERS,
  INITIAL_ASSET_TYPES,
  INITIAL_LOCATIONS,
  INITIAL_EMPLOYEES,
  INITIAL_ASSETS,
  INITIAL_MAINTENANCE_RECORDS,
  INITIAL_ASSET_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_TUTORIALS,
} from '../data/mockData';

interface AppContextType {
  // User Authentication & Management
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  usersList: UserProfile[];
  login: (emailOrNip: string, password: string) => { success: boolean; message: string; user?: UserProfile };
  loginAsUser: (user: UserProfile) => void;
  logout: () => void;
  createUser: (newUser: Omit<UserProfile, 'id' | 'created_at'>) => { success: boolean; message: string; user?: UserProfile };
  updateUser: (id: string, updated: Partial<UserProfile>) => { success: boolean; message: string };
  deleteUser: (id: string) => { success: boolean; message: string };
  switchUserRole: (role: UserRole) => void;
  hasPermission: (action: 'manage_types' | 'manage_assets' | 'manage_maintenance' | 'delete_data' | 'export_data' | 'manage_users') => boolean;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;
  filterAssetTypeId: string | null;
  setFilterAssetTypeId: (id: string | null) => void;

  // Theme
  isDarkMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;

  // Entities
  assetTypes: AssetType[];
  addAssetType: (newType: Omit<AssetType, 'id' | 'created_at' | 'updated_at'>) => AssetType;
  updateAssetType: (id: string, data: Partial<AssetType>) => void;
  deleteAssetType: (id: string) => boolean;
  addFieldToAssetType: (assetTypeId: string, field: Omit<AssetFieldDefinition, 'id' | 'asset_type_id'>) => void;
  updateFieldInAssetType: (assetTypeId: string, fieldId: string, updatedField: Partial<AssetFieldDefinition>) => void;
  deleteFieldFromAssetType: (assetTypeId: string, fieldId: string) => void;

  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'photos' | 'documents'>, initialPhotos?: any[], initialDocs?: any[]) => Asset;
  updateAsset: (id: string, updatedData: Partial<Asset>, remarks?: string) => void;
  deleteAsset: (id: string) => void;
  deleteAssets: (ids: string[]) => void;
  clearAllAssets: () => void;
  addAssetPhoto: (assetId: string, photo: { url: string; caption: string }) => void;
  deleteAssetPhoto: (assetId: string, photoId: string) => void;
  addAssetDocument: (assetId: string, doc: { title: string; file_name: string; file_type: 'pdf' | 'excel' | 'word' | 'txt' | 'other'; url: string; file_size?: string }) => void;
  deleteAssetDocument: (assetId: string, docId: string) => void;
  importAssetsBulk: (newAssets: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'photos' | 'documents'>[]) => { successCount: number; errors: string[] };

  locations: LocationNode[];
  addLocation: (loc: Omit<LocationNode, 'id'>) => LocationNode;
  updateLocation: (id: string, loc: Partial<LocationNode>) => void;
  deleteLocation: (id: string) => void;
  importLocationsBulk: (newLocations: Omit<LocationNode, 'id'>[]) => { successCount: number; errors: string[] };

  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  importEmployeesBulk: (newEmployees: Omit<Employee, 'id'>[]) => { successCount: number; errors: string[] };

  maintenanceRecords: MaintenanceRecord[];
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'created_at'>) => MaintenanceRecord;
  updateMaintenanceRecord: (id: string, record: Partial<MaintenanceRecord>) => void;
  deleteMaintenanceRecord: (id: string) => void;

  // IT Tutorials & SOPs
  tutorials: TutorialItem[];
  addTutorial: (tutorial: Omit<TutorialItem, 'id' | 'created_at'>) => TutorialItem;
  updateTutorial: (id: string, updated: Partial<TutorialItem>) => void;
  deleteTutorial: (id: string) => void;

  assetHistory: AssetHistory[];
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Global modals
  isScannerOpen: boolean;
  openScanner: () => void;
  closeScanner: () => void;
  printLabelsAssets: Asset[];
  openPrintLabels: (assets: Asset[]) => void;
  closePrintLabels: () => void;

  // Data reset / backup
  resetAllDataToDefault: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state ('light' | 'dark' | 'system')
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('itam_theme') as ThemeMode;
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'dark'; // Default dark enterprise theme
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('itam_theme') as ThemeMode;
    if (saved === 'light') return false;
    if (saved === 'dark') return true;
    if (saved === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // Default dark
  });

  const applyTheme = (mode: ThemeMode) => {
    const systemDark =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : true;
    const shouldBeDark = mode === 'dark' || (mode === 'system' && systemDark);

    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('itam_theme', mode);
    applyTheme(mode);
  };

  const toggleDarkMode = () => {
    const nextMode = isDarkMode ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  useEffect(() => {
    applyTheme(themeMode);

    if (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  // Reset initial cache to ensure clean start (no auto-login, clean history, remove demo accounts)
  if (typeof window !== 'undefined' && localStorage.getItem('itam_v4_clean_demo') !== 'clean_v4') {
    localStorage.removeItem('itam_auth_user');
    localStorage.removeItem('itam_user_role');
    const saved = localStorage.getItem('itam_users_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((u: UserProfile) => !['usr-002', 'usr-003', 'usr-004'].includes(u.id));
          localStorage.setItem('itam_users_list', JSON.stringify(cleaned.length > 0 ? cleaned : MOCK_USERS));
        }
      } catch {
        localStorage.removeItem('itam_users_list');
      }
    }
    localStorage.setItem('itam_v4_clean_demo', 'clean_v4');
  }

  // Users list with LocalStorage persistence
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('itam_users_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter((u: UserProfile) => !['usr-002', 'usr-003', 'usr-004'].includes(u.id));
          return cleaned.length > 0 ? cleaned : MOCK_USERS;
        }
      } catch (e) {
        console.error('Failed to parse saved users list', e);
      }
    }
    return MOCK_USERS;
  });

  // Current logged in user (starts logged out / null by default)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedAuth = localStorage.getItem('itam_auth_user');
    if (savedAuth) {
      try {
        return JSON.parse(savedAuth);
      } catch (e) {
        console.error('Failed to parse auth user', e);
      }
    }
    return null;
  });

  const isAuthenticated = Boolean(currentUser);
  const currentUserName = currentUser?.name || 'Administrator';

  const login = (emailOrNip: string, password: string): { success: boolean; message: string; user?: UserProfile } => {
    const cleanId = emailOrNip.trim().toLowerCase();
    const match = usersList.find(
      (u) =>
        (u.email.toLowerCase() === cleanId || (u.nip && u.nip.toLowerCase() === cleanId)) &&
        ((u.password && u.password === password) || (!u.password && password === 'admin123'))
    );

    if (!match) {
      return { success: false, message: 'Email/NIP atau kata sandi tidak cocok.' };
    }

    if (match.status === 'inactive') {
      return { success: false, message: 'Akun ini dinonaktifkan. Silakan hubungi Administrator.' };
    }

    setCurrentUser(match);
    localStorage.setItem('itam_auth_user', JSON.stringify(match));
    localStorage.setItem('itam_user_role', match.role);
    return { success: true, message: `Selamat datang kembali, ${match.name}!`, user: match };
  };

  const loginAsUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('itam_auth_user', JSON.stringify(user));
    localStorage.setItem('itam_user_role', user.role);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('itam_auth_user');
    localStorage.removeItem('itam_user_role');
  };

  const createUser = (newUser: Omit<UserProfile, 'id' | 'created_at'>): { success: boolean; message: string; user?: UserProfile } => {
    const emailExists = usersList.some(
      (u) => u.email.trim().toLowerCase() === newUser.email.trim().toLowerCase()
    );
    if (emailExists) {
      return { success: false, message: 'Email sudah terdaftar pada pengguna lain.' };
    }

    if (newUser.nip) {
      const nipExists = usersList.some((u) => u.nip && u.nip.trim() === newUser.nip?.trim());
      if (nipExists) {
        return { success: false, message: 'NIP sudah terdaftar pada pengguna lain.' };
      }
    }

    const created: UserProfile = {
      ...newUser,
      id: `usr-${Date.now().toString().slice(-4)}`,
      status: newUser.status || 'active',
      password: newUser.password || 'admin123',
      avatar:
        newUser.avatar ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      created_at: new Date().toISOString(),
    };

    const nextList = [created, ...usersList];
    setUsersList(nextList);
    localStorage.setItem('itam_users_list', JSON.stringify(nextList));
    return { success: true, message: `Pengguna ${created.name} berhasil ditambahkan!`, user: created };
  };

  const updateUser = (id: string, updated: Partial<UserProfile>): { success: boolean; message: string } => {
    const nextList = usersList.map((u) => (u.id === id ? { ...u, ...updated } : u));
    setUsersList(nextList);
    localStorage.setItem('itam_users_list', JSON.stringify(nextList));

    if (currentUser?.id === id) {
      const updatedCurrent = { ...currentUser, ...updated };
      setCurrentUser(updatedCurrent);
      localStorage.setItem('itam_auth_user', JSON.stringify(updatedCurrent));
    }

    return { success: true, message: 'Data pengguna berhasil diperbarui.' };
  };

  const deleteUser = (id: string): { success: boolean; message: string } => {
    if (currentUser?.id === id) {
      return { success: false, message: 'Tidak dapat menghapus akun yang sedang Anda gunakan saat ini.' };
    }
    const nextList = usersList.filter((u) => u.id !== id);
    setUsersList(nextList);
    localStorage.setItem('itam_users_list', JSON.stringify(nextList));
    return { success: true, message: 'Pengguna berhasil dihapus.' };
  };

  const switchUserRole = (role: UserRole) => {
    const match = usersList.find((u) => u.role === role) || {
      ...(currentUser || CURRENT_USER),
      role,
      name: role === 'super_admin' ? 'Super Admin' : role === 'it_admin' ? 'Admin IT' : role === 'technician' ? 'Rizki Teknisi' : 'Siti Viewer',
    };
    setCurrentUser(match);
    localStorage.setItem('itam_auth_user', JSON.stringify(match));
    localStorage.setItem('itam_user_role', role);
  };

  const hasPermission = (
    action: 'manage_types' | 'manage_assets' | 'manage_maintenance' | 'delete_data' | 'export_data' | 'manage_users'
  ): boolean => {
    if (!currentUser) return false;
    const role = currentUser.role;
    if (role === 'super_admin') return true;
    if (role === 'it_admin') {
      return action !== 'manage_types'; // Only Super Admin manages custom field definitions
    }
    if (role === 'technician') {
      return action === 'manage_maintenance';
    }
    if (role === 'viewer') {
      return false; // Viewer can only read
    }
    return false;
  };

  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [filterAssetTypeId, setFilterAssetTypeId] = useState<string | null>(null);

  // Data collections with LocalStorage persistence
  const [assetTypes, setAssetTypes] = useState<AssetType[]>(() => {
    const saved = localStorage.getItem('itam_asset_types');
    return saved ? JSON.parse(saved) : INITIAL_ASSET_TYPES;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('itam_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [locations, setLocations] = useState<LocationNode[]>(() => {
    const saved = localStorage.getItem('itam_locations');
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('itam_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    const saved = localStorage.getItem('itam_maintenance');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_RECORDS;
  });

  const [assetHistory, setAssetHistory] = useState<AssetHistory[]>(() => {
    const saved = localStorage.getItem('itam_asset_history');
    return saved ? JSON.parse(saved) : INITIAL_ASSET_HISTORY;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('itam_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [tutorials, setTutorials] = useState<TutorialItem[]>(() => {
    const saved = localStorage.getItem('itam_tutorials');
    return saved ? JSON.parse(saved) : INITIAL_TUTORIALS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('itam_asset_types', JSON.stringify(assetTypes));
  }, [assetTypes]);

  useEffect(() => {
    localStorage.setItem('itam_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('itam_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('itam_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('itam_maintenance', JSON.stringify(maintenanceRecords));
  }, [maintenanceRecords]);

  useEffect(() => {
    localStorage.setItem('itam_asset_history', JSON.stringify(assetHistory));
  }, [assetHistory]);

  useEffect(() => {
    localStorage.setItem('itam_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('itam_tutorials', JSON.stringify(tutorials));
  }, [tutorials]);

  // Asset Types methods
  const addAssetType = (newTypeData: Omit<AssetType, 'id' | 'created_at' | 'updated_at'>): AssetType => {
    const id = `type-${Date.now()}`;
    const now = new Date().toISOString();
    const created: AssetType = {
      ...newTypeData,
      id,
      created_at: now,
      updated_at: now,
      fields: newTypeData.fields.map((f, i) => ({
        ...f,
        id: `f-${id}-${i + 1}`,
        asset_type_id: id,
      })),
    };
    setAssetTypes((prev) => [...prev, created]);
    return created;
  };

  const updateAssetType = (id: string, data: Partial<AssetType>) => {
    setAssetTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t))
    );
  };

  const deleteAssetType = (id: string): boolean => {
    const hasAssets = assets.some((a) => a.asset_type_id === id);
    if (hasAssets) return false;
    setAssetTypes((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  const addFieldToAssetType = (
    assetTypeId: string,
    fieldData: Omit<AssetFieldDefinition, 'id' | 'asset_type_id'>
  ) => {
    const fieldId = `f-${assetTypeId}-${Date.now()}`;
    const newField: AssetFieldDefinition = {
      ...fieldData,
      id: fieldId,
      asset_type_id: assetTypeId,
    };
    setAssetTypes((prev) =>
      prev.map((t) => {
        if (t.id !== assetTypeId) return t;
        return {
          ...t,
          fields: [...t.fields, newField],
          updated_at: new Date().toISOString(),
        };
      })
    );
  };

  const updateFieldInAssetType = (
    assetTypeId: string,
    fieldId: string,
    updatedField: Partial<AssetFieldDefinition>
  ) => {
    setAssetTypes((prev) =>
      prev.map((t) => {
        if (t.id !== assetTypeId) return t;
        return {
          ...t,
          fields: t.fields.map((f) => (f.id === fieldId ? { ...f, ...updatedField } : f)),
          updated_at: new Date().toISOString(),
        };
      })
    );
  };

  const deleteFieldFromAssetType = (assetTypeId: string, fieldId: string) => {
    setAssetTypes((prev) =>
      prev.map((t) => {
        if (t.id !== assetTypeId) return t;
        return {
          ...t,
          fields: t.fields.filter((f) => f.id !== fieldId),
          updated_at: new Date().toISOString(),
        };
      })
    );
  };

  // Assets methods
  const addAsset = (
    assetData: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'photos' | 'documents'>,
    initialPhotos: any[] = [],
    initialDocs: any[] = []
  ): Asset => {
    const id = `ast-${Date.now()}`;
    const now = new Date().toISOString();
    const created: Asset = {
      ...assetData,
      id,
      photos: initialPhotos,
      documents: initialDocs,
      created_at: now,
      updated_at: now,
    };
    setAssets((prev) => [created, ...prev]);

    // Audit trail log
    const historyEntry: AssetHistory = {
      id: `his-${Date.now()}`,
      asset_id: id,
      user_name: currentUserName,
      action: 'create',
      remarks: `Aset baru ${created.asset_tag} (${created.name}) berhasil didaftarkan`,
      created_at: now,
    };
    setAssetHistory((prev) => [historyEntry, ...prev]);

    // Add Notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'new_asset',
        title: 'Aset Baru Ditambahkan',
        message: `${created.asset_tag} - ${created.name} berhasil didaftarkan ke sistem.`,
        asset_id: id,
        created_at: now,
        read: false,
        severity: 'success',
      },
      ...prev,
    ]);

    return created;
  };

  const updateAsset = (id: string, updatedData: Partial<Asset>, remarks?: string) => {
    const oldAsset = assets.find((a) => a.id === id);
    if (!oldAsset) return;

    const now = new Date().toISOString();
    const newAsset = { ...oldAsset, ...updatedData, updated_at: now };

    // Detect changes for Audit Trail
    const changes: AssetHistory[] = [];

    if (updatedData.status && updatedData.status !== oldAsset.status) {
      changes.push({
        id: `his-${Date.now()}-status`,
        asset_id: id,
        user_name: currentUserName,
        action: 'status_change',
        field_changed: 'Status',
        old_value: oldAsset.status,
        new_value: updatedData.status,
        remarks: remarks || `Status diubah dari ${oldAsset.status} ke ${updatedData.status}`,
        created_at: now,
      });
    }

    if (updatedData.custom_values && oldAsset.custom_values) {
      Object.keys(updatedData.custom_values).forEach((key) => {
        const oldVal = oldAsset.custom_values[key];
        const newVal = updatedData.custom_values![key];
        if (oldVal !== newVal && (oldVal !== undefined || newVal !== '')) {
          changes.push({
            id: `his-${Date.now()}-${key}`,
            asset_id: id,
            user_name: currentUserName,
            action: 'update',
            field_changed: key,
            old_value: String(oldVal ?? '-'),
            new_value: String(newVal ?? '-'),
            remarks: remarks || `${currentUserName} memperbarui data ${key}`,
            created_at: now,
          });
        }
      });
    }

    if (updatedData.location_id && updatedData.location_id !== oldAsset.location_id) {
      changes.push({
        id: `his-${Date.now()}-loc`,
        asset_id: id,
        user_name: currentUserName,
        action: 'update',
        field_changed: 'Lokasi',
        remarks: 'Pemindahan lokasi aset',
        created_at: now,
      });
    }

    if (updatedData.employee_id && updatedData.employee_id !== oldAsset.employee_id) {
      changes.push({
        id: `his-${Date.now()}-emp`,
        asset_id: id,
        user_name: currentUserName,
        action: 'assign',
        field_changed: 'Penugasan Pengguna',
        remarks: 'Penugasan / handover aset ke pengguna lain',
        created_at: now,
      });
    }

    setAssets((prev) => prev.map((a) => (a.id === id ? newAsset : a)));
    if (changes.length > 0) {
      setAssetHistory((prev) => [...changes, ...prev]);
    }
  };

  const pushNotification = (notif: {
    type: NotificationType;
    title: string;
    message: string;
    asset_id?: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
  }) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      asset_id: notif.asset_id,
      created_at: new Date().toISOString(),
      read: false,
      severity: notif.severity || 'info',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const deleteAsset = (id: string) => {
    const target = assets.find((a) => a.id === id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setMaintenanceRecords((prev) => prev.filter((m) => m.asset_id !== id));
    setAssetHistory((prev) => prev.filter((h) => h.asset_id !== id));
    if (selectedAssetId === id) setSelectedAssetId(null);
    if (target) {
      pushNotification({
        type: 'asset_deleted',
        title: 'Aset Dihapus',
        message: `Aset ${target.name} (${target.asset_tag}) telah berhasil dihapus.`,
        severity: 'warning',
      });
    }
  };

  const deleteAssets = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const targetSet = new Set(ids);
    setAssets((prev) => prev.filter((a) => !targetSet.has(a.id)));
    setMaintenanceRecords((prev) => prev.filter((m) => !targetSet.has(m.asset_id)));
    setAssetHistory((prev) => prev.filter((h) => !targetSet.has(h.asset_id)));
    if (selectedAssetId && targetSet.has(selectedAssetId)) {
      setSelectedAssetId(null);
    }
    pushNotification({
      type: 'asset_deleted',
      title: 'Hapus Massal Berhasil',
      message: `${ids.length} aset terpilih telah berhasil dihapus secara permanen.`,
      severity: 'warning',
    });
  };

  const clearAllAssets = () => {
    const count = assets.length;
    setAssets([]);
    setMaintenanceRecords([]);
    setAssetHistory([]);
    setSelectedAssetId(null);
    pushNotification({
      type: 'asset_deleted',
      title: 'Inventaris Aset Dikosongkan',
      message: `Seluruh ${count} data aset dan riwayat terkait telah berhasil dikosongkan.`,
      severity: 'warning',
    });
  };

  const addAssetPhoto = (assetId: string, photo: { url: string; caption: string }) => {
    const photoId = `p-${Date.now()}`;
    const now = new Date().toISOString();
    const newPhoto = {
      id: photoId,
      asset_id: assetId,
      url: photo.url,
      caption: photo.caption,
      uploaded_at: now,
    };

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id !== assetId) return a;
        const photos = [...(a.photos || []), newPhoto];
        return {
          ...a,
          photos,
          primary_photo: a.primary_photo || photo.url,
          updated_at: now,
        };
      })
    );

    setAssetHistory((prev) => [
      {
        id: `his-${Date.now()}`,
        asset_id: assetId,
        user_name: currentUserName,
        action: 'upload_photo',
        field_changed: 'Foto Aset',
        new_value: photo.caption,
        remarks: `${currentUserName} mengunggah foto ${photo.caption}`,
        created_at: now,
      },
      ...prev,
    ]);
  };

  const deleteAssetPhoto = (assetId: string, photoId: string) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id !== assetId) return a;
        const photos = a.photos.filter((p) => p.id !== photoId);
        return {
          ...a,
          photos,
          primary_photo: photos.length > 0 ? photos[0].url : undefined,
        };
      })
    );
  };

  const addAssetDocument = (
    assetId: string,
    doc: {
      title: string;
      file_name: string;
      file_type: 'pdf' | 'excel' | 'word' | 'txt' | 'other';
      url: string;
      file_size?: string;
    }
  ) => {
    const docId = `d-${Date.now()}`;
    const now = new Date().toISOString();
    const newDoc = {
      id: docId,
      asset_id: assetId,
      ...doc,
      uploaded_at: now,
    };

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id !== assetId) return a;
        return {
          ...a,
          documents: [...(a.documents || []), newDoc],
          updated_at: now,
        };
      })
    );

    setAssetHistory((prev) => [
      {
        id: `his-${Date.now()}`,
        asset_id: assetId,
        user_name: currentUserName,
        action: 'upload_document',
        field_changed: 'Dokumen',
        new_value: doc.title,
        remarks: `${currentUserName} mengunggah dokumen ${doc.title}`,
        created_at: now,
      },
      ...prev,
    ]);
  };

  const deleteAssetDocument = (assetId: string, docId: string) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id !== assetId) return a;
        return {
          ...a,
          documents: a.documents.filter((d) => d.id !== docId),
        };
      })
    );
  };

  const importAssetsBulk = (
    newAssets: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'photos' | 'documents'>[]
  ): { successCount: number; errors: string[] } => {
    const errors: string[] = [];
    const validAssets: Asset[] = [];
    const now = new Date().toISOString();

    const existingTags = new Set(assets.map((a) => a.asset_tag.toLowerCase()));
    const existingSNs = new Set(assets.filter((a) => a.serial_number).map((a) => a.serial_number.toLowerCase()));

    newAssets.forEach((item, index) => {
      const rowNum = index + 1;
      if (!item.asset_tag) {
        errors.push(`Baris ${rowNum}: Asset ID / Tag wajib diisi.`);
        return;
      }
      if (existingTags.has(item.asset_tag.toLowerCase())) {
        errors.push(`Baris ${rowNum}: Asset ID '${item.asset_tag}' sudah terdaftar (duplikat).`);
        return;
      }
      if (item.serial_number && existingSNs.has(item.serial_number.toLowerCase())) {
        errors.push(`Baris ${rowNum}: Serial Number '${item.serial_number}' sudah terdaftar (duplikat).`);
        return;
      }

      existingTags.add(item.asset_tag.toLowerCase());
      if (item.serial_number) existingSNs.add(item.serial_number.toLowerCase());

      validAssets.push({
        ...item,
        id: `ast-imp-${Date.now()}-${index}`,
        photos: [],
        documents: [],
        created_at: now,
        updated_at: now,
      });
    });

    if (validAssets.length > 0) {
      setAssets((prev) => [...validAssets, ...prev]);
    }

    return { successCount: validAssets.length, errors };
  };

  // Locations methods
  const addLocation = (loc: Omit<LocationNode, 'id'>): LocationNode => {
    const newLoc: LocationNode = {
      ...loc,
      id: `loc-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setLocations((prev) => [...prev, newLoc]);
    return newLoc;
  };

  const updateLocation = (id: string, loc: Partial<LocationNode>) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...loc } : l)));
  };

  const deleteLocation = (id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id && l.parent_id !== id));
  };

  const importLocationsBulk = (
    newLocations: Omit<LocationNode, 'id'>[]
  ): { successCount: number; errors: string[] } => {
    const errors: string[] = [];
    const valid: LocationNode[] = [];
    const now = new Date().toISOString();
    const existingCodes = new Set(locations.map((l) => l.code.toLowerCase()));

    newLocations.forEach((loc, idx) => {
      const rowNum = idx + 1;
      if (!loc.name) {
        errors.push(`Baris ${rowNum}: Nama lokasi wajib diisi.`);
        return;
      }
      const code = loc.code || `LOC-${Math.floor(1000 + Math.random() * 9000)}`;
      if (existingCodes.has(code.toLowerCase())) {
        errors.push(`Baris ${rowNum}: Kode lokasi '${code}' sudah ada.`);
        return;
      }
      existingCodes.add(code.toLowerCase());
      valid.push({
        ...loc,
        code,
        id: `loc-${Date.now()}-${idx}`,
        created_at: now,
      });
    });

    if (valid.length > 0) {
      setLocations((prev) => [...prev, ...valid]);
    }
    return { successCount: valid.length, errors };
  };

  // Employees methods
  const addEmployee = (emp: Omit<Employee, 'id'>): Employee => {
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setEmployees((prev) => [...prev, newEmp]);
    return newEmp;
  };

  const updateEmployee = (id: string, emp: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...emp } : e)));
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const importEmployeesBulk = (
    newEmployees: Omit<Employee, 'id'>[]
  ): { successCount: number; errors: string[] } => {
    const errors: string[] = [];
    const valid: Employee[] = [];
    const now = new Date().toISOString();
    const existingEmails = new Set(employees.map((e) => e.email.toLowerCase()));

    newEmployees.forEach((emp, idx) => {
      const rowNum = idx + 1;
      if (!emp.full_name) {
        errors.push(`Baris ${rowNum}: Nama lengkap karyawan wajib diisi.`);
        return;
      }
      const email = emp.email || `${emp.full_name.toLowerCase().replace(/\s+/g, '.')}@perusahaan.co.id`;
      if (existingEmails.has(email.toLowerCase())) {
        errors.push(`Baris ${rowNum}: Email '${email}' sudah terdaftar.`);
        return;
      }
      existingEmails.add(email.toLowerCase());
      valid.push({
        ...emp,
        email,
        nip: emp.nip || `NIP-${Math.floor(100000 + Math.random() * 900000)}`,
        id: `emp-${Date.now()}-${idx}`,
        created_at: now,
      });
    });

    if (valid.length > 0) {
      setEmployees((prev) => [...prev, ...valid]);
    }
    return { successCount: valid.length, errors };
  };

  // Maintenance methods
  const addMaintenanceRecord = (record: Omit<MaintenanceRecord, 'id' | 'created_at'>): MaintenanceRecord => {
    const newRec: MaintenanceRecord = {
      ...record,
      id: `mnt-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setMaintenanceRecords((prev) => [newRec, ...prev]);

    // Automatically update asset status if maintenance is in progress
    if (newRec.status === 'in_progress') {
      updateAsset(newRec.asset_id, { status: 'maintenance' }, `Maintenance dimulai: ${newRec.title}`);
    } else if (newRec.status === 'completed') {
      updateAsset(newRec.asset_id, { status: 'active' }, `Maintenance selesai: ${newRec.title}`);
    }

    return newRec;
  };

  const updateMaintenanceRecord = (id: string, record: Partial<MaintenanceRecord>) => {
    setMaintenanceRecords((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, ...record };
        if (record.status === 'completed' && m.status !== 'completed') {
          updateAsset(m.asset_id, { status: 'active' }, `Maintenance ${m.maintenance_number} diselesaikan`);
        } else if (record.status === 'in_progress' && m.status !== 'in_progress') {
          updateAsset(m.asset_id, { status: 'maintenance' }, `Maintenance ${m.maintenance_number} sedang berjalan`);
        }
        return updated;
      })
    );
  };

  const deleteMaintenanceRecord = (id: string) => {
    setMaintenanceRecords((prev) => prev.filter((m) => m.id !== id));
  };

  // Tutorials & SOPs methods
  const addTutorial = (tutorial: Omit<TutorialItem, 'id' | 'created_at'>): TutorialItem => {
    const newTut: TutorialItem = {
      ...tutorial,
      id: `tut-${Date.now()}`,
      created_by: currentUserName,
      created_at: new Date().toISOString(),
    };
    setTutorials((prev) => [newTut, ...prev]);
    return newTut;
  };

  const updateTutorial = (id: string, updated: Partial<TutorialItem>) => {
    setTutorials((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTutorial = (id: string) => {
    setTutorials((prev) => prev.filter((t) => t.id !== id));
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const openScanner = () => setIsScannerOpen(true);
  const closeScanner = () => setIsScannerOpen(false);

  const [printLabelsAssets, setPrintLabelsAssets] = useState<Asset[]>([]);
  const openPrintLabels = (assetsToPrint: Asset[]) => setPrintLabelsAssets(assetsToPrint);
  const closePrintLabels = () => setPrintLabelsAssets([]);

  // Backup & Reset
  const resetAllDataToDefault = () => {
    localStorage.removeItem('itam_asset_types');
    localStorage.removeItem('itam_assets');
    localStorage.removeItem('itam_locations');
    localStorage.removeItem('itam_employees');
    localStorage.removeItem('itam_maintenance');
    localStorage.removeItem('itam_asset_history');
    localStorage.removeItem('itam_notifications');
    localStorage.removeItem('itam_tutorials');

    setAssetTypes(INITIAL_ASSET_TYPES);
    setAssets(INITIAL_ASSETS);
    setLocations(INITIAL_LOCATIONS);
    setEmployees(INITIAL_EMPLOYEES);
    setMaintenanceRecords(INITIAL_MAINTENANCE_RECORDS);
    setAssetHistory(INITIAL_ASSET_HISTORY);
    setNotifications(INITIAL_NOTIFICATIONS);
    setTutorials(INITIAL_TUTORIALS);
    setSelectedAssetId(null);
  };

  const exportDatabaseJSON = () => {
    const data = {
      assetTypes,
      assets,
      locations,
      employees,
      maintenanceRecords,
      assetHistory,
      tutorials,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    return JSON.stringify(data, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.assetTypes) setAssetTypes(data.assetTypes);
      if (data.assets) setAssets(data.assets);
      if (data.locations) setLocations(data.locations);
      if (data.employees) setEmployees(data.employees);
      if (data.maintenanceRecords) setMaintenanceRecords(data.maintenanceRecords);
      if (data.assetHistory) setAssetHistory(data.assetHistory);
      if (data.tutorials) setTutorials(data.tutorials);
      return true;
    } catch (e) {
      console.error('Failed to parse backup JSON:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        usersList,
        login,
        loginAsUser,
        logout,
        createUser,
        updateUser,
        deleteUser,
        switchUserRole,
        hasPermission,
        activeTab,
        setActiveTab,
        selectedAssetId,
        setSelectedAssetId,
        filterAssetTypeId,
        setFilterAssetTypeId,
        isDarkMode,
        themeMode,
        setThemeMode,
        toggleDarkMode,
        assetTypes,
        addAssetType,
        updateAssetType,
        deleteAssetType,
        addFieldToAssetType,
        updateFieldInAssetType,
        deleteFieldFromAssetType,
        assets,
        addAsset,
        updateAsset,
        deleteAsset,
        deleteAssets,
        clearAllAssets,
        addAssetPhoto,
        deleteAssetPhoto,
        addAssetDocument,
        deleteAssetDocument,
        importAssetsBulk,
        locations,
        addLocation,
        updateLocation,
        deleteLocation,
        importLocationsBulk,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        importEmployeesBulk,
        maintenanceRecords,
        addMaintenanceRecord,
        updateMaintenanceRecord,
        deleteMaintenanceRecord,
        tutorials,
        addTutorial,
        updateTutorial,
        deleteTutorial,
        assetHistory,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        isScannerOpen,
        openScanner,
        closeScanner,
        printLabelsAssets,
        openPrintLabels,
        closePrintLabels,
        resetAllDataToDefault,
        exportDatabaseJSON,
        importDatabaseJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
