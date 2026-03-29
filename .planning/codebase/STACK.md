# Technology Stack

**Analysis Date:** 2026-03-30

## Languages

**Primary:**
- JavaScript (ES2020+) - React components and configuration files
- JSX - React component templates in `src/components/*.jsx`

## Runtime

**Environment:**
- Node.js (no specific version file detected)

**Package Manager:**
- npm - Lockfile present: `package-lock.json`

## Frameworks

**Core:**
- React 19.2.4 - UI framework for component-based rendering
- React DOM 19.2.4 - DOM rendering for React applications

**Build/Dev:**
- Vite 8.0.1 - Module bundler and dev server
- @vitejs/plugin-react 6.0.1 - React support for Vite with Oxc parser

**Styling:**
- Tailwind CSS 3.4.19 - Utility-first CSS framework
- PostCSS 8.5.8 - CSS transformation pipeline
- Autoprefixer 10.4.27 - Adds vendor prefixes to CSS

## Linting & Code Quality

**Linting:**
- ESLint 9.39.4 - JavaScript linter
- @eslint/js 9.39.4 - Core ESLint rules
- eslint-plugin-react-hooks 7.0.1 - React hooks rules
- eslint-plugin-react-refresh 0.5.2 - React fast refresh rules
- globals 17.4.0 - Global variable definitions

## Type Safety

**Development:**
- @types/react 19.2.14 - TypeScript types for React
- @types/react-dom 19.2.3 - TypeScript types for React DOM

## Configuration

**Build Configuration:**
- `vite.config.js` - Vite build configuration with React plugin
- `eslint.config.js` - ESLint flat config (v9+ format)
- `tailwind.config.js` - Tailwind CSS theme customization and content scanning
- `postcss.config.js` - PostCSS plugin configuration

**Styling Configuration:**
- Custom Tailwind theme in `tailwind.config.js` with:
  - Font families: Playfair Display (serif), Inter (sans), JetBrains Mono (mono)
  - Custom color palette: ivory, ink, and accent colors (red/blue)
  - Extended letter-spacing utilities

**Entry Point:**
- `index.html` - HTML entry point mounting React app to `<div id="root">`
- `src/main.jsx` - React root initialization

## Static Assets

**Fonts:**
- Google Fonts: Playfair Display, Inter, JetBrains Mono (loaded via CDN in `src/index.css`)

**Images:**
- SVG icons embedded inline in components
- Static assets in `public/` directory (favicon, etc.)
- PNG/SVG images in `src/assets/` (hero.png, react.svg, vite.svg)

## Platform Requirements

**Development:**
- Node.js with npm
- Modern browser with ES2020+ support
- Recommended: Node 16+

**Production:**
- Static hosting (builds to `dist/` directory)
- No backend runtime required - fully client-side React application

## Build Output

**Target:**
- `dist/` directory contains production build
- `index.html` - Main entry point
- JavaScript bundles with code splitting via Vite
- CSS bundles with Tailwind optimizations

## Development Scripts

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
npm run lint     # Run ESLint validation
```

---

*Stack analysis: 2026-03-30*
