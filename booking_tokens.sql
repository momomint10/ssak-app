-- ════════════════════════════════════════════════════════════════
-- booking_tokens 테이블 (실제 production 스키마와 일치)
-- 역할: 예약 견적 단축 URL 토큰 저장 (긴 query → 짧은 ?t=토큰)
-- 사용처: server.js의 /api/booking/token POST·GET
-- 작성일: 2026-05-02 (production 검증 후 갱신)
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS booking_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token       TEXT        UNIQUE NOT NULL,                              -- 8자 base62 단축 토큰
  quote_data  JSONB,                                                    -- {name, phone, size, type, price, companyName}
  expires_at  TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 만료 토큰 정리용 인덱스
CREATE INDEX IF NOT EXISTS idx_booking_tokens_expires ON booking_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_booking_tokens_token   ON booking_tokens(token);

-- RLS 활성화 + service_role만 접근 (server.js의 SUPABASE_SERVICE_KEY로 우회)
ALTER TABLE booking_tokens ENABLE ROW LEVEL SECURITY;

-- (선택) 만료 토큰 자동 정리: 매일 cron 또는 수동 실행
-- DELETE FROM booking_tokens WHERE expires_at < NOW();
