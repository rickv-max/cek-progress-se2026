import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Target, 
  FileEdit, 
  CheckCircle, 
  Send, 
  XCircle, 
  Clock,
  PieChart,
  AlertCircle,
  Activity,
  Info
} from 'lucide-react';

// --- KOMPONEN INPUT ---
const InputField = ({ label, name, icon: Icon, colorClass, placeholder, value, onChange }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label htmlFor={name} className="text-sm font-semibold text-slate-600 flex items-center gap-2">
      <Icon className={`w-4 h-4 ${colorClass}`} />
      {label}
    </label>
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*" // Memicu numpad angka di mobile
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || "0"}
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 font-medium text-lg placeholder:text-slate-300 shadow-sm"
      />
    </div>
  </div>
);

// --- KOMPONEN STAT CARD ---
const StatCard = ({ label, count, percent, color, icon: Icon, bgLight }) => (
  <div className={`p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow`}>
    <div className={`absolute top-0 left-0 w-1 h-full ${color}`}></div>
    <div className="flex justify-between items-center">
      <span className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
        <div className={`p-1.5 rounded-md ${bgLight} ${color.replace('bg-', 'text-')}`}>
          <Icon className="w-4 h-4" />
        </div>
        {label}
      </span>
      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
        {percent.toFixed(1)}%
      </span>
    </div>
    <div className="flex items-end justify-between mt-1">
      <span className="text-2xl font-bold text-slate-800">
        {new Intl.NumberFormat('id-ID').format(count)}
      </span>
    </div>
    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-700 ease-out`} 
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  </div>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // State untuk input form (Open dihapus)
  const [inputs, setInputs] = useState({
    total: '',
    draft: '',
    submit: '',
    approved: '',
    reject: '',
    pending: ''
  });

  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setInputs((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getNum = (val) => (val === '' ? 0 : parseInt(val, 10));
  const formatNum = (num) => new Intl.NumberFormat('id-ID').format(num);

  // --- LOGIKA PERHITUNGAN BARU ---
  const total = getNum(inputs.total);
  const draft = getNum(inputs.draft);
  const submit = getNum(inputs.submit);
  const approved = getNum(inputs.approved);
  const reject = getNum(inputs.reject);
  const pending = getNum(inputs.pending);
  
  // Reject sekarang ditambahkan ke perhitungan progres
  const progressCount = draft + submit + approved + reject;
  const remainingCount = Math.max(0, total - progressCount);
  
  const safePercent = (part, whole) => (whole > 0 ? (part / whole) * 100 : 0);
  
  const progressPercent = safePercent(progressCount, total);
  const draftPercent = safePercent(draft, total);
  const submitPercent = safePercent(submit, total);
  const approvedPercent = safePercent(approved, total);
  const rejectPercent = safePercent(reject, total);

  // Animasi counter
  useEffect(() => {
    let start = displayPercent;
    let end = progressPercent;
    if (start === end) return;
    
    let startTime = null;
    const duration = 600; 

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setDisplayPercent(start + (end - start) * easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressPercent]);

  const getStatusInfo = (percent) => {
    if (percent >= 100) return { label: 'Tuntas', color: 'text-emerald-400', stroke: 'text-emerald-500', bg: 'bg-emerald-500', dropShadow: 'drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]', icon: '🏆' };
    if (percent >= 80) return { label: 'Optimal', color: 'text-emerald-400', stroke: 'text-emerald-500', bg: 'bg-emerald-500', dropShadow: 'drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]', icon: '🟢' };
    if (percent >= 40) return { label: 'Berjalan', color: 'text-amber-400', stroke: 'text-amber-500', bg: 'bg-amber-500', dropShadow: 'drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]', icon: '🟡' };
    return { label: 'Kritis', color: 'text-rose-400', stroke: 'text-rose-500', bg: 'bg-rose-500', dropShadow: 'drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]', icon: '🔴' };
  };
  const status = getStatusInfo(progressPercent);

  const getMotivationalMessage = (percent, targetTotal) => {
    if (targetTotal === 0) return { text: "Tentukan total assignment untuk memulai.", icon: "🎯" };
    if (percent === 0) return { text: "Data masih kosong. Ayo mulai kumpulkan pendataan!", icon: "🚀" };
    if (percent < 40) return { text: "Langkah awal yang bagus! Terus tingkatkan progresnya.", icon: "💪" };
    if (percent < 80) return { text: "Kerja bagus! Sedikit lagi menuju target aman.", icon: "🔥" };
    if (percent < 100) return { text: "Luar biasa! Tinggal selangkah lagi mencapai target 100%.", icon: "✨" };
    return { text: "Sempurna! Seluruh target SE2026 telah berhasil diselesaikan.", icon: "🎉" };
  };
  const motivation = getMotivationalMessage(progressPercent, total);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans flex flex-col gap-6">
        <div className="w-64 h-8 bg-slate-200 rounded-lg animate-pulse mb-4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="h-[400px] bg-slate-200 rounded-2xl animate-pulse"></div>
            <div className="h-[200px] bg-slate-200 rounded-2xl animate-pulse"></div>
          </div>
          <div className="lg:col-span-5">
            <div className="h-[600px] bg-slate-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-inner">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">SE2026 Progress</h1>
              <p className="text-xs font-medium text-slate-500">Real-time Data Calculator</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full">
            <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
            Sistem Aktif
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* BAGIAN KIRI - FORM INPUT */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/60">
              <div className="flex items-center gap-2 mb-6">
                <FileEdit className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-800">Entri Data Sensus</h2>
              </div>

              <div className="mb-8 p-5 bg-blue-50/50 border border-blue-100 rounded-xl relative">
                <InputField 
                  label="Total Assignment (Target)" 
                  name="total" 
                  icon={Target} 
                  colorClass="text-blue-600" 
                  placeholder="Masukkan total target beban kerja..." 
                  value={inputs.total} 
                  onChange={handleInputChange} 
                />
                
                <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100/60 rounded-md border border-blue-200/50">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">
                    Progres dihitung dari: <span className="font-bold">Open + Submit + Approved + Reject</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Komponen Progres</h3>
                  <InputField label="Draft" name="draft" icon={FileEdit} colorClass="text-indigo-500" value={inputs.draft} onChange={handleInputChange} />
                  <InputField label="Submit" name="submit" icon={Send} colorClass="text-blue-500" value={inputs.submit} onChange={handleInputChange} />
                  <InputField label="Approved" name="approved" icon={CheckCircle} colorClass="text-emerald-500" value={inputs.approved} onChange={handleInputChange} />
                  <InputField label="Reject (Opsional)" name="reject" icon={XCircle} colorClass="text-rose-500" value={inputs.reject} onChange={handleInputChange} />
                </div>

                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Status Lainnya</h3>
                  <InputField label="Pending (Opsional)" name="pending" icon={Clock} colorClass="text-amber-500" value={inputs.pending} onChange={handleInputChange} />
                </div>
              </div>
            </section>

            {/* KARTU STATISTIK - 4 Komponen Progres */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               <StatCard label="Draft" count={draft} percent={draftPercent} color="bg-indigo-500" bgLight="bg-indigo-100" icon={FileEdit} />
               <StatCard label="Submit" count={submit} percent={submitPercent} color="bg-blue-500" bgLight="bg-blue-100" icon={Send} />
               <StatCard label="Approved" count={approved} percent={approvedPercent} color="bg-emerald-500" bgLight="bg-emerald-100" icon={CheckCircle} />
               <StatCard label="Reject" count={reject} percent={rejectPercent} color="bg-rose-500" bgLight="bg-rose-100" icon={XCircle} />
            </section>
          </div>

          {/* BAGIAN KANAN - DASHBOARD */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-white z-0 border border-slate-800">
              
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="w-5 h-5 text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Dashboard Progres</h2>
                </div>

                <div className="mt-8 mb-6 relative">
                  <svg className={`w-56 h-56 transform -rotate-90 transition-all duration-700 ${status.dropShadow}`}>
                    <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-800" />
                    <circle 
                      cx="112" cy="112" r="100" 
                      stroke="currentColor" strokeWidth="14" fill="transparent" 
                      strokeDasharray={2 * Math.PI * 100}
                      strokeDashoffset={2 * Math.PI * 100 * (1 - (total === 0 ? 0 : Math.min(progressPercent, 100)) / 100)}
                      className={`${status.stroke} transition-all duration-1000 ease-out`} 
                      strokeLinecap="round" 
                    />
                  </svg>
                  
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full">
                    <span className={`text-5xl font-extrabold tracking-tighter ${status.color} drop-shadow-md transition-colors duration-500`}>
                      {total === 0 ? '0' : displayPercent.toFixed(1)}<span className="text-3xl ml-0.5">%</span>
                    </span>
                    <div className={`mt-3 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${status.bg} text-white shadow-lg transform transition-transform duration-300 hover:scale-105`}>
                      <span>{status.icon}</span> {status.label}
                    </div>
                  </div>
                </div>

                <div key={motivation.text} className="w-full mb-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl py-3 px-4 animate-in slide-in-from-bottom-2 fade-in duration-500 flex items-center justify-center gap-2">
                  <span className="text-xl animate-bounce">{motivation.icon}</span>
                  <p className="text-sm font-medium text-slate-200">
                    {motivation.text}
                  </p>
                </div>

                <div className="w-full bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-400 font-medium text-sm">Jumlah Progres</span>
                    <span className="text-2xl font-bold text-white flex items-baseline gap-1">
                      {formatNum(progressCount)}
                      <span className="text-sm font-normal text-slate-500">/ {formatNum(total)}</span>
                    </span>
                  </div>
                  
                  {/* BAR TUMPUK (Menambahkan Reject di Stack) */}
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                    <div style={{ width: `${draftPercent}%` }} className="bg-indigo-500 h-full transition-all duration-500"></div>
                    <div style={{ width: `${submitPercent}%` }} className="bg-blue-500 h-full transition-all duration-500"></div>
                    <div style={{ width: `${approvedPercent}%` }} className="bg-emerald-500 h-full transition-all duration-500"></div>
                    <div style={{ width: `${rejectPercent}%` }} className="bg-rose-500 h-full transition-all duration-500"></div>
                  </div>

                  {/* LEGEND 4 WARNA */}
                  <div className="grid grid-cols-4 gap-2 mt-3 text-[11px] text-slate-400 font-medium text-left">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div> Draft</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div> Submit</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div> Apprv</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div> Rjct</span>
                  </div>
                </div>

                <div className="w-full bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-slate-600/30 rounded-2xl p-5 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-700/50 p-2 rounded-xl text-slate-300">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Sisa Target</p>
                      <p className="text-sm text-slate-400">Belum dikerjakan</p>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-white transition-all">
                    {formatNum(remainingCount)}
                  </div>
                </div>
                
                <div className="mt-6 text-xs text-slate-500 text-left w-full bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                  <span className="font-semibold text-slate-400">Catatan Sistem:</span> 
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    <li>Semua field dengan nilai (termasuk Reject) diakumulasi sebagai penyelesaian tugas.</li>
                    <li>Sisa target otomatis berkurang setiap ada penambahan progres.</li>
                  </ul>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;

