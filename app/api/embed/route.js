import { supabase } from '@/lib/supabase'
import { generateEmbedding } from '@/lib/embeddings'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const { ticketId, subject, body } = await request.json()

  const text = `${subject} ${body}`
  const embedding = await generateEmbedding(text)

  const { error } = await supabase.from('ticket_embeddings').insert({
    ticket_id: ticketId,
    embedding,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
