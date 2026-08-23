-- Migration: switch join_registrations.age_group from age-range slugs
-- ('4-5','6-7','8-9','10-11') to grade slugs
-- ('pre-k','kindergarten','1st-grade','2nd-grade','3rd-grade','4th-grade','5th-grade','6th-grade')
--
-- Run this once against your live database (e.g. via psql, or your DB
-- provider's SQL console). Safe to run even if some steps don't apply.

BEGIN;

-- 1. Drop the old CHECK constraint (name may vary; this finds it dynamically).
DO $$
DECLARE
  con_name text;
BEGIN
  SELECT conname INTO con_name
  FROM pg_constraint
  WHERE conrelid = 'join_registrations'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%age_group%';

  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE join_registrations DROP CONSTRAINT %I', con_name);
  END IF;
END $$;

-- 2. Existing rows: rows already in the table with OLD values ('4-5', '6-7',
--    '8-9', '10-11') will violate the new constraint below unless handled.
--    Pick ONE of the following options before running step 3:
--
--    OPTION A — you know which grade each old age-range should map to.
--    Uncomment and adjust these lines with the correct mapping for your data:
--
--      -- UPDATE join_registrations SET age_group = 'pre-k'     WHERE age_group = '4-5';
--      -- UPDATE join_registrations SET age_group = '1st-grade' WHERE age_group = '6-7';
--      -- UPDATE join_registrations SET age_group = '3rd-grade' WHERE age_group = '8-9';
--      -- UPDATE join_registrations SET age_group = '5th-grade' WHERE age_group = '10-11';
--
--    OPTION B — leave old rows as historical records with their original
--    age-range values, and just widen the constraint to allow both old and
--    new values (comment out step 3 below and use this instead):
--
--      -- ALTER TABLE join_registrations
--      --   ADD CONSTRAINT join_registrations_age_group_check
--      --   CHECK (age_group IN ('4-5','6-7','8-9','10-11',
--      --     'pre-k','kindergarten','1st-grade','2nd-grade','3rd-grade','4th-grade','5th-grade','6th-grade'));
--
--    If you do nothing here and run step 3 as-is, any existing rows with old
--    values will make step 3 FAIL (Postgres won't add a constraint that
--    existing data violates) — the whole migration rolls back safely, so
--    it's fine to try step 3 first and come back to this section if it fails.

-- 3. Add the new CHECK constraint with the 8 grade slugs.
ALTER TABLE join_registrations
  ADD CONSTRAINT join_registrations_age_group_check
  CHECK (age_group IN ('pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade'));

COMMIT;
