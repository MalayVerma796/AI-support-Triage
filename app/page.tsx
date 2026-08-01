import TicketForm from '@/components/TicketForm'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="p-8">
      <div className="max-w-md mb-4">
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
          View Dashboard →
        </Link>
      </div>
      <TicketForm />
    </main>
  )
}