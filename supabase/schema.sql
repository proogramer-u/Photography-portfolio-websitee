create extension if not exists "pgcrypto";

create table if not exists public.galleries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  cover_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists galleries_status_order_idx on public.galleries(status, sort_order);
create index if not exists photos_gallery_order_idx on public.photos(gallery_id, sort_order);

alter table public.galleries enable row level security;
alter table public.photos enable row level security;

create policy "published galleries are public"
  on public.galleries for select
  using (status = 'published' or auth.role() = 'authenticated');

create policy "authenticated users manage galleries"
  on public.galleries for all
  to authenticated
  using (true)
  with check (true);

create policy "published gallery photos are public"
  on public.photos for select
  using (exists (
    select 1 from public.galleries
    where galleries.id = photos.gallery_id and galleries.status = 'published'
  ) or auth.role() = 'authenticated');

create policy "authenticated users manage photos"
  on public.photos for all
  to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

create policy "public image reads"
  on storage.objects for select
  using (bucket_id = 'portfolio-images');

create policy "authenticated image uploads"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-images');

create policy "authenticated image changes"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-images');

create policy "authenticated image deletes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-images');
