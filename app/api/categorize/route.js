import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

async function getChatCompletion(params) {
  const models = [
    process.env.GROQ_MODEL,
    'llama-3.3-70b-versatile',
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
  ].filter(Boolean)

  let lastError
  for (const model of models) {
    try {
      return await groq.chat.completions.create({
        ...params,
        model,
      })
    } catch (err) {
      lastError = err
      if (err?.status === 404 || err?.status === 400) {
        continue
      }
      throw err
    }
  }
  throw lastError
}

export async function POST(request) {
  const { subject, body } = await request.json()

  try {
    const completion = await getChatCompletion({
      messages: [
        {
          role: 'user',
          content: `You are a support ticket triage assistant. Respond ONLY with valid JSON, no other text, in this exact format:
{"category": "billing" | "bug" | "feature_request" | "account" | "other", "urgency": "low" | "medium" | "high", "sentiment": "positive" | "neutral" | "negative"}

Ticket subject: ${subject}
Ticket body: ${body}`,
        },
      ],
    })

    const rawText = completion.choices[0]?.message?.content?.trim() ?? '{}'
    const cleaned = rawText.replace(/^```json\s*|\s*```$/g, '')

    const parsed = JSON.parse(cleaned)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Categorize error:', err)
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }
}
