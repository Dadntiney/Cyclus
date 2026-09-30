-- Privacy / AVG consents on profiles
alter table public.profiles
  add column if not exists health_data_consent_at timestamptz,
  add column if not exists health_data_consent_version text,
  add column if not exists buddy_ai_consent_at timestamptz,
  add column if not exists buddy_ai_consent_version text;

comment on column public.profiles.health_data_consent_at is
  'When the user consented to processing health/cycle data (AVG art. 9).';
comment on column public.profiles.health_data_consent_version is
  'Privacy policy version accepted with health-data consent.';
comment on column public.profiles.buddy_ai_consent_at is
  'When the user consented to sending Buddy context to the AI provider.';
comment on column public.profiles.buddy_ai_consent_version is
  'Privacy policy version accepted with Buddy AI consent.';

-- Copy consent from signup metadata when present
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  consented boolean;
  policy_version text;
begin
  consented := coalesce((new.raw_user_meta_data->>'health_data_consent')::boolean, false);
  policy_version := nullif(new.raw_user_meta_data->>'health_data_consent_version', '');

  insert into public.profiles (
    id,
    health_data_consent_at,
    health_data_consent_version
  )
  values (
    new.id,
    case when consented then now() else null end,
    case when consented then policy_version else null end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated;
