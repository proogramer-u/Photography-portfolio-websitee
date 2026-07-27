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

Cokorda Bagus Laksmana Iswara
