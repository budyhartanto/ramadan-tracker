"use client";

import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  BookOpen,
  CheckCircle2,
  Circle,
  LogOut
} from 'lucide-react';
import { DailyTracking } from '@/lib/db';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [data, setData] = useState<DailyTracking>({
    user_id: '',
    date: currentDate,
    fasting: 0,
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    quran_surah: '',
    quran_ayah: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated') return;

      setLoading(true);
      try {
        const response = await fetch(`/api/tracker?date=${currentDate}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentDate, status]);

  const changeDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);

    // Format safely to YYYY-MM-DD avoiding timezone offset issues
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setCurrentDate(`${year}-${month}-${day}`);
  };

  const handleUpdate = async (updates: Partial<DailyTracking>) => {
    // Merge the current full state immediately with the update slice
    const newData = { ...data, ...updates, date: currentDate };

    setData(newData); // Optimistic UI update

    try {
      await fetch('/api/tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });
    } catch (error) {
      console.error('Failed to update data', error);
      // Might want to rollback state here in a real app
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const prayers = [
    { key: 'fajr' as const, label: 'Shubuh' },
    { key: 'dhuhr' as const, label: 'Dzuhur' },
    { key: 'asr' as const, label: 'Ashar' },
    { key: 'maghrib' as const, label: 'Maghrib' },
    { key: 'isha' as const, label: 'Isya' },
  ];

  const calculateProgress = () => {
    let completed = 0;
    if (data.fasting) completed++;
    prayers.forEach(p => {
      if (data[p.key]) completed++;
    });
    return Math.round((completed / 6) * 100);
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Memuat Aplikasi...</div>;
  }

  return (
    <main>
      <header className="animate-in delay-1" style={{ position: 'relative' }}>
        <button
          onClick={() => signOut()}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}
          title="Keluar"
        >
          <LogOut size={20} />
          <span className="hidden-mobile">Keluar</span>
        </button>
        <h1>Ramadan Tracker</h1>
        <p className="subtitle">Ahlan Wa Sahlan, <strong>{session?.user?.name}</strong>!</p>
      </header>

      {/* Date Navigation */}
      <section className="card flex-between animate-in delay-2">
        <button className="btn-icon" onClick={() => changeDate(-1)} aria-label="Previous Day">
          <ChevronLeft size={24} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
            {formatDate(currentDate)}
          </h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Progress Hari Ini: {calculateProgress()}%
          </span>
        </div>
        <button className="btn-icon" onClick={() => changeDate(1)} aria-label="Next Day">
          <ChevronRight size={24} />
        </button>
      </section>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</div>
      ) : (
        <>
          {/* Fasting Card */}
          <section className="card animate-in delay-3">
            <div className="card-header">
              <Moon size={24} />
              <h3 className="card-title">Puasa</h3>
            </div>
            <div className="flex-between">
              <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                {data.fasting ? 'Alhamdulillah, saya berpuasa' : 'Sedang berhalangan / Belum mencatat'}
              </span>
              <input
                type="checkbox"
                className="toggle-switch"
                checked={!!data.fasting}
                onChange={(e) => handleUpdate({ fasting: e.target.checked ? 1 : 0 })}
              />
            </div>
          </section>

          {/* Prayers Card */}
          <section className="card animate-in delay-3" style={{ animationDelay: '0.4s' }}>
            <div className="card-header">
              <Sun size={24} />
              <h3 className="card-title">Shalat 5 Waktu</h3>
            </div>
            <div className="mt-2">
              {prayers.map((prayer) => (
                <div
                  key={prayer.key}
                  className={`checkbox-item ${data[prayer.key] ? 'checked' : ''}`}
                  onClick={() => handleUpdate({ [prayer.key]: data[prayer.key] ? 0 : 1 })}
                >
                  {data[prayer.key] ? (
                    <CheckCircle2 className="checkbox-input" style={{ border: 'none', color: 'var(--primary-color)' }} />
                  ) : (
                    <Circle className="checkbox-input" />
                  )}
                  <span className="checkbox-label">{prayer.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Quran Card */}
          <section className="card animate-in delay-3" style={{ animationDelay: '0.5s' }}>
            <div className="card-header">
              <BookOpen size={24} />
              <h3 className="card-title">Tadarus Al-Quran</h3>
            </div>
            <div className="grid-2 mt-2">
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Surah Terakhir
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Al-Baqarah"
                  value={data.quran_surah || ''}
                  onChange={(e) => setData({ ...data, quran_surah: e.target.value })}
                  onBlur={(e) => handleUpdate({ quran_surah: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Ayat Terakhir
                </label>
                <input
                  type="number"
                  placeholder="Ayat ke-"
                  value={data.quran_ayah || ''}
                  onChange={(e) => setData({ ...data, quran_ayah: parseInt(e.target.value) || 0 })}
                  onBlur={(e) => handleUpdate({ quran_ayah: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
