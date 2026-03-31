import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o'
const MAX_RETRIES = 2

/**
 * Call OpenAI with structured JSON output.
 * Retries on parse failure up to MAX_RETRIES times.
 */
export async function callStructured({ systemPrompt, userPrompt, schemaName = 'response' }) {
  let lastError

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        temperature: 0.7,
        max_tokens: 8192,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
      })

      const text = response.choices[0]?.message?.content
      if (!text) throw new Error('Empty response from OpenAI')

      const parsed = JSON.parse(text)
      return { data: parsed, usage: response.usage }

    } catch (err) {
      lastError = err
      console.error(`[OpenAI] Attempt ${attempt + 1} failed:`, err.message)

      if (attempt < MAX_RETRIES) {
        // Brief backoff
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  throw new Error(`OpenAI call failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`)
}

export default client
