-- ============================================================================
-- Storage bucket for business logos / cover images.
--
-- Objects are stored under a path prefixed with the business id, e.g.
--   business-assets/{business_id}/logo.png
-- so RLS on storage.objects can check business membership from the path
-- itself (Supabase's recommended pattern) without needing a separate
-- metadata table. The bucket is public-read (logos need to be visible on
-- the anonymous feedback page) but writes are restricted to members of
-- that business.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('business-assets', 'business-assets', true)
on conflict (id) do nothing;

create policy "business_assets_public_read"
  on storage.objects for select
  using (bucket_id = 'business-assets');

create policy "business_assets_member_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'business-assets'
    and public.is_business_member(((storage.foldername(name))[1])::uuid)
  );

create policy "business_assets_member_update"
  on storage.objects for update
  using (
    bucket_id = 'business-assets'
    and public.is_business_member(((storage.foldername(name))[1])::uuid)
  );

create policy "business_assets_member_delete"
  on storage.objects for delete
  using (
    bucket_id = 'business-assets'
    and public.is_business_member(((storage.foldername(name))[1])::uuid)
  );
