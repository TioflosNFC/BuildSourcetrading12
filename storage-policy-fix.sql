-- ===========================================================
-- BUILD SOURCE — Storage upload policy fix
-- Run this in Supabase: Project → SQL Editor → New query
-- This allows your logged-in admin to upload photos to the
-- product-images and project-images buckets.
-- (Public read access for these buckets is separate and should
--  already be working since the buckets are set to "Public".)
-- ===========================================================

create policy "Authenticated can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "Authenticated can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

create policy "Authenticated can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

create policy "Authenticated can upload project images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

create policy "Authenticated can update project images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images');

create policy "Authenticated can delete project images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images');
