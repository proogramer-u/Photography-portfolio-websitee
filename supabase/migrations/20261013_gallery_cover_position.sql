-- Prepared only: review and apply in the Supabase SQL editor after approval.
-- Adds framing metadata; no images, existing records, policies, or buckets are removed.
begin;
alter table public.galleries
  add column if not exists cover_position_x numeric(5,2) not null default 50,
  add column if not exists cover_position_y numeric(5,2) not null default 50;
-- IF NOT EXISTS does not repair previously defined incompatible columns.
-- Check column types/defaults/nullability before applying to a modified schema.
do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.galleries'::regclass and conname = 'galleries_cover_position_x_range') then
    alter table public.galleries add constraint galleries_cover_position_x_range check (cover_position_x between 0 and 100);
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.galleries'::regclass and conname = 'galleries_cover_position_y_range') then
    alter table public.galleries add constraint galleries_cover_position_y_range check (cover_position_y between 0 and 100);
  end if;
end $$;
notify pgrst, 'reload schema';
commit;
