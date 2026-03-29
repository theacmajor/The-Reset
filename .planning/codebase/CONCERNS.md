# Codebase Concerns

**Analysis Date:** 2026-03-30

## Tech Debt

**Monolithic Component Structure:**
- Issue: All UI logic is contained in a single massive component file (`BlueprintPage.jsx` - 669 lines). Micro-components are defined within the same file, making reuse difficult and testing virtually impossible.
- Files: `src/components/BlueprintPage.jsx`
- Impact: Component reuse is limited, unit testing is blocked, and future modifications become risky. Maintenance complexity increases significantly with any new feature additions.
- Fix approach: Extract each micro-component (`SectionLabel`, `Divider`, `DotDivider`, and section components) into separate files in `src/components/`. Use barrel exports if organizing into subdirectories.

**Hardcoded Mock Data at Component Level:**
- Issue: All design blueprint data is hardcoded directly in the component (`data` object at lines 4-56). This makes the component inflexible and prevents dynamic rendering of different blueprints.
- Files: `src/components/BlueprintPage.jsx` (lines 4-56)
- Impact: Cannot render multiple blueprint instances with different data. Any content change requires modifying the component code. No way to load data from external sources or API endpoints.
- Fix approach: Move `data` object to a separate file (e.g., `src/data/sampleBlueprint.js`). Refactor component to accept data as props. This enables the component to be generic and reusable.

**Inline Styling with Tailwind Hardcoded Colors:**
- Issue: Hundreds of inline Tailwind classes with specific color codes (e.g., `text-[#C0392B]`, `bg-[#F0EDE8]`) scattered throughout the component. Makes theming impossible and color maintenance error-prone.
- Files: `src/components/BlueprintPage.jsx` (throughout)
- Impact: Cannot implement theme switching. Color consistency is fragile. Updating color scheme requires changing code in 100+ places. High risk of typos when copy-pasting colors.
- Fix approach: Extract all color values to Tailwind theme configuration or a dedicated color constants file. Use semantic class names (e.g., `text-accent-red`) instead of explicit color codes.

**No Error Handling or Loading States:**
- Issue: No error boundaries, try-catch blocks, or user feedback mechanisms. Component assumes all data and rendering will succeed without issues.
- Files: `src/components/BlueprintPage.jsx`, `src/App.jsx`
- Impact: Silent failures if data structure changes unexpectedly. No graceful degradation. Users see blank screens or broken layouts with no explanation.
- Fix approach: Implement error boundaries in `src/App.jsx`. Add prop validation with PropTypes or TypeScript. Add fallback UI states.

**No TypeScript or Type Safety:**
- Issue: Project uses JavaScript with JSX but no type checking. No PropTypes validation on any components. `eslint.config.js` shows basic rules only.
- Files: `src/components/BlueprintPage.jsx`, `src/App.jsx`, `src/main.jsx`
- Impact: Prop type mismatches go undetected. Refactoring is risky. IDE autocomplete is limited. No compile-time validation of component contracts.
- Fix approach: Migrate to TypeScript incrementally or add PropTypes validation at minimum. Start with new components.

## Missing Critical Features

**No Print/Export Functionality Beyond Basic Print:**
- Issue: "Download PDF" button (line 585) and "Download Image" button (line 595) are present but the download button for images has no onClick handler - it's non-functional.
- Files: `src/components/BlueprintPage.jsx` (lines 595-602)
- Impact: Users cannot export blueprints as images. Only print/PDF functionality works, which limits sharing and portability.
- Fix approach: Implement image export using html2canvas or similar library. Wire up the onClick handler with proper error handling.

**No Responsive Print Layout Testing:**
- Issue: Print styles exist (`@media print` in `src/index.css`) but no testing mechanism for print preview before actual printing.
- Files: `src/index.css` (lines 67-74), `src/components/BlueprintPage.jsx` (line 624)
- Impact: Users may print broken layouts. Mobile print rendering is untested. Color printing on different devices is unpredictable.
- Fix approach: Add a print preview route/modal. Test on multiple browsers and devices before declaring print-ready.

## Test Coverage Gaps

**No Tests Exist:**
- What's not tested: All component rendering, data structure validation, responsive behavior, print layout, accessibility.
- Files: All files under `src/`
- Risk: Breaking changes go undetected. Design regressions appear in production. Refactoring is unsafe. Browser compatibility issues are discovered by users.
- Priority: High

**No Accessibility Testing:**
- Issue: No ARIA labels, alt text on SVGs, semantic HTML structure validation, or keyboard navigation testing.
- Files: `src/components/BlueprintPage.jsx` (throughout)
- Risk: Component fails WCAG compliance. Screen reader users cannot navigate the blueprint. Keyboard-only users cannot use print/download buttons.
- Priority: High (if public-facing)

## Fragile Areas

**SVG Rendering Fragility:**
- Files: `src/components/BlueprintPage.jsx` (lines 125-127, 185-192, 433-446, 464-466, 589-591, 598-600)
- Why fragile: SVG elements with hardcoded dimensions and viewBox values scattered throughout. No centralized SVG component library. Inline stroke and fill attributes make styling inconsistent.
- Safe modification: Centralize SVG icons into separate components with configurable props (size, color, strokeWidth). Use a dedicated icon system.
- Test coverage: No visual regression tests for SVG rendering on different screen sizes.

**Mobile Responsive Assumptions:**
- Files: `src/components/BlueprintPage.jsx` (responsive classes throughout)
- Why fragile: Responsive breakpoints rely entirely on Tailwind's `md:` prefix (768px). No tablet-specific breakpoints. Assumed screen orientations may not match real devices.
- Safe modification: Test on actual mobile devices and tablets. Consider adding `lg:` and `xl:` breakpoints for larger screens.
- Test coverage: No responsive testing across device sizes.

**Font Loading Dependency:**
- Files: `src/index.css` (line 1), component files
- Why fragile: Three Google Fonts are imported (`Playfair Display`, `Inter`, `JetBrains Mono`). Component layout assumes these fonts are always loaded. No fallback rendering.
- Safe modification: Add font-display: swap to CSS import. Consider system font fallbacks. Test behavior if fonts fail to load (network issue).
- Test coverage: No font loading failure scenario testing.

## Performance Bottlenecks

**Large Single Component Bundle:**
- Problem: All UI is in one 669-line component file. Minified bundle size is larger than necessary for such simple display content.
- Files: `src/components/BlueprintPage.jsx`
- Cause: Component not split into smaller units. No code splitting opportunity. Vite build cannot tree-shake unused component pieces.
- Improvement path: Split component into separate files. Use dynamic imports for non-critical sections. Lazy-load images in assets.

**Inline SVG Rendering:**
- Problem: All SVGs are defined inline in JSX rather than as separate SVG files or components. This increases component size and re-renders.
- Files: `src/components/BlueprintPage.jsx` (lines 125-127, 185-192, 433-446, 464-466, 589-591, 598-600)
- Cause: SVGs are hand-crafted shapes without optimization or caching.
- Improvement path: Extract SVGs to separate `.svg` files and import as components. Use SVG sprite sheets for repeated icons.

**No Memoization of Micro-Components:**
- Problem: Components like `SectionLabel`, `Divider`, `DotDivider` are not memoized. Parent re-renders cause unnecessary child renders.
- Files: `src/components/BlueprintPage.jsx` (lines 60-80)
- Cause: Lightweight components are defined but not wrapped with `React.memo()`.
- Improvement path: Wrap static/pure components with `React.memo()`. Consider extracting to separate files where memoization is more natural.

## Security Considerations

**Client-Side Data Exposure:**
- Risk: All user data (salary, case studies, personal information) is hardcoded in the component and visible in browser DevTools and network traffic.
- Files: `src/components/BlueprintPage.jsx` (lines 4-56)
- Current mitigation: None. This is acceptable for a public portfolio but risky if it contains sensitive information.
- Recommendations: If deploying to public, ensure no personal sensitive data is exposed. If this is a private tool, add authentication and data source from secure backend.

**No Input Sanitization:**
- Risk: Component directly renders data objects as text/HTML. If data comes from user input or APIs, XSS attacks are possible.
- Files: `src/components/BlueprintPage.jsx`
- Current mitigation: Data is currently hardcoded, so no injection risk now.
- Recommendations: If making data dynamic, validate and sanitize all inputs. Use React's built-in JSX escaping and avoid dangerouslySetInnerHTML.

**No Content Security Policy (CSP):**
- Risk: External font loading from Google Fonts is unrestricted. No protection against injected scripts.
- Files: `src/index.css` (line 1)
- Current mitigation: Relies on Google's infrastructure security.
- Recommendations: Consider adding CSP headers in production. Use font-display strategies to prevent invisible text flash (FOIT/FOUT).

## Scaling Limits

**Single-Blueprint Limitation:**
- Current capacity: Component hardcoded for one person's blueprint (Kishore's design career blueprint).
- Limit: Cannot handle multiple users or blueprint templates. No data model for storing/retrieving blueprints.
- Scaling path: Implement a data layer (API/database). Create a data structure schema for blueprints. Build a form/editor to create blueprints dynamically.

**No Data Persistence:**
- Current state: All changes are lost on page refresh. No local storage or backend sync.
- Limit: Cannot save user edits. No version history or collaboration.
- Scaling path: Add localStorage for client-side persistence. Implement backend API for sync and sharing.

## Dependencies at Risk

**React 19.2.4 - Bleeding Edge Version:**
- Risk: React 19 is very new (released late 2024). Production codebases typically use more stable LTS versions (18.x).
- Impact: Bugs in React 19 may not be discovered yet. Updates may contain breaking changes. Third-party libraries may not be fully compatible.
- Migration plan: Consider downgrading to React 18 LTS for stability, or keep detailed compatibility notes if using React 19.

**Vite 8.0.1 - Early Version:**
- Risk: Vite 8 is not the stable LTS version. Latest stable is Vite 5.x.
- Impact: May miss critical security updates. Build optimization features may be outdated.
- Migration plan: Evaluate upgrading to Vite 5.x for better performance and security.

**No Testing Dependencies:**
- Risk: No testing framework installed (Jest, Vitest, React Testing Library). Cannot write or run tests without installing new packages.
- Impact: Technical debt grows without test coverage. Refactoring is unsafe.
- Migration plan: Add `vitest` and `@testing-library/react` to devDependencies. Start with critical component tests.

## Accessibility & Compliance Issues

**Missing Alt Text on SVGs:**
- Problem: SVG icons throughout the component lack proper accessibility attributes (title, aria-label, role).
- Files: `src/components/BlueprintPage.jsx` (all SVG definitions)
- Impact: Screen reader users cannot understand icon meanings. Component fails WCAG 2.1 AA standards.
- Fix: Add `aria-label` and `role="img"` to all SVG elements. Use `<title>` elements for icon descriptions.

**No Keyboard Navigation:**
- Problem: Buttons can be reached via Tab, but no custom focus management or keyboard shortcuts for power users.
- Files: `src/components/BlueprintPage.jsx` (lines 585-602)
- Impact: Print and download buttons are accessible, but no keyboard shortcuts to trigger them.
- Fix: Consider adding `aria-label` to buttons, testing Tab focus order, adding keyboard shortcuts documentation.

**Color Contrast Issues Not Validated:**
- Problem: Multiple color combinations (e.g., `text-[#B0ACA5]` on `bg-[#EDEBE7]`) may not meet WCAG AA contrast ratios.
- Files: `src/components/BlueprintPage.jsx`, `src/index.css`
- Impact: Users with color blindness or low vision cannot read certain sections.
- Fix: Run automated accessibility audit (Axe, Lighthouse). Adjust color palette to meet WCAG AA (4.5:1 for text).

---

*Concerns audit: 2026-03-30*
