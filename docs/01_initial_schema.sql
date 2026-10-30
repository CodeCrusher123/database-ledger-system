-- ============================================
-- Learning Basics --
-- ============================================

SELECT * FROM test_items;
SELECT name FROM test_items WHERE name = 'my mock data';
SELECT name FROM test_items WHERE name ILIKE '%a%';
SELECT name FROM test_items WHERE name ILIKE '%e%';

-- ============================================
-- INSERT - Creating Data (NOT idempotent)
-- ============================================
INSERT INTO test_items (name) VALUES ('Coffee'), ('Rent Payment'), ('Gym'), ('Groceries');
INSERT INTO test_items (name) VALUES ('Clean Slate');

-- ============================================
-- ALTER & IDENTITY - Fixing Mistakes
-- ============================================
SELECT * FROM test_items LIMIT 5;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'test_items';
DELETE FROM test_items WHERE name = 'Coffee';
TRUNCATE test_items;
TRUNCATE test_items RESTART IDENTITY;

-- SELF-NOTE --
-- Why IDs skip 10->13: id int8 IDENTITY = Sequence/Ticket dispenser. Never recycled. Gaps are NORMAL.

-- Diagnostics for real schema
SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name IN ('accounts','transactions','categories') ORDER BY table_name;
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY';

-- ============================================
-- PRODUCTION MIGRATION
-- ============================================

-- Step 1.1: Add Ownership 
ALTER TABLE accounts ADD COLUMN owner_id uuid REFERENCES auth.users(id);
ALTER TABLE transactions ADD COLUMN owner_id uuid REFERENCES auth.users(id);
ALTER TABLE categories ADD COLUMN owner_id uuid REFERENCES auth.users(id);

--SELF-NOTE--
--(REFERENCES = guardrail only, does NOT auto-fill)

-- Cleaning before making NOT NULL
SELECT count(*) FROM accounts;
SELECT count(*) FROM transactions;
SELECT count(*) FROM categories;
DELETE FROM transactions;
DELETE FROM categories;
DELETE FROM accounts;

-- Making ownership mandatory
ALTER TABLE accounts ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE categories ALTER COLUMN owner_id SET NOT NULL;

-- Step 1.2: Money Safety
ALTER TABLE transactions ALTER COLUMN account_id SET NOT NULL;
ALTER TABLE transactions ADD CONSTRAINT transactions_amount_cents_non_zero CHECK (amount_cents != 0);
-- Detail: transactions_amount_cents_non_zero = Name Tag (table_column_rule) for readable errors and DROP CONSTRAINT later
ALTER TABLE transactions ALTER COLUMN amount_cents SET NOT NULL;

-- Step 1.3: Time Safety - Diagnostics first
SELECT table_name, column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE table_name IN ('accounts','transactions','categories') AND column_name IN ('created_at','transaction_date') ORDER BY table_name;

-- timestamptz = TIMESTAMP WITH TIME ZONE (alias), now() = CURRENT_TIMESTAMP, CURRENT_DATE = date version of now()
ALTER TABLE accounts ALTER COLUMN created_at SET NOT NULL; -- already had DEFAULT now()
ALTER TABLE categories ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE categories ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE transactions ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE transactions ADD COLUMN transaction_date date DEFAULT CURRENT_DATE NOT NULL;

-- Verify
SELECT table_name, column_name, column_default, is_nullable FROM information_schema.columns WHERE table_name IN ('accounts','transactions','categories') AND column_name IN ('created_at','transaction_date');

-- Step 1.4: Security - RLS
-- pg_tables = Postgres diary for rowsecurity, pg_policies = diary for policies (information_schema doesn't know RLS)
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('accounts','transactions','categories');
SELECT policyname, tablename FROM pg_policies WHERE tablename IN ('accounts','transactions','categories');

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY breakdown:
-- "Name" = Name Tag, ON table, FOR ALL = SELECT/INSERT/UPDATE/DELETE, USING = SEE rule, WITH CHECK = CREATE rule (WITH is mandatory)
CREATE POLICY "Users can manage own accounts" ON accounts FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can manage their own categories for transactions" ON categories FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Verify all policies
SELECT policyname, tablename FROM pg_policies WHERE tablename IN ('accounts','categories','transactions') ORDER BY tablename;

-- Step 1.5: Cleanup
DROP TABLE test_items;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
