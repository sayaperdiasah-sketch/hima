begin;

alter table public.kompetisi
	add column if not exists jenis_peserta text not null default 'kelompok',
	add column if not exists minimal_anggota smallint not null default 2,
	add column if not exists maksimal_anggota smallint not null default 5;

do $$
begin
	if not exists (
		select 1 from pg_constraint
		where conrelid = 'public.kompetisi'::regclass
			and conname = 'kompetisi_participant_limits_check'
	) then
		alter table public.kompetisi
			add constraint kompetisi_participant_limits_check
			check (
				(jenis_peserta = 'individu' and minimal_anggota = 1 and maksimal_anggota = 1)
				or (jenis_peserta = 'kelompok' and minimal_anggota between 2 and maksimal_anggota and maksimal_anggota <= 20)
			);
	end if;
end;
$$;

alter table public.pendaftaran
	add column if not exists email_ketua text,
	add column if not exists anggota jsonb not null default '[]'::jsonb;

insert into public.profiles (id, nama_lengkap)
select u.id, coalesce(u.raw_user_meta_data ->> 'nama_lengkap', '')
from auth.users u
on conflict (id) do nothing;

do $$
begin
	if not exists (
		select 1 from pg_constraint
		where conrelid = 'public.pendaftaran'::regclass
			and conname = 'pendaftaran_anggota_array_check'
	) then
		alter table public.pendaftaran
			add constraint pendaftaran_anggota_array_check
			check (jsonb_typeof(anggota) = 'array');
	end if;
end;
$$;

create or replace function public.validate_registration_members()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
	competition_row public.kompetisi%rowtype;
	member_data jsonb;
	member_count integer;
begin
	select * into competition_row
	from public.kompetisi
	where id_kompetisi = new.id_kompetisi;

	if not found or competition_row.status <> 'aktif' or competition_row.deadline_pendaftaran <= now() then
		raise exception 'competition_unavailable' using errcode = 'P0001';
	end if;

	if jsonb_typeof(new.anggota) <> 'array' then
		raise exception 'registration_members_invalid' using errcode = '22023';
	end if;

	member_count := jsonb_array_length(new.anggota);
	if member_count < competition_row.minimal_anggota or member_count > competition_row.maksimal_anggota then
		raise exception 'registration_member_count_invalid' using errcode = '22023';
	end if;

	for member_data in select value from jsonb_array_elements(new.anggota) as members(value) loop
		if jsonb_typeof(member_data) <> 'object'
			or char_length(btrim(coalesce(member_data ->> 'nama_lengkap', ''))) not between 2 and 100
			or coalesce(member_data ->> 'email', '') !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
			or coalesce(member_data ->> 'no_whatsapp', '') !~ '^08[0-9]{8,12}$'
			or char_length(btrim(coalesce(member_data ->> 'instansi', ''))) not between 2 and 140 then
			raise exception 'registration_member_invalid' using errcode = '22023';
		end if;
	end loop;

	if new.nama_ketua is distinct from new.anggota -> 0 ->> 'nama_lengkap'
		or new.email_ketua is distinct from new.anggota -> 0 ->> 'email'
		or new.no_whatsapp is distinct from new.anggota -> 0 ->> 'no_whatsapp'
		or new.instansi is distinct from new.anggota -> 0 ->> 'instansi' then
		raise exception 'registration_leader_mismatch' using errcode = '22023';
	end if;

	return new;
end;
$$;

drop trigger if exists pendaftaran_validate_members on public.pendaftaran;
create trigger pendaftaran_validate_members
	before insert on public.pendaftaran
	for each row execute procedure public.validate_registration_members();

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
		(select count(*) from public.pendaftaran p where p.id_kompetisi = k.id_kompetisi) as pendaftar_count
	from public.kompetisi k
	where k.status = 'aktif' and k.deadline_pendaftaran > now()
	order by k.deadline_pendaftaran asc;
$$;
revoke all on function public.get_active_competitions() from public;
grant execute on function public.get_active_competitions() to anon, authenticated;

commit;
