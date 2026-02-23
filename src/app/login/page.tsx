"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const result = await signIn('credentials', {
                    username: formData.username,
                    password: formData.password,
                    redirect: false,
                });

                if (result?.error) {
                    setError('Username atau password salah');
                } else {
                    router.push('/');
                    router.refresh();
                }
            } else {
                // Handle Register
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || 'Terjadi kesalahan saat mendaftar');
                } else {
                    // Auto login after register
                    await signIn('credentials', {
                        username: formData.username,
                        password: formData.password,
                        redirect: false,
                    });
                    router.push('/');
                    router.refresh();
                }
            }
        } catch (err) {
            setError('Terjadi kesalahan sistem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
                    {isLogin ? 'Masuk' : 'Daftar Baru'}
                </h2>

                {error && (
                    <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nama Lengkap</label>
                            <input
                                type="text"
                                required={!isLogin}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Cth: Budi"
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Username</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="Cth: budi123"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Pilih kata sandi yang kuat"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: 500,
                            marginTop: '0.5rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Mendaftar')}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500, padding: 0 }}
                    >
                        {isLogin ? 'Daftar sekarang' : 'Masuk di sini'}
                    </button>
                </p>
            </div>
        </main>
    );
}
