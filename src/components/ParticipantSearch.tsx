import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, UserCheck, X, AlertCircle, Users, ExternalLink, Plus } from 'lucide-react';
import { Peserta } from '../types';
import { SPREADSHEET_URL } from '../services/sheetService';

interface ParticipantSearchProps {
  participants: Peserta[];
  selectedParticipant: Peserta | null;
  onSelectParticipant: (peserta: Peserta | null) => void;
  isLoading: boolean;
  onOpenAddModal?: () => void;
}

export const ParticipantSearch: React.FC<ParticipantSearchProps> = ({
  participants,
  selectedParticipant,
  onSelectParticipant,
  isLoading,
  onOpenAddModal,
}) => {
  const [query, setQuery] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync input when selectedParticipant changes externally
  useEffect(() => {
    if (selectedParticipant) {
      setQuery(selectedParticipant.nik);
    } else {
      setQuery('');
    }
  }, [selectedParticipant]);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter participants based on query with early exit (max 10 results for instant response)
  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return participants.slice(0, 8);
    const results: Peserta[] = [];
    for (let i = 0; i < participants.length && results.length < 10; i++) {
      const p = participants[i];
      if (p.nik.toLowerCase().includes(q) || p.nama.toLowerCase().includes(q)) {
        results.push(p);
      }
    }
    return results;
  }, [participants, query]);

  const handleInputChange = (val: string) => {
    setQuery(val);
    setShowSuggestions(true);

    const clean = val.trim();
    if (!clean) {
      onSelectParticipant(null);
      return;
    }

    const exactMatch = participants.find(
      p => p.nik.toLowerCase() === clean.toLowerCase()
    );

    if (exactMatch) {
      onSelectParticipant(exactMatch);
    } else if (selectedParticipant && selectedParticipant.nik.toLowerCase() !== clean.toLowerCase()) {
      onSelectParticipant(null);
    }
  };

  const handleSelect = (p: Peserta) => {
    setQuery(p.nik);
    onSelectParticipant(p);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery('');
    onSelectParticipant(null);
  };

  const isExactFound = !!selectedParticipant;
  const isNotFound = query.trim().length > 0 && !selectedParticipant;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        <div>
          <label htmlFor="nik-input" className="block text-sm sm:text-base font-bold text-slate-800">
            Langkah 1: Masukkan NIK Peserta
          </label>
        </div>
        {selectedParticipant && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full self-start sm:self-auto">
            <UserCheck className="w-3.5 h-3.5" />
            NIK Teridentifikasi
          </span>
        )}
      </div>

      <div className="relative" ref={dropdownRef}>
        <div className="relative flex items-center">
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            id="nik-input"
            type="text"
            value={query}
            onChange={e => handleInputChange(e.target.value)}
            onFocus={() => {
              if (participants.length > 0) setShowSuggestions(true);
            }}
            placeholder="Ketik NIK peserta..."
            autoComplete="off"
            className={`w-full pl-11 pr-10 py-3 sm:py-3.5 rounded-xl border text-slate-800 placeholder-slate-400 text-base font-mono transition-all outline-hidden ${
              isExactFound
                ? 'border-emerald-500 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500/20'
                : isNotFound
                ? 'border-amber-400 bg-amber-50/20 focus:ring-2 focus:ring-amber-400/20'
                : 'border-slate-300 bg-slate-50/50 hover:border-slate-400 focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15'
            }`}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
              title="Bersihkan input NIK"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestion Dropdown */}
        {showSuggestions && participants.length > 0 && (
          <div className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3.5 py-2 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between sticky top-0">
              <span>Pilih Dari Sheet ({filteredSuggestions.length})</span>
            </div>

            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((p: Peserta) => (
                <button
                  key={p.nik}
                  type="button"
                  onClick={() => handleSelect(p)}
                  className={`w-full text-left px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-blue-50/80 transition-colors flex items-center justify-between group active:bg-blue-100 ${
                    selectedParticipant?.nik === p.nik ? 'bg-blue-50 font-semibold' : ''
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded-md bg-slate-100 group-hover:bg-blue-100 text-slate-800 group-hover:text-blue-900 border border-slate-200 shrink-0">
                        {p.nik}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {p.nama}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 mt-0.5 truncate">
                      {p.jabatan} • {p.namaToko} ({p.kodeToko})
                    </span>
                  </div>
                  <span className="text-xs text-blue-600 font-semibold shrink-0">
                    Pilih
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-4 text-center text-xs sm:text-sm text-slate-500">
                <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
                Tidak ditemukan data peserta dengan NIK "{query}".
              </div>
            )}
          </div>
        )}
      </div>



      {/* When NO participants in sheet: Zero demo data notice */}
      {participants.length === 0 && !isLoading && (
        <div className="mt-3.5 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start sm:items-center gap-2">
            <Users className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              Sheet <strong className="font-semibold">Data_Peserta</strong> di Google Sheets saat ini belum memiliki baris data peserta.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onOpenAddModal && (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input Peserta</span>
              </button>
            )}
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 font-bold text-xs hover:bg-amber-100 transition-colors"
            >
              <span>Isi di Google Sheets</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
