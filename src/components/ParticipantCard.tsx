import React from 'react';
import {
  User,
  Briefcase,
  Store,
  MapPin,
  Lock,
  ShieldAlert,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Peserta } from '../types';

interface ParticipantCardProps {
  participant: Peserta | null;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant }) => {
  if (!participant) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 sm:p-8 text-center">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2.5 sm:mb-3 text-slate-400">
          <User className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-700">Data Peserta Belum Dipilih</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Ketik NIK di atas untuk menampilkan data peserta secara otomatis dari sheet <span className="font-semibold text-slate-700">Data_Peserta</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 px-4 sm:px-6 py-3.5 sm:py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/25 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold text-base sm:text-lg shrink-0">
            {participant.nama.charAt(0) || 'P'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-lg text-white truncate">
                {participant.nama}
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                Terdaftar
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 sm:gap-2 mt-0.5 truncate">
              <span className="font-mono text-blue-300">NIK: {participant.nik}</span>
              <span>•</span>
              <span className="truncate">{participant.jabatan}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] sm:text-xs text-slate-300 font-medium">
          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Data Read-Only (Sheet Data_Peserta)</span>
        </div>
      </div>

      {/* Read-only Data Grid (Responsive 1/2 cols on phone, 4 cols on laptop) */}
      <div className="p-3.5 sm:p-6 bg-slate-50/60">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* NIK Field */}
          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                NIK
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
                Kunci
              </span>
            </div>
            <div className="font-mono text-xs sm:text-base font-bold text-slate-900 tracking-wider truncate">
              {participant.nik}
            </div>
          </div>

          {/* Nama Field */}
          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                Nama Peserta
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
                Read-only
              </span>
            </div>
            <div className="text-xs sm:text-base font-bold text-slate-900 truncate" title={participant.nama}>
              {participant.nama}
            </div>
          </div>

          {/* Jabatan Field */}
          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" />
                Jabatan
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
                Read-only
              </span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={participant.jabatan}>
              {participant.jabatan}
            </div>
          </div>

          {/* Kode Toko Field */}
          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                Kode Toko
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
                Read-only
              </span>
            </div>
            <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 truncate">
              {participant.kodeToko}
            </div>
          </div>

          {/* Nama Toko Field */}
          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs col-span-2">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                Nama Toko
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
                Read-only
              </span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={participant.namaToko}>
              {participant.namaToko}
            </div>
          </div>

          {/* AS Field */}
          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600" />
                AS (Supervisor)
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
                Read-only
              </span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={participant.as}>
              {participant.as || '-'}
            </div>
          </div>

          {/* AM Field */}
          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
                AM (Manager)
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
                Read-only
              </span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={participant.am}>
              {participant.am || '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
