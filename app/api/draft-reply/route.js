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
  const { subject, body, similarTickets = [] } = await request.json()

  const context = similarTickets
    .map(
      (t, i) =>
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

  try {
    const completion = await getChatCompletion({
      messages: [{ role: 'user', content: prompt }],
    })

    const draft = completion.choices[0]?.message?.content?.trim() ?? ''

    return NextResponse.json({ draft })
  } catch (err) {
    console.error('Draft reply error:', err)
    return NextResponse.json({ error: 'Failed to generate reply draft' }, { status: 500 })
  }
}
