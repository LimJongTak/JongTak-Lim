import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { fdb, getSetting, FieldValue } from '../db.js';
import { ah, HttpError, parse, visitorHash } from '../middleware.js';

export const publicRouter = Router();

/** 메인 페이지에 필요한 모든 데이터를 한 번에 */
publicRouter.get('/portfolio', ah(async (_req, res) => {
  const [profile, skillsSnap, expSnap, awardsSnap, projectsSnap, reposSnap] = await Promise.all([
    getSetting('profile', {}),
    fdb.collection('skills').orderBy('sort_order').get(),
    fdb.collection('experiences').orderBy('sort_order').get(),
    fdb.collection('awards').orderBy('sort_order').get(),
    fdb.collection('projects').where('published', '==', true).orderBy('featured', 'desc').orderBy('sort_order').get(),
    fdb.collection('github_repos').where('hidden', '==', false).orderBy('pushed_at', 'desc').limit(12).get(),
  ]);
  res.set('Cache-Control', 'public, max-age=60');
  res.json({
    profile,
    skills: skillsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    experiences: expSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    awards: awardsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    projects: projectsSnap.docs.map(d => ({ id: d.id, ...d.data(), featured: !!d.data().featured })),
    repos: reposSnap.docs.map(d => ({ name: d.id, ...d.data() })),
  });
}));

publicRouter.get('/projects', ah(async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  // 전체 공개 프로젝트를 가져온 뒤 카테고리는 메모리에서 필터링 (복합 인덱스 절약)
  const snap = await fdb.collection('projects')
    .where('published', '==', true)
    .orderBy('featured', 'desc')
    .orderBy('sort_order')
    .get();
  let items = snap.docs.map(d => ({ id: d.id, ...d.data(), featured: !!d.data().featured }));
  if (category) items = items.filter(p => (p as Record<string, unknown>).category === category);
  res.json(items);
}));

publicRouter.get('/projects/:slug', ah(async (req, res) => {
  const snap = await fdb.collection('projects').where('slug', '==', String(req.params.slug)).limit(1).get();
  if (snap.empty) throw new HttpError(404, '프로젝트를 찾을 수 없습니다.');
  const doc = snap.docs[0];
  const data = doc.data();
  if (!data.published) throw new HttpError(404, '프로젝트를 찾을 수 없습니다.');

  const [listSnap, likeDoc] = await Promise.all([
    fdb.collection('projects').where('published', '==', true).orderBy('featured', 'desc').orderBy('sort_order').get(),
    fdb.collection('project_likes').doc(`${doc.id}_${visitorHash(req, false)}`).get(),
  ]);
  const list = listSnap.docs.map(d => ({ slug: d.data().slug as string, title: d.data().title as string }));
  const idx = list.findIndex(p => p.slug === data.slug);

  res.json({
    id: doc.id,
    ...data,
    featured: !!data.featured,
    liked: likeDoc.exists,
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx < list.length - 1 ? list[idx + 1] : null,
  });
}));

const likeLimiter = rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false });

/** 좋아요 토글. 방문자 해시(날짜 무관) 기준으로 1인 1회 */
publicRouter.post('/projects/:slug/like', likeLimiter, ah(async (req, res) => {
  const snap = await fdb.collection('projects').where('slug', '==', String(req.params.slug)).limit(1).get();
  if (snap.empty) throw new HttpError(404, '프로젝트를 찾을 수 없습니다.');
  const projectDoc = snap.docs[0];
  const vh = visitorHash(req, false);
  const likeRef = fdb.collection('project_likes').doc(`${projectDoc.id}_${vh}`);
  const likeDoc = await likeRef.get();

  if (likeDoc.exists) {
    await Promise.all([
      likeRef.delete(),
      projectDoc.ref.update({ likes: FieldValue.increment(-1) }),
    ]);
  } else {
    await Promise.all([
      likeRef.set({ project_id: projectDoc.id, visitor_hash: vh, created_at: new Date().toISOString() }),
      projectDoc.ref.update({ likes: FieldValue.increment(1) }),
    ]);
  }
  const updated = await projectDoc.ref.get();
  res.json({ liked: !likeDoc.exists, likes: updated.data()?.likes ?? 0 });
}));

publicRouter.get('/github/repos', ah(async (_req, res) => {
  const snap = await fdb.collection('github_repos').where('hidden', '==', false).orderBy('pushed_at', 'desc').get();
  res.json(snap.docs.map(d => ({ name: d.id, ...d.data() })));
}));

/* ───────────── 방문 통계 ───────────── */

const trackLimiter = rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false });
const TrackBody = z.object({
  path: z.string().max(200).regex(/^\//),
  referrer: z.string().max(300).optional().default(''),
});

publicRouter.post('/track', trackLimiter, ah(async (req, res) => {
  const body = parse(TrackBody, req.body);
  if (body.path.startsWith('/admin')) return res.status(204).end();
  const vh = visitorHash(req);
  // 같은 방문자가 같은 경로를 30분 안에 다시 열면 중복으로 보고 무시
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const dup = await fdb.collection('page_views')
    .where('visitor_hash', '==', vh)
    .where('path', '==', body.path)
    .where('created_at', '>', thirtyMinutesAgo)
    .limit(1)
    .get();
  if (dup.empty) {
    await fdb.collection('page_views').add({
      path: body.path,
      visitor_hash: vh,
      referrer: body.referrer,
      created_at: new Date().toISOString(),
    });
    const m = body.path.match(/^\/projects\/([\w-]+)$/);
    if (m) {
      const pSnap = await fdb.collection('projects').where('slug', '==', m[1]).limit(1).get();
      if (!pSnap.empty) await pSnap.docs[0].ref.update({ views: FieldValue.increment(1) });
    }
  }
  res.status(204).end();
}));

publicRouter.get('/stats', ah(async (_req, res) => {
  const snap = await fdb.collection('page_views').get();
  const all = snap.docs.map(d => d.data() as { visitor_hash: string; created_at: string });
  const totalVisitors = new Set(all.map(d => d.visitor_hash)).size;
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayVisitors = new Set(
    all.filter(d => d.created_at >= todayStart.toISOString()).map(d => d.visitor_hash),
  ).size;
  res.json({ totalVisitors, todayVisitors });
}));
