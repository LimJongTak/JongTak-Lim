import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { fdb, getSetting, setSetting } from '../db.js';
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
    const snap = await fdb.collection('admins').where('username', '==', username).limit(1).get();
    if (snap.empty)
        throw new HttpError(401, '아이디 또는 비밀번호가 올바르지 않습니다.');
    const doc = snap.docs[0];
    const admin = doc.data();
    if (!(await bcrypt.compare(password, admin.password_hash))) {
        throw new HttpError(401, '아이디 또는 비밀번호가 올바르지 않습니다.');
    }
    const token = signAdmin(doc.id, admin.username);
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
    res.json(req.admin);
});
const PasswordBody = z.object({ current: z.string().min(1), next: z.string().min(8, '8자 이상').max(100) });
authRouter.put('/password', requireAdmin, ah(async (req, res) => {
    const { current, next } = parse(PasswordBody, req.body);
    const { id } = req.admin;
    const doc = await fdb.collection('admins').doc(id).get();
    if (!doc.exists)
        throw new HttpError(500, '계정을 찾을 수 없습니다.');
    const { password_hash } = doc.data();
    if (!(await bcrypt.compare(current, password_hash)))
        throw new HttpError(403, '현재 비밀번호가 올바르지 않습니다.');
    await doc.ref.update({ password_hash: await bcrypt.hash(next, 12) });
    res.status(204).end();
}));
/* ───────────── 관리자 전용 ───────────── */
adminRouter.use(requireAdmin);
/** 콘텐츠 컬렉션별 스키마 */
const strArr = z.array(z.string().max(300)).max(30);
const RESOURCES = {
    projects: {
        collection: 'projects',
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
        collection: 'experiences',
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
        collection: 'awards',
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
        collection: 'skills',
        schema: z.object({
            name: z.string().min(1).max(40),
            category: z.enum(['language', 'frontend', 'backend', 'mobile', 'tool', 'design']),
            sort_order: z.coerce.number().int().default(0),
        }),
    },
};
function resource(name) {
    const r = RESOURCES[name];
    if (!r)
        throw new HttpError(404, '알 수 없는 리소스입니다.');
    return r;
}
adminRouter.get('/content/:resource', ah(async (req, res) => {
    const r = resource(String(req.params.resource));
    const snap = await fdb.collection(r.collection).orderBy('sort_order').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
}));
adminRouter.post('/content/:resource', ah(async (req, res) => {
    const name = String(req.params.resource);
    const r = resource(name);
    const vals = parse(r.schema, req.body);
    const now = new Date().toISOString();
    // slug 중복 체크 (projects)
    if (name === 'projects' && vals.slug) {
        const dup = await fdb.collection('projects').where('slug', '==', vals.slug).limit(1).get();
        if (!dup.empty)
            throw new HttpError(409, '이미 존재하는 슬러그입니다.');
    }
    const extra = name === 'projects' ? { views: 0, likes: 0, updated_at: now } : {};
    const ref = await fdb.collection(r.collection).add({ ...vals, ...extra, created_at: now });
    const doc = await ref.get();
    res.status(201).json({ id: ref.id, ...doc.data() });
}));
adminRouter.put('/content/:resource/:id', ah(async (req, res) => {
    const name = String(req.params.resource);
    const r = resource(name);
    const id = String(req.params.id);
    const doc = await fdb.collection(r.collection).doc(id).get();
    if (!doc.exists)
        throw new HttpError(404, '항목을 찾을 수 없습니다.');
    // 요청에 실제로 온 키만 업데이트
    const sent = new Set(Object.keys(req.body ?? {}));
    const parsed = parse(r.schema.partial(), req.body);
    const vals = Object.fromEntries(Object.entries(parsed).filter(([k]) => sent.has(k)));
    if (Object.keys(vals).length === 0)
        throw new HttpError(400, '변경할 값이 없습니다.');
    const extra = name === 'projects' ? { updated_at: new Date().toISOString() } : {};
    await doc.ref.update({ ...vals, ...extra });
    const updated = await doc.ref.get();
    res.json({ id: updated.id, ...updated.data() });
}));
adminRouter.delete('/content/:resource/:id', ah(async (req, res) => {
    const r = resource(String(req.params.resource));
    const id = String(req.params.id);
    const doc = await fdb.collection(r.collection).doc(id).get();
    if (!doc.exists)
        throw new HttpError(404, '항목을 찾을 수 없습니다.');
    await doc.ref.delete();
    res.status(204).end();
}));
/* 프로필 JSON 한 덩어리로 관리 */
adminRouter.get('/profile', ah(async (_req, res) => { res.json(await getSetting('profile', {})); }));
adminRouter.put('/profile', ah(async (req, res) => {
    const body = parse(z.record(z.string(), z.unknown()), req.body);
    await setSetting('profile', body);
    res.json(body);
}));
/* ───────────── 문의함 ───────────── */
adminRouter.get('/messages', ah(async (_req, res) => {
    const snap = await fdb.collection('messages').orderBy('created_at', 'desc').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
}));
adminRouter.patch('/messages/:id', ah(async (req, res) => {
    const { is_read } = parse(z.object({ is_read: z.boolean() }), req.body);
    const doc = await fdb.collection('messages').doc(String(req.params.id)).get();
    if (!doc.exists)
        throw new HttpError(404, '문의를 찾을 수 없습니다.');
    await doc.ref.update({ is_read });
    res.status(204).end();
}));
adminRouter.delete('/messages/:id', ah(async (req, res) => {
    const doc = await fdb.collection('messages').doc(String(req.params.id)).get();
    if (!doc.exists)
        throw new HttpError(404, '문의를 찾을 수 없습니다.');
    await doc.ref.delete();
    res.status(204).end();
}));
/* ───────────── 방명록 관리 ───────────── */
adminRouter.get('/guestbook', ah(async (_req, res) => {
    const snap = await fdb.collection('guestbook').orderBy('created_at', 'desc').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
}));
adminRouter.patch('/guestbook/:id', ah(async (req, res) => {
    const body = parse(z.object({ is_hidden: z.boolean().optional(), reply: z.string().max(500).optional() }), req.body);
    const doc = await fdb.collection('guestbook').doc(String(req.params.id)).get();
    if (!doc.exists)
        throw new HttpError(404, '글을 찾을 수 없습니다.');
    const update = {};
    if (body.is_hidden !== undefined)
        update.is_hidden = body.is_hidden;
    if (body.reply !== undefined)
        update.reply = body.reply;
    if (Object.keys(update).length)
        await doc.ref.update(update);
    res.status(204).end();
}));
adminRouter.delete('/guestbook/:id', ah(async (req, res) => {
    const doc = await fdb.collection('guestbook').doc(String(req.params.id)).get();
    if (!doc.exists)
        throw new HttpError(404, '글을 찾을 수 없습니다.');
    await doc.ref.delete();
    res.status(204).end();
}));
/* ───────────── 대시보드 통계 ───────────── */
adminRouter.get('/stats', ah(async (_req, res) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600_000).toISOString();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [allViewsSnap, unreadSnap, guestbookSnap, likesSnap, projectsSnap] = await Promise.all([
        fdb.collection('page_views').get(),
        fdb.collection('messages').where('is_read', '==', false).count().get(),
        fdb.collection('guestbook').count().get(),
        fdb.collection('project_likes').count().get(),
        fdb.collection('projects').orderBy('views', 'desc').get(),
    ]);
    const allViews = allViewsSnap.docs.map(d => d.data());
    // 전체 / 오늘 방문자 (중복 제거)
    const totalVisitors = new Set(allViews.map(v => v.visitor_hash)).size;
    const todayVisitors = new Set(allViews.filter(v => v.created_at >= todayStart.toISOString()).map(v => v.visitor_hash)).size;
    // 최근 30일
    const recent = allViews.filter(v => v.created_at >= thirtyDaysAgo);
    // 일별 집계
    const dailyMap = new Map();
    for (const v of recent) {
        const day = v.created_at.slice(0, 10);
        if (!dailyMap.has(day))
            dailyMap.set(day, { views: 0, visitors: new Set() });
        const e = dailyMap.get(day);
        e.views++;
        e.visitors.add(v.visitor_hash);
    }
    const daily = Array.from(dailyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, { views, visitors }]) => ({ day, views, visitors: visitors.size }));
    // 많이 본 경로 TOP 10
    const pathMap = new Map();
    for (const v of allViews)
        pathMap.set(v.path, (pathMap.get(v.path) ?? 0) + 1);
    const topPaths = Array.from(pathMap.entries())
        .sort(([, a], [, b]) => b - a).slice(0, 10)
        .map(([path, views]) => ({ path, views }));
    // 유입 경로 TOP 10
    const refMap = new Map();
    for (const v of allViews)
        if (v.referrer)
            refMap.set(v.referrer, (refMap.get(v.referrer) ?? 0) + 1);
    const topReferrers = Array.from(refMap.entries())
        .sort(([, a], [, b]) => b - a).slice(0, 10)
        .map(([referrer, views]) => ({ referrer, views }));
    res.json({
        totals: {
            visitors: totalVisitors,
            pageViews: allViews.length,
            todayVisitors,
            unreadMessages: unreadSnap.data().count,
            guestbook: guestbookSnap.data().count,
            likes: likesSnap.data().count,
        },
        daily,
        topPaths,
        topReferrers,
        projects: projectsSnap.docs.map(d => ({ slug: d.data().slug, title: d.data().title, views: d.data().views, likes: d.data().likes })),
    });
}));
/* ───────────── GitHub 레포 ───────────── */
adminRouter.get('/github', ah(async (_req, res) => {
    const snap = await fdb.collection('github_repos').orderBy('pushed_at', 'desc').get();
    res.json(snap.docs.map(d => ({ name: d.id, ...d.data() })));
}));
adminRouter.post('/github/sync', ah(async (_req, res) => {
    const count = await syncGithubRepos();
    res.json({ synced: count });
}));
adminRouter.patch('/github/:name', ah(async (req, res) => {
    const { hidden } = parse(z.object({ hidden: z.boolean() }), req.body);
    const doc = await fdb.collection('github_repos').doc(String(req.params.name)).get();
    if (!doc.exists)
        throw new HttpError(404, '레포를 찾을 수 없습니다.');
    await doc.ref.update({ hidden });
    res.status(204).end();
}));
