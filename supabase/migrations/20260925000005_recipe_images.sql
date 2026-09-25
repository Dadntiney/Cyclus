-- AI-generated recipe photography: storage + column to cache the result
-- so an image is only ever generated once per recipe.

alter table public.recipes
  add column if not exists image_url text;

-- Public bucket: images are not sensitive and are read directly by the
-- browser via public URLs. Writes are intentionally left to service_role
-- only (no policy is created for anon/authenticated), so regular user
-- sessions — even routed through our own server actions — can never
-- upload or overwrite a file; only a server process using the service
-- role key (which bypasses RLS) can.
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

create policy "recipe_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'recipe-images');
