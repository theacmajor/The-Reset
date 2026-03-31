// ─── Design Career Archetypes ────────────────────────────────────────────────
// Used by the interpreter to classify designers and guide recommendations.

export const ARCHETYPES = [
  {
    id: 'visual-product',
    name: 'Visual-first Product Designer',
    traits: ['Strong aesthetic sense', 'UI polish', 'Pixel-perfect execution'],
    strengths: ['Visual hierarchy', 'Aesthetics', 'Color & Composition', 'Typography'],
    commonWeaknesses: ['Product thinking', 'Research depth', 'Business thinking', 'Stakeholder management'],
    portfolioGaps: ['Lacks problem-framing in case studies', 'Shows polish but not process'],
    learningPriorities: ['Product thinking', 'User research', 'Business metrics', 'Case study storytelling'],
  },
  {
    id: 'craft-ui-to-product',
    name: 'Craft-led UI Designer moving into Product',
    traits: ['Strong in UI systems', 'Detail-oriented', 'Transitioning from execution to strategy'],
    strengths: ['UI Design', 'Design Systems', 'Prototyping', 'Attention to Detail'],
    commonWeaknesses: ['Product strategy', 'User research', 'Presenting work', 'Decision making'],
    portfolioGaps: ['Too many UI showcases, not enough end-to-end product stories'],
    learningPriorities: ['Product thinking', 'Research synthesis', 'Stakeholder communication', 'Strategic framing'],
  },
  {
    id: 'motion-visual',
    name: 'Motion-first Visual Designer',
    traits: ['Animation expertise', 'Strong visual storytelling', 'Creative execution'],
    strengths: ['Animation & Motion', 'Micro-interactions', 'Visual Design', 'Storytelling'],
    commonWeaknesses: ['Structured UX process', 'Information architecture', 'Business thinking', 'Research depth'],
    portfolioGaps: ['Work looks impressive but lacks strategic context', 'Missing "why" behind design decisions'],
    learningPriorities: ['UX fundamentals', 'Problem definition', 'Case study structure', 'Product metrics'],
  },
  {
    id: 'brand-to-digital',
    name: 'Brand Designer transitioning into Digital Product',
    traits: ['Strong brand thinking', 'Visual identity expertise', 'Narrative-driven'],
    strengths: ['Branding', 'Typography', 'Color & Composition', 'Storytelling'],
    commonWeaknesses: ['Interaction patterns', 'Prototyping', 'Technical constraints', 'Product metrics'],
    portfolioGaps: ['Mostly static/print work', 'Needs digital product case studies'],
    learningPriorities: ['Interaction design', 'Prototyping tools', 'Responsive design', 'Product thinking'],
  },
  {
    id: 'ux-generalist',
    name: 'UX Generalist lacking positioning',
    traits: ['Broad skills', 'No clear specialization', 'Jack-of-all-trades risk'],
    strengths: ['UX Design', 'Wireframing', 'User Research', 'Prototyping'],
    commonWeaknesses: ['Positioning', 'Consistency', 'Portfolio quality', 'Storytelling'],
    portfolioGaps: ['Portfolio feels scattered', 'No clear narrative or specialization thread'],
    learningPriorities: ['Pick a superpower', 'Deepen one vertical', 'Case study craft', 'Personal brand clarity'],
  },
  {
    id: 'product-no-business',
    name: 'Product Designer lacking business framing',
    traits: ['Good design process', 'Solid UX thinking', 'Misses the business layer'],
    strengths: ['Product Thinking', 'Prototyping', 'User Research', 'Design Systems'],
    commonWeaknesses: ['Business thinking', 'Metrics understanding', 'Stakeholder management', 'Strategy'],
    portfolioGaps: ['Case studies show process but not impact', 'Missing metrics/outcomes'],
    learningPriorities: ['Business metrics', 'Outcome framing', 'Stakeholder alignment', 'Revenue thinking'],
  },
  {
    id: 'research-heavy',
    name: 'Research-curious but execution-heavy Designer',
    traits: ['Wants to do more research', 'Currently stuck in execution', 'Process-aware'],
    strengths: ['Attention to Detail', 'Rapid Prototyping', 'Visual Design', 'Layout & Grids'],
    commonWeaknesses: ['Research depth', 'Presenting work', 'Strategy', 'Decision making'],
    portfolioGaps: ['No research artifacts shown', 'Case studies jump to solutions too fast'],
    learningPriorities: ['User interviews', 'Research synthesis', 'Insight framing', 'Research presentation'],
  },
  {
    id: 'multi-creative',
    name: 'Multi-disciplinary Creative moving toward structured product roles',
    traits: ['Diverse creative background', 'Exploring product design', 'Needs structure'],
    strengths: ['Aesthetics', 'Storytelling', 'Visual Design', 'Animation & Motion'],
    commonWeaknesses: ['Consistency', 'Systems thinking', 'Portfolio quality', 'Case study writing'],
    portfolioGaps: ['Too many different types of work', 'No clear direction or thread'],
    learningPriorities: ['Design process structure', 'Case study framework', 'Portfolio curation', 'Positioning'],
  },
]

// Build a quick lookup
export const ARCHETYPE_MAP = Object.fromEntries(ARCHETYPES.map(a => [a.id, a]))

// Export as a prompt-friendly string
export function archetypesForPrompt() {
  return ARCHETYPES.map(a => `
**${a.name}** (id: ${a.id})
- Traits: ${a.traits.join(', ')}
- Strengths: ${a.strengths.join(', ')}
- Common weaknesses: ${a.commonWeaknesses.join(', ')}
- Portfolio gaps: ${a.portfolioGaps.join('; ')}
- Learning priorities: ${a.learningPriorities.join(', ')}
  `).join('\n')
}
