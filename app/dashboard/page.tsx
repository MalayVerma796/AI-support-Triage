import { supabase } from '@/lib/supabase'
import TicketTable from '@/components/TicketTable'

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
      <TicketTable tickets={tickets ?? []} />
    </main>
  )
}