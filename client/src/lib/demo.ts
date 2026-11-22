/**
 * 미리보기(데모) 빌드 전용 가짜 백엔드.
 * VITE_DEMO=1 로 빌드하면 api() 호출이 서버 대신 여기로 온다.
 * 실제 서버의 라우트와 응답 모양을 그대로 흉내 내며, 데이터는 이 브라우저의 localStorage에만 저장된다.
 */
import * as seed from '../../../server/src/seed-data';

type Row = Record<string, unknown> & { id: number };
type State = {
  profile: Record<string, unknown>;
  projects: Row[]; experiences: Row[]; awards: Row[]; skills: Row[];
  repos: Row[]; guestbook: Row[]; messages: Row[];
  views: { path: string; day: string; visitor: string }[];
  likes: number[]; seq: number;
};

const KEY = 'jt-portfolio-demo-v1';
const VISITOR = 'demo-visitor';
const rel = (p: unknown) => typeof p === 'string' ? p.replace(/^\//, '') : p;
const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const today = () => new Date().toISOString().slice(0, 10);

function initial(): State {
  let id = 1;
  const profile = { ...seed.profile, photo: rel(seed.profile.photo) as string };
  const projects = seed.projects.map((p, i) => ({
    id: id++, period: '', team: '', problem: [], process: [], insight: '', highlights: [], github_url: '', demo_url: '',
    ...p, cover: rel(p.cover ?? ''), featured: !!p.featured, published: 1, sort_order: i, views: 0, likes: 0,
  }));
  const experiences = seed.experiences.map((e, i) => ({ id: id++, ...e, sort_order: i }));
  const awards = seed.awards.map((a, i) => ({ id: id++, ...a, sort_order: i }));
  const skills = Object.entries(seed.skills).flatMap(([category, names]) => names.map(name => ({ id: id++, name, category, sort_order: 0 })));
  const repos = seed.githubRepos.map(r => ({ id: id++, ...r, html_url: `https://github.com/LimJongTak/${r.name}`, homepage: '', stars: 0, hidden: 0 }));
  const guestbook = [
    { id: id++, name: '미리보기', message: '데모 방명록입니다. 직접 남겨보세요! (이 브라우저에만 저장돼요)', reply: '방문해 주셔서 감사합니다 :)', is_hidden: 0, password: '0000', created_at: now() },
  ];
  return { profile, projects, experiences, awards, skills, repos, guestbook, messages: [], views: [], likes: [], seq: id };
}

let state: State = (() => {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw) as State; } catch { /* ignore */ }
  return initial();
})();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } };
const nextId = () => state.seq++;

class DemoError extends Error { constructor(public status: number, message: string) { super(message); } }
const fail = (status: number, message: string): never => { throw new DemoError(status, message); };

let loggedIn = false;
try { loggedIn = sessionStorage.getItem(KEY + ':auth') === '1'; } catch { /* ignore */ }

const byOrder = (a: Row, b: Row) => (Number(a.sort_order) - Number(b.sort_order)) || (a.id - b.id);
const publishedProjects = () => state.projects.filter(p => p.published)
  .sort((a, b) => (Number(b.featured) - Number(a.featured)) || byOrder(a, b));
const strip = ({ password: _p, ...g }: Row) => g;

const RESOURCES = ['projects', 'experiences', 'awards', 'skills'] as const;
type Res = typeof RESOURCES[number];

export async function demoApi(path: string, method: string, body: Record<string, unknown> = {}): Promise<unknown> {
  await new Promise(r => setTimeout(r, 120)); // 네트워크 느낌
  const [p, qs] = path.split('?');
  const q = new URLSearchParams(qs);
  let m: RegExpMatchArray | null;
  const r = (re: RegExp) => (m = p.match(re));

  /* ── 공개 ── */
  if (method === 'GET' && p === '/portfolio') return {
    profile: state.profile, skills: [...state.skills].sort(byOrder), experiences: [...state.experiences].sort(byOrder),
    awards: [...state.awards].sort(byOrder), projects: publishedProjects(),
    repos: state.repos.filter(x => !x.hidden).sort((a, b) => String(b.pushed_at).localeCompare(String(a.pushed_at))).slice(0, 12),
  };
  if (method === 'GET' && r(/^\/projects\/([\w-]+)$/)) {
    const list = publishedProjects();
    const i = list.findIndex(x => x.slug === m![1]);
    if (i < 0) fail(404, '프로젝트를 찾을 수 없습니다.');
    const pick = (x?: Row) => x ? { slug: x.slug, title: x.title } : null;
    return { ...list[i], liked: state.likes.includes(list[i].id), prev: pick(list[i - 1]), next: pick(list[i + 1]) };
  }
  if (method === 'POST' && r(/^\/projects\/([\w-]+)\/like$/)) {
    const pr = state.projects.find(x => x.slug === m![1]) ?? fail(404, '프로젝트를 찾을 수 없습니다.');
    const liked = !state.likes.includes(pr.id);
    state.likes = liked ? [...state.likes, pr.id] : state.likes.filter(x => x !== pr.id);
    pr.likes = Math.max(0, Number(pr.likes) + (liked ? 1 : -1));
    save();
    return { liked, likes: pr.likes };
  }
  if (method === 'POST' && p === '/track') {
    const path2 = String(body.path ?? '/');
    if (!state.views.some(v => v.path === path2 && v.day === today())) {
      state.views.push({ path: path2, day: today(), visitor: VISITOR });
      const mm = path2.match(/^\/projects\/([\w-]+)$/);
      const pr = mm && state.projects.find(x => x.slug === mm[1]);
      if (pr) pr.views = Number(pr.views) + 1;
      save();
    }
    return undefined;
  }
  if (method === 'GET' && p === '/stats') return { totalVisitors: state.views.length ? 1 : 0, todayVisitors: state.views.some(v => v.day === today()) ? 1 : 0 };

  /* ── 방명록 / 문의 ── */
  if (method === 'GET' && p === '/guestbook') {
    const page = Math.max(1, Number(q.get('page')) || 1);
    const visible = state.guestbook.filter(g => !g.is_hidden).sort((a, b) => b.id - a.id);
    return { items: visible.slice((page - 1) * 10, page * 10).map(strip), total: visible.length, page, pageSize: 10 };
  }
  if (method === 'POST' && p === '/guestbook') {
    const name = String(body.name ?? '').trim(), message = String(body.message ?? '').trim(), password = String(body.password ?? '');
    if (!name || !message) fail(400, '이름과 내용을 입력해 주세요.');
    if (password.length < 4) fail(400, '비밀번호는 4자 이상');
    const g = { id: nextId(), name, message, password, reply: '', is_hidden: 0, created_at: now() };
    state.guestbook.push(g); save();
    return strip(g);
  }
  if (method === 'DELETE' && r(/^\/guestbook\/(\d+)$/)) {
    const g = state.guestbook.find(x => x.id === Number(m![1])) ?? fail(404, '글을 찾을 수 없습니다.');
    if (g.password !== body.password) fail(403, '비밀번호가 일치하지 않습니다.');
    state.guestbook = state.guestbook.filter(x => x !== g); save();
    return undefined;
  }
  if (method === 'POST' && p === '/contact') {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(body.email ?? ''))) fail(400, '올바른 이메일을 입력해 주세요.');
    if (String(body.message ?? '').trim().length < 10) fail(400, '10자 이상 입력해 주세요.');
    state.messages.push({ id: nextId(), name: body.name, email: body.email, company: body.company ?? '', subject: body.subject ?? '', message: body.message, is_read: 0, created_at: now() });
    save();
    return { ok: true };
  }

  /* ── 인증 ── */
  if (method === 'POST' && p === '/auth/login') {
    if (body.username !== 'admin' || body.password !== 'admin1234') fail(401, '아이디 또는 비밀번호가 올바르지 않습니다. (미리보기: admin / admin1234)');
    loggedIn = true; try { sessionStorage.setItem(KEY + ':auth', '1'); } catch { /* ignore */ }
    return { username: 'admin' };
  }
  if (method === 'POST' && p === '/auth/logout') { loggedIn = false; try { sessionStorage.removeItem(KEY + ':auth'); } catch { /* ignore */ } return undefined; }
  if (p.startsWith('/auth') || p.startsWith('/admin')) {
    if (!loggedIn) fail(401, '로그인이 필요합니다.');
  }
  if (method === 'GET' && p === '/auth/me') return { username: 'admin' };
  if (method === 'PUT' && p === '/auth/password') fail(400, '미리보기에서는 비밀번호를 바꿀 수 없습니다.');

  /* ── 관리자 ── */
  if (r(/^\/admin\/content\/(\w+)(?:\/(\d+))?$/)) {
    const res = m![1] as Res;
    if (!RESOURCES.includes(res)) fail(404, '알 수 없는 리소스입니다.');
    const list = state[res];
    const id = m![2] ? Number(m![2]) : null;
    if (method === 'GET') return [...list].sort(byOrder);
    if (method === 'POST') { const row = { id: nextId(), views: 0, likes: 0, ...body } as Row; list.push(row); save(); return row; }
    const row = list.find(x => x.id === id) ?? fail(404, '항목을 찾을 수 없습니다.');
    if (method === 'PUT') { Object.assign(row, body); save(); return row; }
    if (method === 'DELETE') { state[res] = list.filter(x => x !== row) as Row[]; save(); return undefined; }
  }
  if (p === '/admin/profile') {
    if (method === 'PUT') { state.profile = body; save(); }
    return state.profile;
  }
  if (p === '/admin/messages' && method === 'GET') return [...state.messages].sort((a, b) => b.id - a.id);
  if (r(/^\/admin\/messages\/(\d+)$/)) {
    const id = Number(m![1]);
    if (method === 'PATCH') state.messages.forEach(x => { if (x.id === id) x.is_read = body.is_read ? 1 : 0; });
    if (method === 'DELETE') state.messages = state.messages.filter(x => x.id !== id);
    save(); return undefined;
  }
  if (p === '/admin/guestbook' && method === 'GET') return [...state.guestbook].sort((a, b) => b.id - a.id).map(strip);
  if (r(/^\/admin\/guestbook\/(\d+)$/)) {
    const id = Number(m![1]);
    const g = state.guestbook.find(x => x.id === id);
    if (method === 'PATCH' && g) { if (body.is_hidden !== undefined) g.is_hidden = body.is_hidden ? 1 : 0; if (body.reply !== undefined) g.reply = body.reply; }
    if (method === 'DELETE') state.guestbook = state.guestbook.filter(x => x.id !== id);
    save(); return undefined;
  }
  if (p === '/admin/stats') {
    const byDay = new Map<string, number>();
    const byPath = new Map<string, number>();
    for (const v of state.views) { byDay.set(v.day, (byDay.get(v.day) ?? 0) + 1); byPath.set(v.path, (byPath.get(v.path) ?? 0) + 1); }
    return {
      totals: {
        visitors: state.views.length ? 1 : 0, pageViews: state.views.length, todayVisitors: state.views.some(v => v.day === today()) ? 1 : 0,
        unreadMessages: state.messages.filter(x => !x.is_read).length, guestbook: state.guestbook.length, likes: state.likes.length,
      },
      daily: [...byDay].sort().map(([day, views]) => ({ day, views, visitors: 1 })),
      topPaths: [...byPath].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path2, views]) => ({ path: path2, views })),
      topReferrers: [],
      projects: [...state.projects].sort((a, b) => Number(b.views) - Number(a.views)).map(x => ({ slug: x.slug, title: x.title, views: x.views, likes: x.likes })),
    };
  }
  if (p === '/admin/github' && method === 'GET') return [...state.repos].sort((a, b) => String(b.pushed_at).localeCompare(String(a.pushed_at)));
  if (p === '/admin/github/sync') fail(400, '미리보기에서는 GitHub 동기화를 할 수 없습니다. 실제 서버에서 동작합니다.');
  if (r(/^\/admin\/github\/(.+)$/) && method === 'PATCH') {
    const repo = state.repos.find(x => x.name === decodeURIComponent(m![1]));
    if (repo) repo.hidden = body.hidden ? 1 : 0;
    save(); return undefined;
  }
  return fail(404, 'Not found');
}

export function resetDemo() {
  state = initial(); save();
}

export { DemoError };
