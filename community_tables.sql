-- 커뮤니티 테이블 (제목+본문+이미지 지원)
CREATE TABLE IF NOT EXISTS community_posts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anon_id       TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT '일반',
  title         TEXT,
  content       TEXT NOT NULL,
  image_url     TEXT,
  like_count    INT  NOT NULL DEFAULT 0,
  comment_count INT  NOT NULL DEFAULT 0,
  deleted       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_comments (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID NOT NULL,
  anon_id    TEXT NOT NULL,
  content    TEXT NOT NULL,
  deleted    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_likes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID NOT NULL,
  anon_id    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT community_likes_unique UNIQUE(post_id, anon_id)
);

-- 기존 테이블에 컬럼 추가 (이미 존재하면 무시)
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_comm_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comm_likes_post    ON community_likes(post_id);

-- RLS 비활성화 (서버에서 service key로 접근)
ALTER TABLE community_posts    DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes    DISABLE ROW LEVEL SECURITY;
