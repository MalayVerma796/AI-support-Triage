import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

export async function POST(request: Request) {
  const { subject, body } = await request.json()

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
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

  const rawText = completion.choices[0].message.content?.trim() ?? '{}'
  const cleaned = rawText.replace(/^```json\s*|\s*```$/g, '')

  try {
    const parsed = JSON.parse(cleaned)
    return NextResponse.json(parsed)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }
}