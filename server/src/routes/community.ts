import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { db } from '../db.js';
import { config } from '../config.js';
import { ah, HttpError, parse, visitorHash } from '../middleware.js';

export const communityRouter = Router();

const writeLimiter = rateLimit({
  windowMs: 10 * 60_000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { error: '잠시 후 다시 시도해 주세요.' },
});

/* ───────────── 방명록 ───────────── */

const PAGE_SIZE = 10;

communityRouter.get('/guestbook', ah((req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const rows = db.prepare(`SELECT id, name, message, reply, created_at FROM guestbook WHERE is_hidden = 0
    ORDER BY id DESC LIMIT ? OFFSET ?`).all(PAGE_SIZE, (page - 1) * PAGE_SIZE);
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM guestbook WHERE is_hidden = 0').get() as { c: number };
  res.json({ items: rows, total: c, page, pageSize: PAGE_SIZE });
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
  const r = db.prepare('INSERT INTO guestbook (name, message, password_hash, visitor_hash) VALUES (?, ?, ?, ?)')
    .run(body.name, body.message, hash, visitorHash(req, false));
  const row = db.prepare('SELECT id, name, message, reply, created_at FROM guestbook WHERE id = ?').get(r.lastInsertRowid);
  res.status(201).json(row);
}));

const DeleteBody = z.object({ password: z.string().min(1).max(50) });

communityRouter.delete('/guestbook/:id', writeLimiter, ah(async (req, res) => {
  const { password } = parse(DeleteBody, req.body);
  const row = db.prepare('SELECT password_hash FROM guestbook WHERE id = ?').get(Number(req.params.id)) as { password_hash: string } | undefined;
  if (!row) throw new HttpError(404, '글을 찾을 수 없습니다.');
  if (!(await bcrypt.compare(password, row.password_hash))) throw new HttpError(403, '비밀번호가 일치하지 않습니다.');
  db.prepare('DELETE FROM guestbook WHERE id = ?').run(Number(req.params.id));
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
  db.prepare('INSERT INTO messages (name, email, company, subject, message) VALUES (?, ?, ?, ?, ?)')
    .run(body.name, body.email, body.company, body.subject, body.message);

  if (config.notifyWebhook) {
    // 슬랙/디스코드 호환 페이로드. 실패해도 문의 저장은 유지
    const text = `📬 새 문의: ${body.name} <${body.email}> ${body.company ? `(${body.company})` : ''}\n${body.subject}\n${body.message.slice(0, 500)}`;
    fetch(config.notifyWebhook, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, content: text }),
    }).catch(err => console.warn('웹훅 전송 실패:', err.message));
  }
  res.status(201).json({ ok: true });
}));
