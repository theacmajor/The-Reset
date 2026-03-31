import { z } from 'zod'

// ─── Raw Questionnaire Answers ───────────────────────────────────────────────
export const QuestionnaireSchema = z.object({
  name:              z.string().min(1),
  currentSalary:     z.string(),
  targetSalary:      z.string(),
  journeyState:      z.string(),
  targetRole:        z.string(),
  strengths:         z.array(z.string()),
  weaknesses:        z.array(z.string()),
  interests:         z.array(z.string()),
  workSignal:        z.array(z.string()),
  realityCheck:      z.object({
    choice: z.enum(['yes', 'no']),
  }).optional(),
})

// ─── Interpreted Profile (AI Step 1 output) ──────────────────────────────────
export const InterpretedProfileSchema = z.object({
  primaryArchetype:       z.string(),
  secondaryArchetype:     z.string().optional(),
  currentLevelSummary:    z.string(),
  strengthSignal:         z.string(),
  bottleneckSignal:       z.string(),
  incomeGapSummary:       z.string(),
  positioningDirection:   z.string(),
  portfolioStrategy:      z.string(),
  recommendedCaseStudyMix: z.array(z.string()),
  learningPriorities:     z.array(z.string()),
  weaknessToActionMap:    z.array(z.object({
    weakness: z.string(),
    action:   z.string(),
  })),
  portfolioAdvice:  z.array(z.string()),
  aidaAdvice:       z.array(z.string()),
  confidenceNotes:  z.array(z.string()).optional(),
})

// ─── Blueprint Data (AI Step 2 output → feeds the UI) ────────────────────────
export const BlueprintDataSchema = z.object({
  header: z.object({
    name:          z.string(),
    currentIncome: z.string(),
    targetIncome:  z.string(),
    generatedOn:   z.string(),
  }),
  superpower: z.object({
    label:   z.string(),   // 2-4 words — their core edge
    summary: z.string(),   // 1 short line — why this is their edge
  }),
  positioning: z.object({
    headline: z.string(),  // short, human, memorable positioning line
  }),
  brutalTruth: z.object({
    strength: z.string(),  // line 1: what they're strong at
    gap:      z.string(),  // line 2: what's actually holding them back
  }),
  strengths: z.array(z.string()),
  gapActionSystem: z.array(z.object({
    gap:    z.string(),   // gap name
    truth:  z.string(),   // short line — the real problem
    action: z.string(),   // short line — what to do next
  })),
  caseStudyDirection: z.object({
    summary:     z.string(),            // 1 conversational line
    proofBlocks: z.array(z.object({     // 2-3 blocks: what work should prove
      title: z.string(),
      detail: z.string(),
    })),
    mustInclude: z.array(z.string()),   // chips: what to include inside
  }),
  portfolioDirection: z.object({
    summary:    z.string(),            // 1 short advice line
    priorities: z.array(z.string()),   // 3 short emphasis chips
  }),
  learningRoadmap: z.array(z.object({
    focus:   z.string(),   // topic name
    summary: z.string(),   // 1 short line
  })),
  startHere: z.array(z.object({  // exactly 3 action cards
    title:  z.string(),          // short action title
    detail: z.string(),          // 1 supporting line
  })),
  finalStatement: z.string(),
  archetype:      z.string(),
  tagline:        z.string(),
})

// ─── Derived Signals (deterministic pre-processing) ──────────────────────────
export const DerivedSignalsSchema = z.object({
  incomeGapMultiple:  z.number(),
  urgency:            z.enum(['low', 'medium', 'high', 'extreme']),
  tendency:           z.enum(['craft-led', 'thinking-led', 'balanced']),
  hasRealWork:        z.boolean(),
  positioningRisk:    z.boolean(),
  proofGap:           z.boolean(),
  craftSkills:        z.array(z.string()),
  thinkingSkills:     z.array(z.string()),
})
