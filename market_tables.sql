-- 중고거래 테이블 (수수료 없음)
CREATE TABLE IF NOT EXISTS market_listings (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anon_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  price       INT  NOT NULL,
  category    TEXT NOT NULL DEFAULT '기타',
  image_url   TEXT,
  contact     TEXT DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'available', -- available | reserved | sold | deleted
  views       INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE market_listings DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_market_listings_status ON market_listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_listings_anon   ON market_listings(anon_id);
CREATE INDEX IF NOT EXISTS idx_market_listings_cat    ON market_listings(category);
