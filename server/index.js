import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { QuestionnaireSchema } from './lib/schemas.js'
import { deriveSignals } from './lib/rules.js'
import { createSession, saveSignals, saveInterpretation, saveBlueprint, saveError, fetchSession } from './lib/db.js'
import { interpretAnswers } from './openai/interpreter.js'
import { generateBlueprint } from './openai/blueprintGenerator.js'

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }))
app.use(express.json({ limit: '1mb' }))

// ─── POST /api/generate-blueprint ────────────────────────────────────────────
// Full pipeline: validate → persist → rules → interpret → generate → return
app.post('/api/generate-blueprint', async (req, res) => {
  let sessionId

  try {
    // 1. Validate input
    const parsed = QuestionnaireSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid questionnaire data',
        details: parsed.error.issues,
      })
    }
    const answers = parsed.data

    // 2. Persist raw answers
    sessionId = createSession(answers)
    console.log(`[Session ${sessionId}] Created`)

    // 3. Compute derived signals (deterministic)
    const signals = deriveSignals(answers)
    saveSignals(sessionId, signals)
    console.log(`[Session ${sessionId}] Signals:`, {
      urgency: signals.urgency,
      tendency: signals.tendency,
      gap: `${signals.incomeGapMultiple}x`,
    })

    // 4. Step A — Interpret (AI call)
    const profile = await interpretAnswers(answers, signals)
    saveInterpretation(sessionId, profile)
    console.log(`[Session ${sessionId}] Interpreted: ${profile.primaryArchetype}`)

    // 5. Step B — Generate blueprint (AI call)
    const blueprint = await generateBlueprint(answers, profile)
    saveBlueprint(sessionId, blueprint)
    console.log(`[Session ${sessionId}] Blueprint generated`)

    // 6. Return
    res.json({
      sessionId,
      blueprint,
      profile, // include profile so frontend can show archetype info if needed
    })

  } catch (err) {
    console.error(`[Session ${sessionId || '?'}] Pipeline failed:`, err.message)

    if (sessionId) saveError(sessionId, err.message)

    res.status(500).json({
      error: 'Blueprint generation failed',
      message: err.message,
      sessionId,
    })
  }
})

// ─── GET /api/blueprint/:id ──────────────────────────────────────────────────
// Retrieve a previously generated blueprint
app.get('/api/blueprint/:id', (req, res) => {
  const session = fetchSession(req.params.id)
  if (!session) return res.status(404).json({ error: 'Session not found' })

  res.json({
    sessionId: session.id,
    status:    session.status,
    blueprint: session.blueprint_data,
    profile:   session.interpreted_profile,
    error:     session.error,
  })
})

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`[The Reset] API server → http://localhost:${PORT}`)
  console.log(`[The Reset] OpenAI model: ${process.env.OPENAI_MODEL || 'gpt-4o'}`)
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[The Reset] ⚠ OPENAI_API_KEY not set!')
  }
})
