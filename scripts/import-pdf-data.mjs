/**
 * PDF에서 OCR로 추출한 데이터를 Firestore에 직접 삽입하는 스크립트
 * 사용법 (프로젝트 루트에서):
 *   node scripts/import-pdf-data.mjs
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// server/.env 수동 파싱
const envPath = path.join(__dirname, '../server/.env');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

// GOOGLE_APPLICATION_CREDENTIALS 경로를 절대경로로 보정
const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (credPath && !path.isAbsolute(credPath)) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, '../server', credPath);
}

if (!getApps().length) {
  initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? 'jongtak-lim' });
}
const fdb = getFirestore();

const now = new Date().toISOString();

// ─── 추가할 프로젝트 ───────────────────────────────────────────────
const newProjects = [
  {
    slug: 'sundukbang',
    cover: '',
    title: '순덕방',
    subtitle: '대학생을 위한 부동산 플랫폼',
    year: 2024,
    period: '2024',
    category: 'app',
    role: '풀스택 개발',
    team: 'DB&EC 실험실',
    summary:
      '국립순천대학교 주변 원룸 매물에 집중한 대학생 맞춤형 부동산 플랫폼입니다. 쉬운 필터 검색, 챗봇 기반 정보 제공, 실시간 매물 업데이트로 학생들의 자취방 탐색 경험을 개선했습니다.',
    problem: [
      '기존 부동산 앱은 대학가 원룸 매물이 적고, 현장 방문 없이는 신뢰할 수 없는 정보',
      '번거로운 탐색 과정과 대학생 맞춤형 필터 부재',
      '자취 경험이 없는 신입생에게 불친절한 UI/UX',
    ],
    process: [
      'Figma로 컴포넌트 기반 UI/UX 설계, 사용자 친화적 디자인 구현',
      'NextJS 웹·Flutter 앱 동시 개발, NestJS + MySQL 백엔드 구성',
      '챗봇 연동으로 사용자가 원하는 정보를 자연어로 질의 가능하도록 구현',
      '12월 원룸 매물 추가 확보 및 리뷰 시스템·커뮤니티 기능 개선 예정',
    ],
    insight:
      '사용자가 실제로 필요로 하는 정보가 무엇인지 현장에서 직접 확인하고, 작은 불편함 하나하나를 코드로 해결해나가는 과정에서 개발의 본질을 다시 느꼈습니다.',
    highlights: [
      { label: '주요 기능', value: '챗봇 · 필터' },
      { label: '타겟', value: '대학생' },
    ],
    tech: ['NextJS', 'Flutter', 'NestJS', 'MySQL', 'Figma'],
    github_url: 'https://github.com/njturtles',
    demo_url: '',
    accent: '#3b82f6',
    featured: false,
    images: [],
  },
  {
    slug: 'pedaleye',
    cover: '',
    title: 'Pedaleye',
    subtitle: '당신의 급선에 확신을 더하다 — 무선 세이프 페달 & 페달라이트 블랙박스',
    year: 2025,
    period: '2025',
    category: 'etc',
    role: '공동 창업자 · 개발',
    team: '국립순천대학교 Pedaleye팀',
    summary:
      '페달 오조작 사고를 예방하고 사고 발생 시 운전자의 증거 확보를 돕는 무선 세이프 페달 및 페달라이트 블랙박스 창업 아이템입니다. 2025 학생창업유망팀 300+ 성장트랙 제품전시회 출품작입니다.',
    problem: [
      '최근 5년간 연평균 2천 건 이상 페달 오조작 사고 발생, 65세 이상 운전자 사고 비중 25.7%',
      '현행 제조물 책임법상 사고 원인 입증 책임이 소비자에게 전가되어 증거 확보 어려움',
      '기존 블랙박스는 ±5초로 기록 범위 한정, 페달 조작 증거 확보에 한계',
      '기존 페달 블랙박스 평균 25만 원 이상으로 설치 비용 부담, 복잡한 유지보수 필요',
    ],
    process: [
      '브레이크·가속 페달에 접촉식 센서 부착 → 무선 신호로 운전석 패널과 블랙박스에 실시간 전송',
      '태양광 패널 + 교체용 건전지로 복잡한 유지보수 없이 지속 작동 가능',
      '기존 블랙박스와 호환되는 광신호(빨강/초록 LED) 방식으로 별도 하드웨어 불필요',
      '국내외 규제(현대차, 국토교통부, 보험료 할인 법안) 및 시장 트렌드 분석 후 사업화 전략 수립',
    ],
    insight:
      '기술이 사람의 생명과 권리를 지킬 수 있다는 사실을 직접 제품으로 증명하는 과정에서 창업의 의미를 배웠습니다.',
    highlights: [
      { label: '사업', value: '2025 학생창업유망팀 300+' },
      { label: '트랙', value: '성장트랙 제품전시회' },
    ],
    tech: ['임베디드 시스템', '무선 통신', '압력 센서', '태양광 패널', '블랙박스 연동'],
    github_url: '',
    demo_url: '',
    accent: '#f59e0b',
    featured: false,
    images: [],
  },
];

// ─── 추가할 경험 ───────────────────────────────────────────────────
const newExperiences = [
  {
    category: 'volunteer',
    org: 'NH농협은행 초록사다리',
    title: '푸른등대 대학생 재능봉사 캠프 팀장',
    start_date: '2025.07',
    end_date: '2025.08',
    items: [
      '2025 푸른등대 NH농협은행 초록사다리 대학생 재능봉사 캠프 팀장 (10인 팀 총괄)',
      '초등학교 고학년 대상 5일 40시간 교육 캠프 기획·운영',
      '주제: 함께 설계하는 나의 디자인 — ESG 체험·디지털 역량 강화',
      '프로그램: 환경 패션(자투리 천 업사이클링), ESG 코인 마을 만들기(직접 개발한 코인 서비스 활용), 테라리움 정원(마인크래프트 코딩), 물리 실험',
      '참여 기관 협의, 안전 관리 계획 수립, 멘토-멘티 역할 분배 등 전반 총괄',
    ],
  },
];

async function main() {
  // 프로젝트 추가
  console.log('프로젝트 추가 중...');
  for (const p of newProjects) {
    const existing = await fdb.collection('projects').where('slug', '==', p.slug).limit(1).get();
    if (!existing.empty) {
      console.log(`  skip (이미 존재): ${p.slug}`);
      continue;
    }
    const snap = await fdb.collection('projects').orderBy('sort_order', 'desc').limit(1).get();
    const maxOrder = snap.empty ? 0 : (snap.docs[0].data().sort_order ?? 0) + 1;
    await fdb.collection('projects').doc().set({
      slug: p.slug, title: p.title, subtitle: p.subtitle, year: p.year,
      period: p.period, category: p.category, role: p.role, team: p.team,
      summary: p.summary, problem: p.problem, process: p.process,
      insight: p.insight, highlights: p.highlights, tech: p.tech,
      github_url: p.github_url, demo_url: p.demo_url,
      cover: p.cover, images: p.images, accent: p.accent,
      featured: p.featured, published: true,
      sort_order: maxOrder, views: 0, likes: 0,
      created_at: now, updated_at: now,
    });
    console.log(`  추가됨: ${p.title}`);
  }

  // 경험 추가
  console.log('경험 추가 중...');
  for (const e of newExperiences) {
    const existing = await fdb.collection('experiences')
      .where('org', '==', e.org).where('title', '==', e.title).limit(1).get();
    if (!existing.empty) {
      console.log(`  skip (이미 존재): ${e.title}`);
      continue;
    }
    const snap = await fdb.collection('experiences').orderBy('sort_order', 'desc').limit(1).get();
    const maxOrder = snap.empty ? 0 : (snap.docs[0].data().sort_order ?? 0) + 1;
    await fdb.collection('experiences').doc().set({
      ...e, sort_order: maxOrder, created_at: now,
    });
    console.log(`  추가됨: ${e.title}`);
  }

  console.log('\n완료!');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
