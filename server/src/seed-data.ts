/**
 * 초기 콘텐츠. 출처: 2026 포트폴리오 PDF, 이력서 PDF, github.com/LimJongTak
 * 배포 후에는 /admin 에서 수정하면 DB에 반영된다. (이 파일은 최초 seed 용)
 */

export const profile = {
  name: '임종탁',
  nameEn: 'Lim Jong Tak',
  role: 'Web · App Developer',
  roles: ['Frontend Developer', 'Backend Developer', 'App Developer', 'Team Lead'],
  headline: {
    line1: ['결과라는 ', { text: '점(Dot)', color: 'dot' }, '보다,'],
    line2: ['성장의 ', { text: '선(Line)', color: 'line' }, '을 그리는'],
    line3: '개발자 임종탁입니다.',
  },
  intro:
    '4만 명의 트래픽을 견딘 대학 축제 사이트부터 100여 개 업체와 함께 만든 상권 활성화 서비스까지. 아이디어를 머릿속에 가두지 않고, 동료와 함께 발로 뛰며 결과물을 만들어내는 개발자입니다.',
  photo: '/images/profile.webp',
  email: 'tak6030@naver.com',
  github: 'https://github.com/LimJongTak',
  location: '전라남도 순천시',
  education: {
    school: '국립순천대학교',
    major: '컴퓨터공학과',
    period: '2019.03 – 2026.02',
    status: '졸업',
    gpa: '4.05 / 4.5',
    thesis: '원룸 정보시스템 APP 개발 (순덕방)',
  },
  military: '육군 병장 만기 전역 (2020.01 – 2021.08)',
  stats: [
    { value: 40000, suffix: '+', label: '축제 사이트 실사용자' },
    { value: 100, suffix: '+', label: 'MOU 체결 업체' },
    { value: 10, suffix: '+', label: '출시·운영 프로젝트' },
    { value: 4, suffix: '년', label: '꾸준한 멘토링 활동' },
  ],
  philosophy: {
    title: 'The Start of Line',
    quote: '내 일이 아닌 일은 없다',
    before: {
      title: 'Over-responsibility & Burnout',
      body: '학생회장, 동아리 회장, PM, 디자이너, FE 개발자. 모든 것을 혼자 완벽히 해내려다 책임감의 무게가 오히려 효율을 떨어뜨리는 역설과 병목을 겪었습니다.',
      tags: ['학생회장', '동아리 회장', 'PM', '디자이너', 'FE 개발자'],
    },
    after: {
      title: 'Systemization & Efficiency',
      body: 'Notion으로 업무를 가시화하고, 팀원의 강점에 맞춰 R&R을 나눴습니다. 개인이 아니라 팀 전체가 움직이는 환경을 만들었습니다.',
      flow: ['R&R 분배', 'Notion 업무 가시화', '팀의 성공'],
    },
    lesson:
      '리더십은 독단적인 해결이 아니라, 팀원들이 각자의 위치에서 최고의 퍼포먼스를 낼 수 있도록 돕는 서포터의 역할임을 배웠습니다.',
  },
  growth: {
    title: 'Growing Together',
    subtitle: '경험에서 실무 역량으로',
    timeline: [
      { year: '2022', text: '지역아동센터 대학생 멘토' },
      { year: '2023', text: '지역아동센터 대학생 멘토' },
      { year: '2024', text: '지역아동센터 및 다함께돌봄센터 대학생 멘토' },
      { year: '2025', text: '다함께돌봄센터 대학생 멘토' },
    ],
    conversions: [
      { from: '대학생 멘토링', to: '돌발 상황 대응력과 안전 체계 구축 역량' },
      { from: '총학생회', to: '비품 구매·정산·회계 문서 작성 등 총무/자산 관리 역량' },
      { from: 'SW/HW', to: 'Synology·UniFi 장비, 라이선스 백업, 스크립트 기반 자동화' },
    ],
  },
  future: {
    title: 'Future Line',
    subtitle: 'AI 시대, 도구를 넘어 동료로 협업합니다.',
    steps: [
      { stage: 'Ideation', tool: 'Gemini', body: '아키텍처 설계와 비즈니스 로직 브레인스토밍' },
      { stage: 'Coding', tool: 'Cursor', body: '실시간 코드 로직 구현과 문맥 기반 함수 제안 활용' },
      { stage: 'Refactoring', tool: 'Claude', body: '가독성 점검과 기술 부채를 줄이기 위한 코드 리뷰 파트너' },
    ],
    quote: 'AI는 제가 단순 문법 오류가 아닌, 비즈니스 로직과 사용자 가치에 온전히 집중하게 해주는 가장 강력한 무기입니다.',
  },
  closing: {
    title: '이제, 함께 더 큰 선을 그릴 차례입니다.',
    subtitle: 'Ready to draw the next line.',
    body: "4만 명의 트래픽을 감당하며 배운 '실행의 가치'와 100여 개 업체와 협력하며 깨달은 '상생의 힘'을 믿습니다.",
  },
};

type ProjectSeed = {
  slug: string; title: string; subtitle: string; year: number; period?: string;
  category: 'web' | 'app' | 'etc'; role: string; team?: string; summary: string;
  problem?: string[]; process?: string[]; insight?: string;
  highlights?: { label: string; value: string }[]; tech: string[];
  github_url?: string; demo_url?: string; cover?: string; accent: string; featured?: boolean;
  images?: { src: string; caption: string }[];
};

export const projects: ProjectSeed[] = [
  {
    slug: 'scnu-festival-2025',
    cover: '/images/festival.webp',
    title: '2025 대동제 축제 웹 서비스',
    subtitle: '4만 명의 트래픽을 견딘 대학 축제 사이트',
    year: 2025, period: '2025', category: 'web',
    role: '개발 팀장 · 축제준비위원장', team: '국립순천대학교 총학생회',
    summary: '국립순천대학교 2025 대동제 기간 동안 라인업, 공지, 부스·푸드트럭 지도를 제공한 공식 축제 웹 서비스입니다.',
    problem: [
      '축제 기간 중 약 4만 명의 실사용자 동시 접속',
      '라인업 변동과 공지사항 전파 지연',
      '실시간으로 바뀌는 부스·푸드트럭 위치에 대한 사용자 피드백',
    ],
    process: [
      '이미지 용량 최적화와 렌더링 차단 리소스 제거',
      '트래픽 폭주에 대비한 캐싱 전략 수립, 0.1초의 로딩 단축을 위한 밤샘 디버깅',
      '사용자 피드백을 실시간으로 코드에 반영해 즉시 배포',
    ],
    insight: '기술의 완성도는 사용자가 불편함 없이 즐길 때 이루어진다는 것을 알게 되었습니다.',
    highlights: [{ label: '실사용자', value: '40,000+' }, { label: '서버 다운', value: '0회' }],
    tech: ['React', 'TypeScript', 'Caching', 'Image Optimization'],
    accent: '#8b5cf6', featured: true,
  },
  {
    slug: 'ieum',
    cover: '/images/ieum-app.webp',
    title: '이음',
    subtitle: '대학로 상권활성화 웹 서비스 · 서화와 함께 동네 한바퀴',
    year: 2025, period: '2025', category: 'web',
    role: '웹 개발', team: '상권활성화 이음 프로젝트',
    summary: '대학생이 제휴 업체에서 소비하면 스티커를 모아 지역 상품권에 응모하는, 대학로 상권 활성화 플랫폼입니다.',
    problem: ['코로나19와 급격한 온라인화로 대학로·지역 상권 소비 감소', '상권 침체와 공동화 현상'],
    process: [
      '약 100개 업체를 직접 방문해 MOU 체결',
      '금액과 상관없이 소비 시 이음 스티커 1개 제공',
      '스티커 10개 수집 후 응모, 당첨 시 지역 상품권 지급',
      '제휴 업체 검색·카테고리 필터 웹 서비스 개발',
    ],
    insight: "기술이 편리함을 주는 도구를 넘어, 소외된 곳을 잇고 공동체의 가치를 복원하는 상생의 동력임을 깨달았습니다.",
    highlights: [{ label: 'MOU 업체', value: '100+' }],
    tech: ['HTML', 'CSS', 'JavaScript', 'Kakao Map API'],
    github_url: 'https://github.com/LimJongTak/scnuseohwa',
    accent: '#ef4444', featured: true,
  },
  {
    slug: 'repoint',
    cover: '/images/activities/repoint/hero.webp',
    title: 'RE:POINT',
    subtitle: '쓰는 만큼 돌려받는, 지역이 함께 성장하는 소비 리워드 앱',
    year: 2025, period: '2025', category: 'app',
    role: '팀장 (PM · FE · 디자인)', team: '멋쟁이사자처럼 13기 idiot팀 (6명)',
    summary: '지역 가게 영수증을 AI로 인식해 포인트를 적립하고, 모은 포인트를 지역상품권으로 바꿔 소비가 다시 지역에 머물게 하는 앱입니다. 멋쟁이사자처럼 13기 연합해커톤 본선에 진출했습니다.',
    problem: [
      '지역 소비가 온라인 플랫폼과 외부 자본으로 유출',
      '전통시장과 지역 상권 침체, 소상공인 매출 감소',
      '고용 감소와 청년층 이탈로 지역경제 선순환 구조 붕괴',
    ],
    process: [
      'AI 영수증 인식(OCR)으로 사업자번호·금액을 읽어 포인트 적립',
      '적립 포인트를 5천~5만 원 지역상품권으로 교환하는 스토어',
      '영수증 등록·포인트 교환·이벤트를 안내하는 AI 상담원 챗봇',
      '핫플레이스 리워드, 연속 방문 미션, 친구 초대, 랜덤 추첨 이벤트',
      '월별 소비 리포트(식비·쇼핑·그 외)를 보여주는 마이페이지',
      '순천 시범 운영 → 행사·시장 연계 → 전국 확산의 3단계 로드맵 수립',
    ],
    insight: '지역에서 쓴 돈이 지역에 남게 하려면 기술과 지역 협력이 함께 가야 한다는 것을 배웠습니다.',
    highlights: [{ label: '13기 연합해커톤', value: '본선 진출' }, { label: '팀', value: '6명' }],
    tech: ['React', 'TypeScript', 'AI OCR', 'Chatbot'],
    github_url: 'https://github.com/orgs/scnu-idiot/repositories',
    accent: '#5b21b6', featured: true,
    images: [
      { src: '/images/activities/repoint/store.webp', caption: '포인트로 지역상품권 교환' },
      { src: '/images/activities/repoint/chatbot.webp', caption: 'AI 상담원' },
      { src: '/images/activities/repoint/screens.webp', caption: '고객센터 · 공지사항 · 이벤트' },
      { src: '/images/activities/repoint/mypage.webp', caption: '마이페이지 소비 리포트' },
      { src: '/images/activities/repoint/roadmap.webp', caption: '3단계 확산 로드맵' },
    ],
  },
  {
    slug: 'ogogago',
    title: '오고가고',
    subtitle: '경조사 장부 관리 플랫폼',
    year: 2026, period: '2026', category: 'app',
    role: '기획 · 개발', summary: '주고받은 경조사비를 기록하고 관리하는 장부 앱입니다.',
    tech: ['Flutter', 'Dart'],
    github_url: 'https://github.com/LimJongTak/ceremonial-ledger',
    accent: '#f59e0b',
  },
  {
    slug: 'aura',
    title: 'A.U.R.A',
    subtitle: '순천대 AI 인재 부트캠프 마일리지 앱',
    year: 2026, period: '2026', category: 'app',
    role: '개발', summary: '부트캠프 참여 활동을 마일리지로 관리하는 서비스와 공모전 서비스입니다.',
    tech: ['TypeScript', 'React'],
    github_url: 'https://github.com/LimJongTak/aura',
    accent: '#06b6d4',
  },
  {
    slug: 'linkers',
    title: 'Linkers',
    subtitle: '초등학생부터 대학생까지 잇는 교육·레크리에이션·재능봉사 플랫폼',
    year: 2026, period: '2026', category: 'web',
    role: '기획 · 개발', summary: '교육, 레크리에이션, 재능봉사 프로그램을 연결하는 플랫폼입니다.',
    tech: ['TypeScript', 'React'],
    github_url: 'https://github.com/LimJongTak/linkers',
    accent: '#10b981',
  },
  {
    slug: 'musheat',
    cover: '/images/musheat.webp',
    title: 'MushEat',
    subtitle: '비건햄 제품 다국어 소개 웹 서비스',
    year: 2025, period: '2025', category: 'web',
    role: '프론트엔드 개발',
    summary: '"고기보다 더 고기 같은 버섯" 비건햄 제품 랜딩 페이지입니다. 해외 수출 지원을 위해 국문·영문을 최적화했습니다.',
    process: ['i18n 기반 국문/영문 다국어 지원', '인터랙티브 애니메이션 구현'],
    tech: ['React', 'Vite', 'i18n'],
    github_url: 'https://github.com/LimJongTak/MUSH-EAT-LANDING',
    accent: '#b91c1c',
  },
  {
    slug: 'pedaleye',
    cover: '/images/pedaleye.webp',
    title: 'Pedaleye',
    subtitle: '급발진 사고 데이터 분석·시각화 웹 서비스',
    year: 2025, period: '2025', category: 'web',
    role: '웹 개발', team: '학생 창업유망팀 300+ PEDALEYE',
    summary: '무선 세이프페달과 페달라이트 블랙박스로 급발진 사고 원인을 기록·분석하는 서비스의 웹을 운영했습니다.',
    process: ['급발진 사고 데이터 분석 및 시각화', '서비스 웹 운영'],
    highlights: [{ label: '교육부장관 인증', value: '창업유망팀 300+' }],
    tech: ['React', 'Data Visualization'],
    accent: '#0ea5e9',
  },
  {
    slug: 'jangheung-catalog',
    title: '㈜장흥표고 웹 카탈로그',
    subtitle: '지역 기업 제품 웹 카탈로그',
    year: 2025, period: '2025', category: 'web',
    role: '개발', summary: '지역 기업의 제품을 소개하는 웹 카탈로그 뷰어입니다. 지역현안 문제해결 경진대회 우수상(총장상).',
    tech: ['TypeScript', 'React'],
    github_url: 'https://github.com/LimJongTak/my-catalog-viewer',
    accent: '#a16207',
  },
  {
    slug: 'myway',
    cover: '/images/activities/myway/hero.webp',
    title: 'MyWay',
    subtitle: '산책이 일상으로 — 산책 커뮤니티 & 보상형 플랫폼',
    year: 2024, period: '2024', category: 'web',
    role: '팀장 (PM · FE · 디자인)', team: '멋쟁이사자처럼 12기 워크홀릭팀 (PM 1 · BE 3 · FE 2)',
    summary: '지도에서 나만의 산책로를 등록·공유하고 커뮤니티에서 소통하는 산책 플랫폼입니다. 멋쟁이사자처럼 12기 아이디어톤 1·2차 예선 1위, 319팀 중 16팀이 오른 본선에 진출했습니다.',
    problem: [
      '한국인 2명 중 1명은 신체활동 부족 — WHO 권고 실천율 한국 47.9%, 세계 평균 72% (보건복지부, 2023)',
      '평소와 다른 산책로나 산책 중 편의시설 정보를 찾기 어려움',
      '자기만 아는 산책 루트·지역 명소를 공유할 창구 부재',
    ],
    process: [
      'Kakao Map API로 경로를 찍어 산책로 등록 — 구간 거리·총거리·도보 시간 표시',
      '화장실·쉼터·자전거 등 산책로 주변 편의시설 필터',
      '공지사항·자유게시판·Q&A 커뮤니티',
      '마이페이지에서 내가 등록한 산책로 관리',
      '지역 업체 제휴 중심 마케팅, 광고·데이터 마케팅·제휴 수수료 비즈니스 모델 설계',
    ],
    insight: '가장 쉬운 운동인 걷기를 혼자가 아닌 함께 즐길 수 있게 만드는 것, 그리고 기획부터 화면까지 한 흐름으로 설계하는 법을 배웠습니다.',
    highlights: [{ label: '아이디어톤', value: '319팀 중 본선 16팀' }, { label: '예선', value: '1·2차 1위' }],
    tech: ['React', 'Kakao Map API', 'JavaScript'],
    github_url: 'https://github.com/LimJongTak/myway',
    accent: '#3b82f6',
    images: [
      { src: '/images/activities/myway/route.webp', caption: '지도에서 산책로 등록' },
      { src: '/images/activities/myway/community.webp', caption: '커뮤니티' },
      { src: '/images/activities/myway/mypage.webp', caption: '마이페이지' },
      { src: '/images/activities/myway/background.webp', caption: '개발 배경 — 신체활동 부족' },
      { src: '/images/activities/myway/target.webp', caption: '주요 타겟' },
      { src: '/images/activities/myway/business.webp', caption: '비즈니스 모델' },
    ],
  },
  {
    slug: 'sundeokbang',
    title: '순덕방',
    subtitle: '대학로 원룸 정보 앱 (졸업작품)',
    year: 2024, period: '2024', category: 'app',
    role: '개발', summary: '대학로 원룸 정보를 한곳에 모아 보여주는 앱으로, 졸업논문 주제(원룸 정보시스템 APP 개발)입니다.',
    tech: ['Flutter', 'Dart'],
    github_url: 'https://github.com/LimJongTak/sdb',
    accent: '#ec4899',
  },
  {
    slug: 'roster-scheduler',
    title: 'Roster Scheduler',
    subtitle: '근무표 자동 생성 시스템',
    year: 2025, period: '2025', category: 'web',
    role: '개발', summary: '조건에 맞춰 근무 스케줄을 자동으로 편성하는 시스템입니다.',
    tech: ['TypeScript'],
    github_url: 'https://github.com/LimJongTak/roster-scheduler',
    accent: '#64748b',
  },
  {
    slug: 'online-education',
    title: 'Online Education Service',
    subtitle: '온라인 교육 웹 서비스',
    year: 2023, period: '2023', category: 'web',
    role: '개발', summary: '강의 수강을 위한 온라인 교육 웹 서비스입니다.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    github_url: 'https://github.com/LimJongTak/OnlineEducationService_SCNU',
    accent: '#3b82f6',
  },
];

type Exp = { category: string; org: string; title: string; start_date: string; end_date: string; items: string[] };

export const experiences: Exp[] = [
  {
    category: 'leadership', org: '국립순천대학교 총학생회', title: '부총학생회장',
    start_date: '2025.01', end_date: '2025.12',
    items: ['총학생회 부총학생회장', '전체간부수련회 LTC 총괄', '축제준비위원장', '축제사이트 제작팀장', '이음 프로젝트 사이트 제작'],
  },
  {
    category: 'club', org: '멋쟁이사자처럼', title: '12기 대학 대표 · 13기 운영진',
    start_date: '2024.01', end_date: '2025.12',
    items: [
      '12기 국립순천대학교 대표, 아이디어톤 1·2차 예선 1위 · 본선 진출 (319팀 중 16팀)',
      '12기 연합해커톤 본선, 워크홀릭팀 팀장 (PM · FE · 디자인) — MyWay 개발',
      '13기 운영진, 연합해커톤 본선, idiot팀 팀장 — RE:POINT 개발',
      '12기 기획 · 디자인 · 프론트엔드 · 백엔드 트랙 수료, 13기 수료',
    ],
  },
  {
    category: 'club', org: '국립순천대학교 코딩 동아리', title: '회장 · 부회장 · 학술분과장',
    start_date: '2023.09', end_date: '2025.11',
    items: ['회장, 부회장, 운영진 직책 수행', '학술분과장', '그룹스터디 활성화, 교내 아이디어톤·해커톤 진행'],
  },
  {
    category: 'volunteer', org: '한국장학재단', title: '대학생 재능봉사 팀장',
    start_date: '2023.07', end_date: '2026.01',
    items: [
      '대학생 재능봉사 27기 팀장',
      '2025 푸른등대 NH농협은행 대학생 재능봉사캠프 팀장',
      '2022–2024 국가근로장학생 지역아동센터·다함께돌봄센터 근로',
      '2025 대학생청소년교육지원 멘토 (다함께돌봄센터)',
    ],
  },
  {
    category: 'leadership', org: '청년정책추진단 풍운재자', title: '대표',
    start_date: '2024.06', end_date: '2024.11',
    items: [
      '한국온라인창업컨설팅 기업 연계',
      '진도군·순천시 상권활성화재단 연계 (지자체)',
      '순천시 상권활성화재단 서포터즈 대학생 대표',
      '전라남도 4차산업 아이디어 경진대회 주최 (대표)',
      '진도미식여행 1–3회차 주관',
    ],
  },
  {
    category: 'leadership', org: '국립순천대학교 컴퓨터공학과', title: '학생회장',
    start_date: '2019.03', end_date: '2023.12',
    items: [
      '1학년 부과대, 2학년 과대, 학생회장',
      '전공체험 부스 · 오픈캠퍼스 전공체험 운영',
      'MT · 체육대회 · 롯데월드 행사 등 학과 전체 행사 집행',
      '동행프로그램 학생 대표',
    ],
  },
];

export const awards = [
  { kind: 'award', date: '2025', title: '교육부장관 인증서 — 학생 창업유망팀 300+', issuer: '교육부', description: '탁월한 창업역량과 성장 가능성을 인정받아 2025 학생 창업유망팀 300+ 성장트랙 최종 선정 (PEDALEYE)' },
  { kind: 'award', date: '2025', title: '지역현안 문제해결 경진대회 우수상 (총장상)', issuer: '국립순천대학교 총장', description: '지역기업 문제해결 성과공유 부문, 지역 기업이 직면한 문제에 실무 중심의 해결 성과 도출' },
  { kind: 'completion', date: '2025', title: '멋쟁이사자처럼 대학 13기 수료', issuer: '사단법인 멋쟁이사자처럼', description: '' },
  { kind: 'completion', date: '2024', title: '멋쟁이사자처럼 대학 12기 수료 (기획 · 디자인 · 프론트엔드 · 백엔드)', issuer: '사단법인 멋쟁이사자처럼', description: '' },
  { kind: 'certificate', date: '2023.10', title: '리눅스마스터 2급', issuer: '한국정보통신진흥협회', description: '' },
  { kind: 'certificate', date: '2019.10', title: '파이썬프로그래밍활용능력 2급', issuer: '한국정보인재개발원', description: '' },
  { kind: 'certificate', date: '2019.01', title: '1종 보통 운전면허', issuer: '경찰청', description: '' },
];

export const skills: Record<string, string[]> = {
  language: ['Java', 'Python', 'C', 'JavaScript', 'TypeScript', 'Kotlin', 'Dart', 'PHP'],
  frontend: ['React', 'HTML5', 'CSS3', 'SCSS', 'TailwindCSS', 'Vite'],
  backend: ['Node.js', 'MySQL', 'Express'],
  mobile: ['Flutter', 'Android Studio'],
  tool: ['Git', 'GitHub', 'Notion', 'Linux'],
  design: ['Figma', 'Adobe Photoshop', 'Adobe Illustrator'],
};

/** GitHub API 동기화 전에 보여줄 레포 스냅샷 (2026-11 기준) */
export const githubRepos = [
  { name: 'aura', description: '순천대 AI 인재 부트캠프 마일리지 앱 (A.U.R.A)', language: 'TypeScript', pushed_at: '2026-11-13' },
  { name: 'youth', description: '부트캠프 청년 지원 앱', language: 'TypeScript', pushed_at: '2026-11-12' },
  { name: 'digital', description: 'Digital+X', language: 'TypeScript', pushed_at: '2026-11-05' },
  { name: 'pccarekit', description: 'PC 정리 및 최적화 도구', language: 'C#', pushed_at: '2026-10-14' },
  { name: 'auraproject', description: '부트캠프 공모전 서비스', language: 'JavaScript', pushed_at: '2026-09-16' },
  { name: 'crawling', description: '공모전·채용 공고 크롤러', language: 'TypeScript', pushed_at: '2026-08-13' },
  { name: 'work', description: '업무 관리 시스템', language: 'TypeScript', pushed_at: '2026-06-30' },
  { name: 'tiny-breathe', description: 'Flutter로 만든 나만의 정원 게임', language: 'Dart', pushed_at: '2026-03-22' },
  { name: 'linkers', description: '초·중·고·대학생 교육·레크리에이션·재능봉사 플랫폼', language: 'TypeScript', pushed_at: '2026-03-19' },
  { name: 'ceremonial-ledger', description: '경조사 장부 관리 플랫폼 (오고가고)', language: 'Dart', pushed_at: '2026-03-16' },
  { name: 'maze-master', description: '56개 스테이지 미로 생성 서비스', language: 'TypeScript', pushed_at: '2026-01-27' },
  { name: 'bingo-random', description: '영어 빙고 카드 A4 PDF 생성기', language: 'JavaScript', pushed_at: '2026-01-22' },
  { name: 'word-search-generator', description: '영어 단어 찾기 퍼즐 생성기', language: 'Python', pushed_at: '2026-01-16' },
  { name: 'roster-scheduler', description: '근무표 자동 생성 시스템', language: 'TypeScript', pushed_at: '2025-12-08' },
  { name: 'MUSH-EAT-LANDING', description: '머쉬잇 제품 소개 페이지', language: 'JavaScript', pushed_at: '2025-11-30' },
  { name: 'my-catalog-viewer', description: '웹 카탈로그 뷰어', language: 'TypeScript', pushed_at: '2025-11-28' },
];
