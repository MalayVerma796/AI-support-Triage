import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { pipeline } from '@xenova/transformers'

dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')))

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Initialize Groq OpenAI client
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

// AI Model Fallback Helper
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

// HuggingFace Xenova Embedder
let embedder = null
async function generateEmbedding(text) {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  }
  const output = await embedder(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data)
}

// 1. Config Endpoint (Safe public credentials for browser client)
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
})

// 2. AI Categorize Endpoint
app.post('/api/categorize', async (req, res) => {
  const { subject, body } = req.body

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
    res.json(parsed)
  } catch (err) {
    console.error('Categorize error:', err.message)
    res.status(500).json({ error: 'Failed to parse AI response' })
  }
})

// 3. AI Draft Reply Endpoint
app.post('/api/draft-reply', async (req, res) => {
  const { subject, body, similarTickets = [] } = req.body

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
    res.json({ draft })
  } catch (err) {
    console.error('Draft reply error:', err.message)
    res.status(500).json({ error: 'Failed to generate reply draft' })
  }
})

// 4. Vector Embedding Generation Endpoint
app.post('/api/embed', async (req, res) => {
  const { ticketId, subject, body } = req.body

  try {
    const text = `${subject} ${body}`
    const embedding = await generateEmbedding(text)

    const { error } = await supabase.from('ticket_embeddings').insert({
      ticket_id: ticketId,
      embedding,
    })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Embedding error:', err.message)
    res.status(500).json({ error: 'Failed to generate embedding' })
  }
})

// 5. Similar Tickets Vector Search Endpoint
app.post('/api/similar', async (req, res) => {
  const { ticketId } = req.body

  try {
    const { data: embeddingRow, error: embeddingError } = await supabase
      .from('ticket_embeddings')
      .select('embedding')
      .eq('ticket_id', ticketId)
      .single()

    if (embeddingError || !embeddingRow) {
      return res.json({ similar: [] })
    }

    const { data: matches, error: matchError } = await supabase.rpc('match_tickets', {
      query_embedding: embeddingRow.embedding,
      match_count: 3,
      exclude_ticket_id: ticketId,
    })

    if (matchError) {
      return res.status(500).json({ error: matchError.message })
    }

    res.json({ similar: matches || [] })
  } catch (err) {
    console.error('Similar tickets error:', err.message)
    res.status(500).json({ error: 'Failed to find similar tickets' })
  }
})

// Clean Page Route Handlers
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'))
})

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'))
})

app.get('/tickets/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ticket.html'))
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
