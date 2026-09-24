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

-- One unique link per approved family, leading to a Stripe Checkout session.
-- registration_type + registration_id point back at the original signup row
-- so the payment page can show the right family/program details.
CREATE TABLE IF NOT EXISTS payment_links (
  id                     SERIAL PRIMARY KEY,
  token                  TEXT UNIQUE NOT NULL,
  registration_type      TEXT NOT NULL CHECK (registration_type IN ('skills', 'join')),
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
