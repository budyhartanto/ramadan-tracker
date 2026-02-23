# Panduan Deploy Aplikasi Ramadan Tracker

Aplikasi ini menggunakan perpaduan **Next.js** (untuk *frontend* dan *backend/API*) dan **Turso SQLite** (untuk *database*).
Untuk membuatnya online (bisa diakses publik), kita harus memisahkan *hosting* aplikasi dan *database*. 

Pilihan terbaik dan **gratis** adalah menggunakan **Vercel** untuk aplikasi dan **Turso** untuk database.

Berikut langkah-langkah detailnya:

---

## Tahap 1: Setup Database di Turso (Cloud SQLite)
Saat ini database Anda tersimpan di komputer lokal (`ramadan.db`). Ketika di-deploy, database ini tidak akan ikut terbawa, sehingga kita perlu membuat database online.

1. Buka [turso.tech](https://turso.tech) dan daftar/login dengan akun GitHub Anda.
2. Di *Dashboard* Turso, klik **Create Database**. Beri nama (misalnya, `ramadan-tracker-db`).
3. Setelah database berhasil dibuat, salin (copy) dua buah kunci rahasia (*Environment Variables*) berikut:
   * **Database URL**: Biasanya berawalan `libsql://...`
   * **Auth Token**: Token panjang untuk akses database. (Cara mendapatkannya: klik tombol **Generate Token** di dashboard Turso).
   
4. **PENTING: Menjalankan Skema Database di Turso**
   Karena database Turso Anda masih kosong, Anda harus menjalankan skema tabel (`users` dan `daily_tracking`). 
   Ada dua cara:
   - **Cara A**: Gunakan menu *CLI/Web Shell* di Dashboard Turso, lalu copy-paste perintah SQL pembuatan tabel yang ada di file `src/lib/db.ts` bagian `CREATE TABLE...`
   - **Cara B (Lebih mudah)**: Sambungkan URL Turso ke aplikasi lokal Anda (masukkan ke `.env.local`), lalu jalankan `npm run dev` sekali. Skema akan otomatis terbentuk!

---

## Tahap 2: Upload Kode ke GitHub
Vercel membutuhkan kode Anda berada di repository (seperti GitHub, GitLab, atau Bitbucket) agar bisa menarik kode tersebut.

1. Pastikan Anda sudah membuat akun di [GitHub](https://github.com).
2. Buat *repository* baru (bisa diatur *Public* atau *Private*).
3. Buka terminal di folder project Anda (`/home/budy/Documents/backup ramadan-ngaji/ramadan-ngaji`), dan jalankan perintah Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit multi-user"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git
   git push -u origin main
   ```
   *(Ganti `USERNAME_ANDA` dan `NAMA_REPO_ANDA` sesuai akun GitHub Anda).*

---

## Tahap 3: Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) dan daftar/login menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** > **Project**.
3. Vercel akan menampilkan daftar repository GitHub Anda. Cari repository aplikasi Ramadan Tracker yang baru saja Anda *push*, lalu klik **Import**.
4. Di halaman pengaturan Deployment, gulir (scroll) ke bagian **Environment Variables**. Ini sangat penting! Anda wajib menambahkan tiga variabel berikut:
   - `AUTH_SECRET`: Isi dengan kombinasi acak (minimal 32 karakter huruf & angka). Ini untuk keamanan *login* pengguna Anda.
   - `TURSO_DATABASE_URL`: Salin URL `libsql://...` yang Anda dapatkan di Tahap 1.
   - `TURSO_AUTH_TOKEN`: Salin *Auth Token* panjang yang Anda dapatkan di Tahap 1.
5. Jika sudah, klik tombol **Deploy**.

Vercel akan mulai membangun (Build) aplikasi Anda (memakan waktu sekitar 1-2 menit). Jika berhasil, Vercel akan memberikan **URL/Tautan** klik yang sudah bisa dibagikan ke teman-teman Anda!

---

## Bantuan Tambahan
Jika Anda menemui error (terutama masalah koneksi Database atau Error 500 saat mencoba Login pertama kali di layar Vercel), masalah biasanya berakar pada salah satu variabel di **Environment Variables** (langkah 3.4) yang salah di-*copy-paste*. Pastikan tidak ada spasi berlebih!
