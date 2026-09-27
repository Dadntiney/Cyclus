-- Same pattern as recipe_images.sql: cache one photo per workout so it's
-- only ever generated once.
alter table public.workouts
  add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('workout-images', 'workout-images', true)
on conflict (id) do nothing;

create policy "workout_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'workout-images');
