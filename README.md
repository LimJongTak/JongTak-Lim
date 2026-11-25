# JongTak-Lim · 포트폴리오 사이트

> 결과라는 점(Dot)보다, 성장의 선(Line)을 그리는 개발자 임종탁입니다.

방문자용 포트폴리오와 콘텐츠 관리용 관리자 페이지를 갖춘 풀스택 웹 서비스입니다.
콘텐츠는 모두 DB에 저장되므로 코드를 고치지 않고 `/admin`에서 수정할 수 있습니다.

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend | Node.js 22+, Express 5, TypeScript, Zod(입력 검증) |
| Database | Firebase Firestore (firebase-admin, 서버에서만 접근) |
| 배포 | Firebase App Hosting (`apphosting.yaml`) |
| 인증·보안 | JWT(httpOnly 쿠키), bcrypt, helmet(CSP), express-rate-limit, 허니팟 스팸 방지 |

## 기능

**방문자 화면**
- Hero (점 → 선 애니메이션), About, Skills, The Start of Line, Projects, Experience 타임라인, Growing Together, Awards, Future Line, GitHub, 방명록, Contact
- 프로젝트 상세 페이지 `/projects/:slug` (Problem / Process / Insight, 화면 갤러리, 좋아요, 조회수, 이전·다음)
- 활동 블로그 `/blog`, `/blog/:slug` (분류 필터, 사진 갤러리·라이트박스) + 메인의 Activity Log 섹션
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
- 프로젝트 / 블로그 / 경력 / 수상 / 기술 CRUD, 프로필(메인 문구 등) 편집
- 문의함(읽음 처리, 메일 답장), 방명록 관리, GitHub 레포 숨김, 비밀번호 변경

## DB (Firestore 컬렉션)

| 컬렉션 | 용도 |
|---|---|
| `settings` | `profile`(메인 문구·소개 등 JSON), `migrations`(적용한 콘텐츠 마이그레이션 id) |
| `admins` | 관리자 계정 (bcrypt 해시) |
| `projects` | 프로젝트 (problem, process, highlights, tech, images 배열) |
| `posts` | 활동 블로그 글 (본문 마크다운, images 배열) |
| `experiences` / `awards` / `skills` | 경력·활동 / 수상·자격·수료 / 기술 스택 |
| `guestbook` / `messages` | 방명록 / 문의 |
| `page_views` / `project_likes` | 방문 기록 / 좋아요 |
| `github_repos` | GitHub 레포 캐시 |

- 서버가 시작될 때 비어 있는 컬렉션만 `server/src/seed-data.ts`, `seed-posts.ts` 내용으로 채웁니다.
- 이미 운영 중인 DB에 새 콘텐츠를 넣어야 할 때는 `server/src/seed.ts`의 `CONTENT_MIGRATIONS`에 항목을 추가합니다. 한 번 적용되면 `settings/migrations`에 기록되어 다시 실행되지 않습니다.

## 블로그 글 쓰기

`/admin` → **블로그** 탭에서 쓰고 고칩니다. 본문 문법:

| 쓰는 법 | 결과 |
|---|---|
| 빈 줄 | 문단 구분 |
| `## 소제목` | 소제목 |
| `> 문장` | 인용 상자 |
| `- 항목` | 목록 |
| `**굵게**` | 강조 |
| `![캡션](/images/activities/폴더/파일.webp)` | 본문 사진 한 장 |
| `[[gallery]]` | "사진" 칸에 넣은 사진 묶음이 이 위치에 표시 |

사진 파일은 `client/public/images/activities/<글 이름>/`에 넣고, 관리자 "사진" 칸에 한 줄씩 `경로 | 캡션`으로 적습니다.

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

### 배포 (Firebase App Hosting)

App Hosting은 `server/`만 보고, **미리 빌드해서 커밋한** `server/dist`(서버)와 `server/public`(프론트)을 실행합니다.
코드나 이미지를 바꿨다면 반드시 다시 빌드해서 함께 커밋하세요.

```bash
npm run build:deploy   # client 빌드 → server/public 복사, server/dist 컴파일
git add -A && git commit -m "..." && git push origin main
```

`main`에 푸시하면 App Hosting이 새로 배포합니다. 비밀 값(`JWT_SECRET`, `ADMIN_PASSWORD`, `HASH_SALT`)은 `apphosting.yaml`의 secret으로 관리합니다.

## 폴더 구조

```
server/src
  index.ts        앱 진입점, 정적 파일 서빙
  db.ts           Firestore 연결
  seed.ts         초기 콘텐츠 삽입, 콘텐츠 마이그레이션
  seed-data.ts    초기 콘텐츠 (프로필·프로젝트·경력 등)
  seed-posts.ts   활동 블로그 초기 글
  github.ts       GitHub 동기화
  routes/         public · community(방명록/문의) · admin(인증/CRUD/통계)
client/src
  components/     Layout, Sections, Community, Icons
  pages/          Home, ProjectDetail, Blog, BlogPost, admin/
  styles/         global.css (디자인 토큰, 다크 모드)
client/public/images             포트폴리오 PDF에서 추출한 이미지
client/public/images/activities  활동·프로젝트 사진 (MyWay, RE:POINT 기획서에서 추출)
```

## 미리보기 빌드 (서버 없이 열어보기)

```bash
npm run build:preview   # → preview/index.html + preview/images
```

API 호출을 브라우저 안의 가짜 백엔드(`client/src/lib/demo.ts`)로 바꾼 단일 HTML을 만듭니다.
방명록·문의·좋아요·관리자 수정은 그 브라우저의 localStorage에만 저장됩니다. 관리자 계정은 `admin` / `admin1234`입니다.
프로덕션 빌드(`npm run build`)에는 데모 코드가 포함되지 않습니다.
