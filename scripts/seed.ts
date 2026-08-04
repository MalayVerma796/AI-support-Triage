import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const sampleTickets = [
  {
    subject: 'Cannot reset my password',
    body: 'I click "forgot password" but never receive the reset email. Checked spam folder too.',
    customer_email: 'jordan.k@example.com',
  },
  {
    subject: 'Charged twice for my subscription',
    body: 'My card was charged $29 twice this month for the same plan. Please refund the duplicate charge.',
    customer_email: 'priya.m@example.com',
  },
  {
    subject: 'Feature request: dark mode',
    body: 'Would love a dark mode option for the dashboard, especially for late-night use.',
    customer_email: 'alex.t@example.com',
  },
  {
    subject: 'Entire platform is down',
    body: 'Nobody on my team can log in right now. This is blocking all our work and we have a client demo in an hour.',
    customer_email: 'sara.w@example.com',
  },
  {
    subject: 'Export to CSV not working',
    body: 'When I click export, the file downloads but it is completely empty. Tried on Chrome and Safari.',
    customer_email: 'mike.d@example.com',
  },
  {
    subject: 'How do I add team members?',
    body: 'New to the platform, trying to figure out how to invite my colleagues. Cannot find the option.',
    customer_email: 'lisa.n@example.com',
  },
  {
    subject: 'Invoice missing from billing page',
    body: "Last month's invoice isn't showing up in my billing history, I need it for expense reporting.",
    customer_email: 'tom.b@example.com',
  },
  {
    subject: 'Really happy with the recent update',
    body: 'Just wanted to say the new UI is fantastic, much faster than before. Great work!',
    customer_email: 'emma.r@example.com',
  },
  {
    subject: 'API rate limit unclear',
    body: 'Getting 429 errors intermittently and the docs do not clearly state what the actual rate limit is.',
    customer_email: 'devon.s@example.com',
  },
  {
    subject: 'Mobile app crashes on launch',
    body: 'App crashes immediately after opening on my iPhone 15, started happening after the latest update.',
    customer_email: 'nina.p@example.com',
  },
  {
    subject: 'App loading extremely slow',
    body: 'Every page takes 10+ seconds to load, started this week. Very frustrating.',
    customer_email: 'chris.l@example.com',
  },
  {
    subject: 'Cannot log into account',
    body: 'Getting "invalid credentials" error even though my password is correct.',
    customer_email: 'jamie.f@example.com',
  },
  {
    subject: 'Wrong amount charged',
    body: 'I was billed $49 instead of the $29 plan I signed up for.',
    customer_email: 'ravi.k@example.com',
  },
]

async function categorize(subject: string, body: string) {
  const res = await fetch('http://localhost:3000/api/categorize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, body }),
  })
  return res.json()
}

async function embed(ticketId: string, subject: string, body: string) {
  await fetch('http://localhost:3000/api/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketId, subject, body }),
  })
}

async function seed() {
  console.log(`Seeding ${sampleTickets.length} tickets...`)

  for (const ticket of sampleTickets) {
    const categorization = await categorize(ticket.subject, ticket.body)

    const { data: insertedTicket, error } = await supabase
      .from('tickets')
      .insert({
        ...ticket,
        category: categorization.category,
        urgency: categorization.urgency,
        sentiment: categorization.sentiment,
      })
      .select()
      .single()

    if (error) {
      console.error(`Failed to insert "${ticket.subject}":`, error.message)
    } else {
      console.log(`✓ Inserted: ${ticket.subject} [${categorization.category}, ${categorization.urgency}]`)
      await embed(insertedTicket.id, ticket.subject, ticket.body)
      console.log(`  → embedding generated`)
    }

    // small delay to avoid hitting rate limits back-to-back
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  console.log('Done seeding.')
}

seed()