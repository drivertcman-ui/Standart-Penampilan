export interface Peserta {
  nik: string;
  nama: string;
  jabatan: string;
  kodeToko: string;
  namaToko: string;
  as: string; // Area Supervisor
  am: string; // Area Manager
  genderSuggestion?: 'Pria' | 'Wanita';
}

export type Gender = 'Pria' | 'Wanita';

export interface StandardItem {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export interface InspectionRecord {
  id: string;
  timestamp: string; // ISO String
  formattedDate: string; // e.g. 13/10/2026 15:30
  nik: string;
  nama: string;
  jabatan: string;
  kodeToko: string;
  namaToko: string;
  as: string;
  am: string;
  gender: Gender;
  violations: string[]; // List of standards that are NOT compliant
  status: 'SESUAI' | 'TIDAK SESUAI';
  violationCount: number;
  catatan?: string;
  auditor?: string;
  syncedToGoogleSheet?: boolean;
}

export const STANDAR_PRIA: StandardItem[] = [
  {
    id: 'rambut',
    name: 'Rambut',
    description: 'Pendek, rapi, bersih, tidak menyentuh kerah kemeja, tidak dicat mencolok',
    iconName: 'Scissors',
  },
  {
    id: 'kumis',
    name: 'Kumis',
    description: 'Bercukur bersih dan rapi, tidak tebal/melebihi bibir atas',
    iconName: 'Smile',
  },
  {
    id: 'jenggot',
    name: 'Jenggot',
    description: 'Bercukur bersih (shaved) atau dipotong rapi sesuai standar operasional',
    iconName: 'UserCheck',
  },
  {
    id: 'kuku',
    name: 'Kuku',
    description: 'Pendek, bersih, tidak ada kotoran, tidak menggunakan cat kuku/kutek',
    iconName: 'Hand',
  },
  {
    id: 'celana',
    name: 'Celana',
    description: 'Celana kain warna standar (hitam/gelap), potongan rapi, tidak sobek/ketat/pensil',
    iconName: 'Layers',
  },
  {
    id: 'sepatu',
    name: 'Sepatu',
    description: 'Sepatu kerja hitam tertutup, bersih, berkaos kaki gelap, bertali rapi',
    iconName: 'Footprints',
  },
];

export const STANDAR_WANITA: StandardItem[] = [
  {
    id: 'kerudung',
    name: 'Kerudung',
    description: 'Bagi yang berhijab: kerudung rapi sesuai warna seragam, dimasukkan ke kerah/rapi tanpa peniti berlebih',
    iconName: 'Sparkles',
  },
  {
    id: 'makeup',
    name: 'Make up',
    description: 'Riasan wajah natural (fresh look), lipstik warna wajar/standar, tidak menor/pucat',
    iconName: 'Heart',
  },
  {
    id: 'kuku',
    name: 'Kuku',
    description: 'Pendek, bersih, tidak menggunakan cat kuku (kutek) atau kuku palsu',
    iconName: 'Hand',
  },
  {
    id: 'jepit_rambut',
    name: 'Jepit Rambut',
    description: 'Bagi yang tidak berhijab: rambut diikat rapi, jepit/hairnet warna hitam/gelap standar',
    iconName: 'Flower2',
  },
  {
    id: 'celana',
    name: 'Celana',
    description: 'Celana kain warna standar (hitam), potongan sopan, tidak ketat/legging/sobek',
    iconName: 'Layers',
  },
  {
    id: 'sepatu',
    name: 'Sepatu',
    description: 'Sepatu kerja pantofel/tertutup warna hitam, bersih, tidak bertumit tinggi membahayakan',
    iconName: 'Footprints',
  },
];
