'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TicketForm() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    const categorizeRes = await fetch('/api/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body }),
    })
    const categorization = await categorizeRes.json()

    const { error } = await supabase.from('tickets').insert({
      subject,
      body,
      customer_email: email,
      category: categorization.category,
      urgency: categorization.urgency,
      sentiment: categorization.sentiment,
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Ticket submitted successfully!')
      setSubject('')
      setBody('')
      setEmail('')
    }

    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md p-6">
      <h2 className="text-xl font-bold">Submit a Support Ticket</h2>

      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
        className="border rounded px-3 py-2"
      />

      <textarea
        placeholder="Describe your issue..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={4}
        className="border rounded px-3 py-2"
      />

      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border rounded px-3 py-2"
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Ticket'}
      </button>

      {message && <p className="text-sm">{message}</p>}
    </form>
  )
}