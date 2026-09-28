import React from 'react';
import {
  BarChart3,
  Box,
  Layers,
  ArrowRight,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrencyIDR } from '../../utils';
import { IconRenderer } from '../common/IconRenderer';

export const StatisticsView: React.FC = () => {
  const { assets, assetTypes, setActiveTab, setFilterAssetTypeId } = useApp();

  const totalCount = assets.length;

  // Breakdown per type with valuation
  const statsPerType = assetTypes.map((type) => {
    const typeAssets = assets.filter((a) => a.asset_type_id === type.id);
    const count = typeAssets.length;
    const totalCost = typeAssets.reduce((acc, a) => acc + (a.purchase_cost || 0), 0);
    const activeCount = typeAssets.filter((a) => a.status === 'active').length;
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

    return {
      type,
      count,
      totalCost,
      activeCount,
      percentage,
    };
  }).sort((a, b) => b.count - a.count);

  const handleDrilldown = (typeId: string) => {
    setFilterAssetTypeId(typeId);
    setActiveTab('assets');
  };

  const grandTotalCost = assets.reduce((acc, a) => acc + (a.purchase_cost || 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Statistik & Analisis Inventaris IT
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              DRILL-DOWN INTERACTIVE
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Klik pada salah satu kartu statistik atau grafik untuk memfilter daftar aset secara instan
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Seluruh Aset
            </span>
            <span className="text-xl font-black text-brand-600 dark:text-brand-400">
              {totalCount} Unit
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:border-slate-800" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Nilai Kapitalisasi
            </span>
            <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrencyIDR(grandTotalCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Requirement 18: Clickable Category Cards */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Statistik Aset Berdasarkan Kategori (Klik Kartu untuk Drill-down)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {statsPerType.map((item) => (
            <div
              key={item.type.id}
              onClick={() => handleDrilldown(item.type.id)}
              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-brand-500 hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
                    style={{ backgroundColor: item.type.color || '#4f46e5' }}
                  >
                    <IconRenderer name={item.type.icon} className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {item.type.code}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {item.type.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {item.type.description || 'Kategori inventaris'}
                </p>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                    {item.count}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {item.percentage}% dari total
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.type.color || '#4f46e5',
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                  {formatCurrencyIDR(item.totalCost)}
                </span>

                <span className="text-slate-400 group-hover:text-brand-500 flex items-center gap-1 font-semibold text-[11px] transition-colors">
                  <span>Lihat</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Comparison Bar Chart */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Komparasi Kuantitas Aset Antar Jenis
              </h3>
              <p className="text-xs text-slate-400">Klik baris batang untuk memfilter tabel aset</p>
            </div>
            <BarChart3 className="w-5 h-5 text-brand-500" />
          </div>

          <div className="space-y-3 pt-2">
            {statsPerType.map((item) => (
              <div
                key={item.type.id}
                onClick={() => handleDrilldown(item.type.id)}
                className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-brand-500 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.type.color || '#4f46e5' }}
                    />
                    {item.type.name}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {item.count} unit ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 group-hover:brightness-110"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.type.color || '#4f46e5',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Valuation Share */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Distribusi Nilai Kapitalisasi Aset (IDR)
              </h3>
              <p className="text-xs text-slate-400">Porsi nilai investasi hardware perusahaan</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="space-y-3 pt-2">
            {statsPerType.map((item) => {
              const costPercentage = grandTotalCost > 0 ? Math.round((item.totalCost / grandTotalCost) * 100) : 0;
              return (
                <div
                  key={item.type.id}
                  onClick={() => handleDrilldown(item.type.id)}
                  className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-500">
                      {item.type.name}
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrencyIDR(item.totalCost)} ({costPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700 group-hover:bg-emerald-400"
                      style={{ width: `${costPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
