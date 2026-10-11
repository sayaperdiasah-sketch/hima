-- Tambah kolom jenis peserta, min/max anggota, dan URL grup WhatsApp
begin;

alter table public.kompetisi
  add column if not exists jenis_peserta text not null default 'individu'
    check (jenis_peserta in ('individu', 'kelompok')),
  add column if not exists minimal_anggota integer not null default 1
    check (minimal_anggota >= 1),
  add column if not exists maksimal_anggota integer not null default 1
    check (maksimal_anggota >= 1),
  add column if not exists whatsapp_group_url text
    check (whatsapp_group_url is null or whatsapp_group_url ~ '^https?://');

-- Validasi khusus kelompok
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'kompetisi_anggota_kelompok_check') then
    alter table public.kompetisi
      add constraint kompetisi_anggota_kelompok_check
      check (
        jenis_peserta = 'individu'
        or (minimal_anggota between 2 and 20
            and maksimal_anggota between 2 and 20
            and minimal_anggota <= maksimal_anggota)
      );
  end if;
end $$;

commit;
