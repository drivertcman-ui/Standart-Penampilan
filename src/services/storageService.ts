import { InspectionRecord } from '../types';

const STORAGE_KEY = 'standar_penampilan_hasil_ceklist_v2';
const EVENT_NAME = 'hasil_ceklist_updated';

// Clean slate: No demo history
export function getChecklistRecords(): InspectionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    // Filter out any leftover demo data from previous runs if any
    if (Array.isArray(parsed)) {
      const cleaned = parsed.filter(
        (r: InspectionRecord) => !r.id?.startsWith('ins-20261013-00') && r.nik !== '2401001' && r.nik !== '2401002'
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveChecklistRecord(record: InspectionRecord): InspectionRecord[] {
  const current = getChecklistRecords();
  const updated = [record, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch real-time custom event so all open views and tabs update immediately
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: record }));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
  return updated;
}

export function deleteChecklistRecord(id: string): InspectionRecord[] {
  const current = getChecklistRecords();
  const updated = current.filter(r => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { deletedId: id } }));
  } catch (err) {
    console.error('Failed to update localStorage:', err);
  }
  return updated;
}

export function clearAllChecklistRecords(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    // Also clean old key
    localStorage.removeItem('standar_penampilan_hasil_ceklist_v1');
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { cleared: true } }));
  } catch (err) {
    console.error('Failed to clear records:', err);
  }
}

export function subscribeToChecklistUpdates(callback: (records: InspectionRecord[]) => void): () => void {
  const handleUpdate = () => {
    callback(getChecklistRecords());
  };

  window.addEventListener(EVENT_NAME, handleUpdate);
  window.addEventListener('storage', handleUpdate);

  return () => {
    window.removeEventListener(EVENT_NAME, handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}

// Format records into CSV for direct copy or download
export function exportRecordsToCSV(records: InspectionRecord[]): string {
  const headers = [
    'Timestamp',
    'NIK',
    'Nama',
    'Jabatan',
    'Kode Toko',
    'Nama Toko',
    'AS',
    'AM',
    'Gender',
    'Status',
    'Jumlah Pelanggaran',
    'Ketidaksesuaian',
    'Catatan',
    'Auditor',
  ];

  const rows = records.map(r => [
    `"${r.formattedDate}"`,
    `"${r.nik}"`,
    `"${r.nama}"`,
    `"${r.jabatan}"`,
    `"${r.kodeToko}"`,
    `"${r.namaToko}"`,
    `"${r.as}"`,
    `"${r.am}"`,
    `"${r.gender}"`,
    `"${r.status}"`,
    r.violationCount,
    `"${r.violations.length > 0 ? r.violations.join(', ') : 'Sesuai Standar'}"`,
    `"${(r.catatan || '-').replace(/"/g, '""')}"`,
    `"${(r.auditor || '-').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
