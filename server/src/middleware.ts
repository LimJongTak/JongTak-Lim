import type { Request, Response, NextFunction, RequestHandler } from 'express';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { ZodError, type ZodType } from 'zod';
import { config } from './config.js';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** async 핸들러의 에러를 next로 넘긴다. */
export const ah = (fn: (req: Request, res: Response, next: NextFunction) => unknown): RequestHandler =>
  (req, res, next) => { Promise.resolve(fn(req, res, next)).catch(next); };

export function parse<T>(schema: ZodType<T>, input: unknown): T {
  return schema.parse(input);
}

/**
 * 방문자 식별 해시: IP + User-Agent + 날짜 + salt.
 * 원본 IP를 저장하지 않고, 날짜가 바뀌면 다른 값이 되어 장기 추적이 불가능하다.
 */
export function visitorHash(req: Request, daily = true): string {
  const day = daily ? new Date().toISOString().slice(0, 10) : '';
  return crypto.createHash('sha256')
    .update(`${req.ip}|${req.get('user-agent') ?? ''}|${day}|${config.hashSalt}`)
    .digest('hex').slice(0, 32);
}

export const AUTH_COOKIE = 'jt_admin';

export function signAdmin(id: number, username: string) {
  return jwt.sign({ sub: String(id), username }, config.jwtSecret, { expiresIn: '7d' });
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const header = req.get('authorization');
  const token = req.cookies?.[AUTH_COOKIE] ?? (header?.startsWith('Bearer ') ? header.slice(7) : undefined);
  if (!token) return next(new HttpError(401, '로그인이 필요합니다.'));
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string; username: string };
    (req as Request & { admin?: unknown }).admin = { id: Number(payload.sub), username: payload.username };
    next();
  } catch {
    next(new HttpError(401, '세션이 만료되었습니다. 다시 로그인해 주세요.'));
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: '입력값을 확인해 주세요.', issues: err.issues.map(i => ({ path: i.path.join('.'), message: i.message })) });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  const msg = err instanceof Error ? err.message : String(err);
  if (/UNIQUE constraint failed/.test(msg)) return res.status(409).json({ error: '이미 존재하는 값입니다.' });
  console.error(err);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
}
