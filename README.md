# INEFEST 4.0

Portal **Informatics Engineering Festival 4.0** milik Program Studi Teknik Informatika Universitas PGRI Ronggolawe Tuban, dilaksanakan oleh HIMATIF.

## Perubahan utama

- Logo UNIROW dan Prodi TI ditampilkan sebagai identitas instansi.
- Logo HIMATIF ditampilkan sebagai identitas pelaksana.
- Branding publik, metadata, hero, footer, dan portal admin memakai INEFEST 4.0.
- Halaman publik memiliki area mitra bertingkat: Sponsor Utama, Sponsor Pendukung, Community Partner, dan Media Partner.
- Admin dapat menambah, mengubah, mengurutkan, menampilkan/menyembunyikan, memberi tautan, dan menghapus logo mitra.
- Admin memiliki CRUD kompetisi lengkap: tambah, baca, edit, status draft/aktif/tutup, upload poster, dan hapus terkonfirmasi.
- Menu Peserta memiliki pencarian, tambah profil berbasis UUID Auth, edit, hapus, dan ekspor CSV.
- Menu Laporan memiliki KPI, distribusi verifikasi, performa lomba, dana terverifikasi, cetak, dan ekspor CSV.
- Logo mitra disimpan di bucket publik `partner-media`; izin tulis tetap membutuhkan admin terverifikasi.

## Menyiapkan Supabase

1. Untuk proyek baru, jalankan `supabase/schema.sql` di SQL Editor.
2. Untuk proyek yang sudah memakai versi lama, jalankan `supabase/hardening_migration.sql` satu kali.
3. Salin `.env.example` menjadi `.env.local` dan isi URL serta anon key proyek.
4. Buat admin di Supabase Auth, lalu masukkan UUID-nya ke tabel `admin_users` seperti instruksi pada akhir skema.

Admin dibuka dengan `Alt+Shift+A` atau lima ketukan pada teks hak cipta di footer. Penyembunyian rute bukan lapisan keamanan; akses tetap diperiksa oleh Supabase Auth, allowlist `admin_users`, dan RLS.

## Menjalankan proyek

```bash
npm install
npm run dev
```

## Pemeriksaan

```bash
npm run typecheck
npm test
```

Tanpa konfigurasi Supabase, halaman publik tetap dapat dipreview dengan data contoh. Autentikasi, pendaftaran, dan operasi admin sengaja gagal tertutup.
