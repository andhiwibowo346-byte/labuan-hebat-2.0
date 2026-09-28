import React from 'react';
import { X, Printer, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';

export const PrintLabelsModal: React.FC = () => {
  const { printLabelsAssets, closePrintLabels, assetTypes, locations } = useApp();

  if (printLabelsAssets.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header - Hidden on Print */}
        <div className="no-print px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cetak Stiker Label QR Code ({printLabelsAssets.length} Aset)
              </h3>
              <p className="text-xs text-slate-400">
                Format stiker thermal label atau lembar stiker A4 siap cetak
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print)</span>
            </button>

            <button
              onClick={closePrintLabels}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {printLabelsAssets.map((asset) => {
              const type = assetTypes.find((t) => t.id === asset.asset_type_id);
              const loc = locations.find((l) => l.id === asset.location_id);

              return (
                <div
                  key={asset.id}
                  className="bg-white text-slate-900 border-2 border-slate-900 rounded-2xl p-4 shadow-sm flex flex-col justify-between print-page-break"
                  style={{ minHeight: '180px' }}
                >
                  {/* Top Label Brand */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block leading-none">
                        LABUAN HEBAT
                      </span>
                      <span className="text-[9px] text-slate-600 font-medium">
                        IT ASSET MANAGEMENT SYSTEM
                      </span>
                    </div>
                    <span className="font-mono text-xs font-black px-1.5 py-0.5 border border-slate-900 rounded">
                      {type?.code || 'ITAM'}
                    </span>
                  </div>

                  {/* Main QR + Data Row */}
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-white border border-slate-400 rounded-lg shrink-0">
                      <QRCodeSVG
                        value={JSON.stringify({
                          tag: asset.asset_tag,
                          sn: asset.serial_number,
                          type: type?.name,
                        })}
                        size={80}
                        level="M"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-base font-black tracking-tight block leading-tight text-slate-900">
                        {asset.asset_tag}
                      </span>
                      <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                        {asset.name}
                      </p>
                      <p className="font-mono text-[10px] text-slate-600 truncate mt-0.5">
                        SN: {asset.serial_number || 'N/A'}
                      </p>
                      {loc && (
                        <p className="text-[9px] text-slate-500 truncate mt-0.5">
                          Lok: {loc.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Footer */}
                  <div className="mt-2 pt-1 border-t border-slate-300 text-[8px] text-slate-500 flex items-center justify-between">
                    <span>PROPERTY OF COMPANY • DO NOT REMOVE</span>
                    <span className="font-mono">{new Date().getFullYear()}</span>
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
