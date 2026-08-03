import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

export async function POST(request: Request) {
  const { subject, body, similarTickets } = await request.json()

  const context = similarTickets
    .map(
      (t: any, i: number) =>
        `Past similar ticket ${i + 1}: "${t.subject}" - ${t.body}`
    )
    .join('\n')

  const prompt = `You are a helpful customer support agent. Write a brief, professional 
reply to the customer's ticket below. Use the similar past tickets as context for how 
this type of issue is typically handled, but do not copy them verbatim. Keep the tone 
warm and helpful. Do not include a greeting like "Hi" or sign-off, just the core response.

Current ticket:
Subject: ${subject}
Body: ${body}

${context ? `Similar past tickets for context:\n${context}` : ''}

Write only the reply text, nothing else.`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
  })

  const draft = completion.choices[0].message.content?.trim() ?? ''

  return NextResponse.json({ draft })
}