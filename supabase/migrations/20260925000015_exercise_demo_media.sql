-- Visual explanation per exercise: a short looping demo video and/or a
-- static image (used as the video poster, or standalone when there is no
-- video yet). Both are nullable so existing exercises keep working via the
-- illustrated fallback in the app until real media is added per exercise.

alter table public.exercises
  add column if not exists demo_video_url text,
  add column if not exists demo_image_url text;

-- Public bucket, same policy shape as recipe-images: images/videos are not
-- sensitive and are read directly by the browser via public URLs. Writes
-- are intentionally left to service_role only (no policy for anon/
-- authenticated), so regular user sessions can never upload or overwrite
-- a file; only a server process using the service role key can.
insert into storage.buckets (id, name, public)
values ('exercise-media', 'exercise-media', true)
on conflict (id) do nothing;

create policy "exercise_media_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'exercise-media');
