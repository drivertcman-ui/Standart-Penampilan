/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ParticipantSearch } from './components/ParticipantSearch';
import { ParticipantCard } from './components/ParticipantCard';
import { AppearanceChecklist } from './components/AppearanceChecklist';
import { ChecklistHistoryView } from './components/ChecklistHistoryView';
import { ParticipantListView } from './components/ParticipantListView';
import {
  Peserta,
  InspectionRecord,
} from './types';
import {
  fetchParticipantsFromSheet,
  syncRecordToGoogleSheet,
  saveLocalParticipant,
  removeLocalParticipant,
} from './services/sheetService';
import {
  getChecklistRecords,
  saveChecklistRecord,
  deleteChecklistRecord,
  clearAllChecklistRecords,
  subscribeToChecklistUpdates,
} from './services/storageService';
import { CheckCircle2, AlertCircle, Info, Sparkles, X, PlusCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'participants'>('form');

  // Participants loaded from Google Sheet (Zero demo data)
  const [participants, setParticipants] = useState<Peserta[]>([]);
  const [isSheetLoading, setIsSheetLoading] = useState<boolean>(true);
  const [sheetSource, setSheetSource] = useState<'google-sheets' | 'empty'>('empty');
  const [sheetStatusMsg, setSheetStatusMsg] = useState<string>('');

  // Selected participant for inspection
  const [selectedParticipant, setSelectedParticipant] = useState<Peserta | null>(null);

  // Quick Add Participant modal state from main screen
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [quickPeserta, setQuickPeserta] = useState<Peserta>({
    nik: '',
    nama: '',
    jabatan: 'Crew Store',
    kodeToko: 'TK-01',
    namaToko: 'Toko Sentral',
    as: 'AS Budi',
    am: 'AM Hendra',
  });

  // Inspection records history (starts completely clean, real-time reactive)
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [isSavingRecord, setIsSavingRecord] = useState<boolean>(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showToast = (title: string, message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  // Load participants from sheet
  const loadParticipants = useCallback(async () => {
    setIsSheetLoading(true);
    try {
      const res = await fetchParticipantsFromSheet();
      setParticipants(res.participants);
      setSheetSource(res.source);
      setSheetStatusMsg(res.message);
    } catch (err: unknown) {
      console.error('Error fetching participants:', err);
      setSheetStatusMsg('Gagal memuat Google Sheets. Silakan periksa koneksi internet.');
    } finally {
      setIsSheetLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadParticipants();
    setRecords(getChecklistRecords());

    // Subscribe to real-time checklist events
    const unsubscribe = subscribeToChecklistUpdates(updatedRecords => {
      setRecords(updatedRecords);
    });

    return () => unsubscribe();
  }, [loadParticipants]);

  // Handle saving new checklist record
  const handleSaveRecord = async (record: InspectionRecord) => {
    setIsSavingRecord(true);
    try {
      // 1. Save locally with real-time update
      saveChecklistRecord(record);

      // 2. Try syncing to Google Sheets if configured
      const syncResult = await syncRecordToGoogleSheet(record);

      showToast(
        'Hasil Ceklist Tersimpan!',
        `Data ${record.nama} (${record.nik}) telah dimasukkan ke sheet Hasil_Ceklist. ${
          syncResult.success ? 'Tersinkron ke Google Sheets!' : ''
        }`,
        record.status === 'SESUAI' ? 'success' : 'warning'
      );

      // Reset dan bersihkan tampilan agar langsung siap untuk input NIK berikutnya
      setSelectedParticipant(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan';
      showToast('Terjadi Kendala', msg, 'warning');
    } finally {
      setIsSavingRecord(false);
    }
  };

  // Select participant
  const handleSelectParticipant = (peserta: Peserta | null) => {
    setSelectedParticipant(peserta);
    if (peserta && activeTab !== 'form') {
      setActiveTab('form');
    }
  };

  // Handle adding participant
  const handleAddParticipant = (newP: Peserta) => {
    const updated = saveLocalParticipant(newP);
    setParticipants(prev => {
      const exists = prev.some(p => p.nik.toLowerCase() === newP.nik.toLowerCase());
      return exists ? prev.map(p => (p.nik.toLowerCase() === newP.nik.toLowerCase() ? newP : p)) : [newP, ...prev];
    });
    setSelectedParticipant(newP);
    showToast('Peserta Ditambahkan', `Peserta ${newP.nama} (${newP.nik}) siap dicek.`, 'info');
  };

  const handleRemoveParticipant = (nik: string) => {
    removeLocalParticipant(nik);
    setParticipants(prev => prev.filter(p => p.nik.toLowerCase() !== nik.toLowerCase()));
    if (selectedParticipant?.nik.toLowerCase() === nik.toLowerCase()) {
      setSelectedParticipant(null);
    }
    showToast('Peserta Dihapus', `Peserta NIK ${nik} dihapus dari daftar lokal.`, 'info');
  };

  const handleDeleteRecord = (id: string) => {
    deleteChecklistRecord(id);
    showToast('Data Dihapus', 'Baris pemeriksaan telah dihapus dari log.', 'info');
  };

  const handleClearAll = () => {
    clearAllChecklistRecords();
    setRecords([]);
    showToast('Riwayat Dibersihkan', 'Seluruh data ceklist telah berhasil direset.', 'info');
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPeserta.nik.trim() || !quickPeserta.nama.trim()) return;
    handleAddParticipant({
      ...quickPeserta,
      nik: quickPeserta.nik.trim(),
      nama: quickPeserta.nama.trim(),
    });
    setIsQuickAddOpen(false);
    setQuickPeserta({
      nik: '',
      nama: '',
      jabatan: 'Crew Store',
      kodeToko: 'TK-01',
      namaToko: 'Toko Sentral',
      as: 'AS Budi',
      am: 'AM Hendra',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navbar with responsive top header and mobile bottom dock */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recordCount={records.length}
        participantCount={participants.length}
        isSheetLoading={isSheetLoading}
        onRefreshSheet={loadParticipants}
        isGoogleSheetConnected={sheetSource === 'google-sheets'}
      />

      {/* Main Content Area: pb-24 on mobile so content isn't covered by bottom navigation */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {/* Floating Toast Notification */}
        {toast.show && (
          <div className="fixed top-16 sm:top-auto sm:bottom-5 right-3 sm:right-5 z-50 max-w-sm sm:max-w-md w-[calc(100%-1.5rem)] sm:w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 sm:p-4 animate-in slide-in-from-top-4 sm:slide-in-from-bottom-5 duration-200 flex items-start gap-3">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                toast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600'
                  : toast.type === 'warning'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : toast.type === 'warning' ? (
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs sm:text-sm font-bold text-slate-900">{toast.title}</h5>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: FORMULIR CEKLIST */}
        {activeTab === 'form' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Intro Header: Responsive on phones & laptops */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-white shadow-md shadow-blue-900/10 relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] sm:text-xs font-semibold text-blue-100 border border-white/20 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  Audit Kerapian & Grooming Peserta
                </span>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                  Pemeriksaan Standar Penampilan
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/90 mt-1 sm:mt-2 leading-relaxed">
                  Masukkan NIK untuk menampilkan data peserta Meeting STM, lalu centang standar yang tidak sesuai untuk disimpan ke database
                </p>
              </div>

              {/* Decorative shapes */}
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-white/10 to-transparent pointer-events-none transform skew-x-12 hidden sm:block"></div>
            </div>

            {/* Step 1: Input NIK */}
            <ParticipantSearch
              participants={participants}
              selectedParticipant={selectedParticipant}
              onSelectParticipant={handleSelectParticipant}
              isLoading={isSheetLoading}
              onOpenAddModal={() => setIsQuickAddOpen(true)}
            />

            {/* Step 2: Read-only Participant Details Card */}
            <ParticipantCard participant={selectedParticipant} />

            {/* Step 3: Checklist (appears after participant selected) */}
            {selectedParticipant && (
              <AppearanceChecklist
                participant={selectedParticipant}
                onSaveRecord={handleSaveRecord}
                isSaving={isSavingRecord}
                onReset={() => setSelectedParticipant(null)}
              />
            )}
          </div>
        )}

        {/* TAB 2: HASIL CEKLIST REAL-TIME */}
        {activeTab === 'history' && (
          <ChecklistHistoryView
            records={records}
            onDeleteRecord={handleDeleteRecord}
            onClearAll={handleClearAll}
          />
        )}

        {/* TAB 3: DATA PESERTA SHEET */}
        {activeTab === 'participants' && (
          <ParticipantListView
            participants={participants}
            onSelectForChecklist={handleSelectParticipant}
            onRefresh={loadParticipants}
            isLoading={isSheetLoading}
            source={sheetSource}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
          />
        )}



        {/* Quick Add Modal */}
        {isQuickAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Input Peserta Baru
                </h3>
                <button
                  onClick={() => setIsQuickAddOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-3.5">
                Masukkan NIK dan data karyawan untuk pengujian langsung di aplikasi.
              </p>

              <form onSubmit={handleQuickAddSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NIK *</label>
                    <input
                      type="text"
                      required
                      value={quickPeserta.nik}
                      onChange={e => setQuickPeserta({ ...quickPeserta, nik: e.target.value })}
                      placeholder="Contoh: 202401"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono outline-hidden focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Peserta *</label>
                    <input
                      type="text"
                      required
                      value={quickPeserta.nama}
                      onChange={e => setQuickPeserta({ ...quickPeserta, nama: e.target.value })}
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
                      value={quickPeserta.jabatan}
                      onChange={e => setQuickPeserta({ ...quickPeserta, jabatan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kode Toko</label>
                    <input
                      type="text"
                      value={quickPeserta.kodeToko}
                      onChange={e => setQuickPeserta({ ...quickPeserta, kodeToko: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono outline-hidden focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Toko</label>
                  <input
                    type="text"
                    value={quickPeserta.namaToko}
                    onChange={e => setQuickPeserta({ ...quickPeserta, namaToko: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">AS (Area Supervisor)</label>
                    <input
                      type="text"
                      value={quickPeserta.as}
                      onChange={e => setQuickPeserta({ ...quickPeserta, as: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">AM (Area Manager)</label>
                    <input
                      type="text"
                      value={quickPeserta.am}
                      onChange={e => setQuickPeserta({ ...quickPeserta, am: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                  >
                    Simpan & Pilih
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
