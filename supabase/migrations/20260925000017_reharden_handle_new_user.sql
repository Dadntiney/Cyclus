-- The advisor flagged public.handle_new_user() as callable by anon/
-- authenticated again despite migration 000004 already revoking it —
-- something (an intervening `create or replace function` elsewhere,
-- across the several parallel branches this project has had) reset its
-- default grants. Re-applying defensively; this is a no-op if it's ever
-- already revoked.
revoke execute on function public.handle_new_user() from anon, authenticated;
