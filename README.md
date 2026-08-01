# AI Support Ticket Triage Dashboard

An internal tool that uses an LLM to automatically categorize incoming support 
tickets by type, urgency, and sentiment — helping support teams triage tickets 
faster without manual sorting.

## Features
- Ticket submission form with real-time AI categorization
- Dashboard with sortable, filterable ticket queue
- Color-coded urgency indicators for at-a-glance triage
- (Coming soon) Similar-ticket retrieval using vector search
- (Coming soon) AI-drafted reply suggestions

## Tech Stack
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL + pgvector)
- **AI:** Groq API (Llama 3.3 70B) for structured ticket categorization

## Why these choices
- **Groq over other LLM providers:** free tier with generous rate limits, ideal 
  for a project in active development
- **Supabase over a custom backend:** managed Postgres + auth + storage in one 
  place, with pgvector built in for future semantic search features
- **Server-side API routes:** keeps LLM API keys secure, never exposed to the browser

## Running locally
1. Clone the repo
2. `npm install`
3. Create a `.env.local` with your own Supabase and Groq API keys (see `.env.example`)
4. `npm run dev`

## Screenshots
(add once dashboard is polished)