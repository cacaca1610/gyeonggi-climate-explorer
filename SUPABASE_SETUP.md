# Supabase 연동 가이드

## 1. Supabase 프로젝트 생성

### 1.1 회원가입 및 프로젝트 생성
1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인
4. "New Project" 클릭
5. 프로젝트 정보 입력:
   - **Name**: gyeonggi-climate (원하는 이름)
   - **Database Password**: 안전한 비밀번호 생성
   - **Region**: Northeast Asia (Seoul) 선택
   - **Pricing Plan**: Free 선택

### 1.2 프로젝트 생성 대기
- 약 2-3분 소요
- 완료되면 대시보드로 이동

---

## 2. 데이터베이스 테이블 생성

### 2.1 SQL Editor 접속
1. 좌측 메뉴에서 **SQL Editor** 클릭
2. "New query" 클릭

### 2.2 스키마 실행
1. 프로젝트 루트의 `supabase-schema.sql` 파일 열기
2. 전체 내용 복사
3. SQL Editor에 붙여넣기
4. 우측 하단 **"RUN"** 버튼 클릭

### 2.3 테이블 확인
1. 좌측 메뉴에서 **Table Editor** 클릭
2. `game_sessions` 테이블이 생성되었는지 확인
3. 컬럼 확인:
   - id (UUID, Primary Key)
   - character (VARCHAR)
   - name (VARCHAR)
   - location (VARCHAR, nullable)
   - step (INTEGER)
   - quiz_results (JSONB, nullable)
   - completed_at (TIMESTAMP, nullable)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

---

## 3. API 키 가져오기

### 3.1 Project Settings 접속
1. 좌측 하단 톱니바퀴 아이콘 클릭 (Settings)
2. **API** 메뉴 클릭

### 3.2 API 키 복사
다음 두 값을 복사하세요:

1. **Project URL**
   ```
   https://xxxxxxxxxxxxxxxx.supabase.co
   ```

2. **anon public** (공개 키)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
   ```

⚠️ **주의**: `service_role` 키는 절대 프론트엔드에 노출하지 마세요!

---

## 4. 환경변수 설정

### 4.1 .env.local 파일 생성
프로젝트 루트에 `.env.local` 파일 생성:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...

# 백엔드 API 사용 (선택사항)
NEXT_PUBLIC_USE_BACKEND=true
```

### 4.2 .gitignore 확인
`.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인:

```
.env.local
.env*.local
```

---

## 5. 서버 재시작

```bash
npm run dev
```

서버 로그에서 다음 메시지 확인:
```
🗄️  Supabase 데이터베이스 사용
```

---

## 6. 테스트

### 6.1 관리자 대시보드 접속
```
http://localhost:3001/admin
```

### 6.2 게임 플레이
1. 메인 화면에서 게임 시작
2. 캐릭터 선택 및 이름 입력
3. 위치 선택
4. 퀴즈 완료
5. 관리자 대시보드에서 데이터 확인

### 6.3 Supabase 대시보드 확인
1. Supabase 대시보드의 **Table Editor** 접속
2. `game_sessions` 테이블에 데이터가 저장되었는지 확인

---

## 7. 문제 해결

### 7.1 "Supabase 환경변수가 설정되지 않았습니다" 메시지
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 환경변수 이름이 정확한지 확인 (`NEXT_PUBLIC_` 접두사 필수)
- 서버 재시작

### 7.2 데이터가 저장되지 않음
- SQL 스키마가 올바르게 실행되었는지 확인
- API 키가 올바른지 확인
- 브라우저 콘솔에서 오류 메시지 확인
- Supabase 대시보드의 **Logs** 메뉴에서 에러 확인

### 7.3 CORS 오류
- Supabase는 기본적으로 모든 도메인 허용
- 문제 지속 시 Supabase Settings > API > CORS 확인

---

## 8. Supabase vs 인메모리 스토어 비교

| 기능 | 인메모리 | Supabase |
|------|---------|----------|
| 설정 난이도 | ✅ 쉬움 | ⚠️ 보통 |
| 데이터 영구성 | ❌ 서버 재시작 시 삭제 | ✅ 영구 저장 |
| 동시 사용자 | ⚠️ 제한적 | ✅ 무제한 |
| 통계 | ✅ 기본 | ✅ 고급 쿼리 가능 |
| 비용 | ✅ 무료 | ✅ Free tier (월 500MB, 2GB 전송) |
| 확장성 | ❌ 낮음 | ✅ 높음 |

---

## 9. 추가 기능 (선택사항)

### 9.1 리더보드 구현
```sql
-- 상위 10명 조회
SELECT name, location, created_at
FROM game_sessions
WHERE completed_at IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

### 9.2 실시간 구독
```typescript
// 새 게임 세션 실시간 구독
const subscription = supabase
  .from('game_sessions')
  .on('INSERT', (payload) => {
    console.log('새 게임:', payload.new);
  })
  .subscribe();
```

### 9.3 인증 추가
- Supabase Auth로 로그인 기능 구현
- 사용자별 게임 기록 관리

---

## 10. 운영 환경 배포 (Vercel)

### 10.1 Vercel 환경변수 설정
1. Vercel 대시보드 접속
2. 프로젝트 선택
3. **Settings > Environment Variables**
4. 다음 변수 추가:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_USE_BACKEND=true
   ```

### 10.2 재배포
```bash
git add .
git commit -m "Add Supabase integration"
git push
```

---

## 완료! 🎉

이제 Supabase를 사용하여 게임 데이터를 영구적으로 저장할 수 있습니다!

**다음 단계:**
- 리더보드 페이지 구현
- 사용자 인증 추가
- 실시간 통계 대시보드
