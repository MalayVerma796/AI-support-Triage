import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function TicketDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !ticket) {
    notFound()
  }

  const { data: embeddingRow } = await supabase
    .from('ticket_embeddings')
    .select('embedding')
    .eq('ticket_id', id)
    .single()

  let similarTickets: any[] = []

  if (embeddingRow) {
    const { data: matches } = await supabase.rpc('match_tickets', {
      query_embedding: embeddingRow.embedding,
      match_count: 3,
      exclude_ticket_id: id,
    })
    similarTickets = matches ?? []
  }

  return (
    <main className="p-8 max-w-2xl">
      <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-2">{ticket.subject}</h1>

      <div className="flex gap-2 mb-6">
        <Tag label={ticket.category} />
        <Tag label={ticket.urgency} />
        <Tag label={ticket.sentiment} />
        <Tag label={ticket.status} />
      </div>

      <div className="border rounded p-4 mb-6">
        <p className="text-sm text-gray-500 mb-1">From: {ticket.customer_email}</p>
        <p className="whitespace-pre-wrap">{ticket.body}</p>
      </div>

      <p className="text-xs text-gray-400 mb-8">
        Submitted{' '}
        {new Date(ticket.created_at).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </p>

      {similarTickets.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Similar Past Tickets</h2>
          <div className="flex flex-col gap-3">
            {similarTickets.map((match) => (
              <Link
                key={match.ticket_id}
                href={`/tickets/${match.ticket_id}`}
                className="block border rounded p-3 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium">{match.subject}</p>
                  <span className="text-xs text-gray-400">
                    {Math.round(match.similarity * 100)}% match
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {match.body}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

function Tag({ label }: { label: string | null }) {
  if (!label) return null
  return (
    <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium">
      {label}
    </span>
  )
}