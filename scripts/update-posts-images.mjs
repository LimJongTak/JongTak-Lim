/**
 * Firestore 포스트·프로젝트 이미지 및 신규 포스트 업데이트
 * 사용법: GOOGLE_APPLICATION_CREDENTIALS="D:/JongTak-Lim/server/service-account.json" node scripts/update-posts-images.mjs
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) initializeApp({ projectId: 'jongtak-lim' });
const fdb = getFirestore();
const now = new Date().toISOString();

// ─── 기존 포스트 이미지 업데이트 ───────────────────────────────────
const postImageUpdates = [
  {
    slug: 'student-council-2025',
    cover: '/images/activities/student-council/01.webp',
    images: [
      { src: '/images/activities/student-council/01.webp', caption: '총학생회 부총학생회장 활동' },
      { src: '/images/activities/student-council/02.webp', caption: '전체간부수련회 LTC' },
      { src: '/images/activities/student-council/03.webp', caption: '학생회 간부 활동' },
      { src: '/images/activities/student-council/04.webp', caption: '총학생회 행사 운영' },
      { src: '/images/activities/student-council/05.webp', caption: '대동제 축제 준비' },
      { src: '/images/activities/student-council/06.webp', caption: '학생 소통 현장' },
      { src: '/images/activities/student-council/07.webp', caption: '이음 프로젝트 협력' },
      { src: '/images/activities/student-council/08.webp', caption: '총학생회 연말 활동' },
    ],
  },
  {
    slug: 'pedaleye-startup-300',
    cover: '/images/pedaleye.webp',
    images: [
      { src: '/images/activities/startup-300/01.webp', caption: '2025 교육부 학생창업유망팀 300+ 성장트랙 제품전시회' },
      { src: '/images/activities/startup-300/02.webp', caption: 'Pedaleye 팀 발표 현장' },
      { src: '/images/activities/pedaleye/01.webp', caption: '페달아이 웹사이트 메인' },
      { src: '/images/activities/pedaleye/02.webp', caption: '제품 소개 페이지' },
      { src: '/images/activities/pedaleye/03.webp', caption: '서비스 작동 방식' },
      { src: '/images/activities/pedaleye/04.webp', caption: '경쟁우위 분석' },
      { src: '/images/activities/pedaleye/05.webp', caption: '비즈니스 모델' },
      { src: '/images/activities/pedaleye/06.webp', caption: '팀 구성' },
    ],
  },
  {
    slug: 'kosaf-talent-volunteer',
    cover: '/images/activities/nh-volunteer/01.webp',
    images: [
      { src: '/images/activities/nh-volunteer/01.webp', caption: '한국장학재단 NH농협은행 재능봉사 활동' },
      { src: '/images/activities/nh-volunteer/02.webp', caption: '봉사 현장' },
      { src: '/images/activities/nh-volunteer/03.webp', caption: 'NH 봉사 팀 활동' },
      { src: '/images/activities/nh-volunteer/04.webp', caption: '학생 교육 활동' },
      { src: '/images/activities/nh-volunteer/05.webp', caption: '멘토-멘티 활동' },
      { src: '/images/activities/nh-volunteer/06.webp', caption: '수료식' },
      { src: '/images/activities/nh-talent-camp-2025/01.webp', caption: '2025 푸른등대 NH 초록사다리 캠프' },
      { src: '/images/activities/nh-talent-camp-2025/02.webp', caption: 'ESG 코인 마을 만들기 활동' },
      { src: '/images/activities/nh-talent-camp-2025/03.webp', caption: '환경 패션 프로그램' },
      { src: '/images/activities/nh-talent-camp-2025/04.webp', caption: '마인크래프트 코딩 프로그램' },
      { src: '/images/activities/talent-camp-2023/01.webp', caption: '2023 대학생 재능봉사 캠프' },
      { src: '/images/activities/talent-camp-2023/02.webp', caption: '2023 캠프 활동' },
    ],
  },
  {
    slug: 'care-center-mentor',
    cover: '/images/activities/youth-mentor/01.webp',
    images: [
      { src: '/images/activities/youth-mentor/01.webp', caption: '대학생청소년교육지원장학금 멘토 활동' },
      { src: '/images/activities/youth-mentor/02.webp', caption: '지역아동센터 멘토링 현장' },
    ],
  },
  {
    slug: 'pungunjaeja-youth-policy',
    cover: '/images/activities/youth-policy/01.webp',
    images: [
      { src: '/images/activities/youth-policy/01.webp', caption: '청년정책추진단 풍운재자 활동' },
      { src: '/images/activities/youth-policy/02.webp', caption: '청년 정책 토론' },
      { src: '/images/activities/youth-policy/03.webp', caption: '지역 청년 간담회' },
      { src: '/images/activities/youth-policy/04.webp', caption: '정책 발굴 현장' },
      { src: '/images/activities/youth-policy/05.webp', caption: '청년정책 발표' },
      { src: '/images/activities/youth-policy/06.webp', caption: '풍운재자 대표 활동' },
    ],
  },
  {
    slug: 'coding-club',
    cover: '/images/activities/coding-club/01.webp',
    images: [
      { src: '/images/activities/coding-club/01.webp', caption: '코딩 동아리 코마 활동' },
      { src: '/images/activities/coding-club/02.webp', caption: '그룹스터디 세션' },
    ],
  },
  {
    slug: 'computer-engineering-council',
    cover: '/images/activities/cs-council/01.webp',
    images: [
      { src: '/images/activities/cs-council/01.webp', caption: '컴퓨터공학과 학생회 활동' },
      { src: '/images/activities/cs-council/02.webp', caption: '학과 행사 운영' },
      { src: '/images/activities/cs-council/03.webp', caption: '학생회장 활동' },
      { src: '/images/activities/cs-council/04.webp', caption: '학과 MT' },
      { src: '/images/activities/cs-council/05.webp', caption: '과대표 업무' },
      { src: '/images/activities/cs-council/06.webp', caption: '학과 행사 현장' },
    ],
  },
  {
    slug: 'ieum-local-business',
    cover: '/images/ieum-app.webp',
    images: [
      { src: '/images/ieum-app.webp', caption: '이음 웹 서비스 메인 화면' },
      { src: '/images/ieum-map.webp', caption: '이음 지도 기반 업체 탐색' },
      { src: '/images/activities/local-issue/01.webp', caption: '지역현안 프로젝트 활동' },
      { src: '/images/activities/local-issue/02.webp', caption: '업체 협약 현장' },
      { src: '/images/activities/local-issue/03.webp', caption: '서화 대학로 상권 조사' },
      { src: '/images/activities/local-issue/04.webp', caption: '지역 상인 미팅' },
      { src: '/images/activities/local-issue/05.webp', caption: '이음 프로젝트 발표' },
      { src: '/images/activities/local-issue/06.webp', caption: '지역현안 해결 현장' },
    ],
  },
  {
    slug: 'repoint-likelion-13',
    images_add: [
      { src: '/images/activities/likelion/05.webp', caption: '멋쟁이사자처럼 13기 활동' },
      { src: '/images/activities/likelion/06.webp', caption: '해커톤 준비 현장' },
      { src: '/images/activities/likelion/07.webp', caption: '팀 개발 세션' },
      { src: '/images/activities/likelion/08.webp', caption: '멋사 연합 행사' },
    ],
  },
  {
    slug: 'myway-likelion-12',
    images_add: [
      { src: '/images/activities/likelion/01.webp', caption: '멋쟁이사자처럼 12기 대학 대표' },
      { src: '/images/activities/likelion/02.webp', caption: '12기 아이디어톤 예선 1위' },
      { src: '/images/activities/likelion/03.webp', caption: '워크홀릭팀 해커톤 본선' },
      { src: '/images/activities/likelion/04.webp', caption: 'MyWay 개발 현장' },
    ],
  },
];

// ─── 신규 포스트 ────────────────────────────────────────────────────
const newPosts = [
  {
    slug: 'ai-forum-suncheon-2026',
    title: '순천 AI 미래 도시 전략 포럼 — 현장에서 본 AI 도시의 그림',
    excerpt: '순천시가 개최한 AI 미래 도시 전략 포럼에 참석하여 지역 AI 생태계와 디지털 전환 전략을 논의했습니다.',
    category: 'etc',
    period: '2026',
    place: '순천',
    role: '참석자',
    tags: ['AI', '순천', '도시전략', '디지털전환'],
    cover: '/images/activities/ai-forum/01.webp',
    images: [
      { src: '/images/activities/ai-forum/01.webp', caption: '순천 AI 미래 도시 전략 포럼 현장' },
      { src: '/images/activities/ai-forum/02.webp', caption: '포럼 개막식' },
      { src: '/images/activities/ai-forum/03.webp', caption: 'AI 도시 전략 발표' },
      { src: '/images/activities/ai-forum/04.webp', caption: '전문가 패널 토론' },
      { src: '/images/activities/ai-forum/05.webp', caption: '지역 AI 생태계 논의' },
      { src: '/images/activities/ai-forum/06.webp', caption: '포럼 세션 현장' },
      { src: '/images/activities/ai-forum/07.webp', caption: '네트워킹 시간' },
      { src: '/images/activities/ai-forum/08.webp', caption: '포럼 마무리' },
    ],
    featured: false,
    body: `순천시가 개최한 **AI 미래 도시 전략 포럼**에 참석했습니다. 지역 대학생, 창업자, 행정 관계자, 전문가들이 모여 순천의 AI 기반 도시 전환 방향을 논의하는 자리였습니다.

## 무엇을 논의했나

포럼에서는 AI 기술을 활용한 지역 행정 서비스 혁신, 스마트 도시 인프라, 지역 청년 AI 인재 육성 방안 등이 다뤄졌습니다. 현장에서 직접 지역 전문가와 행정 관계자들의 이야기를 들으며 기술이 도시에 어떻게 접목되는지 체감할 수 있었습니다.

> 기술은 도시를 바꾸고, 도시는 사람을 바꾼다.

## 개발자로서 얻은 시각

단순히 개발 기술을 연마하는 것을 넘어, 개발한 서비스가 실제 도시와 지역사회에 어떤 영향을 미치는지 생각하게 된 계기였습니다. 지역에 뿌리를 두고 의미 있는 기술을 만드는 것이 제가 추구하는 방향임을 다시 확인했습니다.

[[gallery]]`,
  },
  {
    slug: 'foreign-student-mentor-2024',
    title: '외국인 유학생 학습튜터링 — 국경을 넘어 함께 배우다',
    excerpt: '국립순천대학교 외국인 유학생을 대상으로 학습 멘토링을 진행했습니다. 언어와 문화의 벽을 넘어 함께 성장한 경험입니다.',
    category: 'volunteer',
    period: '2024',
    place: '국립순천대학교',
    role: '학습 튜터',
    tags: ['외국인 유학생', '멘토링', '학습지원', '다문화'],
    cover: '/images/activities/foreign-mentor/01.webp',
    images: [
      { src: '/images/activities/foreign-mentor/01.webp', caption: '외국인 유학생 학습튜터링 현장' },
      { src: '/images/activities/foreign-mentor/02.webp', caption: '멘토-멘티 학습 세션' },
    ],
    featured: false,
    body: `국립순천대학교 외국인 유학생을 대상으로 **학습 튜터링**을 진행했습니다. 한국어와 전공 과목에 어려움을 겪는 외국인 유학생 멘티에게 주기적으로 학습을 지원했습니다.

## 언어보다 먼저 필요한 것

처음에는 언어 장벽이 가장 큰 문제일 것이라 생각했지만, 실제로는 **학습 방법과 대학 문화의 차이**가 더 큰 어려움이었습니다. 한국의 대학 수업 방식, 과제 제출 형식, 교수님과의 소통 방법 등을 함께 익혀 나갔습니다.

## 가르치며 배운 것

멘티를 가르치면서 제가 당연하게 알고 있던 것들을 처음부터 다시 설명해야 했습니다. 이 과정에서 오히려 제 자신의 이해가 더 깊어졌습니다. 가르치는 것이 최고의 학습법이라는 말을 몸으로 느꼈습니다.

[[gallery]]`,
  },
  {
    slug: 'ta-assistant-2024',
    title: '전공 TA 조교 — 후배들의 첫 코딩을 함께한 한 학기',
    excerpt: '국립순천대학교 컴퓨터공학과 전공 수업의 TA(조교)로 활동하며 후배들의 프로그래밍 학습을 지원했습니다.',
    category: 'etc',
    period: '2024',
    place: '국립순천대학교 컴퓨터공학과',
    role: '전공 TA 조교',
    tags: ['조교', 'TA', '코딩교육', '컴퓨터공학'],
    cover: '/images/activities/ta-assistant/01.webp',
    images: [
      { src: '/images/activities/ta-assistant/01.webp', caption: '전공 TA 조교 활동 현장' },
      { src: '/images/activities/ta-assistant/02.webp', caption: '실습 수업 지도' },
    ],
    featured: false,
    body: `컴퓨터공학과 전공 수업의 **TA(조교)**로 활동했습니다. 프로그래밍 입문 과목을 처음 듣는 후배들이 코드와 씨름하는 모습을 옆에서 지켜보며 도움을 주었습니다.

## 처음 코딩을 배우는 사람 곁에 서는 일

에러 메시지 하나를 해결하지 못해 막혀 있는 후배에게, 그 에러가 왜 발생하는지 차근차근 설명하는 것이 TA의 핵심이었습니다. 단순히 코드를 고쳐주는 것이 아니라, **스스로 문제를 찾아내는 사고 과정**을 함께 밟아가는 것이 목표였습니다.

## 가르치는 것의 무게

내가 아는 것과 남에게 설명할 수 있는 것은 다릅니다. TA를 하면서 제 자신의 개념 이해를 점검하고, 더 쉽게 전달하기 위해 고민하는 시간이 많았습니다. 이 경험이 개발자로서 소통과 문서화를 중요하게 생각하는 계기가 됐습니다.

[[gallery]]`,
  },
];

// ─── 프로젝트 이미지 업데이트 ────────────────────────────────────────
const projectImageUpdates = [
  {
    slug: 'sundukbang',
    cover: '/images/sundukbang.webp',
    images: [
      { src: '/images/activities/sundukbang/01.webp', caption: '개발 동기 — 기존 부동산의 한계' },
      { src: '/images/activities/sundukbang/02.webp', caption: '서비스 개요 — 대학가 원룸 플랫폼' },
      { src: '/images/activities/sundukbang/03.webp', caption: '진행 과정 — 단계별 개발' },
      { src: '/images/activities/sundukbang/04.webp', caption: 'UI 디자인 — Figma 컴포넌트 설계' },
      { src: '/images/activities/sundukbang/05.webp', caption: '기술 스택 — NextJS, Flutter, NestJS, MySQL' },
      { src: '/images/activities/sundukbang/06.webp', caption: '수행 결과 — 순덕방 앱 화면' },
      { src: '/images/activities/sundukbang/07.webp', caption: '매물 리스트 및 상세보기' },
      { src: '/images/activities/sundukbang/08.webp', caption: '챗봇 기능 시연' },
      { src: '/images/activities/sundukbang/09.webp', caption: '개선 방향 — 서비스 확장 계획' },
    ],
  },
  {
    slug: 'pedaleye',
    cover: '/images/pedaleye.webp',
    images: [
      { src: '/images/activities/pedaleye/01.webp', caption: '페달아이 웹사이트 소개 화면' },
      { src: '/images/activities/pedaleye/02.webp', caption: '제품 개요 및 문제 정의' },
      { src: '/images/activities/pedaleye/03.webp', caption: '해결방안 — 무선 세이프 페달' },
      { src: '/images/activities/pedaleye/04.webp', caption: '제품 작동 방식' },
      { src: '/images/activities/pedaleye/05.webp', caption: '경쟁 우위 분석' },
      { src: '/images/activities/pedaleye/06.webp', caption: '시장 규모 및 비즈니스 모델' },
      { src: '/images/activities/pedaleye/07.webp', caption: '사업화 전략' },
      { src: '/images/activities/pedaleye/08.webp', caption: '팀 구성 및 역량' },
      { src: '/images/activities/pedaleye/09.webp', caption: '페달아이 대시보드 화면' },
      { src: '/images/activities/pedaleye/10.webp', caption: '사용자 화면 1' },
      { src: '/images/activities/pedaleye/11.webp', caption: '사용자 화면 2' },
      { src: '/images/activities/pedaleye/12.webp', caption: '전시회 발표 자료' },
    ],
  },
];

async function main() {
  // 1. 기존 포스트 이미지 업데이트
  console.log('[ 기존 포스트 이미지 업데이트 ]');
  for (const upd of postImageUpdates) {
    const snap = await fdb.collection('posts').where('slug', '==', upd.slug).limit(1).get();
    if (snap.empty) { console.log(`  not found: ${upd.slug}`); continue; }
    const ref = snap.docs[0].ref;
    const existing = snap.docs[0].data();
    const updateData = { updated_at: now };
    if (upd.cover) updateData.cover = upd.cover;
    if (upd.images) updateData.images = upd.images;
    if (upd.images_add) {
      updateData.images = [...(existing.images || []), ...upd.images_add];
    }
    await ref.update(updateData);
    console.log(`  updated: ${upd.slug}`);
  }

  // 2. 신규 포스트 추가
  console.log('\n[ 신규 포스트 추가 ]');
  const snap = await fdb.collection('posts').orderBy('sort_order', 'desc').limit(1).get();
  let maxOrder = snap.empty ? 0 : (snap.docs[0].data().sort_order ?? 0);

  for (const post of newPosts) {
    const existing = await fdb.collection('posts').where('slug', '==', post.slug).limit(1).get();
    if (!existing.empty) { console.log(`  skip (이미 존재): ${post.slug}`); continue; }
    maxOrder += 1;
    await fdb.collection('posts').doc().set({
      ...post, sort_order: maxOrder, views: 0, likes: 0,
      published: true, created_at: now, updated_at: now,
    });
    console.log(`  added: ${post.slug}`);
  }

  // 3. 프로젝트 이미지 업데이트
  console.log('\n[ 프로젝트 이미지 업데이트 ]');
  for (const upd of projectImageUpdates) {
    const snap = await fdb.collection('projects').where('slug', '==', upd.slug).limit(1).get();
    if (snap.empty) { console.log(`  not found: ${upd.slug}`); continue; }
    await snap.docs[0].ref.update({
      cover: upd.cover,
      images: upd.images,
      updated_at: now,
    });
    console.log(`  updated: ${upd.slug}`);
  }

  console.log('\n완료!');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
