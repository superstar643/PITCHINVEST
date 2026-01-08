-- PITCHINVEST - Storage buckets + basic policies
-- Run this in Supabase SQL Editor
-- 
-- IMPORTANT: After running this, check:
-- 1. Supabase Dashboard → Storage → Buckets (you should see 4 buckets)
-- 2. Supabase Dashboard → Storage → Policies (you should see 4 policies)
-- 
-- Authentication users are created automatically when signUp() is called from the frontend.
-- Check: Supabase Dashboard → Authentication → Users

-- =========================
-- Buckets (public)
-- =========================

-- Create buckets if they don't exist
    -- Note: If buckets already exist, this will update their settings
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cover-images', 'cover-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('user-photos', 'user-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('pitch-videos', 'pitch-videos', true, 104857600, ARRAY['video/mp4', 'video/mov', 'video/avi', 'video/webm']),
  ('pitch-photos', 'pitch-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set 
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- =========================
-- RLS policies for storage.objects
-- NOTE:
-- These policies assume uploads are done by an authenticated user (auth.uid() is NOT NULL).
-- If you keep "Confirm email" enabled, signUp may not return a session, and uploads will fail.
-- In that case, use an Edge Function (service role) or complete uploads after login.
-- 
-- RLS is already enabled on storage.objects by default in Supabase.
-- We only need to create the policies below.
-- =========================

-- Read: anyone can read public objects in these buckets
drop policy if exists "public_read_registration_buckets" on storage.objects;
create policy "public_read_registration_buckets"
on storage.objects for select
using (bucket_id in ('cover-images','user-photos','pitch-videos','pitch-photos'));

-- Insert: authenticated users can upload only into a folder that starts with their uid
drop policy if exists "user_upload_own_folder_registration_buckets" on storage.objects;
create policy "user_upload_own_folder_registration_buckets"
on storage.objects for insert
with check (
  bucket_id in ('cover-images','user-photos','pitch-videos','pitch-photos')
  and auth.uid() is not null
  and (
    -- path formats used in the frontend:
    -- cover-images: {uid}/...
    -- user-photos: {uid}/...
    -- pitch-videos: pitch/{uid}/... OR videos/{uid}/...
    -- pitch-photos: photos/{uid}/...
    name like (auth.uid()::text || '/%')
    or name like ('pitch/' || auth.uid()::text || '/%')
    or name like ('videos/' || auth.uid()::text || '/%')
    or name like ('photos/' || auth.uid()::text || '/%')
  )
);

-- Update/Delete: authenticated users can modify only their own folder objects
drop policy if exists "user_update_own_folder_registration_buckets" on storage.objects;
create policy "user_update_own_folder_registration_buckets"
on storage.objects for update
using (
  bucket_id in ('cover-images','user-photos','pitch-videos','pitch-photos')
  and auth.uid() is not null
  and (
    name like (auth.uid()::text || '/%')
    or name like ('pitch/' || auth.uid()::text || '/%')
    or name like ('videos/' || auth.uid()::text || '/%')
    or name like ('photos/' || auth.uid()::text || '/%')
  )
)
with check (
  bucket_id in ('cover-images','user-photos','pitch-videos','pitch-photos')
  and auth.uid() is not null
  and (
    name like (auth.uid()::text || '/%')
    or name like ('pitch/' || auth.uid()::text || '/%')
    or name like ('videos/' || auth.uid()::text || '/%')
    or name like ('photos/' || auth.uid()::text || '/%')
  )
);

drop policy if exists "user_delete_own_folder_registration_buckets" on storage.objects;
create policy "user_delete_own_folder_registration_buckets"
on storage.objects for delete
using (
  bucket_id in ('cover-images','user-photos','pitch-videos','pitch-photos')
  and auth.uid() is not null
  and (
    name like (auth.uid()::text || '/%')
    or name like ('pitch/' || auth.uid()::text || '/%')
    or name like ('videos/' || auth.uid()::text || '/%')
    or name like ('photos/' || auth.uid()::text || '/%')
  )
);

-- =========================
-- Verification Queries
-- =========================
-- Run these queries separately to verify everything was created:

-- Check buckets were created (should return 4 rows):
select id, name, public, created_at, file_size_limit 
from storage.buckets 
where id in ('cover-images','user-photos','pitch-videos','pitch-photos')
order by id;

-- Check policies were created (should return 4 rows):
select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies 
where tablename = 'objects' 
  and schemaname = 'storage'
  and policyname like '%registration_buckets%'
order by policyname;
