-- Optional sample content. Run after schema.sql.
with sample_data (nama_kompetisi, kategori, deskripsi, target_peserta, total_hadiah, biaya_pendaftaran, kuota_maksimal, deadline_pendaftaran, status) as (
  values
    ('Nusantara Design Sprint', 'Desain Produk', 'Rancang pengalaman layanan publik digital yang lebih inklusif dalam sprint intensif berbasis studi kasus nyata.', 'Mahasiswa', 'Rp15 Juta', 75000, 120, '2027-11-18 23:59:00+07'::timestamptz, 'aktif'),
    ('Data Impact Challenge', 'Data Science', 'Ubah data perkotaan menjadi insight yang dapat ditindaklanjuti untuk kota yang tangguh dan manusiawi.', 'Umum', 'Rp20 Juta', 100000, 90, '2027-11-25 23:59:00+07'::timestamptz, 'aktif'),
    ('Young Founder Arena', 'Business Case', 'Bangun strategi pertumbuhan untuk bisnis lokal dan presentasikan solusi di hadapan praktisi industri.', 'SMA / Mahasiswa', 'Rp12 Juta', 50000, 150, '2027-12-02 23:59:00+07'::timestamptz, 'aktif'),
    ('Ruang Cerita Pendek', 'Film Pendek', 'Ceritakan wajah Indonesia hari ini lewat film berdurasi maksimal tujuh menit dengan perspektif yang segar.', 'Umum', 'Rp18 Juta', 0, 80, '2027-12-12 23:59:00+07'::timestamptz, 'aktif')
)
insert into public.kompetisi
  (nama_kompetisi, kategori, deskripsi, target_peserta, total_hadiah, biaya_pendaftaran, kuota_maksimal, deadline_pendaftaran, status)
select * from sample_data s
where not exists (
  select 1 from public.kompetisi k where k.nama_kompetisi = s.nama_kompetisi
);

