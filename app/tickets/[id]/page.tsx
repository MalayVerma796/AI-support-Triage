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

      <div className="border rounded p-4 mb-4">
        <p className="text-sm text-gray-500 mb-1">From: {ticket.customer_email}</p>
        <p className="whitespace-pre-wrap">{ticket.body}</p>
      </div>

      <p className="text-xs text-gray-400">
        Submitted {new Date(ticket.created_at).toLocaleString()}
      </p>
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