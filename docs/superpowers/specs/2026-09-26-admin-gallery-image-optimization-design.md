# Admin Galleries and Image Optimization Design

**Goal:** Let the owner manage published photography galleries without a Vercel rebuild while making public image delivery substantially smaller and faster.

## Requirements

- Protect an `/admin` area with Supabase email/password authentication.
- Allow the owner to create, edit, reorder, publish, unpublish, and delete galleries.
- Allow multiple photo uploads per gallery, captions, cover selection, and ordering.
- Keep drafts private; the public site must query published galleries only.
- Store optimized viewing images rather than serving camera originals to visitors.
- Keep the existing hero, gallery, project routes, horizontal gallery interaction, and visual language.
- Do not expose Supabase service-role credentials in the browser.

## Architecture

Supabase Auth provides the admin session. Supabase Postgres stores gallery and photo metadata, while Supabase Storage stores optimized image objects. Row-level security limits write operations to authenticated administrators and allows public reads only for published galleries and their photos.

The frontend uses a small Supabase client configured with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The admin page uploads browser-processed images as WebP, stores the resulting paths, and publishes metadata. Public pages request gallery metadata first, use small cover variants in the grid, and request project photos only after the project route opens.

## Data Model

`galleries`:

- `id` uuid primary key
- `title` text not null
- `slug` text unique not null
- `status` text constrained to `draft` or `published`
- `cover_path` text nullable
- `sort_order` integer default 0
- `created_at`, `updated_at` timestamptz

`photos`:

- `id` uuid primary key
- `gallery_id` uuid references `galleries(id)` on delete cascade
- `storage_path` text not null
- `caption` text nullable
- `sort_order` integer default 0
- `created_at` timestamptz

## Image Processing

The admin upload flow resizes each selected file to a maximum 2400px longest edge and encodes it as WebP before uploading. Public `<img>` elements use lazy loading and async decoding except for the hero image. Gallery covers use a lower-resolution generated client-side variant. Images are rendered with `object-fit` and existing sizing rules, so no full-resolution source is requested for thumbnails.

## Failure Handling

- Unauthenticated admin visits redirect to `/admin/login`.
- Failed uploads remain visible as errors and do not create photo metadata records.
- Failed metadata writes do not mark a gallery published.
- Missing or deleted public records are ignored safely; invalid project routes continue redirecting to `/gallery`.

## Verification

- Run ESLint and the Vite production build.
- Verify public routes load with no Supabase credentials only if a local fallback is intentionally retained; otherwise document required environment variables.
- Manually verify login, draft creation, upload, reorder, publish, public display, unpublish, and deletion against a Supabase project.
