# KompetisiKita

Portal registrasi kompetisi berbasis React, Vite, dan Supabase. Aplikasi memakai `HashRouter`, sehingga aman saat dimuat ulang di GitHub Pages. Admin dapat mengelola lomba secara penuh, memantau seluruh pendaftaran, mengelola tiga hero, mengekspor data, dan membaca audit log.

## Lapisan keamanan

Implementasi memakai lebih dari tiga lapisan yang saling melengkapi:

1. Validasi browser terpusat untuk panjang, format, angka, tanggal, nomor WhatsApp, dan URL internal.
2. Pemeriksaan berkas berdasarkan ekstensi, MIME, ukuran, dan file signature sebelum upload.
3. Supabase Auth dengan PKCE, konfirmasi email, CAPTCHA produksi, serta allowlist `admin_users`.
4. Row Level Security untuk profil, kompetisi, pendaftaran, hero, audit log, dan Storage.
5. Constraint dan trigger database untuk format data, kuota atomik, deadline, dan duplikasi pendaftaran.
6. Audit log otomatis untuk tambah, ubah, hapus, verifikasi, pendaftaran baru, dan login admin.
7. Content Security Policy di HTML serta ekspor CSV yang mencegah formula injection.

## Membuka pintu admin

- Desktop: tekan `Alt + Shift + A`.
- Desktop/mobile: tekan teks hak cipta `© 2026 KompetisiKita` di footer sebanyak 5 kali dalam 2,5 detik.

Pola tersembunyi hanya mengurangi akses iseng; ini bukan lapisan keamanan. Setelah halaman terbuka, akun tetap harus lolos Supabase Auth, allowlist `admin_users`, dan policy RLS.

## 1. Siapkan Supabase

1. Buat project baru di Supabase.
2. Project baru: jalankan seluruh isi `supabase/schema.sql`. Project lama: jalankan `supabase/hardening_migration.sql`.
3. Jika ingin data contoh, jalankan `supabase/seed.sql`.
4. Buka **Authentication → URL Configuration**:
   - Site URL: `https://USERNAME.github.io/NAMA-REPOSITORY/`
   - Redirect URL: `https://USERNAME.github.io/NAMA-REPOSITORY/**`
5. Aktifkan **Confirm email** dan CAPTCHA untuk produksi.

Skema membuat tabel `profiles`, `admin_users`, `kompetisi`, dan `pendaftaran`; trigger profil; RPC katalog dengan jumlah pendaftar; bucket Storage; indeks; serta seluruh policy RLS.

## 2. Menjalankan lokal

1. Salin `.env.example` menjadi `.env.local`.
2. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari Supabase.
3. Jalankan `npm install`.
4. Jalankan `npm run dev`.

Tanpa `.env`, katalog contoh tetap dapat dipreview, tetapi login, pendaftaran, dan portal admin sengaja dinonaktifkan (fail closed).

## 3. Membuat admin pertama

1. Buat akun admin melalui **Authentication → Users** di dashboard Supabase.
2. Salin UUID akun tersebut.
3. Jalankan perintah berikut di SQL Editor:

```sql
insert into public.admin_users (user_id, nama_lengkap)
values ('UUID-AKUN-ADMIN', 'Nama Admin');
```

Mengetahui URL dashboard tidak memberi hak admin. Login diverifikasi dua kali: melalui Supabase Auth dan allowlist `admin_users`. Semua operasi admin juga dilindungi Row Level Security. Aktifkan MFA untuk akun panitia.

Setelah admin dibuat, dashboard otomatis membaca:

- jumlah profil peserta;
- seluruh pendaftaran dan status verifikasinya;
- jumlah kompetisi aktif;
- nama admin yang sedang masuk;
- bukti pembayaran melalui signed URL privat selama 60 detik.
- audit log seluruh aktivitas penting;
- tiga slot hero untuk logo/foto yang dapat diaktifkan atau dinonaktifkan;
- pencarian, filter kompetisi/status, catatan verifikasi, dan ekspor CSV;
- CRUD kompetisi lengkap: tambah, edit, draft/aktif/tutup, serta hapus dengan konfirmasi nama.

Admin juga dapat mengganti poster dan tiga gambar hero langsung dari dashboard. Hapus kompetisi meminta pengetikan nama lomba karena relasi `on delete cascade` dapat menghapus pendaftaran terkait.

## 4. Deployment GitHub Pages

1. Push seluruh source ke branch `main` repository GitHub.
2. Buka **Settings → Secrets and variables → Actions**.
3. Tambahkan repository secret:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Buka **Settings → Pages → Build and deployment**, pilih **GitHub Actions**.
5. Push berikutnya otomatis menjalankan `.github/workflows/deploy.yml`. Paket `gh-pages` tidak digunakan agar rantai dependensi lebih kecil dan bebas temuan audit saat ini.

Build memakai `base: "./"` dan semua rute berada di hash (`#/...`), sehingga aset dan navigasi tetap berfungsi pada subpath GitHub Pages.

`VITE_SUPABASE_ANON_KEY` memang ditujukan untuk browser dan keamanannya bergantung pada RLS. Jangan pernah memasukkan `service_role` key ke GitHub Secrets untuk build frontend, `.env`, atau source code.

## 5. Alur sinkronisasi

- Katalog memanggil RPC `get_active_competitions()` agar kuota terisi ikut diperbarui.
- Registrasi peserta mengunggah bukti ke bucket privat `bukti-bayar`, lalu membuat baris `pendaftaran`.
- Dashboard admin membaca tabel yang sama dan memperbarui `status_verifikasi`.
- Tambah kompetisi menulis ke tabel `kompetisi` dan mengunggah poster ke bucket `posters`.
- Perubahan database terlihat setelah halaman dimuat ulang; Supabase tetap menjadi sumber data utama.

## Pemeriksaan kualitas

```bash
npm ci
npm run typecheck
npm test
npm audit --audit-level=high
```

Build produksi, typecheck, pengujian output, dan audit dependensi harus lulus sebelum deploy.
