# Agas Photography Portfolio

A React + Vite portfolio website for showcasing photography projects.

## Tech Stack

- React 19
- React Router
- Framer Motion
- Tailwind CSS v4
- Vite

## Features

- Full-screen landing (hero) page
- Gallery page with 8 project entries
- Dedicated page for each project (`/project-1` to `/project-8`)
- Animated page transitions using Framer Motion
- Mobile-friendly navigation with overlay menu
- Social/contact links (WhatsApp, Instagram, TikTok)

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

## Route Map

- `/` -> Hero page
- `/gallery` -> Project gallery
- `/project-1` ... `/project-8` -> Individual project pages

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

Made Agastya
