import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const { ticketId } = await request.json()

  const { data: embeddingRow, error: embeddingError } = await supabase
    .from('ticket_embeddings')
    .select('embedding')
    .eq('ticket_id', ticketId)
    .single()

  if (embeddingError || !embeddingRow) {
    return NextResponse.json({ similar: [] })
  }

  const { data: matches, error: matchError } = await supabase.rpc('match_tickets', {
    query_embedding: embeddingRow.embedding,
    match_count: 3,
    exclude_ticket_id: ticketId,
  })

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 })
  }

  return NextResponse.json({ similar: matches })
}
