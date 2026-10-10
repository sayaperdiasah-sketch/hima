## Project background

KompetisiKita adalah portal registrasi kompetisi untuk peserta Indonesia dan panitia penyelenggara. Peserta perlu menemukan lomba, membuat akun, mendaftar, serta memantau verifikasi. Admin memerlukan area kerja terpisah untuk mengelola kompetisi dan memverifikasi pendaftaran tanpa membuka akses kepada akun peserta biasa.

## Product shape

- Static React + TypeScript + Vite application yang kompatibel dengan GitHub Pages dan menggunakan hash-based views.
- Antarmuka peserta mencakup beranda, katalog kompetisi, formulir pendaftaran, autentikasi, dan ringkasan pendaftaran.
- Antarmuka admin memiliki URL login dan shell dashboard terpisah, dengan pemeriksaan role admin dari Supabase sebelum akses diberikan.
- Tautan admin tidak tampil di navigasi publik. Panitia membuka pintu login melalui shortcut `Alt+Shift+A` atau lima ketukan pada teks hak cipta; mekanisme ini hanya discovery gate, bukan pengganti autentikasi.
- Supabase menyediakan Auth, PostgreSQL, dan Storage; keamanan produksi bergantung pada Row Level Security dan tabel `admin_users`, bukan pada penyembunyian rute di sisi klien.
- Katalog membaca kompetisi aktif dari Supabase, pendaftaran peserta mengunggah bukti ke bucket privat lalu membuat transaksi, dan dashboard admin membaca serta memperbarui status verifikasi.
- Katalog memakai RPC `get_active_competitions` untuk jumlah pendaftar; statistik dashboard, identitas admin, form kompetisi, dan signed URL pembayaran semuanya terhubung ke data Supabase.
- Bukti pembayaran hanya dapat diakses oleh pemilik atau admin terverifikasi; frontend menyimpan path objek, bukan URL publik permanen.
- Aplikasi menyertakan mode demo lokal agar seluruh alur UI dapat dipreview tanpa kredensial Supabase. Mode demo tidak menggantikan keamanan produksi.
- Skema SQL, policy RLS, bucket storage, dan petunjuk konfigurasi disertakan sebagai dokumentasi proyek.
- Deployment GitHub Pages memakai `HashRouter`, asset base relatif, dan script `gh-pages`.
- Workflow GitHub Actions membangun dengan dua repository secret Vite dan menerbitkan folder `dist` ke GitHub Pages.
- Tidak ada secret atau service-role key yang boleh disimpan di frontend.
- Identitas visual menggunakan navy/biru sebagai fondasi tepercaya dan merah sebagai aksen energi; gradasi biru-merah dibatasi pada hero, CTA, poster, tombol utama, dan permukaan admin agar tetap terasa korporat serta tidak generik.
