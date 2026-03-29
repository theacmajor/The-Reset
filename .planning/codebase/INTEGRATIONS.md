# External Integrations

**Analysis Date:** 2026-03-30

## APIs & External Services

**Not Detected**
- No external API integrations are implemented in this codebase
- Application is purely static/client-side with no backend calls
- No fetch, axios, or HTTP client libraries are present

## Data Storage

**Not Applicable**
- This is a static client-side application
- No database connections or ORM implementations
- No data persistence layer

**File Storage:**
- Not applicable - application renders static content only

**Caching:**
- Browser caching only (no explicit caching service)

## Authentication & Identity

**Not Implemented**
- No authentication providers (no auth0, firebase, supabase, etc.)
- Application contains no login/logout functionality
- Content is publicly accessible without authentication

## Monitoring & Observability

**Error Tracking:**
- Not detected - no error tracking service (Sentry, Bugsnag, etc.)

**Logs:**
- Not implemented - application is purely client-side
- No centralized logging service configured

**Analytics:**
- Not detected - no analytics libraries (Google Analytics, Mixpanel, etc.)

## CI/CD & Deployment

**Hosting:**
- Not specified - application is a static site generator
- Can be deployed to any static hosting service (Vercel, Netlify, GitHub Pages, etc.)

**CI Pipeline:**
- Not configured - no CI/CD workflows detected

## Environment Configuration

**Environment Variables:**
- None required - application is fully self-contained
- No `.env` files present

**Secrets:**
- Not applicable - no external service credentials needed

## Webhooks & Callbacks

**Incoming:**
- Not applicable

**Outgoing:**
- Not applicable

## Third-Party Libraries

**Google Fonts (CDN):**
- URL: `https://fonts.googleapis.com/css2`
- Fonts: Playfair Display, Inter, JetBrains Mono
- Usage: Imported in `src/index.css`
- Purpose: Provides typography for the blueprint document

## Print & Export

**Native Browser Features:**
- Uses `window.print()` for PDF download functionality
- No external export service required
- Print-optimized CSS in `src/index.css` via `@media print` rules

---

*Integration audit: 2026-03-30*
