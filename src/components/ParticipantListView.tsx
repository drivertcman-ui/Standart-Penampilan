import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  ExternalLink,
  RefreshCw,
  PlusCircle,
  ArrowRight,
  Database,
  Store,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Peserta } from '../types';
import { SPREADSHEET_URL } from '../services/sheetService';

interface ParticipantListViewProps {
  participants: Peserta[];
  onSelectForChecklist: (p: Peserta) => void;
  onRefresh: () => void;
  isLoading: boolean;
  source: 'google-sheets' | 'empty';
  onAddParticipant: (p: Peserta) => void;
  onRemoveParticipant?: (nik: string) => void;
}

export const ParticipantListView: React.FC<ParticipantListViewProps> = ({
  participants,
  onSelectForChecklist,
  onRefresh,
  isLoading,
  source,
  onAddParticipant,
  onRemoveParticipant,
}) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPeserta, setNewPeserta] = useState<Peserta>({
    nik: '',
    nama: '',
    jabatan: 'Crew Store',
    kodeToko: 'TK-001',
    namaToko: 'Toko Sentral',
    as: 'AS Budi',
    am: 'AM Hendra',
  });

  // Fast memoized filtering
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter(
      p =>
        p.nik.toLowerCase().includes(q) ||
        p.nama.toLowerCase().includes(q) ||
        p.namaToko.toLowerCase().includes(q) ||
        p.jabatan.toLowerCase().includes(q) ||
        p.kodeToko.toLowerCase().includes(q)
    );
  }, [participants, search]);

  // Reset page when search query changes
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedParticipants = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeserta.nik.trim() || !newPeserta.nama.trim()) return;
    onAddParticipant({
      ...newPeserta,
      nik: newPeserta.nik.trim(),
      nama: newPeserta.nama.trim(),
    });
    setShowAddModal(false);
    setNewPeserta({
      nik: '',
      nama: '',
      jabatan: 'Crew Store',
      kodeToko: 'TK-001',
      namaToko: 'Toko Sentral',
      as: 'AS Budi',
      am: 'AM Hendra',
    });
  };

  const startRecordIdx = filtered.length > 0 ? (safePage - 1) * pageSize + 1 : 0;
  const endRecordIdx = Math.min(safePage * pageSize, filtered.length);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Source Info Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Data Sheet: <span className="text-blue-700">Data_Peserta</span>
              </h3>
              <span
                className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  source === 'google-sheets'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {source === 'google-sheets' ? 'Google Sheets' : 'Belum Ada Data'}
              </span>
              <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                {participants.length.toLocaleString('id-ID')} Total Peserta
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
              Data peserta dimuat langsung dari spreadsheet Google Sheets publik. Dilengkapi paginasi untuk performa cepat dan ringan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isLoading ? 'Memuat...' : 'Muat Ulang'}</span>
          </button>

          <a
            href={SPREADSHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors active:scale-95"
          >
            <span>Buka Google Sheets</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Cari NIK, Nama, Toko, Jabatan..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="hidden sm:inline">Per hal:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="py-1.5 px-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-hidden"
              >
                <option value={20}>20</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Peserta</span>
            </button>
          </div>
        </div>

        {/* Empty state if 0 participants */}
        {participants.length === 0 && !isLoading && (
          <div className="py-12 px-4 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">Sheet Data_Peserta Masih Kosong</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Silakan tambahkan data peserta di Google Sheets publik Anda atau klik tombol <strong>"Tambah Peserta"</strong> di atas.
            </p>
          </div>
        )}

        {/* MOBILE CARD VIEW (Phones) */}
        {participants.length > 0 && (
          <div className="md:hidden divide-y divide-slate-100">
            {paginatedParticipants.length > 0 ? (
              paginatedParticipants.map(p => (
                <div key={p.nik} className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{p.nama}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.2 rounded text-[11px]">
                          {p.nik}
                        </span>
                        <span>•</span>
                        <span>{p.jabatan}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectForChecklist(p)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-2xs active:scale-95 shrink-0"
                    >
                      <span>Cek</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1 font-medium text-slate-800">
                      <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{p.namaToko} ({p.kodeToko})</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 border-t border-slate-200/60">
                      <span>AS: {p.as}</span>
                      <span>AM: {p.am}</span>
                      {onRemoveParticipant && (
                        <button
                          onClick={() => onRemoveParticipant(p.nik)}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                          title="Hapus peserta lokal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada data yang cocok dengan "{search}".
              </div>
            )}
          </div>
        )}

        {/* DESKTOP TABLE VIEW (Laptop & Desktop) */}
        {participants.length > 0 && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 uppercase font-bold tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">NIK</th>
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4">Kode Toko</th>
                  <th className="py-3 px-4">Nama Toko</th>
                  <th className="py-3 px-4">AS</th>
                  <th className="py-3 px-4">AM</th>
                  <th className="py-3 px-4 text-center">Aksi Ceklist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedParticipants.length > 0 ? (
                  paginatedParticipants.map(p => (
                    <tr key={p.nik} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {p.nik}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {p.nama}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {p.jabatan}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {p.kodeToko}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {p.namaToko}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {p.as}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {p.am}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onSelectForChecklist(p)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs transition-all shadow-2xs active:scale-95"
                        >
                          <span>Cek Grooming</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada peserta yang cocok dengan pencarian "{search}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filtered.length > 0 && (
          <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="font-medium text-center sm:text-left">
              Menampilkan <span className="font-bold text-slate-900">{startRecordIdx}-{endRecordIdx}</span> dari <span className="font-bold text-slate-900">{filtered.length.toLocaleString('id-ID')}</span> peserta
              {search && <span> (difilter dari {participants.length.toLocaleString('id-ID')})</span>}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={safePage <= 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <div className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800">
                Hal {safePage} / {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={safePage >= totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add Participant */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">
                Input Data Peserta Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Data peserta ini akan disimpan ke aplikasi dan dapat langsung dipilih untuk pemeriksaan standar penampilan.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIK *</label>
                  <input
                    type="text"
                    required
                    value={newPeserta.nik}
                    onChange={e => setNewPeserta({ ...newPeserta, nik: e.target.value })}
                    placeholder="Contoh: 2401099"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Peserta *</label>
                  <input
                    type="text"
                    required
                    value={newPeserta.nama}
                    onChange={e => setNewPeserta({ ...newPeserta, nama: e.target.value })}
                    placeholder="Nama lengkap..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={newPeserta.jabatan}
                    onChange={e => setNewPeserta({ ...newPeserta, jabatan: e.target.value })}
                    placeholder="Kasir / Crew"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Toko</label>
                  <input
                    type="text"
                    value={newPeserta.kodeToko}
                    onChange={e => setNewPeserta({ ...newPeserta, kodeToko: e.target.value })}
                    placeholder="TK-01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Toko</label>
                <input
                  type="text"
                  value={newPeserta.namaToko}
                  onChange={e => setNewPeserta({ ...newPeserta, namaToko: e.target.value })}
                  placeholder="Toko Cabang..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">AS (Area Supervisor)</label>
                  <input
                    type="text"
                    value={newPeserta.as}
                    onChange={e => setNewPeserta({ ...newPeserta, as: e.target.value })}
                    placeholder="Nama AS..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">AM (Area Manager)</label>
                  <input
                    type="text"
                    value={newPeserta.am}
                    onChange={e => setNewPeserta({ ...newPeserta, am: e.target.value })}
                    placeholder="Nama AM..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                >
                  Simpan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
