// ─── Deterministic Rules Engine ──────────────────────────────────────────────
// Pre-processes raw answers into derived signals BEFORE calling the AI.
// These are hard rules, not AI guesses.

const CRAFT_SKILLS = [
  'Aesthetics', 'Typography', 'Color & Composition', 'Layout & Grids',
  'Micro-interactions', 'Animation & Motion', 'Illustration',
  'Visual Hierarchy', 'Attention to Detail', 'UI Design', 'Visual Design',
  'Branding', 'Motion Design',
]

const THINKING_SKILLS = [
  'Simplifying Complexity', 'Rapid Prototyping', 'Product Thinking',
  'User Research', 'Design Systems', 'Information Architecture',
  'Systems thinking', 'Strategy', 'Decision making', 'Business thinking',
]

const REAL_WORK_TYPES = [
  'Mobile App', 'Web App', 'SaaS Dashboard', 'Client Work',
  'Freelance Work', 'Redesign Project',
]

const CONCEPT_WORK_TYPES = [
  'Personal Project', 'Concept Project', 'Experimental Project',
]

// Parse salary string to approximate annual LPA number
function parseSalaryToLPA(salary) {
  if (!salary) return 0
  const s = salary.toLowerCase().replace(/,/g, '')

  // CR ranges
  if (s.includes('5+ cr'))  return 500
  if (s.includes('2-5 cr') || s.includes('2–5 cr'))  return 350
  if (s.includes('1-2 cr') || s.includes('1–2 cr'))  return 150
  if (s.includes('1 cr'))   return 100

  // LPA ranges — take midpoint
  const lpaMatch = s.match(/(\d+)[–-](\d+)\s*lpa/i)
  if (lpaMatch) return (parseInt(lpaMatch[1]) + parseInt(lpaMatch[2])) / 2

  if (s.includes('40+ lpa')) return 50
  if (s.includes('60+ lpa')) return 70
  if (s.includes('less than 3')) return 2

  // Fallback
  if (s.includes('not earning')) return 0
  if (s.includes('freelance')) return 6 // rough estimate

  return 0
}

export function deriveSignals(answers) {
  const currentLPA = parseSalaryToLPA(answers.currentSalary)
  const targetLPA  = parseSalaryToLPA(answers.targetSalary)

  const incomeGapMultiple = currentLPA > 0
    ? Math.round((targetLPA / currentLPA) * 10) / 10
    : targetLPA > 0 ? 10 : 0

  const urgency = incomeGapMultiple >= 4 ? 'extreme'
    : incomeGapMultiple >= 2.5 ? 'high'
    : incomeGapMultiple >= 1.5 ? 'medium'
    : 'low'

  const strengths = answers.strengths || []
  const craftSkills   = strengths.filter(s => CRAFT_SKILLS.includes(s))
  const thinkingSkills = strengths.filter(s => THINKING_SKILLS.includes(s))

  const tendency = craftSkills.length > thinkingSkills.length + 1 ? 'craft-led'
    : thinkingSkills.length > craftSkills.length + 1 ? 'thinking-led'
    : 'balanced'

  const workSignals = answers.workSignal || []
  const realWorkCount   = workSignals.filter(w => REAL_WORK_TYPES.includes(w)).length
  const conceptWorkCount = workSignals.filter(w => CONCEPT_WORK_TYPES.includes(w)).length
  const hasRealWork = realWorkCount >= 1

  const interests = answers.interests || []
  const positioningRisk = interests.length >= 5 || (strengths.length >= 6)

  const proofGap = !hasRealWork && conceptWorkCount >= 1

  return {
    incomeGapMultiple,
    urgency,
    tendency,
    hasRealWork,
    positioningRisk,
    proofGap,
    craftSkills,
    thinkingSkills,
  }
}
