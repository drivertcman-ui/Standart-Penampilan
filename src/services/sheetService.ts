import { Peserta, InspectionRecord } from '../types';

export const GOOGLE_SHEET_ID = '12Elg1hKsbJ-KoztM2WAn5TeRi1-5HsGh1eoS-ikmw0c';
export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit?gid=231969535#gid=231969535`;

// Local storage key for manually added participants if any
const LOCAL_PESERTA_KEY = 'standar_penampilan_peserta_manual_v1';

export function getLocalParticipants(): Peserta[] {
  try {
    const raw = localStorage.getItem(LOCAL_PESERTA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalParticipant(peserta: Peserta): Peserta[] {
  const current = getLocalParticipants();
  // Avoid duplicate NIK
  const existsIdx = current.findIndex(p => p.nik.toLowerCase() === peserta.nik.toLowerCase());
  let updated: Peserta[];
  if (existsIdx >= 0) {
    updated = [...current];
    updated[existsIdx] = peserta;
  } else {
    updated = [peserta, ...current];
  }
  localStorage.setItem(LOCAL_PESERTA_KEY, JSON.stringify(updated));
  return updated;
}

export function removeLocalParticipant(nik: string): Peserta[] {
  const current = getLocalParticipants();
  const updated = current.filter(p => p.nik.toLowerCase() !== nik.toLowerCase());
  localStorage.setItem(LOCAL_PESERTA_KEY, JSON.stringify(updated));
  return updated;
}

// Helper to parse CSV lines safely
function parseCSV(csvText: string): string[][] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

// Function to fetch participants from Google Sheets
export async function fetchParticipantsFromSheet(): Promise<{
  success: boolean;
  participants: Peserta[];
  source: 'google-sheets' | 'empty';
  rowCount: number;
  message: string;
}> {
  const localManual = getLocalParticipants();

  // URLs to fetch public sheet
  const urlsToTry = [
    `/api/participants`,
    `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Data_Peserta`,
    `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv&gid=231969535`,
  ];

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json, text/csv, */*' } });
      if (!res.ok) continue;

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data && Array.isArray(data.participants) && data.participants.length > 0) {
          // Merge with any locally added participants (without duplicates)
          const merged = [...data.participants];
          for (const lp of localManual) {
            if (!merged.some(p => p.nik.toLowerCase() === lp.nik.toLowerCase())) {
              merged.push(lp);
            }
          }

          return {
            success: true,
            participants: merged,
            source: 'google-sheets',
            rowCount: merged.length,
            message: `Berhasil memuat ${merged.length} data peserta dari Google Sheets.`,
          };
        }
      } else {
        const text = await res.text();
        const rows = parseCSV(text);

        if (rows.length > 1) {
          // Identify headers
          const header = rows[0].map(h => h.trim().toUpperCase());
          const nikIdx = header.findIndex(h => h.includes('NIK'));
          const namaIdx = header.findIndex(h => h.includes('NAMA') && !h.includes('TOKO'));
          const jabatanIdx = header.findIndex(h => h.includes('JABATAN'));
          const kodeTokoIdx = header.findIndex(h => h.includes('KODE') || h.includes('KD'));
          const namaTokoIdx = header.findIndex(h => h.includes('NAMA TOKO') || (h.includes('TOKO') && !h.includes('KODE')));
          const asIdx = header.findIndex(h => h === 'AS' || h.includes('AREA SUPERVISOR'));
          const amIdx = header.findIndex(h => h === 'AM' || h.includes('AREA MANAGER'));

          const parsed: Peserta[] = [];
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const nik = (row[nikIdx !== -1 ? nikIdx : 0] || '').replace(/['"]/g, '').trim();
            const nama = (row[namaIdx !== -1 ? namaIdx : 1] || '').replace(/['"]/g, '').trim();
            if (!nik && !nama) continue;

            const jabatan = (row[jabatanIdx !== -1 ? jabatanIdx : 2] || '-').replace(/['"]/g, '').trim();
            const kodeToko = (row[kodeTokoIdx !== -1 ? kodeTokoIdx : 3] || '-').replace(/['"]/g, '').trim();
            const namaToko = (row[namaTokoIdx !== -1 ? namaTokoIdx : 4] || '-').replace(/['"]/g, '').trim();
            const asVal = (row[asIdx !== -1 ? asIdx : 5] || '-').replace(/['"]/g, '').trim();
            const amVal = (row[amIdx !== -1 ? amIdx : 6] || '-').replace(/['"]/g, '').trim();

            parsed.push({
              nik,
              nama,
              jabatan,
              kodeToko,
              namaToko,
              as: asVal,
              am: amVal,
            });
          }

          if (parsed.length > 0) {
            const merged = [...parsed];
            for (const lp of localManual) {
              if (!merged.some(p => p.nik.toLowerCase() === lp.nik.toLowerCase())) {
                merged.push(lp);
              }
            }
            return {
              success: true,
              participants: merged,
              source: 'google-sheets',
              rowCount: merged.length,
              message: `Berhasil membaca ${merged.length} data peserta dari sheet Data_Peserta.`,
            };
          }
        }
      }
    } catch {
      // Continue to next URL attempt
    }
  }

  // If live sheet only has headers and no data rows yet
  if (localManual.length > 0) {
    return {
      success: true,
      participants: localManual,
      source: 'empty',
      rowCount: localManual.length,
      message: 'Sheet Data_Peserta Google Sheets belum memiliki baris data. Menampilkan data peserta yang diinputkan.',
    };
  }

  // Zero demo data
  return {
    success: true,
    participants: [],
    source: 'empty',
    rowCount: 0,
    message: 'Sheet Data_Peserta terhubung (belum ada baris data peserta). Silakan tambahkan baris di Google Sheets atau input peserta baru.',
  };
}

export const PERMANENT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzBNiBs64OE-qDhma1BGATtXJ-2et3OfFuUKpi-yjazXnKciJudY0IMIAw32KtcgC_XXg/exec';

// Function to sync a checklist record to Google Sheets via Webhook (Apps Script)
export async function syncRecordToGoogleSheet(
  record: InspectionRecord,
  webhookUrl?: string
): Promise<{ success: boolean; message: string }> {
  const scriptUrl = webhookUrl || localStorage.getItem('google_apps_script_url') || PERMANENT_APPS_SCRIPT_URL;

  try {
    const payload = {
      sheetName: 'Hasil_Ceklist',
      action: 'appendRow',
      data: {
        timestamp: record.formattedDate,
        nik: record.nik,
        nama: record.nama,
        jabatan: record.jabatan,
        kodeToko: record.kodeToko,
        namaToko: record.namaToko,
        as: record.as,
        am: record.am,
        gender: record.gender,
        status: record.status,
        jumlahPelanggaran: record.violationCount,
        ketidaksesuaian: record.violations.length > 0 ? record.violations.join(', ') : 'Sesuai Standar',
        catatan: record.catatan || '-',
        auditor: record.auditor || '-',
      },
    };

    await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });

    return {
      success: true,
      message: 'Data berhasil dikirim ke sheet Hasil_Ceklist Google Sheets.',
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      message: `Gagal mengirim ke Webhook: ${errorMessage}`,
    };
  }
}
