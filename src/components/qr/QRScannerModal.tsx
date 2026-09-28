import React, { useState } from 'react';
import { QrCode, X, Camera, Upload, Search, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QRScannerModal: React.FC = () => {
  const { isScannerOpen, closeScanner, assets, setSelectedAssetId, setActiveTab } = useApp();

  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isScannerOpen) return null;

  const handleLookup = (code: string) => {
    setErrorMsg(null);
    const cleaned = code.trim().toLowerCase();
    if (!cleaned) return;

    // Match by asset_tag or serial_number or parsed json
    let matchedAsset = assets.find(
      (a) =>
        a.asset_tag.toLowerCase() === cleaned ||
        (a.serial_number && a.serial_number.toLowerCase() === cleaned)
    );

    // Try parsing as JSON if from QR Code
    if (!matchedAsset && code.startsWith('{')) {
      try {
        const parsed = JSON.parse(code);
        if (parsed.tag) {
          matchedAsset = assets.find((a) => a.asset_tag.toLowerCase() === parsed.tag.toLowerCase());
        }
      } catch {}
    }

    if (matchedAsset) {
      setSelectedAssetId(matchedAsset.id);
      setActiveTab('assets');
      closeScanner();
    } else {
      setErrorMsg(`Aset dengan kode '${code}' tidak ditemukan di sistem.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Scan QR Code Aset
              </h3>
              <p className="text-xs text-slate-400">Pindai atau masukkan ID aset untuk membuka detail</p>
            </div>
          </div>

          <button
            onClick={closeScanner}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Scanner Viewport Mockup with Active Laser Beam */}
        <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-3xl bg-slate-950 border-2 border-slate-800 overflow-hidden flex flex-col items-center justify-center text-center p-4 shadow-inner">
          {/* Laser scanning line animation */}
          <div className="absolute inset-x-6 h-0.5 bg-brand-500 shadow-glow-brand animate-bounce" />

          {/* Corner viewfinder brackets */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-brand-400 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-brand-400 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-brand-400 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-brand-400 rounded-br-lg" />

          <Camera className="w-12 h-12 text-slate-600 mb-2 animate-pulse" />
          <p className="text-xs text-slate-400">Arahkan kamera ke label QR aset</p>
          <span className="text-[10px] text-brand-400 font-mono mt-1">Ready for input / scanner</span>
        </div>

        {/* Direct Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup(inputCode);
          }}
          className="mt-4 space-y-3"
        >
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Atau Input / Barcode Scanner Langsung:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="ATM-001 / SN123456"
                className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shrink-0"
              >
                Cari
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Simulation Buttons */}
          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Simulasi Cepat Scan Aset Demo:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {assets.slice(0, 4).map((a) => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => handleLookup(a.asset_tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:text-brand-600 transition-colors"
                >
                  ⚡ {a.asset_tag}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
