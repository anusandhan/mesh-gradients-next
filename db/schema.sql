-- Gradients Studio schema. Idempotent: safe to run repeatedly.

CREATE TABLE IF NOT EXISTS users (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clerk_user_id text NOT NULL UNIQUE,
  email         text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- pro_until is written ONLY by the Stripe webhook handler.
CREATE TABLE IF NOT EXISTS entitlements (
  user_id           bigint PRIMARY KEY REFERENCES users(id),
  pro_until         timestamptz NOT NULL,
  stripe_payment_id text,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Monthly free-tier export counters, keyed by UTC month.
CREATE TABLE IF NOT EXISTS export_usage (
  user_id bigint NOT NULL REFERENCES users(id),
  month   text NOT NULL, -- 'YYYY-MM' (UTC)
  count   integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, month)
);

-- Processed Stripe webhook event ids (replay protection).
CREATE TABLE IF NOT EXISTS stripe_events (
  event_id     text PRIMARY KEY,
  processed_at timestamptz NOT NULL DEFAULT now()
);
