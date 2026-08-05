import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TicketTable from '@/components/TicketTable'
import LogoutButton from '@/components/LogoutButton'

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <p className="p-8 text-red-500">Error loading tickets: {error.message}</p>
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Support Ticket Dashboard</h1>
        <LogoutButton />
      </div>
      <TicketTable tickets={tickets ?? []} />
    </main>
  )
}