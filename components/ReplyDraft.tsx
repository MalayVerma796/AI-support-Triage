'use client'

import { useState } from 'react'

type SimilarTicket = {
  ticket_id: string
  subject: string
  body: string
}

export default function ReplyDraft({
  subject,
  body,
  similarTickets,
}: {
  subject: string
  body: string
  similarTickets: SimilarTicket[]
}) {
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    const res = await fetch('/api/draft-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body, similarTickets }),
    })
    const data = await res.json()
    setDraft(data.draft ?? '')
    setLoading(false)
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-3">AI-Suggested Reply</h2>

      {!draft && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-black text-white rounded px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading ? 'Generating draft...' : 'Generate Reply Draft'}
        </button>
      )}

      {draft && (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            className="w-full border rounded p-3 text-sm"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="text-sm text-blue-600 hover:underline"
            >
              {loading ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}