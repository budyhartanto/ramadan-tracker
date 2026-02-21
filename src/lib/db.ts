import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'ramadan.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS daily_tracking (
    date TEXT PRIMARY KEY,
    fasting BOOLEAN DEFAULT 0,
    fajr BOOLEAN DEFAULT 0,
    dhuhr BOOLEAN DEFAULT 0,
    asr BOOLEAN DEFAULT 0,
    maghrib BOOLEAN DEFAULT 0,
    isha BOOLEAN DEFAULT 0,
    quran_surah TEXT DEFAULT '',
    quran_ayah INTEGER DEFAULT 0,
    notes TEXT DEFAULT ''
  )
`);

export interface DailyTracking {
  date: string;
  fasting: number;
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  quran_surah: string;
  quran_ayah: number;
  notes: string;
}

export function getTrackingByDate(date: string): DailyTracking {
  const stmt = db.prepare('SELECT * FROM daily_tracking WHERE date = ?');
  const result = stmt.get(date) as DailyTracking | undefined;

  if (result) return result;

  // Return default if not exists
  return {
    date,
    fasting: 0,
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    quran_surah: '',
    quran_ayah: 0,
    notes: ''
  };
}

export function updateTracking(data: DailyTracking) {
  const stmt = db.prepare(`
    INSERT INTO daily_tracking (date, fasting, fajr, dhuhr, asr, maghrib, isha, quran_surah, quran_ayah, notes)
    VALUES (@date, @fasting, @fajr, @dhuhr, @asr, @maghrib, @isha, @quran_surah, @quran_ayah, @notes)
    ON CONFLICT(date) DO UPDATE SET
      fasting = excluded.fasting,
      fajr = excluded.fajr,
      dhuhr = excluded.dhuhr,
      asr = excluded.asr,
      maghrib = excluded.maghrib,
      isha = excluded.isha,
      quran_surah = excluded.quran_surah,
      quran_ayah = excluded.quran_ayah,
      notes = excluded.notes
  `);
  stmt.run(data);
}
