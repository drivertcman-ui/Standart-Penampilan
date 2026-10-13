import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import https from 'https';

const GOOGLE_SHEET_ID = '12Elg1hKsbJ-KoztM2WAn5TeRi1-5HsGh1eoS-ikmw0c';

function parseCSVLine(line: string): string[] {
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
}

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function apiBackendPlugin(): Plugin {
  return {
    name: 'api-backend-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        if (req.url.startsWith('/api/participants')) {
          res.setHeader('Content-Type', 'application/json');
          try {
            const sheetUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Data_Peserta`;
            const csvData = await fetchUrl(sheetUrl);
            const lines = csvData.split(/\r?\n/).filter(l => l.trim().length > 0);
            
            if (lines.length > 1) {
              const headers = parseCSVLine(lines[0]).map(h => h.toUpperCase());
              const nikIdx = headers.findIndex(h => h.includes('NIK'));
              const namaIdx = headers.findIndex(h => h.includes('NAMA') && !h.includes('TOKO'));
              const jabatanIdx = headers.findIndex(h => h.includes('JABATAN'));
              const kodeTokoIdx = headers.findIndex(h => h.includes('KODE') || h.includes('KD'));
              const namaTokoIdx = headers.findIndex(h => h.includes('NAMA TOKO') || (h.includes('TOKO') && !h.includes('KODE')));
              const asIdx = headers.findIndex(h => h === 'AS' || h.includes('SUPERVISOR'));
              const amIdx = headers.findIndex(h => h === 'AM' || h.includes('MANAGER'));

              const participants = [];
              for (let i = 1; i < lines.length; i++) {
                const row = parseCSVLine(lines[i]);
                const nik = (row[nikIdx !== -1 ? nikIdx : 0] || '').replace(/['"]/g, '').trim();
                const nama = (row[namaIdx !== -1 ? namaIdx : 1] || '').replace(/['"]/g, '').trim();
                if (!nik && !nama) continue;
                participants.push({
                  nik,
                  nama,
                  jabatan: (row[jabatanIdx !== -1 ? jabatanIdx : 2] || '-').replace(/['"]/g, '').trim(),
                  kodeToko: (row[kodeTokoIdx !== -1 ? kodeTokoIdx : 3] || '-').replace(/['"]/g, '').trim(),
                  namaToko: (row[namaTokoIdx !== -1 ? namaTokoIdx : 4] || '-').replace(/['"]/g, '').trim(),
                  as: (row[asIdx !== -1 ? asIdx : 5] || '-').replace(/['"]/g, '').trim(),
                  am: (row[amIdx !== -1 ? amIdx : 6] || '-').replace(/['"]/g, '').trim(),
                });
              }

              if (participants.length > 0) {
                res.end(JSON.stringify({ success: true, source: 'google-sheets', participants }));
                return;
              }
            }
            // Return empty array if only header was present
            res.end(JSON.stringify({ success: true, source: 'google-sheets-empty-header', participants: [] }));
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            res.end(JSON.stringify({ success: false, error: msg, participants: [] }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
