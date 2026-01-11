-- 경기도 기후 탐험대 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. game_sessions 테이블 생성
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character VARCHAR(50) NOT NULL,
  name VARCHAR(50) NOT NULL,
  location VARCHAR(200),
  step INTEGER DEFAULT 1,
  quiz_results JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at
  ON game_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_game_sessions_completed_at
  ON game_sessions(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_game_sessions_character
  ON game_sessions(character);

CREATE INDEX IF NOT EXISTS idx_game_sessions_location
  ON game_sessions(location);

-- 3. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 트리거 생성
DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON game_sessions;

CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS (Row Level Security) 활성화
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- 6. 정책 생성 (모든 사용자가 읽기/쓰기 가능)
CREATE POLICY "게임 세션은 누구나 조회할 수 있습니다"
  ON game_sessions FOR SELECT
  USING (true);

CREATE POLICY "게임 세션은 누구나 생성할 수 있습니다"
  ON game_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "게임 세션은 누구나 업데이트할 수 있습니다"
  ON game_sessions FOR UPDATE
  USING (true);

CREATE POLICY "게임 세션은 누구나 삭제할 수 있습니다"
  ON game_sessions FOR DELETE
  USING (true);

-- 7. 샘플 데이터 (선택사항)
-- INSERT INTO game_sessions (character, name, location, step, completed_at)
-- VALUES
--   ('햇빛이', '테스트유저1', '수원시 장안구 파장동', 3, NOW()),
--   ('물방울이', '테스트유저2', '성남시 분당구 정자동', 2, NULL);

-- 8. 통계 뷰 생성 (선택사항)
CREATE OR REPLACE VIEW game_stats AS
SELECT
  COUNT(*) as total_games,
  COUNT(completed_at) as completed_games,
  COUNT(*) - COUNT(completed_at) as in_progress_games,
  COUNT(DISTINCT character) as unique_characters,
  COUNT(DISTINCT location) as unique_locations
FROM game_sessions;

-- 완료!
-- 이제 Supabase Dashboard에서 테이블을 확인할 수 있습니다.
