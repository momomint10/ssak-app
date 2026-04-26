-- 커뮤니티 게시글
CREATE TABLE IF NOT EXISTS community_posts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anon_id      TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT '자유',
  title        TEXT,
  content      TEXT NOT NULL,
  like_count   INT  NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  deleted      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 댓글
CREATE TABLE IF NOT EXISTS community_comments (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  anon_id    TEXT NOT NULL,
  content    TEXT NOT NULL,
  deleted    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 좋아요 (중복 방지)
CREATE TABLE IF NOT EXISTS community_likes (
  id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id  UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  anon_id  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, anon_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_created   ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category  ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_comments_post   ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post      ON community_likes(post_id);

-- RLS 비활성화 (서버에서 service key로 접근)
ALTER TABLE community_posts    DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes    DISABLE ROW LEVEL SECURITY;
