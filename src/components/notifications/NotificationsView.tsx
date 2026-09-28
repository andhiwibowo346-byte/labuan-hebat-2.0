import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Camera,
  MapPin,
  ShieldAlert,
  FileWarning,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationType } from '../../types';
import { formatDateTimeIndonesian } from '../../utils';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setSelectedAssetId,
    setActiveTab,
  } = useApp();

  const [filterType, setFilterType] = useState<string>('all');
  const [onlyUnread, setOnlyUnread] = useState(false);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (onlyUnread && n.read) return false;
      if (filterType !== 'all' && n.type !== filterType) return false;
      return true;
    });
  }, [notifications, onlyUnread, filterType]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const notifTypeFilters: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: 'Semua Notifikasi', icon: Bell },
    { id: 'maintenance_due', label: 'Maintenance', icon: Clock },
    { id: 'damaged_asset', label: 'Aset Rusak', icon: AlertTriangle },
    { id: 'warranty_expiring', label: 'Garansi', icon: ShieldAlert },
    { id: 'missing_photo', label: 'Foto Kurang', icon: Camera },
    { id: 'missing_location', label: 'Lokasi Kosong', icon: MapPin },
    { id: 'new_asset', label: 'Aset Baru', icon: Sparkles },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Pusat Notifikasi & Alert Sistem
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                {unreadCount} Belum Dibaca
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Peringatan otomatis: maintenance jatuh tempo, aset rusak, masa garansi, dan kelengkapan dokumen
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
          >
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Tandai Semua Dibaca</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {notifTypeFilters.map((tab) => {
          const Icon = tab.icon;
          const isSelected = filterType === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        <label className="flex items-center gap-2 ml-auto text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyUnread}
            onChange={(e) => setOnlyUnread(e.target.checked)}
            className="rounded text-brand-600 focus:ring-brand-500"
          />
          <span>Hanya yang belum dibaca</span>
        </label>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-16 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tidak ada notifikasi pada kategori ini
            </p>
            <p className="text-xs text-slate-400 mt-1">Seluruh status operasional termonitor baik</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const Icon =
              notif.severity === 'error'
                ? AlertCircle
                : notif.severity === 'warning'
                ? AlertTriangle
                : CheckCircle2;

            const iconColors =
              notif.severity === 'error'
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                : notif.severity === 'warning'
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

            return (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 ${
                  notif.read
                    ? 'border-slate-200/70 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 opacity-80'
                    : 'border-brand-500/40 bg-brand-50/20 dark:bg-brand-950/20 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${iconColors}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-2 block">
                      {formatDateTimeIndonesian(notif.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      title="Tandai telah dibaca"
                    >
                      Baca
                    </button>
                  )}

                  {notif.asset_id && (
                    <button
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        setSelectedAssetId(notif.asset_id!);
                        setActiveTab('assets');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm"
                    >
                      <span>Buka Aset</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
