-- Supabase Storage buckets (ADR-013)

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('public-media', 'public-media', true, 15728640),
  ('private-files', 'private-files', false, 52428800)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

-- public-media: anyone can read public files

drop policy if exists public_media_select on storage.objects;
create policy public_media_select
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'public-media');

-- Admin uploads go through service role (server action); no client insert policy needed yet.

-- private-files: no public policies — signed URLs via service role after ACCESS-11
