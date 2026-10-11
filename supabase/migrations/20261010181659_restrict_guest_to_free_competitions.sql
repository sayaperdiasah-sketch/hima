begin;

drop policy if exists "Pendaftaran tamu valid" on public.pendaftaran;
create policy "Pendaftaran tamu valid" on public.pendaftaran
	for insert to anon
	with check (
		id_user is null
		and status_verifikasi = 'Pending'
		and email_ketua is not null
		and verified_by is null
		and verified_at is null
		and catatan_admin is null
		and bukti_bayar_path is null
		and exists (
			select 1
			from public.kompetisi k
			where k.id_kompetisi = pendaftaran.id_kompetisi
				and k.status = 'aktif'
				and k.biaya_pendaftaran = 0
				and k.deadline_pendaftaran > now()
		)
	);

commit;
