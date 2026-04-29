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

-- 인앱 채팅 테이블 (개인정보 보호 - 전화번호 미노출)
CREATE TABLE IF NOT EXISTS market_chats (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id      UUID NOT NULL,
  buyer_anon_id   TEXT NOT NULL,
  seller_anon_id  TEXT NOT NULL,
  last_message    TEXT,
  buyer_unread    INT  NOT NULL DEFAULT 0,
  seller_unread   INT  NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT market_chats_unique UNIQUE(listing_id, buyer_anon_id)
);

CREATE TABLE IF NOT EXISTS market_messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id         UUID NOT NULL,
  sender_anon_id  TEXT NOT NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE market_chats    DISABLE ROW LEVEL SECURITY;
ALTER TABLE market_messages DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_market_chats_buyer  ON market_chats(buyer_anon_id);
CREATE INDEX IF NOT EXISTS idx_market_chats_seller ON market_chats(seller_anon_id);
CREATE INDEX IF NOT EXISTS idx_market_msgs_chat    ON market_messages(chat_id, created_at);
