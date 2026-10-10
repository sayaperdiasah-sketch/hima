## Project background

INEFEST 4.0 adalah portal Informatics Engineering Festival Program Studi Teknik Informatika Universitas PGRI Ronggolawe Tuban. Situs melayani peserta kompetisi dan panitia HIMATIF, dengan identitas instansi UNIROW serta Prodi TI yang jelas.

## Product shape

- React, TypeScript, Vite, dan Node.js 22 dengan hash-based routes.
- Halaman publik mencakup beranda, katalog kompetisi, pendaftaran, autentikasi peserta, dan area mitra.
- Identitas visual menampilkan logo UNIROW dan Prodi TI sebagai instansi serta HIMATIF sebagai pelaksana INEFEST 4.0.
- Dashboard admin tetap dilindungi Supabase Auth, allowlist `admin_users`, dan RLS.
- Admin dapat menjalankan CRUD kompetisi, profil peserta, dan sponsor/media partner; memverifikasi/menghapus pendaftaran; mengelola tiga slot hero; serta membaca audit log.
- Tampilan Peserta menyediakan pencarian, ekspor CSV, tambah profil untuk UUID Auth yang sudah ada, edit, dan hapus dengan peringatan cascade.
- Tampilan Laporan merangkum peserta, pendaftaran, tingkat persetujuan, dana terverifikasi, performa kompetisi, cetak, dan ekspor CSV.
- Kelas mitra terdiri dari Sponsor Utama, Sponsor Pendukung, Community Partner, dan Media Partner dengan urutan, status tampil, tautan, serta logo.
- Logo mitra disimpan di bucket publik `partner-media`; tabel `event_partners` menjadi sumber data publik dan admin.
- Jika Supabase belum dikonfigurasi, situs memakai data contoh untuk katalog dan mitra, sedangkan operasi akun/admin gagal tertutup.
- Tidak ada secret atau service-role key di source maupun browser bundle.
