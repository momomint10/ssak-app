-- 채용공고
CREATE TABLE IF NOT EXISTS job_posts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anon_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  region      TEXT NOT NULL,
  work_date   DATE NOT NULL,
  headcount   INT  NOT NULL DEFAULT 1,
  daily_rate  INT  NOT NULL DEFAULT 0,
  skills      TEXT[] NOT NULL DEFAULT '{}',
  description TEXT DEFAULT '',
  contact     TEXT DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ DEFAULT now()
);
-- 지원서
CREATE TABLE IF NOT EXISTS job_applications (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id            UUID NOT NULL,
  applicant_anon_id TEXT NOT NULL,
  applicant_contact TEXT NOT NULL,
  worker_nickname   TEXT DEFAULT '구직자',
  message           TEXT DEFAULT '',
  status            TEXT NOT NULL DEFAULT 'pending',
  employer_contact  TEXT DEFAULT '',
  matched_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT job_app_unique UNIQUE(job_id, applicant_anon_id)
);
-- worker_profiles에 contact 컬럼 추가
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS contact TEXT DEFAULT '';

ALTER TABLE job_posts         DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications  DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_job_posts_status    ON job_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_posts_region    ON job_posts(region);
CREATE INDEX IF NOT EXISTS idx_job_app_job         ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_app_applicant   ON job_applications(applicant_anon_id);
