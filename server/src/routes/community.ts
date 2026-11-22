import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { fdb } from '../db.js';
import { config } from '../config.js';
import { ah, HttpError, parse, visitorHash } from '../middleware.js';

export const communityRouter = Router();

const writeLimiter = rateLimit({
  windowMs: 10 * 60_000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { error: '잠시 후 다시 시도해 주세요.' },
});

/* ───────────── 방명록 ───────────── */

const PAGE_SIZE = 10;

communityRouter.get('/guestbook', ah(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const snap = await fdb.collection('guestbook').where('is_hidden', '==', false).orderBy('created_at', 'desc').get();
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const total = all.length;
  const items = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  res.json({ items, total, page, pageSize: PAGE_SIZE });
}));

const GuestbookBody = z.object({
  name: z.string().trim().min(1, '이름을 입력해 주세요.').max(20),
  message: z.string().trim().min(1, '내용을 입력해 주세요.').max(500),
  password: z.string().min(4, '비밀번호는 4자 이상').max(50),
  website: z.string().max(0).optional(), // honeypot: 봇이 채우면 거절
});

communityRouter.post('/guestbook', writeLimiter, ah(async (req, res) => {
  const body = parse(GuestbookBody, req.body);
  const hash = await bcrypt.hash(body.password, 10);
  const now = new Date().toISOString();
  const ref = await fdb.collection('guestbook').add({
    name: body.name,
    message: body.message,
    password_hash: hash,
    visitor_hash: visitorHash(req, false),
    is_hidden: false,
    reply: '',
    created_at: now,
  });
  res.status(201).json({ id: ref.id, name: body.name, message: body.message, reply: '', created_at: now });
}));

const DeleteBody = z.object({ password: z.string().min(1).max(50) });

communityRouter.delete('/guestbook/:id', writeLimiter, ah(async (req, res) => {
  const { password } = parse(DeleteBody, req.body);
  const doc = await fdb.collection('guestbook').doc(String(req.params.id)).get();
  if (!doc.exists) throw new HttpError(404, '글을 찾을 수 없습니다.');
  const { password_hash } = doc.data() as { password_hash: string };
  if (!(await bcrypt.compare(password, password_hash))) throw new HttpError(403, '비밀번호가 일치하지 않습니다.');
  await doc.ref.delete();
  res.status(204).end();
}));

/* ───────────── 문의 (Contact) ───────────── */

const ContactBody = z.object({
  name: z.string().trim().min(1, '이름을 입력해 주세요.').max(50),
  email: z.email('올바른 이메일을 입력해 주세요.').max(120),
  company: z.string().trim().max(80).optional().default(''),
  subject: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().min(10, '10자 이상 입력해 주세요.').max(3000),
  website: z.string().max(0).optional(),
});

communityRouter.post('/contact', writeLimiter, ah(async (req, res) => {
  const body = parse(ContactBody, req.body);
  await fdb.collection('messages').add({
    name: body.name,
    email: body.email,
    company: body.company,
    subject: body.subject,
    message: body.message,
    is_read: false,
    created_at: new Date().toISOString(),
  });

  if (config.notifyWebhook) {
    const text = `📬 새 문의: ${body.name} <${body.email}> ${body.company ? `(${body.company})` : ''}\n${body.subject}\n${body.message.slice(0, 500)}`;
    fetch(config.notifyWebhook, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, content: text }),
    }).catch(err => console.warn('웹훅 전송 실패:', err.message));
  }
  res.status(201).json({ ok: true });
}));
