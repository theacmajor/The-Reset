import { archetypesForPrompt } from '../lib/archetypes.js'

// ─── Shared tone rules ───────────────────────────────────────────────────────
const TONE_RULES = `
TONE RULES (strictly follow):
- Be specific. Every insight must trace back to the user's actual answers.
- Be sharp. Short sentences. No filler.
- Be useful. Every word should help them act.
- No motivational fluff. No "you've got this" or "great start" energy.
- No generic career-coach filler like "improve your UX skills".
- No restating the user's answers back to them as insights.
- No startup-bro tone.
- Sound like a senior design director giving honest private feedback.
`

// ─── Interpreter system prompt ───────────────────────────────────────────────
export function interpreterSystemPrompt() {
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

IMPORTANT: Return ONLY valid JSON matching the schema below. No markdown, no explanation, no wrapping.

Schema:
{
  "primaryArchetype": "archetype id string",
  "secondaryArchetype": "archetype id or null",
  "currentLevelSummary": "1-2 sentence assessment of where they are right now",
  "strengthSignal": "their strongest real advantage in 1-2 sentences",
  "bottleneckSignal": "the one thing holding them back most, 1-2 sentences",
  "incomeGapSummary": "assessment of current vs target income gap",
  "positioningDirection": "where they should position themselves, 1-2 sentences",
  "portfolioStrategy": "what their portfolio should communicate, 2-3 sentences",
  "recommendedCaseStudyMix": ["case study type 1", "case study type 2", ...],
  "learningPriorities": ["priority 1", "priority 2", ...],
  "weaknessToActionMap": [{"weakness": "...", "action": "specific action"}, ...],
  "portfolioAdvice": ["specific advice 1", "specific advice 2", ...],
  "aidaAdvice": ["Attention: ...", "Interest: ...", "Desire: ...", "Action: ..."],
  "confidenceNotes": ["any caveats about the analysis"]
}`
}

export function interpreterUserPrompt(answers, signals) {
  return `Analyze this designer and return the interpretation JSON.

RAW QUESTIONNAIRE ANSWERS:
- Name: ${answers.name}
- Current income: ${answers.currentSalary}
- Target income: ${answers.targetSalary}
- Current role: ${answers.journeyState}
- Target direction: ${answers.targetRole}
- Core strengths: ${(answers.strengths || []).join(', ')}
- Where they get stuck: ${(answers.weaknesses || []).join(', ')}
- Interests beyond core role: ${(answers.interests || []).join(', ')}
- Work signals (done or want to do): ${(answers.workSignal || []).join(', ')}
- Reality check response: ${answers.realityCheck?.choice || 'yes'}

DERIVED SIGNALS (deterministic analysis):
- Income gap: ${signals.incomeGapMultiple}x (urgency: ${signals.urgency})
- Tendency: ${signals.tendency}
- Has real shipped work: ${signals.hasRealWork}
- Positioning risk (too broad): ${signals.positioningRisk}
- Proof gap (needs more real work): ${signals.proofGap}
- Craft skills: ${signals.craftSkills.join(', ') || 'none identified'}
- Thinking skills: ${signals.thinkingSkills.join(', ') || 'none identified'}

Return the InterpretedProfile JSON only.`
}

// ─── Blueprint generator system prompt ───────────────────────────────────────
export function blueprintSystemPrompt() {
  return `You are The Reset's Blueprint Generator. You take a designer's interpreted profile and raw answers, then generate the final blueprint content.

The blueprint is a personalized career document. It must feel like it was written specifically for THIS person.

${TONE_RULES}

ADDITIONAL RULES:
- The superpower label should be 2-4 words. Not generic. Based on their actual strongest skill signal.
- The positioning statement should be 1 sentence. Sharp. Memorable. Not corporate.
- The final statement should be punchy, 5-10 words, personal to them.
- Learning roadmap items should be ordered by priority. Most impactful first.
- Case study stack should list specific types of projects, not vague categories.
- Portfolio structure items should be specific pages/sections for their portfolio.
- Tagline should describe who they are and where they're heading in one sentence.

Return ONLY valid JSON matching this schema:

{
  "header": {
    "name": "...",
    "currentIncome": "...",
    "targetIncome": "...",
    "generatedOn": "date string"
  },
  "positioning": {
    "superpowerLabel": "2-4 word superpower",
    "positioningStatement": "one sharp sentence"
  },
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "weaknessToAction": [{"weakness": "...", "action": "..."}, ...],
  "caseStudyStack": ["specific case study type 1", ...],
  "thingsToShow": ["what to feature in portfolio 1", ...],
  "learningRoadmap": ["learning priority 1 (most important)", ...],
  "portfolioStructure": ["portfolio section 1", ...],
  "finalStatement": "punchy 5-10 word statement",
  "archetype": "human-readable archetype name",
  "tagline": "one sentence describing who they are and where they're heading"
}`
}

export function blueprintUserPrompt(answers, profile) {
  return `Generate the blueprint JSON for this designer.

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
- Recommended case studies: ${profile.recommendedCaseStudyMix.join(', ')}
- Learning priorities: ${profile.learningPriorities.join(', ')}
- Weakness actions: ${profile.weaknessToActionMap.map(w => `${w.weakness} → ${w.action}`).join('; ')}
- Portfolio advice: ${profile.portfolioAdvice.join('; ')}
- AIDA advice: ${profile.aidaAdvice.join('; ')}

Return the BlueprintData JSON only.`
}
