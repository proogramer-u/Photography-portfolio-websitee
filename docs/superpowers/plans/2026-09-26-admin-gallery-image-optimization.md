# Admin Galleries and Image Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static portfolio metadata with Supabase-managed published galleries and reduce public image transfer sizes through browser-side WebP processing and lazy loading.

**Architecture:** A browser Supabase client reads published gallery data and authenticates the owner. The admin page writes gallery/photo metadata and uploads resized WebP files to Storage. Public pages use the database as their source of truth, with a small local fallback only until migration is complete.

**Tech Stack:** React 19, React Router, Vite, Supabase JS, browser Canvas API, Tailwind CSS, Framer Motion.

**Spec:** `docs/superpowers/specs/2026-09-26-admin-gallery-image-optimization-design.md`

## Global Constraints

- Only authenticated admin users may write galleries, photos, or storage objects.
- Public visitors receive published metadata and optimized viewing images only.
- Do not expose a Supabase service-role key in client code.
- Preserve existing route behavior and visual language.

---

### Task 1: Supabase schema and client configuration

**Files:**
- Create: `supabase/schema.sql`
- Create: `src/lib/supabase.js`
- Modify: `package.json`
- Modify: `.env.example`

- [ ] Add `@supabase/supabase-js`.
- [ ] Define the `galleries` and `photos` tables, indexes, status check, timestamps, and cascade deletion in SQL.
- [ ] Add RLS policies for public published reads and authenticated owner writes.
- [ ] Add Storage bucket/policies for optimized image objects.
- [ ] Export a browser client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [ ] Run `npm install` and `npm run lint`.
- [ ] Commit as `feat: add supabase gallery schema and client`.

### Task 2: Data access and image processing utilities

**Files:**
- Create: `src/lib/galleryApi.js`
- Create: `src/lib/imageProcessing.js`
- Create: `src/lib/galleryFallback.js`

- [ ] Implement `listPublishedGalleries()` returning galleries with ordered photos.
- [ ] Implement `getPublishedGalleryBySlug(slug)` and `saveGalleryMetadata()` with explicit errors.
- [ ] Implement `processImage(file, { maxSize, quality })` using Canvas, preserving aspect ratio and returning a WebP `File`.
- [ ] Implement `createCoverVariant(file)` at a smaller max size.
- [ ] Keep existing `portfolio.js` data as a temporary fallback for local/public rendering while Supabase is configured.
- [ ] Run `npm run lint`.
- [ ] Commit as `feat: add gallery data and image processing utilities`.

### Task 3: Admin authentication and management UI

**Files:**
- Create: `src/pages/AdminLoginPage.jsx`
- Create: `src/pages/AdminPage.jsx`
- Create: `src/components/AdminGalleryForm.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/Header.jsx`

- [ ] Add `/admin/login` with Supabase email/password sign-in and visible error/loading states.
- [ ] Add protected `/admin` routing that redirects unauthenticated users to login.
- [ ] Implement gallery create/edit controls for title, slug, draft/published status, cover, and ordered photo uploads.
- [ ] Upload processed WebP files before inserting photo metadata; remove failed upload objects when metadata insertion fails.
- [ ] Add reorder controls and delete/unpublish actions.
- [ ] Add logout and a small admin link that is not shown in public navigation unless intentionally enabled.
- [ ] Run `npm run lint` and `npm run build`.
- [ ] Commit as `feat: add protected gallery administration`.

### Task 4: Connect public pages to published galleries

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/pages/GalleryPage.jsx`
- Modify: `src/pages/ProjectPage.jsx`
- Modify: `src/components/HorizontalGallery.jsx`
- Modify: `src/data/portfolio.js`

- [ ] Load published galleries from Supabase with fallback behavior when configuration is absent.
- [ ] Replace numeric project assumptions with stable gallery slugs while preserving existing URLs where possible.
- [ ] Render only published galleries in the public index.
- [ ] Add loading and empty states without disrupting page transitions.
- [ ] Keep project image fetching route-scoped so gallery pages do not preload every project.
- [ ] Run `npm run lint` and `npm run build`.
- [ ] Commit as `feat: render supabase galleries publicly`.

### Task 5: Optimize image loading and migrate static assets

**Files:**
- Modify: `src/pages/HeroPage.jsx`
- Modify: `src/pages/GalleryPage.jsx`
- Modify: `src/components/HorizontalGallery.jsx`
- Modify: `src/index.css`
- Modify: `index.html`
- Modify: `README.md`

- [ ] Add explicit `width`/`height` or aspect-ratio constraints to prevent layout shift.
- [ ] Add `loading="lazy"` and `decoding="async"` to non-hero images.
- [ ] Mark only the hero image as eager/high priority.
- [ ] Add responsive `sizes` where image widths vary.
- [ ] Replace the JPEG favicon reference with a small SVG/ICO asset.
- [ ] Document Supabase environment variables, schema setup, Storage setup, and migration of current images.
- [ ] Remove static originals from the deployed frontend only after Supabase migration is verified.
- [ ] Run `npm run lint` and `npm run build`.
- [ ] Commit as `perf: optimize public image loading`.

### Task 6: End-to-end verification

**Files:**
- Modify: `README.md` if verification instructions need clarification.

- [ ] Verify admin login and logout.
- [ ] Verify draft galleries remain absent from public routes.
- [ ] Verify processed upload files are WebP and no larger than the configured display size.
- [ ] Verify publish, unpublish, reorder, cover selection, and deletion.
- [ ] Verify public gallery and project routes show only published records.
- [ ] Verify direct navigation to an invalid project still redirects to `/gallery`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Commit any final documentation-only changes as `docs: document gallery administration`.
