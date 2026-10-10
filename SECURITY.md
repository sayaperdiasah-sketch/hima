# Keamanan KompetisiKita

## Model akses

- Peserta hanya dapat membaca/mengubah profil sendiri dan membaca pendaftaran sendiri.
- Peserta hanya dapat membuat satu pendaftaran per kompetisi aktif sebelum deadline.
- Admin harus lolos Supabase Auth, berstatus aktif di `admin_users`, lalu tetap dibatasi RLS.
- Mengetahui URL admin atau shortcut tidak memberikan hak akses.

## Lapisan proteksi

1. Validasi HTML dan TypeScript untuk input, batas panjang, angka, tanggal, nomor WhatsApp, dan URL internal.
2. Validasi upload menggunakan ekstensi, MIME, ukuran, dan magic bytes untuk PDF/JPEG/PNG/WebP.
3. Supabase Auth PKCE, konfirmasi email, CAPTCHA, rate limit bawaan, dan MFA admin.
4. RLS dan Storage policy untuk seluruh data privat serta berkas pembayaran.
5. Constraint dan trigger PostgreSQL untuk konsistensi, kuota atomik, deadline, serta duplikasi.
6. Audit log immutable dari browser untuk create/update/delete/register/verify/login admin.
7. CSP, referrer policy, pesan error tersanitasi, dan mitigasi CSV formula injection.

## Checklist produksi

- Aktifkan **Confirm email**, CAPTCHA, dan MFA admin di Supabase.
- Jalankan `schema.sql` pada project baru atau `hardening_migration.sql` pada project lama.
- Masukkan hanya anon key ke GitHub Actions; jangan pernah memakai `service_role` di frontend.
- Tambahkan admin lewat SQL Editor dan tinjau `admin_users` secara berkala.
- Jalankan `npm ci`, `npm run typecheck`, `npm test`, dan `npm audit --audit-level=high` sebelum deploy.
- Pantau menu **Log Aktivitas** untuk operasi tidak wajar.
- Rotasi kredensial dan nonaktifkan admin segera bila akun dicurigai.

## Batasan hosting

GitHub Pages tidak dapat mengirim header HTTP kustom. CSP diterapkan melalui meta tag. Jika membutuhkan HSTS, header Permissions-Policy, WAF, atau rate limit tambahan di edge, letakkan domain di belakang reverse proxy/CDN yang mendukung header keamanan.
