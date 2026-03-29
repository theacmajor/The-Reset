# Testing Patterns

**Analysis Date:** 2026-03-30

## Test Framework

**Runner:**
- Not configured
- No test framework installed (Jest, Vitest, or similar not in dependencies)

**Assertion Library:**
- Not configured

**Run Commands:**
- No test commands defined in `package.json`
- Current scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`

## Test File Organization

**Location:**
- No test files in source directory
- No `__tests__` or test directories found

**Naming:**
- No test file naming convention established
- Standard patterns would be `*.test.jsx`, `*.spec.jsx` if implemented

**Structure:**
- No test structure established yet

## Test Types

**Unit Tests:**
- Not implemented
- Would test individual components like `SectionLabel`, `Divider`, `DotDivider`
- Components are pure and deterministic (no state or side effects), making them ideal for unit testing

**Integration Tests:**
- Not implemented
- Could test component composition in `BlueprintPage.jsx`
- Would verify data flows correctly through section components

**E2E Tests:**
- Not configured
- No E2E framework installed

## What to Test (Recommendations)

**High Priority Components:**

1. **`SectionLabel` component** (`src/components/BlueprintPage.jsx`)
   - Should accept children and className props
   - Should render with correct Tailwind classes
   - Should apply custom className when provided

2. **`Divider` component** (`src/components/BlueprintPage.jsx`)
   - Should render border element with correct classes
   - Should accept optional className prop

3. **`DotDivider` component** (`src/components/BlueprintPage.jsx`)
   - Should render three-element structure (line, dot, line)
   - Should apply correct spacing and styling

4. **`BlueprintPage` main component** (`src/components/BlueprintPage.jsx`)
   - Should render all major sections (Header, Superpower, Strengths, etc.)
   - Should correctly map over data arrays (strengths, weaknesses, caseStudies, etc.)
   - Should apply correct styling to primary vs secondary case studies

5. **Section components:**
   - `BlueprintHeader`: Should display user data (name, salary, date)
   - `StrengthsWeaknessesSection`: Should correctly map and display strengths/weaknesses
   - `CaseStudySection`: Should highlight primary case studies differently
   - `LearningRoadmapSection`: Should grid items correctly

## Mocking Strategy (If Implemented)

**What to Mock:**
- No external API calls to mock
- No database queries
- Mock data is already defined in component file

**What NOT to Mock:**
- React hooks (no hooks currently used)
- Component rendering
- CSS class application

## Test Data

**Current Mock Data:**
Located in `src/components/BlueprintPage.jsx` at lines 4-56:

```javascript
const data = {
  name: 'Kishore',
  currentSalary: '5.4 LPA',
  targetSalary: '11 LPA',
  date: 'March 2025',
  superpower: 'Motion Design',
  superpowerTagline: '...',
  strengths: ['Email Design', 'Graphic Design', 'Poster Design'],
  weaknesses: [
    { label: 'User Research', action: '...' },
    // ...
  ],
  caseStudies: [
    { title: 'TAP Invest', tag: 'Primary', type: 'UX / Product', primary: true },
    // ...
  ],
  // ... more properties
}
```

**Recommendations for Test Fixtures:**
- Extract mock data to separate file: `src/fixtures/blueprintData.js`
- Create factory functions for generating test data variations
- Create separate fixtures for testing empty states, edge cases

## Setting Up Testing (Next Steps)

**Recommended Setup:**

1. **Install testing dependencies:**
   ```bash
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
   ```

2. **Create test configuration** (`vitest.config.js`):
   ```javascript
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: ['./src/test/setup.js'],
     },
   })
   ```

3. **Add npm scripts** to `package.json`:
   ```json
   "test": "vitest",
   "test:ui": "vitest --ui",
   "test:coverage": "vitest --coverage"
   ```

4. **Create test directory structure:**
   ```
   src/
   ├── components/
   │   ├── BlueprintPage.jsx
   │   └── __tests__/
   │       └── BlueprintPage.test.jsx
   ├── fixtures/
   │   └── blueprintData.js
   └── test/
       └── setup.js
   ```

## Coverage Goals

**Requirements:** Not enforced

**Recommended targets:**
- Component functions: 80%+ coverage
- Conditional rendering: 100% (all branches tested)
- Data mapping: 100% (test with various data shapes)

## Common Testing Patterns (For Reference)

**Testing component rendering:**
```javascript
import { render, screen } from '@testing-library/react'
import SectionLabel from '../components/BlueprintPage'

describe('SectionLabel', () => {
  it('should render with children', () => {
    render(<SectionLabel>Test Label</SectionLabel>)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })
})
```

**Testing data-driven rendering:**
```javascript
describe('StrengthsWeaknessesSection', () => {
  it('should render all strengths from data', () => {
    const { container } = render(<StrengthsWeaknessesSection />)
    // Verify each strength appears in the DOM
    const strengthItems = container.querySelectorAll('[role="listitem"]')
    expect(strengthItems).toHaveLength(data.strengths.length)
  })
})
```

**Testing conditional styling:**
```javascript
describe('CaseStudySection', () => {
  it('should highlight primary case study', () => {
    const { container } = render(<CaseStudySection />)
    const primaryItem = container.querySelector('[class*="bg-\\[#FDF8F7\\]"]')
    expect(primaryItem).toBeInTheDocument()
  })
})
```

---

*Testing analysis: 2026-03-30*
