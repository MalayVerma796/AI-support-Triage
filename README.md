# Triage — AI Support Ticket Dashboard

🔗 **Live demo:** https://ai-support-triage-chi.vercel.app
Test login: `test@test.com` / `test1234`

An internal support tool that uses an LLM to automatically categorize incoming
tickets by type, urgency, and sentiment, retrieves semantically similar past
tickets using vector search, and drafts AI-suggested replies grounded in that
retrieved context — a complete RAG (Retrieval-Augmented Generation) pipeline
built from scratch.

## Features

- **Ticket submission** with real-time AI categorization (category, urgency, sentiment)
- **Dashboard** with a filterable, sortable ticket queue and urgency indicators
- **Semantic similarity search** — finds related past tickets by meaning, not
  just keyword matching, using local embeddings + pgvector cosine similarity
- **AI-drafted replies** generated using retrieved similar tickets as context
- **Authentication** — dashboard and ticket views are protected; only
  submission is public
- Fully responsive, deployed to production

## Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL + pgvector)
- **AI:**
  - Groq API (Llama 3.3 70B) for structured categorization and reply generation
  - Local embedding model (`all-MiniLM-L6-v2` via Transformers.js) for
    generating ticket embeddings — no external API calls or rate limits
- **Auth:** Supabase Authentication with cookie-based sessions (`@supabase/ssr`)
- **Deployment:** Vercel, auto-deployed on every push to `main`

## Architecture notes

- **Server Components fetch data, Client Components handle interaction** —
  the dashboard and ticket detail pages fetch data server-side; filtering and
  the reply-draft generator are client components that receive that data as props.
- **RAG pipeline:** on ticket submission, an embedding is generated in the
  background and stored in `pgvector`. On viewing a ticket, a Postgres function
  (`match_tickets`) finds the closest embeddings by cosine distance, and those
  matches are passed as context into the reply-generation prompt.
- **RLS (Row Level Security)** policies scope database access per role
  (`anon` for public ticket submission, `authenticated` for the dashboard).
- **API keys never reach the browser** — all LLM calls happen in server-side
  API routes.

## Running locally

1. Clone the repo
2. `npm install`
3. Create a `.env.local` based on `.env.example` with your own Supabase and
   Groq API keys
4. `npm run dev`

## Screenshots

*(add screenshots here — see below)*