begin;

revoke all privileges on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated;

commit;
