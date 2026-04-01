import OpenAI from 'openai'
import { z } from 'zod'
import { db, admin } from './lib/firestore.js'

// ─── OpenAI client ──────────────────────────────────────────────────────────
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o'

// ─── Schemas ────────────────────────────────────────────────────────────────
const QuestionnaireSchema = z.object({
  name:          z.string().min(1),
  currentSalary: z.string(),
  targetSalary:  z.string(),
  journeyState:  z.string(),
  targetRole:    z.string(),
  strengths:     z.array(z.string()),
  weaknesses:    z.array(z.string()),
  interests:     z.array(z.string()),
  workSignal:    z.array(z.string()),
  realityCheck:  z.object({ choice: z.enum(['yes', 'no']) }).optional(),
})

// ─── Archetypes ─────────────────────────────────────────────────────────────
const ARCHETYPES = [
  { id: 'visual-product', name: 'Visual-first Product Designer', traits: ['Strong aesthetic sense', 'UI polish', 'Pixel-perfect execution'], strengths: ['Visual hierarchy', 'Aesthetics', 'Color & Composition', 'Typography'], commonWeaknesses: ['Product thinking', 'Research depth', 'Business thinking', 'Stakeholder management'], portfolioGaps: ['Lacks problem-framing in case studies', 'Shows polish but not process'], learningPriorities: ['Product thinking', 'User research', 'Business metrics', 'Case study storytelling'] },
  { id: 'craft-ui-to-product', name: 'Craft-led UI Designer moving into Product', traits: ['Strong in UI systems', 'Detail-oriented', 'Transitioning from execution to strategy'], strengths: ['UI Design', 'Design Systems', 'Prototyping', 'Attention to Detail'], commonWeaknesses: ['Product strategy', 'User research', 'Presenting work', 'Decision making'], portfolioGaps: ['Too many UI showcases, not enough end-to-end product stories'], learningPriorities: ['Product thinking', 'Research synthesis', 'Stakeholder communication', 'Strategic framing'] },
  { id: 'motion-visual', name: 'Motion-first Visual Designer', traits: ['Animation expertise', 'Strong visual storytelling', 'Creative execution'], strengths: ['Animation & Motion', 'Micro-interactions', 'Visual Design', 'Storytelling'], commonWeaknesses: ['Structured UX process', 'Information architecture', 'Business thinking', 'Research depth'], portfolioGaps: ['Work looks impressive but lacks strategic context', 'Missing "why" behind design decisions'], learningPriorities: ['UX fundamentals', 'Problem definition', 'Case study structure', 'Product metrics'] },
  { id: 'brand-to-digital', name: 'Brand Designer transitioning into Digital Product', traits: ['Strong brand thinking', 'Visual identity expertise', 'Narrative-driven'], strengths: ['Branding', 'Typography', 'Color & Composition', 'Storytelling'], commonWeaknesses: ['Interaction patterns', 'Prototyping', 'Technical constraints', 'Product metrics'], portfolioGaps: ['Mostly static/print work', 'Needs digital product case studies'], learningPriorities: ['Interaction design', 'Prototyping tools', 'Responsive design', 'Product thinking'] },
  { id: 'ux-generalist', name: 'UX Generalist lacking positioning', traits: ['Broad skills', 'No clear specialization', 'Jack-of-all-trades risk'], strengths: ['UX Design', 'Wireframing', 'User Research', 'Prototyping'], commonWeaknesses: ['Positioning', 'Consistency', 'Portfolio quality', 'Storytelling'], portfolioGaps: ['Portfolio feels scattered', 'No clear narrative or specialization thread'], learningPriorities: ['Pick a superpower', 'Deepen one vertical', 'Case study craft', 'Personal brand clarity'] },
  { id: 'product-no-business', name: 'Product Designer lacking business framing', traits: ['Good design process', 'Solid UX thinking', 'Misses the business layer'], strengths: ['Product Thinking', 'Prototyping', 'User Research', 'Design Systems'], commonWeaknesses: ['Business thinking', 'Metrics understanding', 'Stakeholder management', 'Strategy'], portfolioGaps: ['Case studies show process but not impact', 'Missing metrics/outcomes'], learningPriorities: ['Business metrics', 'Outcome framing', 'Stakeholder alignment', 'Revenue thinking'] },
  { id: 'research-heavy', name: 'Research-curious but execution-heavy Designer', traits: ['Wants to do more research', 'Currently stuck in execution', 'Process-aware'], strengths: ['Attention to Detail', 'Rapid Prototyping', 'Visual Design', 'Layout & Grids'], commonWeaknesses: ['Research depth', 'Presenting work', 'Strategy', 'Decision making'], portfolioGaps: ['No research artifacts shown', 'Case studies jump to solutions too fast'], learningPriorities: ['User interviews', 'Research synthesis', 'Insight framing', 'Research presentation'] },
  { id: 'multi-creative', name: 'Multi-disciplinary Creative moving toward structured product roles', traits: ['Diverse creative background', 'Exploring product design', 'Needs structure'], strengths: ['Aesthetics', 'Storytelling', 'Visual Design', 'Animation & Motion'], commonWeaknesses: ['Consistency', 'Systems thinking', 'Portfolio quality', 'Case study writing'], portfolioGaps: ['Too many different types of work', 'No clear direction or thread'], learningPriorities: ['Design process structure', 'Case study framework', 'Portfolio curation', 'Positioning'] },
]

function archetypesForPrompt() {
  return ARCHETYPES.map(a => `**${a.name}** (id: ${a.id})\n- Traits: ${a.traits.join(', ')}\n- Strengths: ${a.strengths.join(', ')}\n- Common weaknesses: ${a.commonWeaknesses.join(', ')}\n- Portfolio gaps: ${a.portfolioGaps.join('; ')}\n- Learning priorities: ${a.learningPriorities.join(', ')}`).join('\n\n')
}

// ─── Rules engine ───────────────────────────────────────────────────────────
const CRAFT_SKILLS = ['Aesthetics', 'Typography', 'Color & Composition', 'Layout & Grids', 'Micro-interactions', 'Animation & Motion', 'Illustration', 'Visual Hierarchy', 'Attention to Detail', 'UI Design', 'Visual Design', 'Branding', 'Motion Design']
const THINKING_SKILLS = ['Simplifying Complexity', 'Rapid Prototyping', 'Product Thinking', 'User Research', 'Design Systems', 'Information Architecture', 'Systems thinking', 'Strategy', 'Decision making', 'Business thinking']
const REAL_WORK_TYPES = ['Mobile App', 'Web App', 'SaaS Dashboard', 'Client Work', 'Freelance Work', 'Redesign Project']
const CONCEPT_WORK_TYPES = ['Personal Project', 'Concept Project', 'Experimental Project']

function parseSalaryToLPA(salary) {
  if (!salary) return 0
  const s = salary.toLowerCase().replace(/,/g, '')
  if (s.includes('5+ cr')) return 500
  if (s.includes('2-5 cr') || s.includes('2–5 cr')) return 350
  if (s.includes('1-2 cr') || s.includes('1–2 cr')) return 150
  if (s.includes('1 cr')) return 100
  const lpaMatch = s.match(/(\d+)[–-](\d+)\s*lpa/i)
  if (lpaMatch) return (parseInt(lpaMatch[1]) + parseInt(lpaMatch[2])) / 2
  if (s.includes('less than 3')) return 2
  if (s.includes('not earning')) return 0
  if (s.includes('freelance')) return 6
  return 0
}

function deriveSignals(answers) {
  const currentLPA = parseSalaryToLPA(answers.currentSalary)
  const targetLPA = parseSalaryToLPA(answers.targetSalary)
  const incomeGapMultiple = currentLPA > 0 ? Math.round((targetLPA / currentLPA) * 10) / 10 : targetLPA > 0 ? 10 : 0
  const urgency = incomeGapMultiple >= 4 ? 'extreme' : incomeGapMultiple >= 2.5 ? 'high' : incomeGapMultiple >= 1.5 ? 'medium' : 'low'
  const strengths = answers.strengths || []
  const craftSkills = strengths.filter(s => CRAFT_SKILLS.includes(s))
  const thinkingSkills = strengths.filter(s => THINKING_SKILLS.includes(s))
  const tendency = craftSkills.length > thinkingSkills.length + 1 ? 'craft-led' : thinkingSkills.length > craftSkills.length + 1 ? 'thinking-led' : 'balanced'
  const workSignals = answers.workSignal || []
  const realWorkCount = workSignals.filter(w => REAL_WORK_TYPES.includes(w)).length
  const conceptWorkCount = workSignals.filter(w => CONCEPT_WORK_TYPES.includes(w)).length
  const hasRealWork = realWorkCount >= 1
  const interests = answers.interests || []
  const positioningRisk = interests.length >= 5 || strengths.length >= 6
  const proofGap = !hasRealWork && conceptWorkCount >= 1
  return { incomeGapMultiple, urgency, tendency, hasRealWork, positioningRisk, proofGap, craftSkills, thinkingSkills }
}

// ─── OpenAI call with retries ───────────────────────────────────────────────
async function callStructured({ systemPrompt, userPrompt }) {
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        temperature: 0.7,
        max_tokens: 8192,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      })
      const text = response.choices[0]?.message?.content
      if (!text) throw new Error('Empty response from OpenAI')
      return { data: JSON.parse(text), usage: response.usage }
    } catch (err) {
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
      else throw err
    }
  }
}

// ─── Prompts ────────────────────────────────────────────────────────────────
const TONE_RULES = `TONE RULES (strictly follow):
- Be specific. Every insight must trace back to the user's actual answers.
- Be sharp. Short sentences. No filler.
- Be useful. Every word should help them act.
- No motivational fluff. No "you've got this" or "great start" energy.
- No generic career-coach filler like "improve your UX skills".
- No restating the user's answers back to them as insights.
- Sound like a senior design director giving honest private feedback.`

function interpreterSystemPrompt() {
  return `You are The Reset's AI Interpreter. You analyze a designer's questionnaire answers and classify them into an actionable career profile.

You have access to these design career archetypes:
${archetypesForPrompt()}

Your job:
1. Classify the designer into a PRIMARY archetype (and optionally a SECONDARY).
2. Identify their strongest real leverage point.
3. Identify their biggest bottleneck preventing growth.
4. Assess the seriousness of their income gap.
5. Recommend a specific portfolio direction.
6. Define what case studies they should build or highlight.
7. Prioritize what they should learn FIRST.
8. Map each weakness to a concrete action.
9. Provide portfolio structure advice.
10. Provide AIDA framework advice for their portfolio.

${TONE_RULES}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation.

Schema:
{
  "primaryArchetype": "archetype id string",
  "secondaryArchetype": "archetype id or null",
  "currentLevelSummary": "1-2 sentence assessment",
  "strengthSignal": "their strongest real advantage in 1-2 sentences",
  "bottleneckSignal": "the one thing holding them back most",
  "incomeGapSummary": "assessment of income gap",
  "positioningDirection": "where they should position themselves",
  "portfolioStrategy": "what their portfolio should communicate",
  "recommendedCaseStudyMix": ["type 1", "type 2"],
  "learningPriorities": ["priority 1", "priority 2"],
  "weaknessToActionMap": [{"weakness": "...", "action": "..."}],
  "portfolioAdvice": ["advice 1", "advice 2"],
  "aidaAdvice": ["Attention: ...", "Interest: ...", "Desire: ...", "Action: ..."],
  "confidenceNotes": ["any caveats"]
}`
}

function blueprintSystemPrompt() {
  return `You are The Reset's Blueprint Generator. You take a designer's interpreted profile and raw answers, then generate a concise, scannable, printable career blueprint.

CRITICAL: This blueprint is displayed as visual cards. Every string appears in a compact card or chip:
- Max 1 line per field. Under 15 words unless specified.
- No paragraphs. No multi-sentence explanations.
- Conversational, direct, personal.

${TONE_RULES}

Return ONLY valid JSON:
{
  "header": { "name": "...", "currentIncome": "...", "targetIncome": "...", "generatedOn": "date" },
  "superpower": { "label": "2-4 words", "summary": "1 short line" },
  "positioning": { "headline": "short human line" },
  "brutalTruth": { "strength": "what they're good at", "gap": "what's holding them back" },
  "strengths": ["chip 1", "chip 2"],
  "gapActionSystem": [{ "gap": "name", "truth": "short line", "action": "short line" }],
  "caseStudyDirection": { "summary": "1 line", "proofBlocks": [{ "title": "label", "detail": "short line" }], "mustInclude": ["chip 1", "chip 2"] },
  "portfolioDirection": { "summary": "1 line", "priorities": ["chip 1", "chip 2", "chip 3"] },
  "learningRoadmap": [{ "focus": "topic", "summary": "1 short line" }],
  "startHere": [{ "title": "action title", "detail": "1 supporting line" }],
  "finalStatement": "punchy 5-10 words",
  "archetype": "archetype name",
  "tagline": "one sentence"
}`
}

// ─── Handler ────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const parsed = QuestionnaireSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid data', details: parsed.error.issues })
    const answers = parsed.data
    const signals = deriveSignals(answers)

    // Step 1: Interpret
    const { data: profile } = await callStructured({
      systemPrompt: interpreterSystemPrompt(),
      userPrompt: `Analyze this designer and return the interpretation JSON.

RAW QUESTIONNAIRE ANSWERS:
- Name: ${answers.name}
- Current income: ${answers.currentSalary}
- Target income: ${answers.targetSalary}
- Current role: ${answers.journeyState}
- Target direction: ${answers.targetRole}
- Core strengths: ${(answers.strengths || []).join(', ')}
- Where they get stuck: ${(answers.weaknesses || []).join(', ')}
- Interests: ${(answers.interests || []).join(', ')}
- Work signals: ${(answers.workSignal || []).join(', ')}
- Reality check: ${answers.realityCheck?.choice || 'yes'}

DERIVED SIGNALS:
- Income gap: ${signals.incomeGapMultiple}x (urgency: ${signals.urgency})
- Tendency: ${signals.tendency}
- Has real shipped work: ${signals.hasRealWork}
- Positioning risk: ${signals.positioningRisk}
- Proof gap: ${signals.proofGap}
- Craft skills: ${signals.craftSkills.join(', ') || 'none'}
- Thinking skills: ${signals.thinkingSkills.join(', ') || 'none'}

Return the InterpretedProfile JSON only.`,
    })

    // Step 2: Generate blueprint
    const { data: blueprint } = await callStructured({
      systemPrompt: blueprintSystemPrompt(),
      userPrompt: `Generate the blueprint JSON for this designer.

RAW ANSWERS:
- Name: ${answers.name}
- Current income: ${answers.currentSalary}
- Target income: ${answers.targetSalary}
- Current role: ${answers.journeyState}
- Target direction: ${answers.targetRole}
- Strengths: ${(answers.strengths || []).join(', ')}
- Weaknesses: ${(answers.weaknesses || []).join(', ')}
- Interests: ${(answers.interests || []).join(', ')}
- Work signals: ${(answers.workSignal || []).join(', ')}

INTERPRETED PROFILE:
- Primary archetype: ${profile.primaryArchetype}
- Secondary archetype: ${profile.secondaryArchetype || 'none'}
- Current level: ${profile.currentLevelSummary}
- Strength signal: ${profile.strengthSignal}
- Bottleneck: ${profile.bottleneckSignal}
- Income gap: ${profile.incomeGapSummary}
- Positioning direction: ${profile.positioningDirection}
- Portfolio strategy: ${profile.portfolioStrategy}
- Recommended case studies: ${(profile.recommendedCaseStudyMix || []).join(', ')}
- Learning priorities: ${(profile.learningPriorities || []).join(', ')}
- Weakness actions: ${(profile.weaknessToActionMap || []).map(w => w.weakness + ' → ' + w.action).join('; ')}
- Portfolio advice: ${(profile.portfolioAdvice || []).join('; ')}
- AIDA advice: ${(profile.aidaAdvice || []).join('; ')}

Return the BlueprintData JSON only.`,
    })

    // Save to Firestore (fire and forget)
    let userEmail = null
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = await admin.auth().verifyIdToken(authHeader.slice(7))
        userEmail = decoded.email
      } catch {}
    }
    db.collection('submissions').add({
      name: answers.name,
      email: userEmail,
      answers,
      signals,
      profile,
      blueprint,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }).catch(err => console.error('Firestore write failed:', err.message))

    res.json({ blueprint, profile })
  } catch (err) {
    console.error('Blueprint generation failed:', err.message)
    res.status(500).json({ error: 'Blueprint generation failed', message: err.message })
  }
}
