## Project background

KompetisiKita adalah portal registrasi kompetisi untuk peserta Indonesia dan panitia penyelenggara. Peserta perlu menemukan lomba, membuat akun, mendaftar, serta memantau verifikasi. Admin memerlukan area kerja terpisah untuk mengelola kompetisi dan memverifikasi pendaftaran tanpa membuka akses kepada akun peserta biasa.

## Product shape

- Static React + TypeScript + Vite application yang kompatibel dengan GitHub Pages dan menggunakan hash-based views.
- Antarmuka peserta mencakup beranda, katalog kompetisi, formulir pendaftaran, autentikasi, dan ringkasan pendaftaran.
- Antarmuka admin memiliki URL login dan shell dashboard terpisah, dengan pemeriksaan Supabase Auth dan allowlist admin sebelum akses diberikan.
- Tautan admin tidak tampil di navigasi publik. Panitia membuka pintu login melalui shortcut `Alt+Shift+A` atau lima ketukan pada teks hak cipta; mekanisme ini hanya discovery gate, bukan pengganti autentikasi.
- Supabase menyediakan Auth, PostgreSQL, dan Storage; keamanan produksi bergantung pada Row Level Security dan tabel `admin_users`, bukan pada penyembunyian rute di sisi klien.
- Katalog membaca kompetisi aktif dari Supabase, pendaftaran peserta mengunggah bukti ke bucket privat lalu membuat transaksi, dan dashboard admin membaca seluruh pendaftaran serta menyimpan status dan catatan verifikasi.
- Katalog memakai RPC `get_active_competitions` untuk jumlah pendaftar; statistik dashboard, identitas admin, form kompetisi, dan signed URL pembayaran semuanya terhubung ke data Supabase.
- Bukti pembayaran hanya dapat diakses oleh pemilik atau admin terverifikasi; frontend menyimpan path objek, bukan URL publik permanen.
- Admin memiliki CRUD kompetisi lengkap, ekspor CSV aman, filter/pencarian pendaftaran, hapus pendaftaran terkonfirmasi, tiga slot hero, dan audit log berhalaman.
- Tiga hero menerima JPG/PNG/WebP maksimal 5 MB dari bucket publik `hero-media`; hanya admin terverifikasi yang dapat menulis.
- Validasi frontend memeriksa format, batas panjang, tanggal, nomor WhatsApp, serta ekstensi/MIME/file signature. Database mengulang validasi melalui constraint dan trigger kuota atomik.
- Katalog dapat memakai data contoh untuk preview, tetapi autentikasi, pendaftaran, dan admin selalu gagal tertutup saat Supabase belum dikonfigurasi.
- Skema SQL baru dan migrasi hardening untuk project lama mencakup policy RLS, bucket storage, constraint, trigger kuota, serta audit log otomatis.
- Deployment GitHub Pages memakai `HashRouter`, asset base relatif, dan GitHub Actions resmi tanpa dependensi `gh-pages`.
- Workflow GitHub Actions membangun dengan dua repository secret Vite dan menerbitkan folder `dist` ke GitHub Pages.
- Tidak ada secret atau service-role key yang boleh disimpan di frontend.
- Identitas visual menggunakan navy/biru sebagai fondasi tepercaya dan merah sebagai aksen energi; gradasi biru-merah dibatasi pada hero, CTA, poster, tombol utama, dan permukaan admin agar tetap terasa korporat serta tidak generik.
