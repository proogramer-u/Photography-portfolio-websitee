# Cokorda Photography

My photography portfolio, built with React and Vite. You can browse the galleries and scroll through each collection horizontally. There's also an admin page for uploading photographs and managing galleries.

The site uses Tailwind CSS for styling, Framer Motion for animations, and Supabase for login, gallery data, and image storage.

## Running it locally

You'll need Node.js 22.12 or newer, npm, and a Supabase project.

```bash
npm ci
cp .env.example .env.local
```

Fill in `.env.local` with your own settings:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
VITE_ADMIN_USERNAME=your-username
VITE_ADMIN_EMAIL=owner@example.com
```

Use the Supabase project URL without `/rest/v1/` at the end. The admin username is an alias for an existing Supabase email/password account, so the password is still checked by Supabase. There's no signup page on the website.

These `VITE_` values are visible in the browser, including the email used for the alias. Use a publishable or anon key here, never a secret/service-role key or a password. `.env.local` stays out of Git.

Then start the site:

```bash
npm run dev
```

The address is usually `http://localhost:5173`. Restart Vite if you change the environment settings.

## What's working

The public site shows published galleries, their covers, and the photos inside them. Images have loading placeholders and failure states, and later photos load lazily.

In the admin dashboard, you can:

- Create a gallery as a draft, with just a name to start.
- Upload multiple photos when creating a gallery, add captions, and arrange their order before saving.
- Add multiple photos to an existing gallery, with optional captions.
- Edit a saved photograph’s caption or move it to Trash. Restore it later, or permanently delete its record with a separate confirmation. Trash requires the photo-Trash migration; stored image files are retained. Replace or remove a photo’s gallery cover before moving it to Trash.
- Rename, publish, unpublish, or move a gallery to Trash. Restore it with its original publication status, or permanently delete it after confirmation.
- Upload a separate cover, replace or remove it, or use one of the gallery's photos as the cover.
- Adjust cover framing by dragging or using position sliders (requires the cover-position migration).

Uploads accept JPEG and PNG files up to 20 MiB each. They're converted to WebP in the browser, keeping their proportions. Photos are resized to a maximum 2400px longest edge; covers use 900px.

Separate photo names, descriptions, alt text, and reordering saved photos still need to be connected. Caption editing uses the existing caption field; it does not require a database migration. Trash requires the photo migration (`supabase/migrations/20261014_photo_trash.sql`), then the gallery migration (`supabase/migrations/20261015_gallery_trash.sql`). Review and apply them separately before using Trash. Galleries and photos stay until you restore or permanently delete them. Moving a gallery to Trash preserves its collection; permanently deleting it removes all its photo records, including individually trashed photos.

## A few things still to finish

The admin login works, but owner-only permissions still need to be verified and enforced on the backend. The policies in `supabase/schema.sql` allow every authenticated account to manage content. The username alias and React route guard don't replace database and Storage permissions.

The bucket is public, so marking a gallery as a draft or unpublishing it doesn't make its image URLs private. Gallery creation also saves the gallery and photos in separate requests; a failed photo save can leave a partially created gallery.

Old covers and uploaded files are kept when a cover is replaced or a gallery is deleted. This avoids accidentally removing a photograph used elsewhere, but file cleanup is still pending. Keep the original files in `public/images/` until they're backed up and any migration has been checked.

The [codebase audit](docs/CODEBASE_AUDIT.md) has the full findings and proposed fixes. Those fixes haven't been applied yet.

## Supabase

Cover framing needs the additive migration in `supabase/migrations/20261013_gallery_cover_position.sql`. Review it against your live schema before applying it. Existing galleries default to centered framing, and public reads fall back to the old schema until the columns are added. This migration does not change image files, buckets, or authorization policies.

The schema reference is in `supabase/schema.sql`. It describes the `galleries` and `photos` tables, their policies, and the `portfolio-images` bucket.

Check your existing Supabase setup before running that file. It isn't a migration history, and rerunning its policy statements can fail. The SQL in this repo also doesn't tell you which policies are currently deployed.

## Pages

| URL | Page |
|---|---|
| `/` | Homepage |
| `/gallery` | Published galleries |
| `/project/:slug` | Photos in a gallery |
| `/admin/login` | Admin sign-in |
| `/admin` | Admin dashboard |

Selecting a gallery in the dashboard adds `?gallery=<id>` to the admin URL. The old `/project-N` routes depend on `src/data/portfolio.js`, which is currently empty.

## Checks and build

```bash
npm run lint
node --test tests/*.test.mjs
npm run build
```

The build goes into `dist/`. To look at it locally:

```bash
npm run preview
```

For deployment, publish `dist/` and set the environment variables on your hosting platform before building. Changes to those variables need a rebuild.

The host needs to serve `index.html` for app routes so opening or refreshing a gallery URL works. The current setup assumes the site is hosted at the root of its domain; a subdirectory needs extra Vite/router configuration. There isn't a hosting configuration included yet.

## Finding your way around

- `src/pages/` — public pages and the admin dashboard
- `src/components/` — navigation, horizontal galleries, forms, and loading placeholders
- `src/components/admin/` — admin cards, sidebar, dialogs, and cover controls
- `src/lib/` — Supabase calls, login helpers, and image processing
- `public/images/` — original local photographs, including the homepage image
- `tests/` — regression tests using mocked requests
- `docs/` — project notes and the audit

