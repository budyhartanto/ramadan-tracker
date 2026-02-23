import { createClient } from '@libsql/client';
import path from 'path';

// Load credentials from environment variables (Turso) or fallback to local file
const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), 'ramadan.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url,
  authToken,
});

// Initialize schema
db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL
  )
`).catch(console.error);

db.execute(`
  CREATE TABLE IF NOT EXISTS daily_tracking (
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    fasting BOOLEAN DEFAULT 0,
    fajr BOOLEAN DEFAULT 0,
    dhuhr BOOLEAN DEFAULT 0,
    asr BOOLEAN DEFAULT 0,
    maghrib BOOLEAN DEFAULT 0,
    isha BOOLEAN DEFAULT 0,
    quran_surah TEXT DEFAULT '',
    quran_ayah INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    PRIMARY KEY (user_id, date),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`).catch(console.error);

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
}

export interface DailyTracking {
  user_id: string;
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

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE username = ?',
    args: [username]
  });

  const row = result.rows[0];
  if (row) {
    return {
      id: row.id as string,
      username: row.username as string,
      password: row.password as string,
      name: row.name as string
    };
  }
  return null;
}

export async function registerUser(user: User) {
  await db.execute({
    sql: 'INSERT INTO users (id, username, password, name) VALUES (?, ?, ?, ?)',
    args: [user.id, user.username, user.password as string, user.name]
  });
}

export async function getTrackingByDate(userId: string, date: string): Promise<DailyTracking> {
  const result = await db.execute({
    sql: 'SELECT * FROM daily_tracking WHERE user_id = ? AND date = ?',
    args: [userId, date]
  });

  const row = result.rows[0];

  if (row) {
    return {
      user_id: row.user_id as string,
      date: row.date as string,
      fasting: Number(row.fasting),
      fajr: Number(row.fajr),
      dhuhr: Number(row.dhuhr),
      asr: Number(row.asr),
      maghrib: Number(row.maghrib),
      isha: Number(row.isha),
      quran_surah: row.quran_surah as string,
      quran_ayah: Number(row.quran_ayah),
      notes: row.notes as string
    };
  }

  // Return default if not exists
  return {
    user_id: userId,
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

export async function updateTracking(data: DailyTracking) {
  await db.execute({
    sql: `
      INSERT INTO daily_tracking (user_id, date, fasting, fajr, dhuhr, asr, maghrib, isha, quran_surah, quran_ayah, notes)
      VALUES (:user_id, :date, :fasting, :fajr, :dhuhr, :asr, :maghrib, :isha, :quran_surah, :quran_ayah, :notes)
      ON CONFLICT(user_id, date) DO UPDATE SET
        fasting = excluded.fasting,
        fajr = excluded.fajr,
        dhuhr = excluded.dhuhr,
        asr = excluded.asr,
        maghrib = excluded.maghrib,
        isha = excluded.isha,
        quran_surah = excluded.quran_surah,
        quran_ayah = excluded.quran_ayah,
        notes = excluded.notes
    `,
    args: { ...data }
  });
}
