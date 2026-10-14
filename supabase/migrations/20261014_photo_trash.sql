-- Review and apply separately. This migration preserves existing photo records.
-- Public image bytes remain public; Trash hides records, not existing Storage URLs.
begin;

alter table public.photos add column if not exists deleted_at timestamptz;
create index if not exists photos_deleted_at_idx on public.photos (deleted_at) where deleted_at is not null;

-- Replace only the repository's existing named public-read policy. Inspect live
-- policies for other anonymous grants before assuming Trash metadata is private.
drop policy if exists "published gallery photos are public" on public.photos;
create policy "published gallery photos are public"
  on public.photos for select
  using (auth.role() = 'authenticated' or (deleted_at is null and exists (
    select 1 from public.galleries where galleries.id = photos.gallery_id and galleries.status = 'published'
  )));

notify pgrst, 'reload schema';
commit;
