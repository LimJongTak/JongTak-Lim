import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { db, getSetting, parseJsonCols } from '../db.js';
import { ah, HttpError, parse, visitorHash } from '../middleware.js';

export const publicRouter = Router();

const PROJECT_JSON = ['problem', 'process', 'highlights', 'tech'];
const PROJECT_LIST_COLS = `id, slug, title, subtitle, year, period, category, role, team, summary, tech,
  highlights, github_url, demo_url, cover, accent, featured, views, likes`;

const projectRow = (r: Record<string, unknown>) => {
  const p = parseJsonCols(r, PROJECT_JSON);
  return { ...p, featured: !!p.featured };
};

/** 메인 페이지에 필요한 모든 데이터를 한 번에 */
publicRouter.get('/portfolio', ah((_req, res) => {
  const profile = getSetting('profile', {});
  const skills = db.prepare('SELECT name, category FROM skills ORDER BY sort_order, id').all();
  const experiences = (db.prepare('SELECT * FROM experiences ORDER BY sort_order, id').all() as Record<string, unknown>[])
    .map(r => parseJsonCols(r, ['items']));
  const awards = db.prepare('SELECT * FROM awards ORDER BY sort_order, id').all();
  const projects = (db.prepare(`SELECT ${PROJECT_LIST_COLS} FROM projects WHERE published = 1
    ORDER BY featured DESC, sort_order, year DESC`).all() as Record<string, unknown>[]).map(projectRow);
  const repos = db.prepare('SELECT * FROM github_repos WHERE hidden = 0 ORDER BY pushed_at DESC LIMIT 12').all();
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ profile, skills, experiences, awards, projects, repos });
}));

publicRouter.get('/projects', ah((req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const rows = category
    ? db.prepare(`SELECT ${PROJECT_LIST_COLS} FROM projects WHERE published = 1 AND category = ? ORDER BY featured DESC, sort_order`).all(category)
    : db.prepare(`SELECT ${PROJECT_LIST_COLS} FROM projects WHERE published = 1 ORDER BY featured DESC, sort_order`).all();
  res.json((rows as Record<string, unknown>[]).map(projectRow));
}));

publicRouter.get('/projects/:slug', ah((req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE slug = ? AND published = 1').get(String(req.params.slug)) as Record<string, unknown> | undefined;
  if (!row) throw new HttpError(404, '프로젝트를 찾을 수 없습니다.');
  const list = db.prepare('SELECT slug, title FROM projects WHERE published = 1 ORDER BY featured DESC, sort_order').all() as { slug: string; title: string }[];
  const idx = list.findIndex(p => p.slug === row.slug);
  const liked = !!db.prepare('SELECT 1 FROM project_likes WHERE project_id = ? AND visitor_hash = ?').get(row.id as number, visitorHash(req, false));
  res.json({
    ...projectRow(row),
    liked,
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx < list.length - 1 ? list[idx + 1] : null,
  });
}));

const likeLimiter = rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false });

/** 좋아요 토글. 방문자 해시(날짜 무관) 기준으로 1인 1회 */
publicRouter.post('/projects/:slug/like', likeLimiter, ah((req, res) => {
  const p = db.prepare('SELECT id FROM projects WHERE slug = ?').get(String(req.params.slug)) as { id: number } | undefined;
  if (!p) throw new HttpError(404, '프로젝트를 찾을 수 없습니다.');
  const vh = visitorHash(req, false);
  const existing = db.prepare('SELECT 1 FROM project_likes WHERE project_id = ? AND visitor_hash = ?').get(p.id, vh);
  if (existing) {
    db.prepare('DELETE FROM project_likes WHERE project_id = ? AND visitor_hash = ?').run(p.id, vh);
  } else {
    db.prepare('INSERT INTO project_likes (project_id, visitor_hash) VALUES (?, ?)').run(p.id, vh);
  }
  db.prepare('UPDATE projects SET likes = (SELECT COUNT(*) FROM project_likes WHERE project_id = ?) WHERE id = ?').run(p.id, p.id);
  const { likes } = db.prepare('SELECT likes FROM projects WHERE id = ?').get(p.id) as { likes: number };
  res.json({ liked: !existing, likes });
}));

publicRouter.get('/github/repos', ah((_req, res) => {
  res.json(db.prepare('SELECT * FROM github_repos WHERE hidden = 0 ORDER BY pushed_at DESC').all());
}));

/* ───────────── 방문 통계 ───────────── */

const trackLimiter = rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false });
const TrackBody = z.object({
  path: z.string().max(200).regex(/^\//),
  referrer: z.string().max(300).optional().default(''),
});

publicRouter.post('/track', trackLimiter, ah((req, res) => {
  const body = parse(TrackBody, req.body);
  if (body.path.startsWith('/admin')) return res.status(204).end();
  const vh = visitorHash(req);
  // 같은 방문자가 같은 경로를 30분 안에 다시 열면 중복으로 보고 무시
  const dup = db.prepare(`SELECT 1 FROM page_views WHERE visitor_hash = ? AND path = ?
    AND created_at > datetime('now', '-30 minutes')`).get(vh, body.path);
  if (!dup) {
    db.prepare('INSERT INTO page_views (path, visitor_hash, referrer) VALUES (?, ?, ?)').run(body.path, vh, body.referrer);
    const m = body.path.match(/^\/projects\/([\w-]+)$/);
    if (m) db.prepare('UPDATE projects SET views = views + 1 WHERE slug = ?').run(m[1]);
  }
  res.status(204).end();
}));

publicRouter.get('/stats', ah((_req, res) => {
  const total = db.prepare('SELECT COUNT(DISTINCT visitor_hash) AS c FROM page_views').get() as { c: number };
  const today = db.prepare(`SELECT COUNT(DISTINCT visitor_hash) AS c FROM page_views WHERE date(created_at) = date('now')`).get() as { c: number };
  res.json({ totalVisitors: total.c, todayVisitors: today.c });
}));
