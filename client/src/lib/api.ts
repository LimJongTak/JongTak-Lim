export type Rich = string | { text: string; color: 'dot' | 'line' };

export type Profile = {
  name: string; nameEn: string; role: string; roles: string[];
  headline: { line1: Rich[]; line2: Rich[]; line3: string };
  intro: string; photo?: string; email: string; github: string; location: string;
  education: { school: string; major: string; period: string; status: string; gpa: string; thesis: string };
  military?: string;
  stats: { value: number; suffix: string; label: string }[];
  philosophy: {
    title: string; quote: string;
    before: { title: string; body: string; tags: string[] };
    after: { title: string; body: string; flow: string[] };
    lesson: string;
  };
  growth: { title: string; subtitle: string; timeline: { year: string; text: string }[]; conversions: { from: string; to: string }[] };
  future: { title: string; subtitle: string; steps: { stage: string; tool: string; body: string }[]; quote: string };
  closing: { title: string; subtitle: string; body: string };
};

export type Project = {
  id: number; slug: string; title: string; subtitle: string; year: number; period: string;
  category: 'web' | 'app' | 'etc'; role: string; team: string; summary: string;
  problem?: string[]; process?: string[]; insight?: string;
  highlights: { label: string; value: string }[]; tech: string[];
  github_url: string; demo_url: string; cover: string; accent: string;
  featured: boolean; published?: number; sort_order?: number; views: number; likes: number;
};

export type ProjectDetail = Project & {
  liked: boolean;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
};

export type Experience = {
  id: number; category: string; org: string; title: string;
  start_date: string; end_date: string; items: string[]; sort_order: number;
};
export type Award = { id: number; kind: 'award' | 'certificate' | 'completion'; date: string; title: string; issuer: string; description: string; sort_order: number };
export type Skill = { id?: number; name: string; category: string; sort_order?: number };
export type Repo = { name: string; description: string; language: string; html_url: string; homepage: string; stars: number; pushed_at: string; hidden?: number };
export type GuestbookEntry = { id: number; name: string; message: string; reply: string; created_at: string; is_hidden?: number };
export type Message = { id: number; name: string; email: string; company: string; subject: string; message: string; is_read: number; created_at: string };

export type PortfolioData = {
  profile: Profile; skills: Skill[]; experiences: Experience[]; awards: Award[]; projects: Project[]; repos: Repo[];
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public issues?: { path: string; message: string }[]) { super(message); }
}

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    ...rest,
    headers: { ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? '요청에 실패했습니다.', data.issues);
  return data as T;
}

/** API 에러를 사람이 읽을 메시지로 */
export function errorText(e: unknown): string {
  if (e instanceof ApiError) return e.issues?.length ? e.issues.map(i => i.message).join(' · ') : e.message;
  return '네트워크 오류가 발생했습니다.';
}

export const CATEGORY_LABEL: Record<string, string> = {
  education: '학력', leadership: '리더십', club: '동아리', volunteer: '봉사 · 멘토링', work: '경력', etc: '기타',
  language: 'Language', frontend: 'Frontend', backend: 'Backend', mobile: 'Mobile', tool: 'Tools', design: 'Design',
  web: 'Web', app: 'App',
  award: '수상', certificate: '자격증', completion: '수료',
};

export function formatDate(s: string) {
  const d = new Date(s.replace(' ', 'T') + (s.includes('T') || s.endsWith('Z') ? '' : 'Z'));
  return isNaN(d.getTime()) ? s : d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}
