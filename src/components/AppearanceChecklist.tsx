import React, { useState } from 'react';
import {
  Scissors,
  Smile,
  UserCheck,
  Hand,
  Layers,
  Footprints,
  Sparkles,
  Heart,
  Flower2,
  CheckCircle2,
  AlertTriangle,
  Send,
  User,
  RotateCcw,
} from 'lucide-react';
import {
  Peserta,
  Gender,
  STANDAR_PRIA,
  STANDAR_WANITA,
  InspectionRecord,
} from '../types';

interface AppearanceChecklistProps {
  participant: Peserta;
  onSaveRecord: (record: InspectionRecord) => Promise<void>;
  isSaving: boolean;
  onReset: () => void;
}

export const AppearanceChecklist: React.FC<AppearanceChecklistProps> = ({
  participant,
  onSaveRecord,
  isSaving,
  onReset,
}) => {
  const [gender, setGender] = useState<Gender>(participant.genderSuggestion || 'Pria');
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  const [catatan, setCatatan] = useState<string>('');

  const currentStandards = gender === 'Pria' ? STANDAR_PRIA : STANDAR_WANITA;

  const toggleViolation = (itemName: string) => {
    setSelectedViolations(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
    setSelectedViolations([]);
  };

  const handleSelectAllCompliant = () => {
    setSelectedViolations([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const isCompliant = selectedViolations.length === 0;

    const record: InspectionRecord = {
      id: `ins-${Date.now()}`,
      timestamp: now.toISOString(),
      formattedDate: now.toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      nik: participant.nik,
      nama: participant.nama,
      jabatan: participant.jabatan,
      kodeToko: participant.kodeToko,
      namaToko: participant.namaToko,
      as: participant.as,
      am: participant.am,
      gender,
      violations: selectedViolations,
      status: isCompliant ? 'SESUAI' : 'TIDAK SESUAI',
      violationCount: selectedViolations.length,
      catatan: catatan.trim() || (isCompliant ? 'Semua standar grooming terpenuhi.' : undefined),
      auditor: '-',
    };

    await onSaveRecord(record);
  };

  const renderIcon = (iconName: string) => {
    const className = 'w-4 h-4 sm:w-5 sm:h-5';
    switch (iconName) {
      case 'Scissors':
        return <Scissors className={className} />;
      case 'Smile':
        return <Smile className={className} />;
      case 'UserCheck':
        return <UserCheck className={className} />;
      case 'Hand':
        return <Hand className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'Footprints':
        return <Footprints className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Heart':
        return <Heart className={className} />;
      case 'Flower2':
        return <Flower2 className={className} />;
      default:
        return <UserCheck className={className} />;
    }
  };

  const isCompliant = selectedViolations.length === 0;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Title & Gender Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-lg font-bold text-slate-900">
              Langkah 2: Ceklist Standar Penampilan
            </h3>
            <span className="text-[10px] sm:text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              Centang yang TIDAK SESUAI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Centang poin grooming yang melanggar. Bila semua rapi, biarkan tanpa centang.
          </p>
        </div>

        {/* Gender Toggle Button (Full width on mobile, auto on laptop) */}
        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => handleGenderChange('Pria')}
            className={`py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              gender === 'Pria'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Pria</span>
          </button>
          <button
            type="button"
            onClick={() => handleGenderChange('Wanita')}
            className={`py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              gender === 'Wanita'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Wanita</span>
          </button>
        </div>
      </div>

      {/* Compliance Status Preview Banner */}
      <div
        className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
          isCompliant
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-rose-50/70 border-rose-200 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isCompliant ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {isCompliant ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs sm:text-sm truncate">
              Status:{' '}
              <span
                className={`uppercase tracking-wide font-extrabold ${
                  isCompliant ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isCompliant ? 'SESUAI STANDAR (Lolos)' : `${selectedViolations.length} ITEM TIDAK SESUAI`}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs opacity-80 mt-0.5 truncate sm:whitespace-normal">
              {isCompliant
                ? 'Semua standar terpenuhi dengan rapi.'
                : `Tidak sesuai: ${selectedViolations.join(', ')}`}
            </p>
          </div>
        </div>

        {selectedViolations.length > 0 && (
          <button
            type="button"
            onClick={handleSelectAllCompliant}
            className="text-xs font-semibold px-3 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto active:scale-95"
          >
            Reset (Jadikan Sesuai)
          </button>
        )}
      </div>

      {/* Checklist Grid (1 col on mobile, 2 cols on tablet, 3 cols on laptop) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Standar Penampilan ({gender}):
          </span>
          <span className="text-[11px] text-slate-500">
            Centang bila <strong className="text-rose-600">MELANGGAR</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {currentStandards.map(item => {
            const isChecked = selectedViolations.includes(item.name);

            return (
              <label
                key={item.id}
                className={`relative flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer select-none transition-all active:scale-[0.99] ${
                  isChecked
                    ? 'border-rose-500 bg-rose-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {/* Touch friendly checkbox */}
                <div className="pt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleViolation(item.name)}
                    className="w-5 h-5 rounded-md border-2 border-slate-300 text-rose-600 focus:ring-rose-500 transition-colors cursor-pointer accent-rose-600"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <span
                        className={`p-1 rounded-md ${
                          isChecked ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {renderIcon(item.iconName)}
                      </span>
                      {item.name}
                    </span>

                    {isChecked && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded shrink-0">
                        Tidak Sesuai
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Notes Field */}
      <div className="pt-1">
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Catatan Tambahan (Opsional)
        </label>
        <input
          type="text"
          value={catatan}
          onChange={e => setCatatan(e.target.value)}
          placeholder="Contoh: Kuku panjang diberi teguran lisan"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-hidden bg-slate-50/50 focus:bg-white"
        />
      </div>

      {/* Action Buttons (Stacked on mobile, side-by-side on laptop) */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Ganti Peserta Lain</span>
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 ${
            isSaving
              ? 'bg-slate-400 text-white cursor-not-allowed'
              : isCompliant
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{isSaving ? 'Menyimpan...' : 'Simpan ke Hasil_Ceklist'}</span>
        </button>
      </div>
    </form>
  );
};
