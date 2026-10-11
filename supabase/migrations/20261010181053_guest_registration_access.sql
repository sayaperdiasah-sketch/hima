begin;

alter table public.pendaftaran alter column id_user drop not null;

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
				and k.deadline_pendaftaran > now()
		)
	);

revoke select, update, delete on table public.pendaftaran from anon;
grant insert on table public.pendaftaran to anon;

do $$
declare
	registration_sequence text := pg_get_serial_sequence('public.pendaftaran', 'id_pendaftaran');
begin
	if registration_sequence is not null then
		execute format('grant usage on sequence %s to anon', registration_sequence::regclass);
	end if;
end;
$$;

create unique index if not exists pendaftaran_guest_email_competition_idx
	on public.pendaftaran (id_kompetisi, lower(email_ketua))
	where id_user is null and email_ketua is not null;

commit;
