import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync('./server/service-account.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
const now = new Date().toISOString();

// ─── POSTS ────────────────────────────────────────────────────────────────────

const posts = {

  // scnu-festival-2025
  dDldoxZO59zUHiG5a3dg: {
    title: '8만 명이 다녀간 축제, 그 뒤에서 사이트를 지킨 날들',
    excerpt: '축제준비위원장이자 사이트 개발 팀장으로 2025 대동제를 준비했습니다. 총 8만여 명의 방문객, 약 4만 명의 실사용자가 접속한 사이트를 운영하며 배운 것들.',
    images: [
      { src: '/images/activities/scnu-festival-2025/01.webp', caption: 'FairyTale 대동제 2025 공식 포스터 (May 28-29, 국립순천대학교)' },
      { src: '/images/activities/scnu-festival-2025/02.webp', caption: '축제 시작 전, 준비위원회 전체가 무대 앞에 모이다' },
      { src: '/images/activities/scnu-festival-2025/03.webp', caption: '이틀간 약 8만여 명의 발걸음이 가득 채운 메인 무대 현장' },
      { src: '/images/activities/scnu-festival-2025/04.webp', caption: '모든 것이 끝난 뒤 — 무대 위에서 엔딩 크레딧과 함께' },
    ],
    body: `2025년 국립순천대학교 총학생회 FairyTale 대동제. 축제준비위원장이자 사이트 개발 팀장으로, 축제 뒤에서 가장 많은 시간을 보낸 한 해였습니다.

## 주제 'FairyTale' — 디자인부터 시작하다

![FairyTale 대동제 2025 공식 포스터 (May 28-29)](/images/activities/scnu-festival-2025/01.webp)

총학생회가 선택한 2025 대동제의 주제는 **FairyTale**이었습니다. 요정, 성, 유니콘, 시계가 함께하는 보랏빛 세계관. 포스터부터 굿즈, 사이트까지 하나의 테마로 연결했습니다.

## 무대 뒤의 준비

![축제 시작 전, 준비위원회 전체가 무대 앞에 모이다](/images/activities/scnu-festival-2025/02.webp)

축제 당일 아침, 메인 무대 조명 아래서 모든 준비위원이 한 자리에 모였습니다. 무대 설치, 안전 관리, 프로그램 운영, 미디어 팀 — 각자의 자리에서 최선을 다한 50여 명의 사람들.

## 8만여 명의 함성

![이틀간 약 8만여 명의 발걸음이 가득 채운 메인 무대 현장](/images/activities/scnu-festival-2025/03.webp)

이틀 동안 **약 8만여 명**이 대동제를 찾았습니다. 사이트에는 **약 4만 명**의 실사용자가 접속했습니다. 라인업 확인, 푸드트럭 위치, 부스 정보 — 모든 것을 사이트 하나에서 해결할 수 있었습니다.

사이트를 만들면서 가장 무서웠던 것은 "과연 버텨낼 수 있을까"였습니다. 이미지 최적화, 캐싱 전략, 렌더링 차단 리소스 제거 — 밤새 디버깅한 모든 작업이 그 질문에 대한 대답이었습니다.

> 축제 사이트 → [scnuseohwa.onrender.com](https://scnuseohwa.onrender.com)

## 엔딩 크레딧

![모든 것이 끝난 뒤 — 무대 위에서 엔딩 크레딧과 함께](/images/activities/scnu-festival-2025/04.webp)

마지막 날 밤, 무대 화면에 한 명 한 명의 이름이 올라갔습니다. 준비위원회 전원이 무대 위에 올라가 그 이름들을 함께 바라봤습니다. 가장 힘들었고, 가장 뿌듯했던 순간이었습니다.

[[gallery]]`,
    updated_at: now,
  },

  // student-council-2025
  sAEyFRrz0FzyUx2czmQs: {
    images: [
      { src: '/images/activities/student-council/01.webp', caption: '총학생회 선거 출마 — 임종탁 후보' },
      { src: '/images/activities/student-council/02.webp', caption: '선거 운동원들과 함께 — 새벽까지 함께한 사람들' },
      { src: '/images/activities/student-council/03.webp', caption: '2025 전체간부수련회(LTC) — 서화! Leadership Training' },
      { src: '/images/activities/student-council/04.webp', caption: '2025 신입생 OT 현장' },
      { src: '/images/activities/student-council/05.webp', caption: '이음 프로젝트 — 대학로 가게에 붙은 이음 스티커' },
      { src: '/images/activities/student-council/06.webp', caption: '이음 프로젝트 — 업체 방문 현장' },
    ],
    body: `2025년 한 해 동안 국립순천대학교 총학생회 **부총학생회장**으로 일했습니다. 선거 출마부터 임기 마지막 날까지, 학교 안팎에서 가장 많이 뛰어다닌 한 해였습니다.

## 출마 — 먼저 손을 내밀다

![총학생회 선거 출마 — 임종탁 후보](/images/activities/student-council/01.webp)

총학생회 선거에 출마했습니다. 학교 안에서 가장 많은 사람에게 먼저 말을 걸어야 하는 경험이었습니다. 정장과 명찰을 달고 선거 운동을 하면서, 리더십의 시작은 용기 있게 먼저 나서는 것임을 배웠습니다.

![선거 운동원들과 함께 — 새벽까지 함께한 사람들](/images/activities/student-council/02.webp)

선거 운동원들이 새벽까지 함께해 주었습니다. 혼자가 아니라 함께 만들어가는 것이 총학생회라는 걸, 선거 때부터 느꼈습니다.

## 전체간부수련회 — 함께하는 출발

![2025 전체간부수련회(LTC) — 서화! Leadership Training](/images/activities/student-council/03.webp)

부총학생회장으로서 **전체간부수련회(LTC)**를 총괄했습니다. 총학생회 각 부서 간부들이 모여 한 해 목표를 세우고, 팀워크를 다지는 자리입니다. 100명 가까운 사람들이 함께하는 행사를 기획하고 운영하면서, 보이지 않는 준비가 얼마나 중요한지 다시 배웠습니다.

## 신입생 OT

![2025 신입생 OT 현장](/images/activities/student-council/04.webp)

한 해의 첫 번째 큰 행사는 신입생 OT였습니다. 처음 대학에 오는 신입생들에게 학교가 따뜻한 곳이라는 첫인상을 남기는 것이 목표였습니다.

## 이음 — 대학로를 살리는 프로젝트

![이음 프로젝트 — 대학로 가게에 붙은 이음 스티커](/images/activities/student-council/05.webp)

대학로 상권 활성화를 위한 **'이음'** 프로젝트. 약 100개 업체를 직접 발로 찾아가 MOU를 맺고, 스티커를 모아 지역상품권에 응모하는 시스템을 운영했습니다.

![이음 프로젝트 업체 방문 현장](/images/activities/student-council/06.webp)

가게 한 곳 한 곳을 직접 찾아가 협약을 맺는 과정은, "현장이 답이다"라는 말의 의미를 몸으로 배운 시간이었습니다.

## 배운 것

> 내 일이 아닌 일은 없다.

처음에는 이 말을 "모든 걸 내가 해야 한다"로 받아들였습니다. 1년을 보내고 나서는 "모든 일에 관심을 갖되, 팀이 함께 움직이게 만든다"로 바뀌었습니다.

[[gallery]]`,
    updated_at: now,
  },

  // computer-engineering-council
  '1zITQGss3HtuYDpcwmwT': {
    images: [
      { src: '/images/activities/cs-council/01.webp', caption: '2023 컴퓨터공학과 MT (구례, 2023.03.22-24)' },
      { src: '/images/activities/cs-council/02.webp', caption: '2023 단과대학 운영위원회 — 학과 대표 회의' },
      { src: '/images/activities/cs-council/03.webp', caption: '견학 행사 — 컴퓨터공학과 단체 사진' },
      { src: '/images/activities/cs-council/04.webp', caption: '오픈캠퍼스 중고등학생 전공 특강 (2024.05.02)' },
      { src: '/images/activities/cs-council/05.webp', caption: '지역아동센터 전공 프로그램 교육 봉사' },
    ],
    body: `컴퓨터공학과에 입학한 2019년부터 2023년까지, 학과 일에서 손을 놓은 적이 거의 없었습니다. 1학년 부과대에서 시작해 과대, 그리고 **학생회장**까지.

## MT — 첫 번째 연결

![2023 컴퓨터공학과 MT (구례, 2023.03.22-24)](/images/activities/cs-council/01.webp)

학과 MT를 직접 기획하고 진행했습니다. 2023년 3월, 구례군 순천대학교 교직원수련원에서 2박 3일. 모든 학년이 함께하는 MT는 학과 커뮤니티를 만드는 가장 직접적인 방법이었습니다.

## 단과대학 운영위원회

![2023 공과대학 단과대학 운영위원회](/images/activities/cs-council/02.webp)

컴퓨터공학과 대표로 단과대학 운영위원회에 참여했습니다. 학과 현안을 대학 단위로 연결하고, 여러 학과 학생회와 협력하는 경험이었습니다.

## 견학 행사

![견학 행사 — 컴퓨터공학과 단체 사진](/images/activities/cs-council/03.webp)

학과 견학 행사를 기획했습니다. 학생들이 현장을 경험하고 진로를 탐색할 수 있는 자리를 마련하는 것이 목적이었습니다.

## 오픈캠퍼스 전공 특강

![오픈캠퍼스 중고등학생 전공 특강 (2024.05.02)](/images/activities/cs-council/04.webp)

중고등학생들이 대학을 방문하는 오픈캠퍼스에서 **컴퓨터공학과 전공 특강**을 직접 운영했습니다. 미래 전공 선택을 앞둔 학생들에게 컴퓨터공학의 매력을 소개하는 시간이었습니다.

## 봉사활동

![지역아동센터 전공 프로그램 교육 봉사](/images/activities/cs-council/05.webp)

지역아동센터에서 컴퓨터 관련 교육 프로그램을 진행하는 봉사활동도 함께했습니다. 배운 것을 나누는 일이 더 깊이 이해하는 방법이라는 걸 배웠습니다.

## 배운 것

행사 하나를 치르려면 예산을 짜고, 인원을 나누고, 끝나면 정산을 해야 합니다. 리더십은 앞에서 이끄는 것보다 뒤에서 모두가 제 역할을 할 수 있게 받쳐주는 일이라는 걸, 학과 학생회에서 처음 배웠습니다.

[[gallery]]`,
    updated_at: now,
  },

  // coding-club
  Mu3xpBWxV1gHsNgUS09d: {
    images: [
      { src: '/images/activities/coding-club/01.webp', caption: '코딩 동아리 코마 모임 (1)' },
      { src: '/images/activities/coding-club/02.webp', caption: '코딩 동아리 코마 모임 (2)' },
    ],
    body: `초등학생 때 Visual Basic으로 처음 코딩을 접했고, 고등학생 때는 직접 컴퓨터 동아리를 만들었습니다. 대학에서도 같은 이유로 코딩 동아리 **코마**에 뛰어들었습니다.

## 2년 3개월의 기록

![코딩 동아리 코마 — 모임 현장 (1)](/images/activities/coding-club/01.webp)

부회장, 학술분과장, 회장을 거쳤습니다. 그룹 스터디를 만들고, 교내 아이디어톤과 해커톤을 기획했습니다.

![코딩 동아리 코마 — 모임 현장 (2)](/images/activities/coding-club/02.webp)

스터디로 기초를 다지고, 아이디어톤에서 기획을 해보고, 해커톤에서 직접 만들어보는 흐름을 동아리 안에서 꾸려 갔습니다.

## 함께 성장하는 구조

> 혼자가 아닌 함께가 더 멀리 간다.

코딩은 혼자 배울 수 있지만, 혼자 배우면 좁게 배웁니다. 같이 막히고, 같이 풀고, 같이 발표하면서 각자의 약점이 채워집니다. 그 과정을 2년 3개월 동안 옆에서 지켜봤습니다.

[[gallery]]`,
    updated_at: now,
  },

  // myway-likelion-12
  I2cBRRVeGSQe8pvkbNLR: {
    body: `2024년, 멋쟁이사자처럼 대학 12기에서 국립순천대학교 **대학 대표**를 맡았습니다. 동시에 **워크홀릭(WalkHolic)팀** 팀장으로 PM·프론트엔드·디자인을 담당했습니다.

> 산책이 일상으로

## 한국인 2명 중 1명은 신체활동 부족

![개발 배경 — 신체활동 지침 실천율](/images/activities/myway/background.webp)

WHO는 일주일에 중강도 신체활동 150분 이상을 권고합니다. 보건복지부에 따르면 이 권고를 지키는 비율이 세계 평균 72%인데 한국은 **47.9%**입니다. 가장 쉽게 시작할 수 있는 운동인 걷기를, 혼자가 아니라 함께 즐길 수 있게 만들고 싶었습니다.

## MyWay가 하는 일

- **산책로 등록** — 지도에서 경로를 직접 찍어 나만의 산책로를 등록합니다.
- **커뮤니티** — 공지사항, 자유게시판, Q&A에서 같은 관심사를 가진 사람들과 소식을 나눕니다.
- **마이페이지** — 개인정보를 확인하고 내가 등록한 산책로를 관리합니다.

![지도에서 경로를 찍어 산책로를 등록하는 화면](/images/activities/myway/route.webp)

## 결과

- 12기 아이디어톤 **1차 예선 1등, 2차 예선 1등**
- **319팀 중 16팀**이 오른 3차 본선 진출
- 12기 연합해커톤 본선 진출

## 현장에서

![12기 아이디어톤 본선 발표 현장 (2024.06.01)](/images/activities/likelion/01.webp)

멋쟁이사자처럼 12기 아이디어톤 본선. 319팀 중 16팀 안에 들어 본선 무대에 올라 MyWay를 직접 발표했습니다.

![12기 아이디어톤 — MyWay 온라인 발표 화면](/images/activities/likelion/02.webp)

![12기 연합해커톤 (GROWL TO WORLD) — 전국 멋쟁이사자처럼이 한 자리에](/images/activities/likelion/03.webp)

12기 전체가 모인 연합해커톤. "GROWL TO WORLD"라는 슬로건 아래 전국 대학 팀들이 경쟁했습니다.

![해커톤 당일 현장](/images/activities/likelion/04.webp)

[[gallery]]

## 돌아보며

팀장으로서 기획, 디자인, 프론트엔드를 오가며 많은 역할을 함께 맡았던 프로젝트입니다. 여러 역할을 동시에 해본 경험 덕분에, 이후에는 업무를 가시화하고 팀원의 강점에 맞춰 역할을 나누는 일의 중요성을 더 크게 느끼게 됐습니다.`,
    updated_at: now,
  },

  // repoint-likelion-13
  fEHVoJjGT0OWmxPnhZso: {
    body: `멋쟁이사자처럼 대학 13기에서는 운영진으로 활동하면서, 직접 **idiot팀** 팀장을 맡아 PM·프론트엔드·디자인을 담당했습니다. 6명이 함께 만든 서비스가 **RE:POINT**입니다. 13기 연합해커톤 본선에도 진출했습니다.

> 쓰는 만큼 돌려받는, 지역이 함께 성장하는 RE:POINT

## 출발점: 지역에서 쓴 돈은 어디로 가는가

![지방 경제 문제의 악순환](/images/activities/repoint/problem.webp)

지역의 소비가 온라인 플랫폼과 외부 자본으로 빠져나가면, 전통시장과 지역 상권이 침체되고 소상공인의 매출이 줄어듭니다. 고용이 줄고 청년층이 지역을 떠나면서 지역경제의 선순환 구조가 무너집니다. 이 악순환의 첫 고리인 "지역 소비"를 다시 지역에 붙잡아 두는 것이 목표였습니다.

## 어떻게 동작하나

- **AI 영수증 인식** — 지역 가게 영수증을 촬영하면 사업자번호와 금액을 인식해 포인트를 적립합니다.
- **지역상품권 교환** — 모은 포인트는 5천 원부터 5만 원까지 지역상품권으로 바꿉니다.
- **AI 상담원** — 영수증 등록, 포인트 교환, 이벤트 참여 방법을 언제든 안내합니다.
- **이벤트** — 주차별 핫플레이스 리워드, 연속 방문 미션(RE:챌린지), 친구 초대, 영수증 랜덤 추첨.
- **마이페이지** — 이번 달 소비를 식비·쇼핑·그 외로 나눠 보여주는 소비 리포트.

![적립한 포인트로 지역상품권 교환](/images/activities/repoint/store.webp)

## 현장에서

![멋쟁이사자처럼 13기 연합해커톤 현장](/images/activities/likelion/05.webp)

멋쟁이사자처럼 13기 전국 연합해커톤. RE:POINT를 함께 만든 idiot팀과 수많은 팀들이 한 공간에서 경쟁했습니다.

## 앱 하나로 끝나지 않도록

서비스가 실제로 굴러가려면 지역과 함께 가야 했습니다. 확산 계획을 3단계로 세웠습니다.

- **STEP 1 · 순천 시범 운영** — 순천시청 협력, 포인트와 순천사랑상품권 연동, 지역 상인회 협약과 가맹점 확보
- **STEP 2 · 지역 확산** — 순천만국제정원박람회 소비 인증 이벤트, 전통시장·청년몰·친환경 매장 제휴 확대
- **STEP 3 · 전국 확산** — 소비 데이터 기반 정책 제안과 지자체 협력 모델

[[gallery]]

## 돌아보며

대학로 상권을 살리기 위한 '이음' 프로젝트와 RE:POINT는 같은 질문에서 출발했습니다. "지역에서 쓴 돈이 지역에 남게 하려면 무엇이 필요할까?" 기술이 편리함을 넘어 공동체를 잇는 도구가 될 수 있다는 걸 다시 한 번 확인한 프로젝트였습니다.`,
    updated_at: now,
  },

  // pedaleye-startup-300
  KqO7WBKKFAWb2xaFuz8Q: {
    images: [
      { src: '/images/activities/startup-300/01.webp', caption: '2025 학생창업유망팀 300+ 아이디어캠프 행사장' },
      { src: '/images/activities/startup-300/02.webp', caption: '2025 학생창업유망팀 300+ 행사장 현장' },
    ],
    body: `PEDALEYE는 무선 세이프페달과 페달라이트 블랙박스로 급발진 사고 상황을 기록하고, 그 데이터를 분석하는 팀입니다. 저는 팀의 **웹 개발 파트**를 맡았습니다.

![2025 학생창업유망팀 300+ 아이디어캠프 행사장](/images/activities/startup-300/01.webp)

## 맡은 일

- 서비스 웹사이트 운영
- 급발진 사고 데이터 분석 결과를 사람들이 이해하기 쉽게 시각화

![행사장 현장 — 2025 학생창업유망팀 300+](/images/activities/startup-300/02.webp)

## 결과

탁월한 창업 역량과 성장 가능성을 인정받아 **2025 학생 창업유망팀 300+ 경진대회 성장트랙**에 최종 선정되었고, **교육부장관 인증서**를 받았습니다.

## 배운 것

복잡한 기술과 데이터를 가진 팀일수록, 그 가치를 처음 보는 사람에게 한 화면으로 전달하는 일이 중요했습니다. 웹은 팀의 기술을 세상에 소개하는 첫 번째 창구였습니다.

[[gallery]]`,
    updated_at: now,
  },

  // care-center-mentor
  '7XudE9238q9dHD0zUaR7': {
    images: [
      { src: '/images/activities/youth-mentor/01.webp', caption: '다함께돌봄센터에서 아이들과 함께한 체험 활동 (2025.07.11)' },
      { src: '/images/activities/youth-mentor/02.webp', caption: '체험 활동 현장' },
    ],
    body: `2022년 지역아동센터에서 시작한 대학생 멘토 활동은 2025년 다함께돌봄센터까지 **4년** 동안 이어졌습니다.

- **2022** 지역아동센터 대학생 멘토
- **2023** 지역아동센터 대학생 멘토
- **2024** 지역아동센터 및 다함께돌봄센터 대학생 멘토
- **2025** 다함께돌봄센터 대학생 멘토 (대학생청소년교육지원)

![다함께돌봄센터에서 아이들과 함께한 체험 활동 (2025.07.11)](/images/activities/youth-mentor/01.webp)

## 돌봄 현장에서 배운 것

아이들이 있는 공간은 예기치 못한 사고와 돌발 상황이 잦습니다. 직접 체험 프로그램을 준비하고 진행하면서, 아이들이 주도적으로 참여할 수 있는 환경을 만드는 법을 배웠습니다.

![체험 활동 현장](/images/activities/youth-mentor/02.webp)

## 4년이라는 시간

> 한 번의 큰 성과보다 매주 같은 자리에 있는 것이 더 어렵다.

꾸준함은 결과라는 점보다 성장의 선을 그리는 방식입니다. 4년 동안 한 주도 빠지지 않고 현장에 있었던 것이, 이후 어떤 일에서도 포기하지 않는 태도로 연결됐습니다.

[[gallery]]`,
    updated_at: now,
  },

  // foreign-student-mentor-2024
  L8x3q15rV0sZyFywSm4z: {
    images: [
      { src: '/images/activities/foreign-mentor/01.webp', caption: '외국인 유학생과 함께 노트북으로 학습하는 멘토링 현장' },
      { src: '/images/activities/foreign-mentor/02.webp', caption: '외국인 유학생 멘토링 활동' },
    ],
    body: `2024년, 외국인 유학생 학습튜터링 멘토로 활동했습니다. 같은 학교에 다니지만 언어와 문화의 벽으로 어려움을 겪는 외국인 유학생들과 함께 공부하고, 학교 생활에 적응할 수 있도록 도왔습니다.

![외국인 유학생과 함께 노트북으로 학습하는 멘토링 현장](/images/activities/foreign-mentor/01.webp)

## 멘토로서 배운 것

가르치는 것은 가장 깊이 배우는 방법입니다. 외국인 학생들이 이해하기 어려운 개념을 다시 설명하려다 보면, 내가 얼마나 그것을 제대로 알고 있는지 되돌아보게 됩니다.

![멘토링 현장 — 함께 공부하는 시간](/images/activities/foreign-mentor/02.webp)

## 국경을 넘어 연결되다

국적과 언어가 달라도 배우고자 하는 마음은 같습니다. 멘토링을 하면서 다양한 문화적 배경을 가진 사람들과 소통하는 법을 배웠고, 이 경험은 이후 다국어 서비스 개발 프로젝트에도 직접적으로 연결됐습니다.

[[gallery]]`,
    updated_at: now,
  },

  // ta-assistant-2024
  UBco0hWiMNmUv8tHBDJD: {
    images: [
      { src: '/images/activities/ta-assistant/01.webp', caption: '데이터베이스 과목 TA 수업 현장 — SQL 문제 풀이' },
      { src: '/images/activities/ta-assistant/02.webp', caption: 'TA 수업 현장 (2)' },
    ],
    body: `2024년 1학기, **데이터베이스 과목 TA(Teaching Assistant) 조교**를 맡았습니다. 같은 학과 후배들이 처음으로 SQL을 배우고, 데이터베이스 개념을 이해하는 과정을 곁에서 도왔습니다.

![데이터베이스 과목 TA 수업 현장 — SQL 문제 풀이](/images/activities/ta-assistant/01.webp)

## 맡은 일

- 주간 실습 시간 조교 운영
- 과제·시험 채점 보조
- 학생 질문 응대 및 개념 설명

![TA 수업 현장 (2)](/images/activities/ta-assistant/02.webp)

## 배운 것

> 가르치는 사람이 가장 많이 배운다.

내가 완벽히 이해하지 못한 것은 설명할 수 없습니다. TA를 하면서 데이터베이스 개념을 다시 한 번 처음부터 정리했고, 그 과정에서 채워지지 않았던 빈틈들을 발견했습니다.

[[gallery]]`,
    updated_at: now,
  },

  // pungunjaeja-youth-policy
  oLa8o1234uTLyyUGTDIy: {
    images: [
      { src: '/images/activities/youth-policy/01.webp', caption: '전라남도 4차산업 아이디어 경진대회 발표 현장 (2024.11)' },
      { src: '/images/activities/youth-policy/02.webp', caption: '경진대회 발표 — 프로젝트 협력 지원 세부' },
      { src: '/images/activities/youth-policy/03.webp', caption: '2024 진도 남문로 미식투어 — 현장 단체 사진' },
      { src: '/images/activities/youth-policy/04.webp', caption: '순천시 시민이활동지원센터 행사 현장' },
      { src: '/images/activities/youth-policy/05.webp', caption: '2024 도란도란 서포터즈 발대식 (2024.09.26, 순천시 상권활성화재단)' },
      { src: '/images/activities/youth-policy/06.webp', caption: '세미나 및 심사 현장' },
    ],
    body: `2024년 하반기, 청년정책추진단 **풍운재자**의 대표를 맡았습니다. 지역 청년들이 직접 지역 문제를 발굴하고, 정책으로 연결해내는 단체입니다. "풍운재자(風雲才子)"는 바람과 구름처럼 세상을 누비는 재능 있는 사람들이라는 뜻입니다.

## 전라남도 4차산업 아이디어 경진대회 주최

![전라남도 4차산업 아이디어 경진대회 발표 현장 (2024.11)](/images/activities/youth-policy/01.webp)

풍운재자 대표로 **전라남도 4차산업 아이디어 경진대회**를 주최했습니다. MyWay, RE:POINT 등 대학생 아이디어 팀들이 참여해 지역 문제를 기술로 해결하는 방안을 발표했습니다.

![경진대회 발표 — 프로젝트 협력 지원 세부](/images/activities/youth-policy/02.webp)

경진대회를 단순한 발표 행사가 아니라, 대학생 아이디어가 실제 지역 문제와 연결되는 접점으로 만들었습니다.

## 진도군 미식여행 주관

![2024 진도 남문로 미식투어 — 현장 단체 사진](/images/activities/youth-policy/03.webp)

**진도군 상권활성화재단**과 연계해 **진도미식여행**을 1회차부터 3회차까지 주관했습니다. 진도 지역 소상공인의 음식과 문화를 직접 체험하고 알리는 프로그램이었습니다.

## 순천시 시민이활동지원센터 연계

![순천시 시민이활동지원센터 행사 현장](/images/activities/youth-policy/04.webp)

순천시 시민이활동지원센터와 연계해 지역 청년 활동을 지원하는 사업에도 참여했습니다.

## 도란도란서포터즈 — 순천시 상권활성화재단 대학생 팀장

![2024 도란도란 서포터즈 발대식 (2024.09.26, 순천시 상권활성화재단)](/images/activities/youth-policy/05.webp)

순천시 상권활성화재단 **도란도란서포터즈** 대학생 팀장을 맡았습니다. 2024년 9월 26일 발대식을 시작으로, 소상공인시장진흥공단, 전라남도, 순천시와 협력해 지역 상권 활성화 프로그램을 운영했습니다.

> 관련 기사: [국제뉴스 — 도란도란서포터즈 대학생팀 활동](https://www.gukjenews.com/news/articleView.html?idxno=3098271) · [뉴스꽃 — 순천 도란도란서포터즈](http://www.newsggam.com/news/articleView.html?idxno=131093)

![세미나 및 심사 현장](/images/activities/youth-policy/06.webp)

지자체와 함께 일한다는 것이 무엇인지, 지역 상권과 대학생이 어떻게 연결될 수 있는지를 직접 보고 체험한 활동이었습니다. 이 경험은 이후 RE:POINT, 이음 등 지역 상권 관련 프로젝트의 출발점이 됐습니다.

[[gallery]]`,
    updated_at: now,
  },
};

// ─── PROJECT UPDATES ──────────────────────────────────────────────────────────

const projectUpdates = {
  // linkers
  iLrClbPdesgAaHYF1d0v: {
    subtitle: '대학생이 만들고 학교가 활용하는 교육 프로그램 마켓플레이스',
    summary: '대학생이 직접 만든 교육 프로그램을 학교가 구매·활용하는 B2B 마켓플레이스. 판매자·구매자·관리자 삼자 역할 분리, Kakao OAuth 인증, PortOne v2 결제, AWS S3+CloudFront 파일 보호(다운로드 횟수 제한)까지 갖춘 풀스택 서비스입니다.',
    problem: ['교육 콘텐츠 제작자(대학생)와 소비자(학교) 사이의 거래 창구 부재', '구매 검증 없는 콘텐츠 접근 및 저작권 보호 문제'],
    process: ['Kakao OAuth 2.0 + JWT 이중 인증 구현', 'PortOne v2 SDK로 결제 및 환불 처리', 'AWS S3 + CloudFront signed URL 기반 파일 다운로드 (파일당 최대 5회 제한)', '판매자 대시보드 — 일별·월별 매출 차트 (Recharts)', '관리자 — 프로그램 승인/거절/정지, 신고 처리, 정산 및 출금 관리'],
    insight: '서비스 완성도는 결국 세 역할(구매자·판매자·관리자)의 경험을 균형 있게 설계하는 데 있었습니다. 각 역할이 필요한 기능만 보이도록 접근을 제어하는 것이 핵심이었습니다.',
    tech: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Prisma ORM', 'PortOne v2', 'AWS S3', 'CloudFront', 'Vercel'],
    github_url: 'https://github.com/LimJongTak/linkers',
    demo_url: 'https://linkers-seven.vercel.app',
    published: true,
    updated_at: now,
  },

  // ogogago
  '0zOf9WX7bUs6g86KGdgh': {
    subtitle: '스마트 경조사 장부 — 가족과 함께 주고받는 모든 경조사를 한 곳에',
    summary: '결혼·장례·생일 등 경조사에서 주고받는 금전 내역을 직관적으로 관리하는 모바일 장부 앱. 가족 공유 장부(6자리 초대 코드), 월별·연간 통계, 엑셀 가져오기/내보내기, 연간 리포트 이미지 공유까지 지원합니다.',
    problem: ['경조사 내역을 수기로 관리하다 보면 누락·오기가 잦음', '가족끼리 경조사 내역을 공유하고 함께 관리하는 도구 부재'],
    process: ['Google·Kakao·Naver·이메일 멀티 OAuth 로그인', 'Firestore 실시간 동기화 + SQLite(Drift) 오프라인 캐시', '6자리 초대 코드 기반 가족 공유 장부 (최대 10명)', '연간·월별 통계 차트 및 연간 리포트 이미지 캡처·공유', 'PDF·엑셀 가져오기/내보내기, 구글 드라이브 백업·복원'],
    insight: '경조사 장부는 단순한 메모가 아닙니다. "다음에 얼마를 해야 하지?"라는 질문에 바로 답할 수 있어야 비로소 쓸모 있는 앱이 됩니다.',
    tech: ['Flutter', 'Dart', 'Firebase Auth', 'Firestore', 'SQLite (Drift)', 'Riverpod'],
    github_url: 'https://github.com/LimJongTak/ceremonial-ledger',
    published: true,
    updated_at: now,
  },

  // A.U.R.A mileage
  Hquc4lqeCA7rbPdLNmuf: {
    subtitle: '국립순천대학교 AI 인재 부트캠프 마일리지·프로그램 관리 플랫폼',
    summary: '부트캠프 참여 활동을 마일리지로 적립·관리하고, 비교과 프로그램 신청·이수 확인까지 한 곳에서 처리하는 웹 서비스. 스프레드시트와 Google Apps Script로 운영하던 기존 시스템을 대체하며, AES-256-GCM 암호화로 개인정보를 보호합니다.',
    problem: ['스프레드시트·GAS 기반 운영으로 인한 중복·누락 오류', '학생·관리자 양측의 처리 창구가 분산되어 있는 비효율'],
    process: ['학생 — 마일리지 신청·조회, 비교과 프로그램 신청, 이수 요건 확인', '관리자 — 일괄 지급·회수, 프로그램별 참여 확인, 알림 발송', 'AES-256-GCM 암호화(계좌·전화번호), IP 기반 Rate Limiting', '이메일 인증(Resend API), 첫 로그인 비밀번호 강제 변경'],
    insight: '행정 시스템은 오류가 없어야 신뢰받습니다. 기능보다 데이터 정합성과 감사 로그 설계에 더 많은 시간을 쏟았습니다.',
    tech: ['Next.js 16', 'React 19', 'TypeScript', 'Firebase Auth', 'Firestore', 'Firebase App Hosting', 'Resend'],
    demo_url: 'https://aura.scnuai.com',
    github_url: 'https://github.com/LimJongTak/aura',
    published: true,
    updated_at: now,
  },

  // 장흥표고 웹카탈로그
  '9E3XhMciUTl8xdVWRPad': {
    subtitle: '한·영·중·베 4개 언어 지원 장흥표고 비건 햄 웹 카탈로그',
    summary: '장흥군 특산물 표고버섯으로 만든 비건 햄 MushEat의 글로벌 진출을 위한 다국어 제품 카탈로그. 2025 SCNU 지역현안문제해결 경진대회 프로젝트로, 외국인 소비자 시식 조사를 바탕으로 개발했습니다.',
    demo_url: 'https://jjpyogo-catalog.onrender.com',
    published: true,
    updated_at: now,
  },

  // MushEat
  a2oBPUxjPM1maDscbPQ0: {
    subtitle: '표고버섯 기반 비건 햄 MushEat 브랜드 웹사이트',
    summary: '장흥표고의 비건 햄 브랜드 MushEat 공식 웹사이트. 2025 SCNU 지역현안문제해결 경진대회에서 외국인 유학생 소비자 조사와 함께 개발한 프로젝트로, 한국어·영어·중국어·베트남어 다국어 지원을 목표로 합니다.',
    demo_url: 'https://musheat.onrender.com',
    published: true,
    updated_at: now,
  },

  // 2025 대동제 축제 웹서비스 project
  cScv0QXbs7N4rQjkJ57C: {
    subtitle: '2025 국립순천대학교 대동제 FairyTale 공식 웹사이트',
    summary: '총학생회 부총학생회장 겸 축제사이트 개발 팀장으로 개발·운영한 2025 대동제 FairyTale 공식 웹사이트. 라인업, 푸드트럭·부스 지도, 공지 등을 한 곳에서 제공하며, 이틀간 약 8만여 명이 방문한 축제에서 약 4만 명의 실사용자가 접속했습니다.',
    demo_url: 'https://scnuseohwa.onrender.com',
    published: true,
    updated_at: now,
  },

  // roster-scheduler → 메인에서 제외
  MQgLLpZJz54a4vUCJa96: {
    published: false,
    featured: false,
    updated_at: now,
  },

  // online-education → 메인에서 제외
  dio91ILZD8b8hJ8VvloS: {
    published: false,
    featured: false,
    updated_at: now,
  },
};

// ─── NEW POSTS ────────────────────────────────────────────────────────────────

const newPosts = [
  {
    slug: 'local-issue',
    title: 'SCNU 지역현안문제해결 — 로컬의 한계를 넘어 글로벌로',
    excerpt: '2025 SCNU 지역현안문제해결 경진대회에서 장흥표고 비건 햄 MushEat의 글로벌 진출을 연구했습니다. CEO 미팅부터 외국인 시식 조사, 다국어 웹 카탈로그 개발까지.',
    category: 'etc',
    period: '2025.10 – 2025.12',
    place: '국립순천대학교',
    role: '팀 프로젝트 (기획·조사·개발)',
    tags: ['지역현안', '경진대회', 'MushEat', '다국어 웹', '장흥표고'],
    featured: false,
    published: true,
    sort_order: 20,
    views: 0,
    images: [
      { src: '/images/activities/local-issue/01.webp', caption: '장흥표고 CEO와의 비즈니스 미팅' },
      { src: '/images/activities/local-issue/02.webp', caption: '외국인 유학생 대상 MushEat 비건 햄 시식 및 설문조사 (2025.11.29)' },
      { src: '/images/activities/local-issue/03.webp', caption: '"로컬의 한계를 넘어, 글로벌 확신으로" — 2025 SCNU 지역현안문제해결 경진대회 발표' },
      { src: '/images/activities/local-issue/04.webp', caption: '추가 기업 미팅 현장' },
      { src: '/images/activities/local-issue/05.webp', caption: '경진대회 발표 현장 (2)' },
    ],
    body: `2025년 하반기, 국립순천대학교 **SCNU 지역현안문제해결 경진대회**에 참여했습니다. 지역 기업과 협력해 현실 문제를 직접 해결하는 프로젝트였습니다.

## 과제: 로컬 제품의 글로벌 진출

장흥군 특산물인 표고버섯으로 만든 비건 햄 브랜드 **MushEat**. 국내 소비자에게도 생소한 제품을 어떻게 해외 시장에 알릴 수 있을까 — 그것이 우리 팀이 받은 과제였습니다.

## 현장으로 간다 — CEO 미팅

![장흥표고 CEO와의 비즈니스 미팅](/images/activities/local-issue/01.webp)

이론이 아니라 현장에서 시작했습니다. 직접 장흥표고를 방문해 CEO와 이야기를 나눴습니다. 제품의 탄생 배경, 현재 판매 현황, 글로벌 시장에서 겪는 어려움을 직접 들었습니다.

![추가 기업 미팅 현장](/images/activities/local-issue/04.webp)

## 외국인 대상 소비자 조사

![외국인 유학생 대상 MushEat 비건 햄 시식 및 설문조사 (2025.11.29)](/images/activities/local-issue/02.webp)

가장 먼저 "외국인들이 이 제품을 어떻게 생각하는지"를 알아야 했습니다. 국립순천대학교 외국인 유학생들을 대상으로 비건 햄 시식 행사와 설문조사를 진행했습니다. 한국어·영어·중국어·베트남어로 소통하며 제품의 강점과 개선점을 수집했습니다.

## 솔루션: 다국어 웹 카탈로그

외국인 소비자가 가장 불편해한 것은 "어디서 살 수 있는지, 어떤 제품인지" 정보가 없다는 것이었습니다. 그래서 한국어·영어·중국어·베트남어 4개 언어를 지원하는 **장흥표고 웹 카탈로그**를 개발했습니다.

> 웹 카탈로그: [jjpyogo-catalog.onrender.com](https://jjpyogo-catalog.onrender.com) · MushEat 사이트: [musheat.onrender.com](https://musheat.onrender.com)

## 경진대회 발표

!["로컬의 한계를 넘어, 글로벌 확신으로" — 2025 SCNU 지역현안문제해결 경진대회](/images/activities/local-issue/03.webp)

경진대회 발표 주제는 **"로컬의 한계를 넘어, 글로벌 '확신'으로"**. 현장 조사, 소비자 인터뷰, 솔루션 개발까지의 전 과정을 발표했습니다.

![경진대회 발표 현장 (2)](/images/activities/local-issue/05.webp)

## 배운 것

> 기술은 현장의 질문에 답해야 한다.

CEO의 이야기를 듣지 않았다면, 외국인 소비자를 직접 만나지 않았다면, 개발한 웹사이트는 그저 번역 사이트에 불과했을 것입니다. 현장에서 발굴한 문제가 기술의 방향을 바꿨습니다.

[[gallery]]`,
    created_at: now,
    updated_at: now,
  },
];

// ─── NEW PROJECTS ─────────────────────────────────────────────────────────────

const newProjects = [
  {
    slug: 'scnuai',
    title: 'SCNUAI 대회 온라인 전시관',
    subtitle: 'AI 인재 부트캠프 공모전 운영 및 온라인 작품 전시 플랫폼',
    year: 2026,
    period: '2025 –',
    category: 'web',
    role: 'Full-Stack 개발',
    team: '',
    summary: '국립순천대학교 AI인재양성부트캠프 공모전을 위한 온라인 전시관·심사 플랫폼. PDF 발표 자료를 자동으로 이미지로 변환해 갤러리 형태로 전시하고, 심사위원이 루브릭 기반으로 채점합니다. 관리자는 대회 설정, 참가자 관리, 마일리지 배분, 방문자 분석을 한 곳에서 처리합니다.',
    problem: ['공모전 출품작을 온라인으로 전시하고 심사하는 통합 플랫폼 부재', 'PDF 자료를 갤러리로 보여주는 자동 변환 과정의 복잡성'],
    process: ['PDF → 페이지별 이미지 자동 변환 (pdfjs-dist)', '프로젝트 링크 → 미리보기 카드 자동 생성', '심사위원 루브릭 기반 채점 + 엑셀 일괄 업로드', '관리자 대시보드 — 대회·참가자·마일리지·방문자 분석 통합 관리'],
    insight: '전시와 심사가 동일한 플랫폼 위에 있을 때, 참가자는 다른 팀의 작품을 보며 영감을 얻고, 심사위원은 맥락과 함께 평가합니다.',
    highlights: ['PDF 자동 이미지 변환 갤러리', '루브릭 기반 심사 + 엑셀 대량 채점', '마일리지 연동 및 방문자 분석'],
    tech: ['Next.js 16', 'React 19', 'TypeScript', 'Firebase Auth', 'Firestore', 'Firebase Storage', 'Cloud Functions', 'Tailwind CSS v4'],
    github_url: 'https://github.com/LimJongTak/auraproject',
    demo_url: 'https://scnuai.com',
    cover: '',
    accent: '#6366f1',
    featured: false,
    published: true,
    sort_order: 10,
    views: 0,
    likes: 0,
    created_at: now,
    updated_at: now,
  },
  {
    slug: 'axlab',
    title: 'AXLab 오픈랩 예약 시스템',
    subtitle: '국립순천대학교 디지털+X 산업기술센터 시설 예약 플랫폼',
    year: 2025,
    period: '2025',
    category: 'web',
    role: 'Full-Stack 개발',
    team: '',
    summary: '인증 없이 시설을 예약할 수 있는 간편 예약 플랫폼. 월별 캘린더 뷰, 시간대별 슬롯 선택, 중복 예약 자동 방지, 관리자 승인 시스템을 갖추고 있습니다. 최대 2주 전 예약, 하루 최대 9시간 제한을 적용합니다.',
    problem: ['시설 예약이 오프라인 또는 별도 연락으로만 가능해 불편', '중복 예약, 미처리 신청 등 운영 오류 발생'],
    process: ['로그인 없이 이름·연락처로 예약 신청', '예약 슬롯 상태 — 가능/대기/승인/불가 4단계 표시', '관리자 대시보드 — 승인·거절·삭제, 시설 추가·운영시간 조정', 'Firestore 기반 중복 예약 충돌 자동 방지'],
    insight: '예약 시스템의 핵심은 "지금 가능한지"를 한눈에 보여주는 것입니다. 슬롯 상태를 색상으로 명확히 구분하는 것만으로 문의 전화를 크게 줄일 수 있었습니다.',
    tech: ['Next.js', 'TypeScript', 'Firebase Firestore', 'Tailwind CSS'],
    github_url: 'https://github.com/LimJongTak/digital',
    demo_url: 'https://axlab.scnuai.com',
    cover: '',
    accent: '#0ea5e9',
    featured: false,
    published: true,
    sort_order: 11,
    views: 0,
    likes: 0,
    created_at: now,
    updated_at: now,
  },
  {
    slug: 'youth',
    title: '청년도약 인재양성 부트캠프',
    subtitle: '국립순천대학교 청년도약인재양성부트캠프사업단 홍보 웹앱',
    year: 2025,
    period: '2025 –',
    category: 'web',
    role: 'Full-Stack 개발',
    team: '',
    summary: '부트캠프 모집 공고와 프로그램 소개를 위한 홍보 사이트이자 관리자 CMS. 모바일 최적화 디자인(390×844px 기준)으로 실제 모바일에서 자연스럽게 확장되며, 관리자와 매니저 역할 기반 콘텐츠 관리를 지원합니다.',
    problem: ['부트캠프 모집 정보를 별도 SNS·문서로 관리해 정보 분산', '비개발자 담당자가 콘텐츠를 직접 수정하기 어려운 구조'],
    process: ['모바일 퍼스트 UI — 390px 기준 설계, 실제 기기에서 자연 확장', 'Firebase 실시간 동기화로 관리자 수정 즉시 반영', '관리자(전체 권한)·매니저(콘텐츠 편집) 2단계 역할 분리', 'Cloudflare Pages + GitHub Actions CI/CD 자동 배포'],
    insight: '홍보 사이트의 생명은 최신성입니다. 담당자가 직접, 즉시 수정할 수 있는 CMS 구조가 없다면 사이트는 금방 구식이 됩니다.',
    tech: ['React 19', 'TypeScript', 'Vite', 'SCSS Modules', 'Firebase Firestore', 'Firebase Auth', 'Cloudflare Pages'],
    github_url: 'https://github.com/LimJongTak/youth',
    demo_url: 'https://youth.scnuai.com',
    cover: '',
    accent: '#10b981',
    featured: false,
    published: true,
    sort_order: 12,
    views: 0,
    likes: 0,
    created_at: now,
    updated_at: now,
  },
];

// ─── RUN UPDATES ──────────────────────────────────────────────────────────────

console.log('Updating posts...');
for (const [id, data] of Object.entries(posts)) {
  await db.collection('posts').doc(id).update(data);
  console.log('  ✔ post', id, '(', data.title?.slice(0, 30) || 'body/images update', ')');
}

console.log('\nUpdating projects...');
for (const [id, data] of Object.entries(projectUpdates)) {
  await db.collection('projects').doc(id).update(data);
  console.log('  ✔ project', id);
}

console.log('\nCreating new posts...');
for (const post of newPosts) {
  // Check if slug already exists
  const existing = await db.collection('posts').where('slug', '==', post.slug).get();
  if (!existing.empty) {
    console.log('  ~ post slug already exists:', post.slug);
    await db.collection('posts').doc(existing.docs[0].id).update(post);
  } else {
    const ref = await db.collection('posts').add(post);
    console.log('  ✔ created post', ref.id, post.slug);
  }
}

console.log('\nCreating new projects...');
for (const proj of newProjects) {
  const existing = await db.collection('projects').where('slug', '==', proj.slug).get();
  if (!existing.empty) {
    console.log('  ~ project slug already exists:', proj.slug);
    await db.collection('projects').doc(existing.docs[0].id).update(proj);
  } else {
    const ref = await db.collection('projects').add(proj);
    console.log('  ✔ created project', ref.id, proj.slug);
  }
}

console.log('\nDone!');
process.exit(0);
