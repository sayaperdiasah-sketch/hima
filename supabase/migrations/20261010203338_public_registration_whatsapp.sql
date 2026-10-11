begin;

alter table public.kompetisi
	add column if not exists whatsapp_group_url text;

do $$
begin
	if not exists (
		select 1 from pg_constraint
		where conrelid = 'public.kompetisi'::regclass
			and conname = 'kompetisi_whatsapp_group_url_check'
	) then
		alter table public.kompetisi
			add constraint kompetisi_whatsapp_group_url_check
			check (
				whatsapp_group_url is null
				or whatsapp_group_url ~ '^https://chat\.whatsapp\.com/[A-Za-z0-9_-]+/?([?][^[:space:]]*)?$'
			);
	end if;
end;
$$;

drop function public.get_active_competitions();
create function public.get_active_competitions()
returns table (
	id_kompetisi bigint,
	nama_kompetisi text,
	kategori text,
	deskripsi text,
	target_peserta text,
	total_hadiah text,
	biaya_pendaftaran integer,
	kuota_maksimal integer,
	deadline_pendaftaran timestamptz,
	poster_path text,
	status text,
	jenis_peserta text,
	minimal_anggota smallint,
	maksimal_anggota smallint,
	whatsapp_group_url text,
	pendaftar_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
	select
		k.id_kompetisi,
		k.nama_kompetisi,
		k.kategori,
		k.deskripsi,
		k.target_peserta,
		k.total_hadiah,
		k.biaya_pendaftaran,
		k.kuota_maksimal,
		k.deadline_pendaftaran,
		k.poster_path,
		k.status,
		k.jenis_peserta,
		k.minimal_anggota,
		k.maksimal_anggota,
		k.whatsapp_group_url,
		(select count(*) from public.pendaftaran p where p.id_kompetisi = k.id_kompetisi)
	from public.kompetisi k
	where k.status = 'aktif' and k.deadline_pendaftaran > now()
	order by k.deadline_pendaftaran asc;
$$;
revoke all on function public.get_active_competitions() from public;
grant execute on function public.get_active_competitions() to anon, authenticated;

alter table public.pendaftaran alter column id_user drop not null;
alter table public.pendaftaran drop constraint if exists pendaftaran_user_competition_key;

drop policy if exists "Pendaftaran tamu valid" on public.pendaftaran;
create policy "Pendaftaran tamu valid" on public.pendaftaran
	for insert to anon, authenticated
	with check (
		id_user is null
		and status_verifikasi = 'Pending'
		and email_ketua is not null
		and verified_by is null
		and verified_at is null
		and catatan_admin is null
		and (
			bukti_bayar_path is null
			or bukti_bayar_path ~ ('^guest/' || id_kompetisi::text || '/[A-Za-z0-9._-]+$')
		)
		and exists (
			select 1
			from public.kompetisi k
			where k.id_kompetisi = pendaftaran.id_kompetisi
				and k.status = 'aktif'
				and k.deadline_pendaftaran > now()
				and (k.biaya_pendaftaran = 0 or bukti_bayar_path is not null)
		)
	);

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

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.prevent_duplicate_registration_contacts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	perform pg_catalog.pg_advisory_xact_lock(new.id_kompetisi);

	if exists (
		select 1
		from public.pendaftaran existing_registration
		cross join lateral pg_catalog.jsonb_array_elements(new.anggota) as incoming_member(value)
		where existing_registration.id_kompetisi = new.id_kompetisi
			and (
				pg_catalog.lower(existing_registration.email_ketua) = pg_catalog.lower(incoming_member.value ->> 'email')
				or existing_registration.no_whatsapp = incoming_member.value ->> 'no_whatsapp'
				or exists (
					select 1
					from pg_catalog.jsonb_array_elements(coalesce(existing_registration.anggota, '[]'::jsonb)) as existing_member(value)
					where pg_catalog.lower(existing_member.value ->> 'email') = pg_catalog.lower(incoming_member.value ->> 'email')
						or existing_member.value ->> 'no_whatsapp' = incoming_member.value ->> 'no_whatsapp'
				)
			)
	) or exists (
		select 1
		from pg_catalog.jsonb_array_elements(new.anggota) with ordinality as first_member(value, member_number)
		join pg_catalog.jsonb_array_elements(new.anggota) with ordinality as second_member(value, member_number)
			on second_member.member_number > first_member.member_number
		where pg_catalog.lower(first_member.value ->> 'email') = pg_catalog.lower(second_member.value ->> 'email')
			or first_member.value ->> 'no_whatsapp' = second_member.value ->> 'no_whatsapp'
	) then
		raise exception 'duplicate_registration_contact'
			using errcode = '23505', constraint = 'pendaftaran_competition_contact_unique';
	end if;

	return new;
end;
$$;
revoke all on function private.prevent_duplicate_registration_contacts() from public, anon, authenticated;

drop trigger if exists z_pendaftaran_prevent_duplicate_contacts on public.pendaftaran;
create trigger z_pendaftaran_prevent_duplicate_contacts
	before insert on public.pendaftaran
	for each row execute function private.prevent_duplicate_registration_contacts();

drop policy if exists "guest uploads payment proof" on storage.objects;
create policy "guest uploads payment proof" on storage.objects
	for insert to anon, authenticated
	with check (
		bucket_id = 'bukti-bayar'
		and name ~ '^guest/[0-9]+/[A-Za-z0-9._-]+$'
		and exists (
			select 1
			from public.kompetisi k
			where k.id_kompetisi::text = (storage.foldername(name))[2]
				and k.biaya_pendaftaran > 0
				and k.status = 'aktif'
				and k.deadline_pendaftaran > now()
		)
	);

commit;
