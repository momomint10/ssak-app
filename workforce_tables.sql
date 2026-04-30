-- 인력 프로필
CREATE TABLE IF NOT EXISTS worker_profiles (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anon_id       TEXT NOT NULL UNIQUE,
  nickname      TEXT NOT NULL,
  regions       TEXT[] NOT NULL DEFAULT '{}',
  skills        TEXT[] NOT NULL DEFAULT '{}',
  experience    INT  NOT NULL DEFAULT 0,
  daily_rate    INT  NOT NULL DEFAULT 0,
  available_days TEXT[] NOT NULL DEFAULT '{}',
  bio           TEXT DEFAULT '',
  avatar_emoji  TEXT DEFAULT '🧹',
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 인력매칭 채팅방
CREATE TABLE IF NOT EXISTS worker_chats (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id         UUID NOT NULL,
  worker_anon_id    TEXT NOT NULL,
  requester_anon_id TEXT NOT NULL,
  last_message      TEXT,
  worker_unread     INT  NOT NULL DEFAULT 0,
  requester_unread  INT  NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT worker_chats_unique UNIQUE(worker_id, requester_anon_id)
);

-- 인력매칭 채팅 메시지
CREATE TABLE IF NOT EXISTS worker_messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id         UUID NOT NULL,
  sender_anon_id  TEXT NOT NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE worker_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE worker_chats    DISABLE ROW LEVEL SECURITY;
ALTER TABLE worker_messages DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_worker_profiles_status ON worker_profiles(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_anon   ON worker_profiles(anon_id);
CREATE INDEX IF NOT EXISTS idx_worker_chats_worker    ON worker_chats(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_chats_requester ON worker_chats(requester_anon_id);
CREATE INDEX IF NOT EXISTS idx_worker_msgs_chat       ON worker_messages(chat_id, created_at);
