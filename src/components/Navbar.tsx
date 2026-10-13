import React from 'react';
import {
  ClipboardCheck,
  History,
  Users,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { SPREADSHEET_URL } from '../services/sheetService';

interface NavbarProps {
  activeTab: 'form' | 'history' | 'participants';
  setActiveTab: (tab: 'form' | 'history' | 'participants') => void;
  recordCount: number;
  participantCount: number;
  isSheetLoading: boolean;
  onRefreshSheet: () => void;
  isGoogleSheetConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  recordCount,
  participantCount,
  isSheetLoading,
  onRefreshSheet,
  isGoogleSheetConnected,
}) => {
  return (
    <>
      {/* Top Header (Visible on both Mobile and Laptop) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Branding */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-lg truncate">
                    Standar Penampilan
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                  Audit Grooming & Seragam Karyawan
                </p>
              </div>
            </div>

            {/* Quick Actions (Sync button & Google Sheets link) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button
                onClick={onRefreshSheet}
                disabled={isSheetLoading}
                title="Perbarui data peserta dari Google Sheets"
                className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2 sm:px-2.5 py-1.5 rounded-lg font-medium transition-colors border border-slate-200 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSheetLoading ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden sm:inline">
                  {isSheetLoading ? 'Memuat...' : 'Sync Sheet'}
                </span>
              </button>

              <a
                href={SPREADSHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all active:scale-95"
                title="Buka Google Sheets Publik"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Sheets</span>
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
              </a>
            </div>
          </div>

          {/* Desktop & Laptop Horizontal Navigation Tabs (Hidden on Mobile) */}
          <nav className="hidden md:flex space-x-2 border-t border-slate-100 py-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              Formulir Ceklist
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4" />
              Hasil Ceklist Real-Time
              {recordCount > 0 && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'history'
                      ? 'bg-blue-800 text-blue-100'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {recordCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('participants')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'participants'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              Data Peserta
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'participants'
                    ? 'bg-blue-800 text-blue-100'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {participantCount}
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Optimized for Handphone Ergonomics - 3 Tabs) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg safe-bottom">
        <div className="grid grid-cols-3 gap-1 max-w-md mx-auto">
          {/* Tab 1: Form */}
          <button
            onClick={() => setActiveTab('form')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors ${
              activeTab === 'form'
                ? 'text-blue-600 font-bold bg-blue-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardCheck className={`w-5 h-5 ${activeTab === 'form' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5">Formulir</span>
          </button>

          {/* Tab 2: Hasil Ceklist */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors relative ${
              activeTab === 'history'
                ? 'text-blue-600 font-bold bg-blue-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <History className={`w-5 h-5 ${activeTab === 'history' ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {recordCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-black rounded-full px-1 py-0.2 min-w-[14px] text-center">
                  {recordCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Hasil Ceklist</span>
          </button>

          {/* Tab 3: Peserta */}
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors relative ${
              activeTab === 'participants'
                ? 'text-blue-600 font-bold bg-blue-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Users className={`w-5 h-5 ${activeTab === 'participants' ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {participantCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-slate-600 text-white text-[9px] font-bold rounded-full px-1 py-0.2 min-w-[14px] text-center">
                  {participantCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Data Peserta</span>
          </button>
        </div>
      </div>
    </>
  );
};
