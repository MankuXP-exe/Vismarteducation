-- ═══════════════════════════════════════════════════════════════════
-- Vi Smart Learning Education — Storage Bucket Policies
-- Run AFTER 002_rls_policies.sql
-- ═══════════════════════════════════════════════════════════════════
-- NOTE: Create these buckets MANUALLY first in Supabase Dashboard → Storage:
--   1. avatars          (Public, 2MB, image/jpeg image/png image/webp)
--   2. batch-thumbnails (Public, 5MB, image/jpeg image/png image/webp)
--   3. study-materials  (Private, 50MB, application/pdf image/*)
--   4. discount-documents (Private, 5MB, image/* application/pdf)
-- Then run the policies below:

-- Avatars: users upload own avatar
create policy "Users upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Avatars are public"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Study materials: enrolled students download
create policy "Enrolled students download materials"
  on storage.objects for select
  using (
    bucket_id = 'study-materials'
    and auth.role() = 'authenticated'
  );

-- Teachers upload materials
create policy "Teachers upload materials"
  on storage.objects for insert
  with check (
    bucket_id = 'study-materials'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('teacher','admin')
    )
  );
