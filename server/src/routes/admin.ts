import { Router } from 'express';
import { z, type ZodObject, type ZodRawShape } from 'zod';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { db, getSetting, parseJsonCols, setSetting } from '../db.js';
import { config } from '../config.js';
import { ah, AUTH_COOKIE, HttpError, parse, requireAdmin, signAdmin } from '../middleware.js';
import { syncGithubRepos } from '../github.js';

export const authRouter = Router();
export const adminRouter = Router();

/* ───────────── 인증 ───────────── */

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { error: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해 주세요.' },
});

const LoginBody = z.object({ username: z.string().min(1).max(50), password: z.string().min(1).max(100) });

authRouter.post('/login', loginLimiter, ah(async (req, res) => {
  const { username, password } = parse(LoginBody, req.body);
  const admin = db.prepare('SELECT id, username, password_hash FROM admins WHERE username = ?').get(username) as
    { id: number; username: string; password_hash: string } | undefined;
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    throw new HttpError(401, '아이디 또는 비밀번호가 올바르지 않습니다.');
  }
  const token = signAdmin(admin.id, admin.username);
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true, sameSite: 'strict', secure: config.isProd, maxAge: 7 * 24 * 3600_000, path: '/api',
  });
  res.json({ username: admin.username });
}));

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { path: '/api' });
  res.status(204).end();
});

authRouter.get('/me', requireAdmin, (req, res) => {
  res.json((req as unknown as { admin: unknown }).admin);
});

const PasswordBody = z.object({ current: z.string().min(1), next: z.string().min(8, '8자 이상').max(100) });

authRouter.put('/password', requireAdmin, ah(async (req, res) => {
  const { current, next } = parse(PasswordBody, req.body);
  const { id } = (req as unknown as { admin: { id: number } }).admin;
  const row = db.prepare('SELECT password_hash FROM admins WHERE id = ?').get(id) as { password_hash: string };
  if (!(await bcrypt.compare(current, row.password_hash))) throw new HttpError(403, '현재 비밀번호가 올바르지 않습니다.');
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(await bcrypt.hash(next, 12), id);
  res.status(204).end();
}));

/* ───────────── 관리자 전용 ───────────── */

adminRouter.use(requireAdmin);

/** 콘텐츠 테이블별 스키마. 여기 정의된 필드만 쓸 수 있다(컬럼 화이트리스트). */
const strArr = z.array(z.string().max(300)).max(30);
const RESOURCES: Record<string, { table: string; schema: ZodObject<ZodRawShape>; json: string[]; order: string }> = {
  projects: {
    table: 'projects',
    json: ['problem', 'process', 'highlights', 'tech'],
    order: 'featured DESC, sort_order, id',
    schema: z.object({
      slug: z.string().regex(/^[a-z0-9-]+$/, '영문 소문자, 숫자, - 만 사용').max(60),
      title: z.string().min(1).max(100),
      subtitle: z.string().max(200).default(''),
      year: z.coerce.number().int().min(2000).max(2100),
      period: z.string().max(50).default(''),
      category: z.enum(['web', 'app', 'etc']).default('web'),
      role: z.string().max(100).default(''),
      team: z.string().max(100).default(''),
      summary: z.string().max(1000).default(''),
      problem: strArr.default([]),
      process: strArr.default([]),
      insight: z.string().max(1000).default(''),
      highlights: z.array(z.object({ label: z.string().max(50), value: z.string().max(50) })).max(8).default([]),
      tech: strArr.default([]),
      github_url: z.union([z.url(), z.literal('')]).default(''),
      demo_url: z.union([z.url(), z.literal('')]).default(''),
      cover: z.string().max(500).default(''),
      accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#8b5cf6'),
      featured: z.coerce.boolean().default(false),
      published: z.coerce.boolean().default(true),
      sort_order: z.coerce.number().int().default(0),
    }),
  },
  experiences: {
    table: 'experiences',
    json: ['items'],
    order: 'sort_order, id',
    schema: z.object({
      category: z.enum(['education', 'leadership', 'club', 'volunteer', 'work', 'etc']),
      org: z.string().min(1).max(100),
      title: z.string().max(100).default(''),
      start_date: z.string().max(10),
      end_date: z.string().max(10).default(''),
      items: strArr.default([]),
      sort_order: z.coerce.number().int().default(0),
    }),
  },
  awards: {
    table: 'awards',
    json: [],
    order: 'sort_order, id',
    schema: z.object({
      kind: z.enum(['award', 'certificate', 'completion']),
      date: z.string().max(20),
      title: z.string().min(1).max(150),
      issuer: z.string().max(100).default(''),
      description: z.string().max(500).default(''),
      sort_order: z.coerce.number().int().default(0),
    }),
  },
  skills: {
    table: 'skills',
    json: [],
    order: 'sort_order, id',
    schema: z.object({
      name: z.string().min(1).max(40),
      category: z.enum(['language', 'frontend', 'backend', 'mobile', 'tool', 'design']),
      sort_order: z.coerce.number().int().default(0),
    }),
  },
};

function toDbValues(data: Record<string, unknown>, json: string[]) {
  const out: Record<string, string | number | null> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    if (json.includes(k)) out[k] = JSON.stringify(v);
    else if (typeof v === 'boolean') out[k] = v ? 1 : 0;
    else out[k] = v as string | number | null;
  }
  return out;
}

function resource(name: string) {
  const r = RESOURCES[name];
  if (!r) throw new HttpError(404, '알 수 없는 리소스입니다.');
  return r;
}

adminRouter.get('/content/:resource', ah((req, res) => {
  const r = resource(String(req.params.resource));
  const rows = db.prepare(`SELECT * FROM ${r.table} ORDER BY ${r.order}`).all() as Record<string, unknown>[];
  res.json(rows.map(row => parseJsonCols(row, r.json)));
}));

adminRouter.post('/content/:resource', ah((req, res) => {
  const r = resource(String(req.params.resource));
  const vals = toDbValues(parse(r.schema, req.body), r.json);
  const cols = Object.keys(vals);
  const result = db.prepare(`INSERT INTO ${r.table} (${cols.join(', ')}) VALUES (${cols.map(c => ':' + c).join(', ')})`).run(vals);
  const row = db.prepare(`SELECT * FROM ${r.table} WHERE id = ?`).get(result.lastInsertRowid) as Record<string, unknown>;
  res.status(201).json(parseJsonCols(row, r.json));
}));

adminRouter.put('/content/:resource/:id', ah((req, res) => {
  const r = resource(String(req.params.resource));
  const id = Number(req.params.id);
  // zod 4는 partial()에서도 default를 채우므로, 요청에 실제로 온 키만 남긴다
  const sent = new Set(Object.keys(req.body ?? {}));
  const parsed = parse(r.schema.partial(), req.body) as Record<string, unknown>;
  const vals = toDbValues(Object.fromEntries(Object.entries(parsed).filter(([k]) => sent.has(k))), r.json);
  const cols = Object.keys(vals);
  if (cols.length === 0) throw new HttpError(400, '변경할 값이 없습니다.');
  const touch = r.table === 'projects' ? ", updated_at = datetime('now')" : '';
  const result = db.prepare(`UPDATE ${r.table} SET ${cols.map(c => `${c} = :${c}`).join(', ')}${touch} WHERE id = :id`)
    .run({ ...vals, id });
  if (result.changes === 0) throw new HttpError(404, '항목을 찾을 수 없습니다.');
  const row = db.prepare(`SELECT * FROM ${r.table} WHERE id = ?`).get(id) as Record<string, unknown>;
  res.json(parseJsonCols(row, r.json));
}));

adminRouter.delete('/content/:resource/:id', ah((req, res) => {
  const r = resource(String(req.params.resource));
  const result = db.prepare(`DELETE FROM ${r.table} WHERE id = ?`).run(Number(req.params.id));
  if (result.changes === 0) throw new HttpError(404, '항목을 찾을 수 없습니다.');
  res.status(204).end();
}));

/* 프로필(메인 문구, 연락처, 철학 섹션 등)은 JSON 한 덩어리로 관리 */
adminRouter.get('/profile', (_req, res) => { res.json(getSetting('profile', {})); });
adminRouter.put('/profile', ah((req, res) => {
  const body = parse(z.record(z.string(), z.unknown()), req.body);
  setSetting('profile', body);
  res.json(body);
}));

/* ───────────── 문의함 ───────────── */

adminRouter.get('/messages', ah((_req, res) => {
  res.json(db.prepare('SELECT * FROM messages ORDER BY id DESC').all());
}));
adminRouter.patch('/messages/:id', ah((req, res) => {
  const { is_read } = parse(z.object({ is_read: z.boolean() }), req.body);
  db.prepare('UPDATE messages SET is_read = ? WHERE id = ?').run(is_read ? 1 : 0, Number(req.params.id));
  res.status(204).end();
}));
adminRouter.delete('/messages/:id', ah((req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(Number(req.params.id));
  res.status(204).end();
}));

/* ───────────── 방명록 관리 ───────────── */

adminRouter.get('/guestbook', ah((_req, res) => {
  res.json(db.prepare('SELECT id, name, message, reply, is_hidden, created_at FROM guestbook ORDER BY id DESC').all());
}));
adminRouter.patch('/guestbook/:id', ah((req, res) => {
  const body = parse(z.object({ is_hidden: z.boolean().optional(), reply: z.string().max(500).optional() }), req.body);
  const id = Number(req.params.id);
  if (body.is_hidden !== undefined) db.prepare('UPDATE guestbook SET is_hidden = ? WHERE id = ?').run(body.is_hidden ? 1 : 0, id);
  if (body.reply !== undefined) db.prepare('UPDATE guestbook SET reply = ? WHERE id = ?').run(body.reply, id);
  res.status(204).end();
}));
adminRouter.delete('/guestbook/:id', ah((req, res) => {
  db.prepare('DELETE FROM guestbook WHERE id = ?').run(Number(req.params.id));
  res.status(204).end();
}));

/* ───────────── 대시보드 통계 ───────────── */

adminRouter.get('/stats', ah((_req, res) => {
  const one = (sql: string) => (db.prepare(sql).get() as { c: number }).c;
  res.json({
    totals: {
      visitors: one('SELECT COUNT(DISTINCT visitor_hash) AS c FROM page_views'),
      pageViews: one('SELECT COUNT(*) AS c FROM page_views'),
      todayVisitors: one(`SELECT COUNT(DISTINCT visitor_hash) AS c FROM page_views WHERE date(created_at) = date('now')`),
      unreadMessages: one('SELECT COUNT(*) AS c FROM messages WHERE is_read = 0'),
      guestbook: one('SELECT COUNT(*) AS c FROM guestbook'),
      likes: one('SELECT COUNT(*) AS c FROM project_likes'),
    },
    daily: db.prepare(`SELECT date(created_at) AS day, COUNT(*) AS views, COUNT(DISTINCT visitor_hash) AS visitors
      FROM page_views WHERE created_at > datetime('now', '-30 days') GROUP BY day ORDER BY day`).all(),
    topPaths: db.prepare(`SELECT path, COUNT(*) AS views FROM page_views GROUP BY path ORDER BY views DESC LIMIT 10`).all(),
    topReferrers: db.prepare(`SELECT referrer, COUNT(*) AS views FROM page_views WHERE referrer <> ''
      GROUP BY referrer ORDER BY views DESC LIMIT 10`).all(),
    projects: db.prepare('SELECT slug, title, views, likes FROM projects ORDER BY views DESC').all(),
  });
}));

/* ───────────── GitHub 레포 ───────────── */

adminRouter.get('/github', ah((_req, res) => {
  res.json(db.prepare('SELECT * FROM github_repos ORDER BY pushed_at DESC').all());
}));
adminRouter.post('/github/sync', ah(async (_req, res) => {
  const count = await syncGithubRepos();
  res.json({ synced: count });
}));
adminRouter.patch('/github/:name', ah((req, res) => {
  const { hidden } = parse(z.object({ hidden: z.boolean() }), req.body);
  db.prepare('UPDATE github_repos SET hidden = ? WHERE name = ?').run(hidden ? 1 : 0, String(req.params.name));
  res.status(204).end();
}));
