CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  device_id   TEXT,
  anon_id     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subs_anon     ON push_subscriptions(anon_id);
