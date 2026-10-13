import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  FileSpreadsheet,
  Check,
  UserCheck,
  ShieldAlert,
  LayoutGrid,
  Table as TableIcon,
  Store,
  Clock,
  User,
} from 'lucide-react';
import { InspectionRecord } from '../types';
import { exportRecordsToCSV } from '../services/storageService';

interface ChecklistHistoryViewProps {
  records: InspectionRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const ChecklistHistoryView: React.FC<ChecklistHistoryViewProps> = ({
  records,
  onDeleteRecord,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SESUAI' | 'TIDAK SESUAI'>('ALL');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'Pria' | 'Wanita'>('ALL');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'auto' | 'cards' | 'table'>('auto');
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = records.length;
    const compliant = records.filter(r => r.status === 'SESUAI').length;
    const nonCompliant = records.filter(r => r.status === 'TIDAK SESUAI').length;
    const compliantRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

    const violationCounts: Record<string, number> = {};
    records.forEach(r => {
      r.violations.forEach(v => {
        violationCounts[v] = (violationCounts[v] || 0) + 1;
      });
    });

    const topViolations = Object.entries(violationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return { total, compliant, nonCompliant, compliantRate, topViolations };
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch =
        r.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.namaToko.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.kodeToko.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.jabatan.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' || r.status === statusFilter;

      const matchGender =
        genderFilter === 'ALL' || r.gender === genderFilter;

      return matchSearch && matchStatus && matchGender;
    });
  }, [records, searchTerm, statusFilter, genderFilter]);

  const handleDownloadCSV = () => {
    const csv = exportRecordsToCSV(records);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Hasil_Ceklist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyForSheets = () => {
    const tsvRows = filteredRecords.map(r => [
      r.formattedDate,
      r.nik,
      r.nama,
      r.jabatan,
      r.kodeToko,
      r.namaToko,
      r.as,
      r.am,
      r.gender,
      r.status,
      r.violationCount,
      r.violations.length > 0 ? r.violations.join(', ') : 'Sesuai Standar',
      r.catatan || '-',
      r.auditor || '-',
    ].join('\t')).join('\n');

    navigator.clipboard.writeText(tsvRows);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Stats Overview (Responsive grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Diperiksa
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {stats.total}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">
            Sheet Hasil_Ceklist
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Sesuai
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-black text-emerald-600 font-mono">
            {stats.compliant}{' '}
            <span className="text-xs font-normal text-slate-500">
              ({stats.compliantRate}%)
            </span>
          </div>
          <div className="text-[10px] sm:text-xs text-emerald-700 font-medium mt-0.5 truncate">
            Lolos standar rapi
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-rose-600 uppercase tracking-wider">
              Tidak Sesuai
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-black text-rose-600 font-mono">
            {stats.nonCompliant}{' '}
            <span className="text-xs font-normal text-slate-500">
              ({stats.total > 0 ? 100 - stats.compliantRate : 0}%)
            </span>
          </div>
          <div className="text-[10px] sm:text-xs text-rose-700 font-medium mt-0.5 truncate">
            Perlu perbaikan
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase tracking-wider">
              Pelanggaran Dominan
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5">
            {stats.topViolations.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {stats.topViolations.map(([name, count]) => (
                  <span
                    key={name}
                    className="text-[10px] sm:text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-md"
                  >
                    {name}: {count}x
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 mt-1">
                Belum ada data pelanggaran
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Records Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Controls Toolbar (Responsive stack on phone, row on laptop) */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari NIK, Nama, Toko, Jabatan..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
              />
            </div>

            {/* View Mode Switcher (on medium+ screens) */}
            <div className="hidden sm:flex items-center bg-slate-200/80 p-0.5 rounded-xl border border-slate-300">
              <button
                onClick={() => setViewMode('auto')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'auto' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
                title="Menyesuaikan otomatis handphone/laptop"
              >
                Auto
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Kartu
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
                title="Tampilan Tabel"
              >
                <TableIcon className="w-3.5 h-3.5" />
                Tabel
              </button>
            </div>
          </div>

          {/* Filters & Export Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1">
              {/* Filter Status */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 outline-hidden"
              >
                <option value="ALL">Semua Status</option>
                <option value="SESUAI">Sesuai Standar</option>
                <option value="TIDAK SESUAI">Tidak Sesuai</option>
              </select>

              {/* Filter Gender */}
              <select
                value={genderFilter}
                onChange={e => setGenderFilter(e.target.value as any)}
                className="text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 outline-hidden"
              >
                <option value="ALL">Semua Gender</option>
                <option value="Pria">Pria</option>
                <option value="Wanita">Wanita</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Copy for Sheets */}
              <button
                onClick={handleCopyForSheets}
                disabled={filteredRecords.length === 0}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-40"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden xs:inline">Salin Sheets</span>
                  </>
                )}
              </button>

              {/* Download CSV */}
              <button
                onClick={handleDownloadCSV}
                disabled={records.length === 0}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Indicator banner */}
        <div className="px-3.5 sm:px-5 py-2 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0"></span>
            <span className="font-semibold truncate">Real-Time:</span>
            <span className="hidden sm:inline">Diperbarui seketika setelah ceklist disubmit.</span>
          </div>
          <span className="font-mono text-blue-700 font-bold shrink-0">
            {filteredRecords.length} Data
          </span>
        </div>

        {/* NO DATA STATE */}
        {filteredRecords.length === 0 && (
          <div className="py-12 px-4 text-center text-slate-400">
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-600">Belum ada hasil ceklist tersimpan.</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Silakan lakukan ceklist peserta pada tab Formulir. Setiap input baru akan muncul di sini secara real-time.
            </p>
          </div>
        )}

        {/* MOBILE CARD VIEW (Default on phones, or if cards mode active) */}
        {filteredRecords.length > 0 && (viewMode === 'cards' || viewMode === 'auto') && (
          <div className={`p-3 space-y-3 ${viewMode === 'auto' ? 'md:hidden' : ''}`}>
            {filteredRecords.map(r => {
              const isCompliant = r.status === 'SESUAI';

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5 relative"
                >
                  {/* Card Header: Name, NIK, Status badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{r.nama}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded text-[11px]">
                          {r.nik}
                        </span>
                        <span>•</span>
                        <span>{r.jabatan}</span>
                        <span>•</span>
                        <span
                          className={`font-semibold ${
                            r.gender === 'Pria' ? 'text-blue-600' : 'text-pink-600'
                          }`}
                        >
                          {r.gender}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] shrink-0 ${
                        isCompliant
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCompliant ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                      )}
                      {r.status}
                    </span>
                  </div>

                  {/* Store & Supervisor */}
                  <div className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1 font-medium text-slate-800">
                      <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{r.namaToko} ({r.kodeToko})</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 border-t border-slate-200/60">
                      <span>AS: {r.as}</span>
                      <span>AM: {r.am}</span>
                    </div>
                  </div>

                  {/* Violations Chips */}
                  <div>
                    {r.violations.length > 0 ? (
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                          Ketidaksesuaian ({r.violationCount}):
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {r.violations.map(v => (
                            <span
                              key={v}
                              className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Semua standar grooming rapi & terpenuhi.
                      </div>
                    )}
                  </div>

                  {/* Notes & Auditor */}
                  {(r.catatan || r.auditor) && (
                    <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between gap-2">
                      <div className="truncate">
                        {r.catatan && <span className="text-slate-700 italic">"{r.catatan}"</span>}
                        {r.auditor && <span className="text-slate-400"> (Oleh: {r.auditor})</span>}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{r.formattedDate.split(' ')[0]}</span>
                      </div>
                    </div>
                  )}

                  {/* Delete button */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onDeleteRecord(r.id)}
                      className="text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1 p-1 hover:bg-rose-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DESKTOP TABLE VIEW (Default on laptop/desktop, or if table mode active) */}
        {filteredRecords.length > 0 && (viewMode === 'table' || viewMode === 'auto') && (
          <div className={`overflow-x-auto ${viewMode === 'auto' ? 'hidden md:block' : ''}`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 uppercase font-bold tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">NIK</th>
                  <th className="py-3 px-4">Nama Peserta</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4">Toko</th>
                  <th className="py-3 px-4">AS / AM</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Status & Pelanggaran</th>
                  <th className="py-3 px-4">Catatan & Auditor</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map(r => {
                  const isCompliant = r.status === 'SESUAI';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono">
                        {r.formattedDate}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {r.nik}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {r.nama}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {r.jabatan}
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <div className="font-semibold">{r.namaToko}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {r.kodeToko}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <div>AS: {r.as}</div>
                        <div className="text-[11px] text-slate-400">AM: {r.am}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                            r.gender === 'Pria'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-pink-50 text-pink-700 border border-pink-200'
                          }`}
                        >
                          {r.gender}
                        </span>
                      </td>
                      <td className="py-3 px-4 min-w-[200px]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] ${
                              isCompliant
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isCompliant ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                            )}
                            {r.status}
                          </span>
                          {!isCompliant && (
                            <span className="text-[10px] font-bold text-rose-600">
                              ({r.violationCount} Poin)
                            </span>
                          )}
                        </div>

                        {r.violations.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {r.violations.map(v => (
                              <span
                                key={v}
                                className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-medium px-1.5 py-0.2 rounded"
                              >
                                {v}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-700">
                            Semua standar rapi & sesuai
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="text-slate-800 truncate" title={r.catatan}>
                          {r.catatan || '-'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Oleh: {r.auditor || 'Auditor'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onDeleteRecord(r.id)}
                          title="Hapus baris ini"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        {records.length > 0 && (
          <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
            <span>
              Menampilkan {filteredRecords.length} dari {records.length} riwayat pemeriksaan
            </span>
            <button
              type="button"
              onClick={() => setShowClearConfirmModal(true)}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline py-1 px-2.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              Bersihkan Seluruh Riwayat
            </button>
          </div>
        )}
      </div>

      {/* In-app Confirmation Modal for Clear All */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 sm:p-6 animate-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Hapus Seluruh Riwayat Ceklist?
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Tindakan ini akan menghapus semua <strong className="text-slate-900">{records.length} data riwayat</strong> pemeriksaan yang tersimpan di aplikasi ini. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowClearConfirmModal(false);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm active:scale-95"
              >
                Ya, Bersihkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
