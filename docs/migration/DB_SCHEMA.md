# LEDGERPULSE — FULL BUILD SUMMARY DAY 0 TO DB COMPLETE

## PHASE 0: WORKSPACE & SECURE BRIDGE

- Vite + React-TS + Zustand + Supabase JS
- `.env.local`: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
- Singleton `src/lib/supabaseClient.ts` = Only translator: Postgres <-> Supabase Client <-> Zustand (Optimistic Cache)
- `DatabaseDataViewer.tsx`: useEffect + try/catch pipeline, 60 FPS verification with test_items, RLS disabled for POC

## PHASE 1: TRANSLATION

- Supabase JS does NOT build SQL in browser. It sends GET /rest/v1/table to PostgREST which builds SQL server-side and checks RLS.
- SELECT returns SET (0-N rows), not one.
- ILIKE = case-insensitive LIKE, % = wildcard
- INSERT is NOT idempotent

## PHASE 2: DATA vs STRUCTURE

- `information_schema.columns` = public library catalog (standard SQL)
- `pg_tables`, `pg_policies` = Postgres private diary (Postgres-only features like RLS)
- DATA: DELETE (rows WHERE), TRUNCATE (empty table, keep structure), TRUNCATE RESTART IDENTITY (empty + reset id dispenser)
- STRUCTURE: ALTER TABLE ADD/DROP COLUMN, RENAME COLUMN
- Identity gaps 10->13->17: Sequence ticket dispenser never recycles, for concurrency. Normal.

## PHASE 3: REAL SCHEMA CHECK (built by me without kowing basics)

- accounts, categories, transactions + test_items int8 IDENTITY
- Found: account_id Nullable (BUG), created_at Nullable, No owner_id, No transaction_date, RLS DISABLED

## PHASE 4: PRODUCTION MIGRATION (rebuilding with some basic knowledge now)

### Step 1.1: Ownership

`ALTER TABLE ... ADD COLUMN owner_id uuid REFERENCES auth.users(id);`
REFERENCES = FK guardrail only, does NOT auto-fill. Must send owner_id from client: insert({owner_id: user.id})

### Step 1.1b: Make Mandatory

Clean first: DELETE FROM transactions/categories/accounts (FK order)
`ALTER COLUMN owner_id SET NOT NULL;`

### Step 1.2: Money Safety

`ALTER COLUMN account_id SET NOT NULL;`
`ADD CONSTRAINT transactions_amount_cents_non_zero CHECK (amount_cents !=0)`

- Name Tag = table_column_rule for readable errors and DROP CONSTRAINT
- CHECK = Rule, Name = Tag

### Step 1.3: Time Safety

- timestamptz = TIMESTAMP WITH TIME ZONE (alias)
- now() = CURRENT_TIMESTAMP (full timestamptz)
- CURRENT_DATE = date version of now()
- DEFAULT = auto-fill if frontend forgets
- Diagnostic showed accounts had now() but YES nullable, categories/transactions null default YES nullable
- Fix: SET DEFAULT now() then SET NOT NULL, ADD transaction_date date DEFAULT CURRENT_DATE NOT NULL

### Step 1.4: RLS Security

- RLS DISABLED = open door, anon key sees all
- RLS ENABLED + no policy = default-deny, no one sees anything
- RLS ENABLED + policy = secure multi-tenant
- Policy: `CREATE POLICY "Name" ON table FOR ALL USING (auth.uid()=owner_id) WITH CHECK (auth.uid()=owner_id)`
- FOR ALL = SELECT/INSERT/UPDATE/DELETE
- USING = SEE rule, WITH CHECK = CREATE rule (WITH mandatory, CHECK alone = syntax error)
- auth.uid() = JWT id, cannot be faked

### Step 1.5: Cleanup

`DROP TABLE test_items;` = delete structure+data+sequence, irreversible

### FINAL STATE

3 tables, all owner_id NOT NULL REFERENCES auth.users, created_at timestamptz DEFAULT now() NOT NULL, rowsecurity true, 1 policy each auth.uid()=owner_id, transactions has account_id NOT NULL, amount_cents NOT NULL CHECK !=0, transaction_date NOT NULL

### NEXT: PHASE 2 ZUSTAND

- Store shape (accounts/categories/transactions with integer cents)
- Supabase bridge with auto RLS filtering (no frontend if check)
- Optimistic UI
