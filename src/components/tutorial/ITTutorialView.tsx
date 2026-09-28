import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Search,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  Copy,
  Check,
  ShieldCheck,
  Wrench,
  Monitor,
  Network,
  Server,
  Plus,
  Trash2,
  X,
  ArrowRight,
  Info,
  Sparkles,
  Tag,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TutorialItem, TutorialStep } from '../../types';

export const ITTutorialView: React.FC = () => {
  const {
    tutorials,
    addTutorial,
    deleteTutorial,
    currentUser,
    hasPermission,
    assetTypes,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialItem | null>(null);

  // Completed checklist step state per tutorial
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  // Super Admin Add Tutorial Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for new tutorial
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'atm' | 'pc_laptop' | 'network' | 'server' | 'sop' | 'other'>('pc_laptop');
  const [newDifficulty, setNewDifficulty] = useState<'Mudah' | 'Menengah' | 'Lanjutan'>('Mudah');
  const [newEstimatedTime, setNewEstimatedTime] = useState('15 Menit');
  const [newSymptoms, setNewSymptoms] = useState<string[]>(['']);
  const [newSummary, setNewSummary] = useState('');
  const [newApplicableTypes, setNewApplicableTypes] = useState<string[]>([]);
  const [newSteps, setNewSteps] = useState<TutorialStep[]>([
    {
      step: 1,
      title: '',
      description: '',
      command: '',
      tip: '',
    },
  ]);

  const canManageTutorials =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'it_admin' ||
    hasPermission('manage_assets');

  const filteredTutorials = useMemo(() => {
    return tutorials.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.symptoms.some((s) => s.toLowerCase().includes(q)) ||
          item.applicableTypes.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [tutorials, selectedCategory, searchQuery]);

  const toggleChecklistStep = (tutorialId: string, stepNumber: number) => {
    setCompletedSteps((prev) => {
      const current = prev[tutorialId] || [];
      const updated = current.includes(stepNumber)
        ? current.filter((s) => s !== stepNumber)
        : [...current, stepNumber];
      return { ...prev, [tutorialId]: updated };
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(text);
    setTimeout(() => setCopiedCommand(null), 2500);
  };

  // Add / remove symptom
  const handleAddSymptom = () => {
    setNewSymptoms((prev) => [...prev, '']);
  };

  const handleRemoveSymptom = (index: number) => {
    setNewSymptoms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSymptomChange = (index: number, val: string) => {
    setNewSymptoms((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  // Add / remove step
  const handleAddStep = () => {
    setNewSteps((prev) => [
      ...prev,
      {
        step: prev.length + 1,
        title: '',
        description: '',
        command: '',
        tip: '',
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (newSteps.length <= 1) return;
    setNewSteps((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((s, i) => ({ ...s, step: i + 1 }));
    });
  };

  const handleStepChange = (index: number, field: keyof TutorialStep, val: string) => {
    setNewSteps((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // Toggle applicable asset type
  const handleToggleApplicableType = (typeName: string) => {
    setNewApplicableTypes((prev) =>
      prev.includes(typeName) ? prev.filter((t) => t !== typeName) : [...prev, typeName]
    );
  };

  // Save new tutorial
  const handleSaveTutorial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Judul tutorial wajib diisi.');
      return;
    }

    const validSteps = newSteps.filter((s) => s.title.trim() && s.description.trim());
    if (validSteps.length === 0) {
      alert('Harap isi minimal 1 langkah penyelesaian yang memiliki Judul dan Deskripsi.');
      return;
    }

    const cleanSymptoms = newSymptoms.map((s) => s.trim()).filter((s) => s.length > 0);

    const created = addTutorial({
      title: newTitle.trim(),
      category: newCategory,
      difficulty: newDifficulty,
      estimatedTime: newEstimatedTime.trim() || '15 Menit',
      symptoms: cleanSymptoms.length > 0 ? cleanSymptoms : ['Kendala operasional sistem IT'],
      summary: newSummary.trim() || 'Panduan penanganan insiden teknis standar IT.',
      steps: validSteps.map((s, i) => ({ ...s, step: i + 1 })),
      applicableTypes: newApplicableTypes.length > 0 ? newApplicableTypes : ['Semua Tipe'],
    });

    // Reset Form
    setNewTitle('');
    setNewSummary('');
    setNewSymptoms(['']);
    setNewSteps([{ step: 1, title: '', description: '', command: '', tip: '' }]);
    setNewApplicableTypes([]);
    setIsAddModalOpen(false);

    // Open newly created tutorial
    setSelectedTutorial(created);
  };

  const handleDeleteTutorial = (id: string, title: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus tutorial "${title}"?`)) {
      deleteTutorial(id);
      if (selectedTutorial?.id === id) {
        setSelectedTutorial(null);
      }
    }
  };

  const categoryPills = [
    { id: 'all', label: 'Semua Panduan', icon: BookOpen },
    { id: 'atm', label: 'ATM & Mesin Transaksi', icon: CreditCardIcon },
    { id: 'pc_laptop', label: 'PC, Laptop & OS', icon: Monitor },
    { id: 'network', label: 'Jaringan & Switch', icon: Network },
    { id: 'server', label: 'Server & Database', icon: Server },
    { id: 'sop', label: 'SOP & Prosedur IT', icon: ShieldCheck },
  ];

  function CreditCardIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
              LABUAN HEBAT • IT ONBOARDING ACADEMY
            </span>
            <span className="text-xs text-brand-300">{tutorials.length} Modul Aktif</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
            Pusat Tutorial & SOP Pemecahan Masalah IT
          </h1>
          <p className="text-xs md:text-sm text-brand-200/80 mt-1 leading-relaxed">
            Tempat belajar mandiri untuk staf dan teknisi IT baru. Temukan SOP resmi, langkah-langkah troubleshooting step-by-step, kode perintah, dan solusi praktis untuk masalah ATM, PC, Jaringan, dan Server.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          {canManageTutorials && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tutorial & SOP</span>
            </button>
          )}
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari masalah (misal: ATM offline, BSOD, BitLocker, DHCP)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs md:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categoryPills.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Tutorial Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTutorials.map((tut) => {
          const completedCount = (completedSteps[tut.id] || []).length;
          const totalCount = tut.steps.length;
          const progressPct = Math.round((completedCount / totalCount) * 100);

          return (
            <div
              key={tut.id}
              onClick={() => setSelectedTutorial(tut)}
              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-brand-500 hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all flex flex-col justify-between group relative"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tut.difficulty === 'Mudah'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : tut.difficulty === 'Menengah'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}
                    >
                      {tut.difficulty}
                    </span>
                    {tut.created_by && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold">
                        {tut.created_by}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {tut.estimatedTime}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                  {tut.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                  {tut.summary}
                </p>

                {/* Symptoms pills */}
                <div className="mt-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Gejala Umum:
                  </span>
                  {tut.symptoms.slice(0, 2).map((sym, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="text-rose-500 leading-none mt-0.5">•</span>
                      <span className="line-clamp-1">{sym}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Progress & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    {completedCount} dari {totalCount} langkah selesai
                  </span>
                  <div className="w-24 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canManageTutorials && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTutorial(tut.id, tut.title);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Hapus Tutorial"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Pelajari</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL: INTERACTIVE STEP-BY-STEP PROBLEM SOLVER */}
      {selectedTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    SOP TEKNIS IT • {selectedTutorial.category.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Estimasi: {selectedTutorial.estimatedTime}
                  </span>
                  {selectedTutorial.created_by && (
                    <span className="text-[10px] text-slate-400">
                      • Oleh: {selectedTutorial.created_by}
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {selectedTutorial.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 sm:line-clamp-none">
                  {selectedTutorial.summary}
                </p>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {canManageTutorials && (
                  <button
                    onClick={() => handleDeleteTutorial(selectedTutorial.id, selectedTutorial.title)}
                    className="p-1.5 sm:p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    title="Hapus Tutorial Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedTutorial(null)}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Steps Checklist */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
              {/* Applicable Types */}
              {selectedTutorial.applicableTypes && selectedTutorial.applicableTypes.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Berlaku Untuk:
                  </span>
                  {selectedTutorial.applicableTypes.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Symptoms Callout Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                <span className="font-bold flex items-center gap-1.5 mb-1.5 text-amber-800 dark:text-amber-200 uppercase tracking-wider text-[11px]">
                  <AlertTriangle className="w-4 h-4" /> Gejala & Masalah yang Sering Terjadi:
                </span>
                <ul className="space-y-1 list-disc pl-5">
                  {selectedTutorial.symptoms.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Step by step checklist */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Langkah-Langkah Penyelesaian Masalah (Klik Centang Saat Selesai):
                </h3>

                {selectedTutorial.steps.map((st) => {
                  const isChecked = (
                    completedSteps[selectedTutorial.id] || []
                  ).includes(st.step);

                  return (
                    <div
                      key={st.step}
                      className={`p-4 rounded-2xl border transition-all ${
                        isChecked
                          ? 'bg-emerald-500/5 border-emerald-500/30'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleChecklistStep(selectedTutorial.id, st.step)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-all ${
                            isChecked
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                              : 'border-2 border-slate-300 dark:border-slate-700 text-slate-400 hover:border-brand-500'
                          }`}
                        >
                          {isChecked ? '✓' : st.step}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => toggleChecklistStep(selectedTutorial.id, st.step)}
                            className={`text-xs md:text-sm font-bold cursor-pointer select-none ${
                              isChecked
                                ? 'line-through text-slate-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            Langkah {st.step}: {st.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line leading-relaxed">
                            {st.description}
                          </p>

                          {/* Command Line Box */}
                          {st.command && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs flex items-center justify-between gap-3 border border-slate-800">
                              <div className="flex items-center gap-2 truncate">
                                <Terminal className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                                <span className="text-emerald-400 truncate">{st.command}</span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(st.command!)}
                                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 flex items-center gap-1 shrink-0"
                              >
                                {copiedCommand === st.command ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Tersalin</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Salin</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {/* Tip Alert */}
                          {st.tip && (
                            <div className="mt-2 p-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/50 dark:border-brand-900/30 text-[11px] text-brand-700 dark:text-brand-300">
                              💡 <b>Pro Tip:</b> {st.tip}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Masalah belum terselesaikan melalui panduan standar?
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedTutorial(null);
                    setActiveTab('maintenance');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Buat Tiket Maintenance</span>
                </button>

                <button
                  onClick={() => setSelectedTutorial(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  Tutup Panduan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPERADMIN ADD TUTORIAL MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            <form onSubmit={handleSaveTutorial} className="flex flex-col flex-1 overflow-hidden">
              {/* Modal Header */}
              <div className="p-3.5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg md:text-xl font-black tracking-tight truncate">
                      Tambah Tutorial & SOP Baru
                    </h2>
                    <p className="text-[11px] sm:text-xs text-emerald-100 truncate">
                      Otoritas Super Admin: Tambahkan panduan teknis agar langsung dipelajari tim IT
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 sm:p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 shrink-0 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Tutorial / SOP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Troubleshooting Printer Kasir / Thermal Paper Jammed"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs md:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Grid Category, Difficulty, Estimated Time */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kategori
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                    >
                      <option value="atm">ATM & Transaksi</option>
                      <option value="pc_laptop">PC, Laptop & OS</option>
                      <option value="network">Jaringan & Switch</option>
                      <option value="server">Server & Database</option>
                      <option value="sop">SOP & Regulasi IT</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tingkat Kesulitan
                    </label>
                    <select
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                    >
                      <option value="Mudah">Mudah</option>
                      <option value="Menengah">Menengah</option>
                      <option value="Lanjutan">Lanjutan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Estimasi Waktu
                    </label>
                    <input
                      type="text"
                      value={newEstimatedTime}
                      onChange={(e) => setNewEstimatedTime(e.target.value)}
                      placeholder="Contoh: 15 Menit"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Applicable Asset Types */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Jenis Aset Terkait (Opsional):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {assetTypes.map((t) => {
                      const isSelected = newApplicableTypes.includes(t.name);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleToggleApplicableType(t.name)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Gejala Masalah / Tanda Gangguan:
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSymptom}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Gejala
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newSymptoms.map((sym, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={sym}
                          onChange={(e) => handleSymptomChange(i, e.target.value)}
                          placeholder={`Gejala ${i + 1} (contoh: Lampu indikator error berkedip merah)`}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                        />
                        {newSymptoms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSymptom(i)}
                            className="p-2 text-slate-400 hover:text-rose-500 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ringkasan Solusi / Penjelasan Singkat
                  </label>
                  <textarea
                    rows={2}
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    placeholder="Ringkasan langkah penanganan teknis..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Step by Step Builder */}
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Langkah-Langkah Penyelesaian ({newSteps.length} Langkah):
                    </span>
                    <button
                      type="button"
                      onClick={handleAddStep}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Langkah Berikutnya</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {newSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase">
                            Langkah {step.step}
                          </span>
                          {newSteps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveStep(idx)}
                              className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus Langkah
                            </button>
                          )}
                        </div>

                        <div>
                          <input
                            type="text"
                            required
                            value={step.title}
                            onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                            placeholder={`Judul Langkah ${step.step} (Contoh: Putuskan Daya dan Buka Penutup)`}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <textarea
                            rows={2}
                            required
                            value={step.description}
                            onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                            placeholder="Deskripsi langkah penanganan detail..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              value={step.command || ''}
                              onChange={(e) => handleStepChange(idx, 'command', e.target.value)}
                              placeholder="Perintah CLI (opsional: ping, ipconfig, dll)"
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-800 dark:text-slate-100"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              value={step.tip || ''}
                              onChange={(e) => handleStepChange(idx, 'tip', e.target.value)}
                              placeholder="Tips / Catatan Keamanan (opsional)"
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] text-slate-800 dark:text-slate-100"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan & Terbitkan Tutorial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
