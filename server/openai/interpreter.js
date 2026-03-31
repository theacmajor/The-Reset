import { callStructured } from './client.js'
import { interpreterSystemPrompt, interpreterUserPrompt } from './prompts.js'
import { InterpretedProfileSchema } from '../lib/schemas.js'

/**
 * Step 1: Interpret raw questionnaire answers into a structured profile.
 * Validates the AI output against the InterpretedProfile schema.
 */
export async function interpretAnswers(answers, signals) {
  const systemPrompt = interpreterSystemPrompt()
  const userPrompt   = interpreterUserPrompt(answers, signals)

  console.log('[Interpreter] Calling OpenAI...')
  const { data, usage } = await callStructured({
    systemPrompt,
    userPrompt,
    schemaName: 'InterpretedProfile',
  })

  console.log(`[Interpreter] Tokens: ${usage?.total_tokens || '?'}`)

  // Validate against schema
  const result = InterpretedProfileSchema.safeParse(data)
  if (!result.success) {
    console.error('[Interpreter] Schema validation failed:', result.error.issues)
    console.error('[Interpreter] Raw keys received:', Object.keys(data))
    console.warn('[Interpreter] Returning raw data despite validation failure')
    return data
  }

  return result.data
}
