# Cokordaz Photography Portfolio


## Getting Started

### Requirements

- Node.js 18+ (recommended)
- npm

### Installation

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

By default, Vite runs at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Supabase Admin Galleries

The app can use Supabase as its live gallery source. Copy `.env.example` to `.env.local` and set:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run `supabase/schema.sql` in the Supabase SQL editor, then create one email/password account for the site owner. The admin page is available at `/admin`. It supports draft galleries, publishing, captions, ordering, and deletion.

Uploaded photos are resized to a maximum 2400px longest edge and converted to WebP in the browser before they are stored. Cover images use a smaller variant. The public site lazy-loads non-hero images and only requests project images when their project route opens. Keep the existing files in `public/images` until the Supabase galleries have been uploaded and verified; they can then be removed from the deployment to avoid shipping the original 8–12 MB camera files.

## Route Map

- `/` -> Hero page
- `/gallery` -> Project gallery
- `/project/:slug` -> Individual managed project pages
- `/project-1` ... `/project-8` -> Legacy project pages
- `/admin/login` -> Admin sign-in
- `/admin` -> Protected gallery management

## Project Structure

```text
agas-portfolio/
  public/
    images/
  src/
    components/
      Header.jsx
      HorizontalGallery.jsx
      PageTransition.jsx
    pages/
      HeroPage.jsx
      GalleryPage.jsx
      projects/
        Project1Page.jsx ... Project8Page.jsx
    App.jsx
    main.jsx
```

## Deployment Notes

This is a static frontend app and can be deployed to platforms like Vercel, Netlify, or GitHub Pages after running `npm run build`.

## Author

Cokorda Bagus Laksmana Iswara
