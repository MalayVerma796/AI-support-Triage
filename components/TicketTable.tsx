'use client'

import { useState } from 'react'

type Ticket = {
  id: string
  subject: string
  category: string | null
  urgency: string | null
  sentiment: string | null
  status: string
  created_at: string
}

export default function TicketTable({ tickets }: { tickets: Ticket[] }) {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')

  const filteredTickets = tickets.filter((ticket) => {
    const matchesCategory =
      categoryFilter === 'all' || ticket.category === categoryFilter
    const matchesUrgency =
      urgencyFilter === 'all' || ticket.urgency === urgencyFilter
    return matchesCategory && matchesUrgency
  })

  const categories = Array.from(
    new Set(tickets.map((t) => t.category).filter(Boolean))
  ) as string[]

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All Urgencies</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <span className="self-center text-sm text-gray-500">
          {filteredTickets.length} of {tickets.length} tickets
        </span>
      </div>

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
            {filteredTickets.map((ticket) => (
              <tr
  key={ticket.id}
  className="border-b hover:bg-gray-50 cursor-pointer"
  onClick={() => (window.location.href = `/tickets/${ticket.id}`)}
>
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

      {filteredTickets.length === 0 && (
        <p className="text-gray-500 mt-4">No tickets match these filters.</p>
      )}
    </div>
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