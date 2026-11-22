# JongTak-Lim · 포트폴리오 사이트

> 결과라는 점(Dot)보다, 성장의 선(Line)을 그리는 개발자 임종탁입니다.

방문자용 포트폴리오와 콘텐츠 관리용 관리자 페이지를 갖춘 풀스택 웹 서비스입니다.
콘텐츠는 모두 DB에 저장되므로 코드를 고치지 않고 `/admin`에서 수정할 수 있습니다.

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend | Node.js 22+, Express 5, TypeScript, Zod(입력 검증) |
| Database | SQLite (Node 내장 `node:sqlite`, 네이티브 모듈 설치 불필요) |
| 인증·보안 | JWT(httpOnly 쿠키), bcrypt, helmet(CSP), express-rate-limit, 허니팟 스팸 방지 |

## 기능

**방문자 화면**
- Hero (점 → 선 애니메이션), About, Skills, The Start of Line, Projects, Experience 타임라인, Growing Together, Awards, Future Line, GitHub, 방명록, Contact
- 프로젝트 상세 페이지 `/projects/:slug` (Problem / Process / Insight, 좋아요, 조회수, 이전·다음)
- 라이트·다크 모드, 반응형, 스크롤 진행 바, 등장 애니메이션 (`prefers-reduced-motion` 지원)

**백엔드 처리**
- 포트폴리오 콘텐츠 API (프로필·프로젝트·경력·수상·기술)
- 방명록: 작성·페이지네이션, 비밀번호로 본인 삭제, 관리자 답글·숨김
- 문의 폼: DB 저장 + 선택적으로 Slack/Discord 웹훅 알림
- 방문 통계: 원본 IP 대신 일 단위 해시만 저장, 30분 내 중복 집계 방지
- 프로젝트 좋아요(1인 1회 토글), 조회수
- GitHub 공개 레포 자동 동기화 (6시간 주기 + 관리자 수동 동기화)
- 요청 횟수 제한 (로그인, 글쓰기, 좋아요)

**관리자 `/admin`**
- 대시보드: 방문자·페이지뷰·일별 그래프·많이 본 페이지·유입 경로·프로젝트 반응
- 프로젝트 / 경력 / 수상 / 기술 CRUD, 프로필(메인 문구 등) 편집
- 문의함(읽음 처리, 메일 답장), 방명록 관리, GitHub 레포 숨김, 비밀번호 변경

## DB 스키마

| 테이블 | 용도 |
|---|---|
| `settings` | 프로필 JSON (메인 문구, 소개, 철학 섹션 등) |
| `admins` | 관리자 계정 (bcrypt 해시) |
| `projects` | 프로젝트 (JSON 컬럼: problem, process, highlights, tech) |
| `experiences` / `awards` / `skills` | 경력·활동 / 수상·자격·수료 / 기술 스택 |
| `guestbook` | 방명록 (비밀번호 해시, 숨김, 답글) |
| `messages` | 문의 |
| `page_views` | 방문 기록 (경로, 방문자 해시, 유입 경로) |
| `project_likes` | 좋아요 (프로젝트 + 방문자 해시 PK) |
| `github_repos` | GitHub 레포 캐시 |

스키마는 `server/src/db.ts`의 `MIGRATIONS` 배열로 관리합니다 (`PRAGMA user_version`).

## 실행

Node.js **22.5 이상**이 필요합니다.

```bash
npm install
cp server/.env.example server/.env   # 값 수정
npm run dev        # API :4000 + Vite :5173 (프록시 연결)
```

- 사이트: http://localhost:5173
- 관리자: http://localhost:5173/admin (개발 기본값 `admin` / `admin1234`)
- 첫 실행 때 DB를 만들고 `server/src/seed-data.ts` 내용(PDF·이력서·GitHub 기반)을 넣습니다.
- 콘텐츠를 seed 내용으로 초기화: `npm run seed` (방명록·문의·통계는 유지)

### 배포 (단일 서버)

```bash
npm run build
NODE_ENV=production JWT_SECRET=... ADMIN_PASSWORD=... npm start
```

프로덕션에서는 Express가 빌드된 클라이언트(`client/dist`)까지 함께 서빙합니다.
`JWT_SECRET`, `ADMIN_PASSWORD`가 없으면 서버가 시작되지 않습니다.
SQLite 파일(`DB_PATH`)이 남아 있어야 하므로, 디스크가 유지되는 환경(VPS, Railway/Fly.io 볼륨 등)에 배포하세요.

## 폴더 구조

```
server/src
  index.ts        앱 진입점, 정적 파일 서빙
  db.ts           SQLite 연결, 마이그레이션
  seed-data.ts    초기 콘텐츠
  github.ts       GitHub 동기화
  routes/         public · community(방명록/문의) · admin(인증/CRUD/통계)
client/src
  components/     Layout, Sections, Community, Icons
  pages/          Home, ProjectDetail, admin/
  styles/         global.css (디자인 토큰, 다크 모드)
client/public/images  포트폴리오 PDF에서 추출한 이미지
```
