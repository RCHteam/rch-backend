CREATE TABLE IF NOT EXISTS skills_registrations (
  id            SERIAL PRIMARY KEY,
  full_name     TEXT NOT NULL,
  dob           DATE NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL,
  team          TEXT NOT NULL,
  experience    TEXT NOT NULL,
  notes         TEXT NOT NULL,
  jersey_number TEXT,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS join_registrations (
  id               SERIAL PRIMARY KEY,
  age_group        TEXT NOT NULL CHECK (age_group IN ('pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade')),
  child_name       TEXT NOT NULL,
  dob              DATE NOT NULL,
  motivation       TEXT NOT NULL,
  experience        TEXT,
  availability     TEXT,
  parent_name      TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  emergency_name   TEXT NOT NULL,
  emergency_phone  TEXT NOT NULL,
  medical          TEXT NOT NULL,
  jersey_number    TEXT,
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_join_age_group ON join_registrations(age_group);
CREATE INDEX IF NOT EXISTS idx_skills_submitted_at ON skills_registrations(submitted_at);
CREATE INDEX IF NOT EXISTS idx_join_submitted_at ON join_registrations(submitted_at);

-- Simple key/value store for site-wide toggles (e.g. turning Skills Training
-- registration on/off from the admin dashboard).
CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO site_settings (key, value) VALUES ('skills_training_open', 'true')
ON CONFLICT (key) DO NOTHING;

-- Same pattern, for the Join Sultans FC registration form.
INSERT INTO site_settings (key, value) VALUES ('join_registration_open', 'true')
ON CONFLICT (key) DO NOTHING;

-- One unique link per approved family, leading to a Stripe Checkout session.
-- registration_type + registration_id point back at the original signup row
-- so the payment page can show the right family/program details.
CREATE TABLE IF NOT EXISTS payment_links (
  id                     SERIAL PRIMARY KEY,
  token                  TEXT UNIQUE NOT NULL,
  registration_type      TEXT NOT NULL CHECK (registration_type IN ('skills', 'join', 'player')),
  registration_id        INTEGER NOT NULL,
  child_name             TEXT NOT NULL,
  parent_name            TEXT,
  email                  TEXT NOT NULL,
  program_label          TEXT NOT NULL,
  one_time_amount_cents  INTEGER NOT NULL,
  monthly_amount_cents   INTEGER NOT NULL,
  season_end_date        DATE NOT NULL,
  status                 TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'canceled')),
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  stripe_checkout_session_id TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at           TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_links_token ON payment_links(token);

-- Tracks whether the family's most recent MONTHLY charge (after the initial
-- checkout) succeeded or failed, so /admin can flag a lapsed payment instead
-- of showing "Paid" forever once the first charge goes through.
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS last_payment_status TEXT;
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMPTZ;

-- Set while an admin has paused a family's monthly billing (e.g. winter
-- break travel) — Stripe skips charges until this date, then resumes
-- automatically.
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS paused_until DATE;

-- Confirmed/active players roster — separate from the registrations tables
-- above (which are the public signup intake). This is the day-to-day
-- managed list of enrolled players, mirroring the club's per-grade roster
-- spreadsheet (name, DOB, parent contact, program enrollment, sessions,
-- discount).
CREATE TABLE IF NOT EXISTS players (
  id             SERIAL PRIMARY KEY,
  grade          TEXT NOT NULL CHECK (grade IN ('pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade')),
  player_name    TEXT NOT NULL,
  dob            DATE,
  parent_name    TEXT,
  parent_phone   TEXT,
  parent_email   TEXT,
  session_type   TEXT NOT NULL DEFAULT 'one' CHECK (session_type IN ('one', 'two')),
  rch            BOOLEAN NOT NULL DEFAULT false,
  sultans        BOOLEAN NOT NULL DEFAULT false,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_players_grade ON players(grade);

-- Per-session prices used to compute the revenue table from roster counts
-- (admin-editable from the dashboard, same pattern as the Skills Training
-- toggle above).
INSERT INTO site_settings (key, value) VALUES ('price_one_session_cents', '15000') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('price_two_session_cents', '25000') ON CONFLICT (key) DO NOTHING;

-- Migration: the payment_links table already existed on the live database
-- with registration_type limited to ('skills', 'join'), so CREATE TABLE IF
-- NOT EXISTS above won't widen it. Drop and re-add the check constraint to
-- also allow 'player' (payment links sent straight from the Players Roster).
ALTER TABLE payment_links DROP CONSTRAINT IF EXISTS payment_links_registration_type_check;
ALTER TABLE payment_links ADD CONSTRAINT payment_links_registration_type_check
  CHECK (registration_type IN ('skills', 'join', 'player'));

-- Amounts used when generating a payment link (kit fee + the two monthly
-- tiers) — separate from price_one/two_session_cents above, which only
-- drive the Revenue projection table from roster counts. Admin-editable from
-- the "Payment Link Amounts" box so a price change (e.g. next season's rate)
-- never needs a code deploy. Starting at October's agreed rate: $60/mo for
-- one session, $100/mo for two, no kit fee charged until November.
INSERT INTO site_settings (key, value) VALUES ('payment_one_session_monthly_cents', '6000') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('payment_two_session_monthly_cents', '10000') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('kit_fee_cents', '5000') ON CONFLICT (key) DO NOTHING;

-- Online-only course option (recurring monthly, no kit fee) — same
-- session-based proration and admin-editable pricing as the in-person tiers.
INSERT INTO site_settings (key, value) VALUES ('payment_online_course_monthly_cents', '3120') ON CONFLICT (key) DO NOTHING;

-- Session-based proration: when a family's first payment is completed, the
-- full-price subscription is deferred to start on next_billing_anchor
-- (instead of charging a calendar-day-prorated amount immediately) —
-- prorated_amount_cents records what was actually charged for this month,
-- for admin visibility.
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS next_billing_anchor DATE;
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS prorated_amount_cents INTEGER;

-- Proration lock mode ("Option B"): while 'locked', the this-month amount
-- (and its anchor date) is calculated once, at the moment the admin
-- generates the payment link, and stored below — so a family that delays
-- paying for a few days still owes what was shown to them, instead of a
-- smaller number recalculated at checkout time. Switch back to 'live' once
-- initial enrollment settles, so new signups go back to paying exactly for
-- whatever practices are left as of the moment they actually pay.
INSERT INTO site_settings (key, value) VALUES ('proration_lock_mode', 'locked') ON CONFLICT (key) DO NOTHING;

ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS locked_amount_cents INTEGER;
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS locked_practices_remaining INTEGER;
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS locked_practices_total INTEGER;
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS locked_anchor_date DATE;

-- "Move to Roster" workflow: Skills Training / Join Sultans FC registrations
-- are just applicants until an admin approves and moves them onto the actual
-- Players Roster. moved_at marks that move — the admin dashboard lists (and
-- the summary's "Potential" counts) only show rows where this is still NULL,
-- so a moved applicant disappears from the pending list without losing its
-- original submission data.
ALTER TABLE skills_registrations ADD COLUMN IF NOT EXISTS moved_at TIMESTAMPTZ;
ALTER TABLE join_registrations ADD COLUMN IF NOT EXISTS moved_at TIMESTAMPTZ;

-- Unsubscribed / quit players: archived instead of deleted, so history and
-- past revenue attribution isn't lost. Archived players are hidden from the
-- main roster and shown instead in the "Data" section.
ALTER TABLE players ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Widen session_type to also allow 'online' (the Online Course option), same
-- migration pattern as the payment_links.registration_type widening above.
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_session_type_check;
ALTER TABLE players ADD CONSTRAINT players_session_type_check
  CHECK (session_type IN ('one', 'two', 'online'));

-- Coaches directory (dashboard "Coaches" section).
CREATE TABLE IF NOT EXISTS coaches (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  grades     TEXT[] NOT NULL DEFAULT '{}',
  rch        BOOLEAN NOT NULL DEFAULT false,
  sultans    BOOLEAN NOT NULL DEFAULT false,
  notes      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Monthly charges (dashboard "Charges" section, under Finances) — mirrors the
-- recurring-vs-one-time expense spreadsheet. A 'recurring' charge applies to
-- every month from its creation onward; a 'one_time' charge applies only to
-- the specific charge_month it's tagged with. These are subtracted from
-- estimated roster revenue to get net income for a given month.
CREATE TABLE IF NOT EXISTS charges (
  id            SERIAL PRIMARY KEY,
  description   TEXT NOT NULL,
  amount_cents  INTEGER NOT NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('recurring', 'one_time')),
  charge_month  DATE, -- required for one_time, ignored for recurring
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Monthly snapshots — an archived record of the roster + estimated revenue/
-- charges/net for a given month, generated automatically at month-end (or
-- manually via "Generate this month's snapshot now" in the Data section) so
-- there's a permanent month-by-month history even as the live roster changes.
CREATE TABLE IF NOT EXISTS monthly_snapshots (
  id                  SERIAL PRIMARY KEY,
  month               DATE NOT NULL UNIQUE, -- first-of-month marker
  roster_json         JSONB NOT NULL,
  total_revenue_cents INTEGER NOT NULL,
  total_charges_cents INTEGER NOT NULL,
  net_cents           INTEGER NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Collect grade + sessions-per-week directly from parents at signup time,
-- instead of the admin having to ask for it later when moving an applicant
-- onto the Players Roster. Skills Training has no grade column at all yet;
-- Join Sultans FC already has age_group (its grade), so it only needs
-- session_type added. Both are nullable at the DB level (existing rows have
-- neither) — the public forms require them going forward at the app layer.
ALTER TABLE skills_registrations ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE skills_registrations DROP CONSTRAINT IF EXISTS skills_registrations_grade_check;
ALTER TABLE skills_registrations ADD CONSTRAINT skills_registrations_grade_check
  CHECK (grade IS NULL OR grade IN ('pre-k', 'kindergarten', '1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade'));

ALTER TABLE skills_registrations ADD COLUMN IF NOT EXISTS session_type TEXT;
ALTER TABLE skills_registrations DROP CONSTRAINT IF EXISTS skills_registrations_session_type_check;
ALTER TABLE skills_registrations ADD CONSTRAINT skills_registrations_session_type_check
  CHECK (session_type IS NULL OR session_type IN ('one', 'two', 'online'));

ALTER TABLE join_registrations ADD COLUMN IF NOT EXISTS session_type TEXT;
ALTER TABLE join_registrations DROP CONSTRAINT IF EXISTS join_registrations_session_type_check;
ALTER TABLE join_registrations ADD CONSTRAINT join_registrations_session_type_check
  CHECK (session_type IS NULL OR session_type IN ('one', 'two', 'online'));

-- Skills Training never had a separate parent/guardian name field (unlike
-- Join Sultans FC, which already has parent_name) — full_name has always
-- been the PLAYER's name. Add parent_name so Move to Roster gets both
-- names directly from the parent at signup instead of the admin having to
-- type the parent's name in by hand. Nullable for existing rows; required
-- at the app layer going forward.
ALTER TABLE skills_registrations ADD COLUMN IF NOT EXISTS parent_name TEXT;

-- Stand-alone one-time payment links (Finances tab) — not tied to a
-- registration or a recurring subscription at all. Used for one-off charges
-- (a tournament fee, a replacement kit, a test charge) where the admin just
-- needs to collect a single payment of a given amount from whoever the link
-- is sent to.
CREATE TABLE IF NOT EXISTS one_time_payments (
  id                          SERIAL PRIMARY KEY,
  token                       TEXT UNIQUE NOT NULL,
  title                       TEXT NOT NULL,
  description                 TEXT NOT NULL DEFAULT '',
  amount_cents                INTEGER NOT NULL CHECK (amount_cents >= 0),
  status                      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  stripe_checkout_session_id  TEXT,
  stripe_customer_id          TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at                TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_one_time_payments_token ON one_time_payments(token);
