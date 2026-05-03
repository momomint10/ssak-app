-- 인력 프로필 v2: available_times, contact 컬럼 추가
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS available_times TEXT[] DEFAULT '{}';
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS contact TEXT DEFAULT '';
