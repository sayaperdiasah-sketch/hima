# KompetisiKita

Portal registrasi kompetisi berbasis React, Vite, dan Supabase. Aplikasi memakai `HashRouter`, sehingga aman saat dimuat ulang di GitHub Pages. Pintu portal admin disembunyikan dari navigasi umum dan hanya menerima akun yang terdapat di tabel `admin_users`.

## Membuka pintu admin

- Desktop: tekan `Alt + Shift + A`.
- Desktop/mobile: tekan teks hak cipta `© 2026 KompetisiKita` di footer sebanyak 5 kali dalam 2,5 detik.

Pola tersembunyi hanya mengurangi akses iseng; ini bukan lapisan keamanan. Setelah halaman terbuka, akun tetap harus lolos Supabase Auth, allowlist `admin_users`, dan policy RLS.

## 1. Siapkan Supabase

1. Buat project baru di Supabase.
2. Buka **SQL Editor**, jalankan seluruh isi `supabase/schema.sql` satu kali.
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

Tanpa `.env`, aplikasi otomatis berjalan dalam mode demo untuk keperluan preview. Mode ini tidak digunakan setelah Supabase dikonfigurasi.

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

Admin juga dapat menambahkan kompetisi dan poster langsung dari dashboard.

## 4. Deployment GitHub Pages

1. Push seluruh source ke branch `main` repository GitHub.
2. Buka **Settings → Secrets and variables → Actions**.
3. Tambahkan repository secret:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Buka **Settings → Pages → Build and deployment**, pilih **GitHub Actions**.
5. Push berikutnya otomatis menjalankan `.github/workflows/deploy.yml`.

Build memakai `base: "./"` dan semua rute berada di hash (`#/...`), sehingga aset dan navigasi tetap berfungsi pada subpath GitHub Pages.

`VITE_SUPABASE_ANON_KEY` memang ditujukan untuk browser dan keamanannya bergantung pada RLS. Jangan pernah memasukkan `service_role` key ke GitHub Secrets untuk build frontend, `.env`, atau source code.

## 5. Alur sinkronisasi

- Katalog memanggil RPC `get_active_competitions()` agar kuota terisi ikut diperbarui.
- Registrasi peserta mengunggah bukti ke bucket privat `bukti-bayar`, lalu membuat baris `pendaftaran`.
- Dashboard admin membaca tabel yang sama dan memperbarui `status_verifikasi`.
- Tambah kompetisi menulis ke tabel `kompetisi` dan mengunggah poster ke bucket `posters`.
- Perubahan database terlihat setelah halaman dimuat ulang; Supabase tetap menjadi sumber data utama.
