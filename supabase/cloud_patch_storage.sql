-- Storage buckets for Supabase Cloud
-- Run in SQL Editor AFTER auth/cart patches (or: npm run db:push)
-- Fixes: "Bucket public-media не настроен в Supabase Storage"

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('public-media', 'public-media', true, 15728640),
  ('private-files', 'private-files', false, 52428800)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists public_media_select on storage.objects;
create policy public_media_select
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'public-media');
