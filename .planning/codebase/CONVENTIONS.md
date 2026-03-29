# Coding Conventions

**Analysis Date:** 2026-03-30

## Naming Patterns

**Files:**
- Component files: PascalCase (e.g., `BlueprintPage.jsx`)
- Regular utility/config files: kebab-case or camelCase (e.g., `vite.config.js`, `eslint.config.js`)
- CSS files: lowercase with dash separation (e.g., `index.css`)

**Functions:**
- React component functions: PascalCase (e.g., `BlueprintPage`, `SectionLabel`, `StrengthsWeaknessesSection`)
- Inline utility functions: PascalCase (e.g., `DotDivider`, `Divider`, `SectionLabel`)
- All functions start with uppercase letter as they are React components

**Variables:**
- Constants at module level: camelCase or UPPER_CASE (e.g., `data` object in `src/components/BlueprintPage.jsx`)
- Object property names: camelCase (e.g., `currentSalary`, `targetSalary`, `superpowerTagline`)
- Array/collection variables: camelCase plural or singular (e.g., `strengths`, `weaknesses`, `caseStudies`)

**Types:**
- No TypeScript types found in codebase (JSX with implicit types)
- Custom color and spacing values stored in Tailwind config (`tailwind.config.js`)

## Code Style

**Formatting:**
- 2-space indentation (inferred from codebase)
- Double quotes for strings (observed in JSX attributes)
- Semicolons at end of statements
- Trailing commas in multiline objects/arrays

**Linting:**
- ESLint 9.39.4 configured in `eslint.config.js`
- Recommended rules from `@eslint/js`
- React Hooks plugin enabled: `eslint-plugin-react-hooks`
- React Refresh plugin enabled: `eslint-plugin-react-refresh`
- Unused vars rule configured: `varsIgnorePattern: '^[A-Z_]'` (ignores uppercase variables/constants)

**Tailwind CSS:**
- Utility-first approach with inline Tailwind classes
- Custom font families: `font-serif` (Playfair Display), `font-sans` (Inter), `font-mono-jet` (JetBrains Mono)
- Custom color palette defined in theme extension
- Responsive design with `md:` breakpoints for mobile-first approach

## Import Organization

**Order:**
1. React and React DOM imports (e.g., `import React from 'react'`)
2. Local component imports (e.g., `import BlueprintPage from './components/BlueprintPage'`)
3. Stylesheet imports (e.g., `import './index.css'`)

**Path Aliases:**
- None detected; relative paths used throughout
- Standard ES6 module imports/exports

## Error Handling

**Patterns:**
- No explicit error handling detected in current codebase
- No try/catch blocks or error boundaries observed
- No console logging or error logging implementations

**Validation:**
- No form validation or input validation patterns found
- Data structure is static/mock data defined at module level

## Logging

**Framework:** Not implemented

**Patterns:**
- No logging framework in use
- No console.log statements in source code
- Developers should implement logging if needed in future features

## Comments

**When to Comment:**
- ASCII section separators used to organize large component files
- Example: `// ─── Section: Header ─────────────────────────────────────────────────────────────`
- Section comments demarcate logical groupings within the BlueprintPage component

**JSDoc/TSDoc:**
- No JSDoc or TypeScript documentation comments present
- Not enforced by linting configuration

## Function Design

**Size:**
- Component functions range from single-line returns (e.g., `Divider`) to ~50 line sections
- Small, focused components preferred (e.g., `SectionLabel`, `DotDivider`)
- Larger components (~100+ lines) organize internal functions for each section

**Parameters:**
- React components accept `props` as single parameter
- Destructuring used for className defaults (e.g., `className = ''`)
- Default parameters used for optional CSS classes: `SectionLabel({ children, className = '' })`

**Return Values:**
- All functions return JSX elements
- Conditional rendering used inline with ternary operators
- Map functions used for list rendering with proper `key` prop on `map()` iterator

**Example Function Pattern:**
```javascript
function SectionLabel({ children, className = '' }) {
  return (
    <span className={`font-mono-jet text-[0.6rem] tracking-[0.22em] uppercase text-[#8C8880] ${className}`}>
      {children}
    </span>
  )
}
```

## Module Design

**Exports:**
- Default exports for main components (e.g., `export default App`, `export default BlueprintPage`)
- Named exports not used

**Barrel Files:**
- Single component file per module (`BlueprintPage.jsx`)
- No barrel export pattern (index.js re-exports) detected

**Component Composition:**
- Large components decomposed into smaller utility components within the same file
- All section components grouped in single file with ASCII section dividers
- Main component composes all sections in JSX structure

## Styling Approach

**Tailwind Utility Classes:**
- Inline Tailwind classes used extensively
- Long class strings with responsive variants: `className="px-8 pt-8 pb-6 md:px-10 md:pt-10"`
- Arbitrary values in brackets: `text-[0.6rem]`, `border-[#8C8880]`, `rotate-[-1deg]`

**Custom CSS:**
- Minimal custom CSS in `src/index.css`
- Layer utilities for reusable component classes: `.section-label`, `.paper-texture`
- Media queries for print styling: `@media print`

**Inline Styles:**
- Used for font-family fallbacks and occasional dynamic styling
- Example: `style={{ fontFamily: "'Playfair Display', Georgia, serif" }}`
- Rotation transform: `style={{ transform: 'rotate(-0.5deg)' }}`

## Data Handling

**Mock Data:**
- All data defined as constant object at module level
- Structured as nested objects and arrays
- No API calls or external data sources in current implementation

**State Management:**
- No useState or state management detected
- Fully stateless, pure component rendering
- All rendering based on static data object

---

*Convention analysis: 2026-03-30*
