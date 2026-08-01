import { supabase } from '@/lib/supabase'

export default async function Dashboard() {
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <p className="p-8 text-red-500">Error loading tickets: {error.message}</p>
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Support Ticket Dashboard</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3">Subject</th>
              <th className="p-3">Category</th>
              <th className="p-3">Urgency</th>
              <th className="p-3">Sentiment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {tickets?.map((ticket) => (
              <tr key={ticket.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{ticket.subject}</td>
                <td className="p-3">{ticket.category ?? '—'}</td>
                <td className="p-3">
                  <UrgencyBadge urgency={ticket.urgency} />
                </td>
                <td className="p-3">{ticket.sentiment ?? '—'}</td>
                <td className="p-3">{ticket.status}</td>
                <td className="p-3">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tickets?.length === 0 && (
        <p className="text-gray-500 mt-4">No tickets yet.</p>
      )}
    </main>
  )
}

function UrgencyBadge({ urgency }: { urgency: string | null }) {
  const colors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  }

  if (!urgency) return <span>—</span>

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[urgency] ?? ''}`}>
      {urgency}
    </span>
  )
}