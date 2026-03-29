# Architecture

**Analysis Date:** 2026-03-30

## Pattern Overview

**Overall:** Single-Page Application (SPA) with component-based rendering

**Key Characteristics:**
- React 19 for UI rendering with functional components and hooks
- Vite as build tool for development and production bundling
- Monolithic component structure with embedded state and styling
- Static data-driven rendering pattern
- Print-friendly document generation focus

## Layers

**Presentation Layer:**
- Purpose: Render the design career blueprint document interface
- Location: `src/components/BlueprintPage.jsx`
- Contains: React functional components (micro-components and section components)
- Depends on: React, Tailwind CSS, inline SVG assets
- Used by: App component at `src/App.jsx`

**Application Layer:**
- Purpose: Bootstrap React application and mount to DOM
- Location: `src/main.jsx`
- Contains: React root creation and StrictMode wrapper
- Depends on: React DOM, App component
- Used by: HTML entry point at `index.html`

**Styling Layer:**
- Purpose: Provide design tokens, typography, and utility classes
- Location: `src/index.css` (Tailwind directives), `tailwind.config.js` (theme configuration)
- Contains: Font imports, Tailwind layers (base, components, utilities), custom CSS utilities, media query rules
- Depends on: Tailwind CSS, PostCSS
- Used by: All components via class names

**Build & Configuration Layer:**
- Purpose: Configure development server, production builds, and code quality
- Location: `vite.config.js`, `eslint.config.js`, `postcss.config.js`
- Contains: Vite React plugin setup, ESLint rules, PostCSS processing
- Depends on: Vite, Vitest, ESLint, PostCSS
- Used by: Development and build processes

## Data Flow

**Page Render Flow:**

1. Browser loads `index.html`
2. `index.html` references `/src/main.jsx` as entry point
3. `main.jsx` imports `App.jsx` and renders it into `#root` DOM element
4. `App.jsx` imports and renders `BlueprintPage` component
5. `BlueprintPage` defines mock data object and renders 11 section components
6. Each section component uses Tailwind classes and inline SVG for styling
7. Print-friendly CSS rules apply when user clicks "Download PDF" button
8. Browser print dialog captures rendered document and exports as PDF

**State Management:**
- No centralized state management (Redux, Context, etc.)
- All data is hardcoded in `BlueprintPage.jsx` as a `data` constant
- Component tree is stateless and functional (no useState hooks)
- Render is deterministic based on data object structure

## Key Abstractions

**Section Component Pattern:**
- Purpose: Encapsulate each logical section of the blueprint document
- Examples:
  - `BlueprintHeader()` - Title and salary display
  - `SuperpowerSection()` - Core skill presentation
  - `StrengthsWeaknessesSection()` - Skills matrix
  - `CaseStudySection()` - Project portfolio
  - `LearningRoadmapSection()` - Skills to acquire
  - `DoubleDiamondSection()` - Design process visualization
  - `PortfolioSection()` - Checklist of portfolio items
  - `AidaSection()` - Marketing framework display
- Pattern: Each section is a pure function receiving no props, using data constant, returning JSX with Tailwind styling

**Micro Component Pattern:**
- Purpose: Reusable visual elements across sections
- Examples:
  - `SectionLabel()` - Monospace uppercase labels (mono-jet font family)
  - `Divider()` - Simple border dividers
  - `DotDivider()` - Decorative dotted dividers with center dot
- Pattern: Accept optional `className` prop for customization, return minimal JSX with Tailwind styles

**SVG Inline Pattern:**
- Purpose: Include scalable vector graphics without external files
- Examples: Arrow icons, checkmarks, dashes, decorative line patterns
- Pattern: Inline `<svg>` elements with hardcoded viewBox and path data

## Entry Points

**HTML Entry Point:**
- Location: `index.html`
- Triggers: Browser request to application URL
- Responsibilities: Define document head (meta tags, title), provide root DOM element (#root), reference JavaScript module

**React Entry Point:**
- Location: `src/main.jsx`
- Triggers: Module evaluation after index.html loads script tag
- Responsibilities: Create React root with StrictMode wrapper, render App component

**Application Component:**
- Location: `src/App.jsx`
- Triggers: React root render
- Responsibilities: Import CSS, render BlueprintPage component

**Page Component:**
- Location: `src/components/BlueprintPage.jsx`
- Triggers: App component render
- Responsibilities: Define page-level data, render all sections, manage print button functionality

## Error Handling

**Strategy:** No explicit error handling implemented

**Patterns:**
- No try-catch blocks
- No error boundaries
- No data validation or schema verification
- All data is static, eliminating runtime data errors
- Browser's default error handling applies to any runtime exceptions

## Cross-Cutting Concerns

**Logging:** Not implemented. No console statements or logging framework present.

**Validation:** Not implemented. No schema validation (Zod, etc.) or type checking (TypeScript not used).

**Authentication:** Not required. Application is a static document renderer with no backend integration.

**Print/Export:** Handled via CSS media queries at `src/index.css` lines 67-74. The `.no-print` class hides interactive elements when printing. Window.print() invoked from download button.

**Responsive Design:** Mobile-first approach using Tailwind breakpoints (`md:` prefix) throughout component classes. Sections stack vertically on mobile, grid layouts on medium+ screens.

---

*Architecture analysis: 2026-03-30*
