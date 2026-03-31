import { callStructured } from './client.js'
import { blueprintSystemPrompt, blueprintUserPrompt } from './prompts.js'
import { BlueprintDataSchema } from '../lib/schemas.js'

/**
 * Step 2: Generate blueprint content from interpreted profile + raw answers.
 * Validates the AI output against the BlueprintData schema.
 */
export async function generateBlueprint(answers, interpretedProfile) {
  const systemPrompt = blueprintSystemPrompt()
  const userPrompt   = blueprintUserPrompt(answers, interpretedProfile)

  console.log('[Blueprint] Calling OpenAI...')
  const { data, usage } = await callStructured({
    systemPrompt,
    userPrompt,
    schemaName: 'BlueprintData',
  })

  console.log(`[Blueprint] Tokens: ${usage?.total_tokens || '?'}`)

  // Validate against schema
  const result = BlueprintDataSchema.safeParse(data)
  if (!result.success) {
    console.error('[Blueprint] Schema validation failed:', result.error.issues)
    console.error('[Blueprint] Raw keys received:', Object.keys(data))
    // Return raw data anyway so the frontend can render what it can
    console.warn('[Blueprint] Returning raw data despite validation failure')
    return data
  }

  return result.data
}
