-- Apply after 20261014_photo_trash.sql. Review live grants/policies first.
-- This keeps all galleries and photographs; permanent deletion remains explicit.
begin;

alter table public.galleries add column if not exists deleted_at timestamptz;
create index if not exists galleries_deleted_at_idx on public.galleries (deleted_at) where deleted_at is not null;

drop policy if exists "published galleries are public" on public.galleries;
create policy "published galleries are public"
  on public.galleries for select
  using (auth.role() = 'authenticated' or (status = 'published' and deleted_at is null));

drop policy if exists "published gallery photos are public" on public.photos;
create policy "published gallery photos are public"
  on public.photos for select
  using (auth.role() = 'authenticated' or (deleted_at is null and exists (
    select 1 from public.galleries where galleries.id = photos.gallery_id
      and galleries.status = 'published' and galleries.deleted_at is null
  )));

-- Other live anonymous-read policies could override these filters: inspect them.
-- Public Storage URLs are unchanged and remain accessible.
notify pgrst, 'reload schema';
commit;
