## Project background

INEFEST 4.0 adalah portal Informatics Engineering Festival Program Studi Teknik Informatika Universitas PGRI Ronggolawe Tuban. Situs melayani peserta kompetisi dan panitia HIMATIF, dengan identitas instansi UNIROW serta Prodi TI yang jelas.

## Product shape

- React, TypeScript, Vite, dan Node.js 22 dengan hash-based routes.
- Halaman publik mencakup beranda, katalog kompetisi, pendaftaran, autentikasi peserta, dan area mitra.
- Identitas visual menampilkan logo UNIROW dan Prodi TI sebagai instansi serta HIMATIF sebagai pelaksana INEFEST 4.0.
- Dashboard admin tetap dilindungi Supabase Auth, allowlist `admin_users`, dan RLS.
- Admin dapat mengelola kompetisi, pendaftaran, hero, audit log, serta sponsor/media partner bertingkat.
- Kelas mitra terdiri dari Sponsor Utama, Sponsor Pendukung, Community Partner, dan Media Partner dengan urutan, status tampil, tautan, serta logo.
- Logo mitra disimpan di bucket publik `partner-media`; tabel `event_partners` menjadi sumber data publik dan admin.
- Jika Supabase belum dikonfigurasi, situs memakai data contoh untuk katalog dan mitra, sedangkan operasi akun/admin gagal tertutup.
- Tidak ada secret atau service-role key di source maupun browser bundle.
