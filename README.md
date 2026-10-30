# LedgerPulse

A relational finance ledger built to learn production-grade data modeling — not another fetch-wrapper.

Currently in active build.

## Stack

React + TypeScript + Vite + Zustand + Supabase (Postgres)

## What I'm Building

LedgerPulse — A multi-user ledger where money is stored as integer cents (1550 instead of $15.50) to avoid float errors, with real RLS security.

## Progress So Far

**Phase 0: The Bridge**

- Vite React-TS setup
- Connected client via `@supabase/supabase-js` using singleton `src/lib/supabaseClient.ts`
- `.env.local` with `VITE_SUPABASE_URL` + `PUBLISHABLE_KEY`
- Verified full loop: Client -> PostgREST -> Postgres -> Render

**Phase 1: DB (Just Completed)**

- Started with `test_items` sandbox, then dropped it
- Learned raw SQL: `SELECT`, `INSERT`, `DELETE`, `TRUNCATE RESTART IDENTITY`, `ALTER TABLE`
- Understood sequences: why IDs skip (ticket dispenser model)
- Built real tables: `accounts`, `categories`, `transactions`
- Added `owner_id uuid REFERENCES auth.users(id) NOT NULL` for multi-tenancy
- Fixed constraints: `account_id NOT NULL`, `amount_cents int8 NOT NULL CHECK (amount_cents != 0)`
- Fixed time: `created_at timestamptz DEFAULT now() NOT NULL`, `transaction_date date DEFAULT CURRENT_DATE`
- Enabled RLS + Policies: `USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id)`
- Docs in `docs/migrations/01_initial_schema.sql`

## Next

**Phase 2: Zustand**

- Store shape with integer cents
- Supabase bridge with RLS auto-filtering
- Optimistic UI for create/update/delete

## Run Locally

```bash
npm install
# Add .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Build to Understand — No boilerplate dumps.
