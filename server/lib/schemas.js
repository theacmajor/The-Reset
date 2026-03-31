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
  positioning: z.object({
    superpowerLabel:       z.string(),
    positioningStatement:  z.string(),
  }),
  strengths:        z.array(z.string()),
  weaknesses:       z.array(z.string()),
  weaknessToAction: z.array(z.object({
    weakness: z.string(),
    action:   z.string(),
  })),
  caseStudyStack:     z.array(z.string()),
  thingsToShow:       z.array(z.string()),
  learningRoadmap:    z.array(z.string()),
  portfolioStructure: z.array(z.string()),
  finalStatement:     z.string(),
  archetype:          z.string(),
  tagline:            z.string(),
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
