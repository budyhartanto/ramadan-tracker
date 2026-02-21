import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ramadan Tracker | Tingkatkan Ibadahmu',
  description: 'Aplikasi tracker Ramadan untuk mencatat puasa, shalat 5 waktu, dan tadarus Al-Quran.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={outfit.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}
