import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

export const db = new DatabaseSync(config.dbPath);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

/**
 * 스키마. 버전이 올라가면 MIGRATIONS 배열 끝에 SQL을 추가한다.
 * user_version PRAGMA로 적용된 마이그레이션을 추적한다.
 */
const MIGRATIONS: string[] = [
  /* 1: 초기 스키마 */ `
  CREATE TABLE settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    subtitle    TEXT NOT NULL DEFAULT '',
    year        INTEGER NOT NULL,
    period      TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL DEFAULT 'web',   -- web | app | etc
    role        TEXT NOT NULL DEFAULT '',
    team        TEXT NOT NULL DEFAULT '',
    summary     TEXT NOT NULL DEFAULT '',
    problem     TEXT NOT NULL DEFAULT '[]',    -- JSON string[]
    process     TEXT NOT NULL DEFAULT '[]',    -- JSON string[]
    insight     TEXT NOT NULL DEFAULT '',
    highlights  TEXT NOT NULL DEFAULT '[]',    -- JSON {label,value}[]
    tech        TEXT NOT NULL DEFAULT '[]',    -- JSON string[]
    github_url  TEXT NOT NULL DEFAULT '',
    demo_url    TEXT NOT NULL DEFAULT '',
    cover       TEXT NOT NULL DEFAULT '',      -- 이미지 URL 또는 비워두면 그라데이션
    accent      TEXT NOT NULL DEFAULT '#8b5cf6',
    featured    INTEGER NOT NULL DEFAULT 0,
    published   INTEGER NOT NULL DEFAULT 1,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    views       INTEGER NOT NULL DEFAULT 0,
    likes       INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE experiences (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category    TEXT NOT NULL,               -- education | leadership | club | volunteer | etc
    org         TEXT NOT NULL,
    title       TEXT NOT NULL DEFAULT '',
    start_date  TEXT NOT NULL,               -- YYYY.MM
    end_date    TEXT NOT NULL DEFAULT '',    -- 비어 있으면 진행 중
    items       TEXT NOT NULL DEFAULT '[]',  -- JSON string[]
    sort_order  INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE awards (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    kind        TEXT NOT NULL DEFAULT 'award', -- award | certificate | completion
    date        TEXT NOT NULL,
    title       TEXT NOT NULL,
    issuer      TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    sort_order  INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE skills (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL,               -- language | frontend | backend | mobile | tool | design
    sort_order  INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE guestbook (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    message       TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    visitor_hash  TEXT NOT NULL,
    is_hidden     INTEGER NOT NULL DEFAULT 0,
    reply         TEXT NOT NULL DEFAULT '',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    company     TEXT NOT NULL DEFAULT '',
    subject     TEXT NOT NULL DEFAULT '',
    message     TEXT NOT NULL,
    is_read     INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE page_views (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    path         TEXT NOT NULL,
    visitor_hash TEXT NOT NULL,
    referrer     TEXT NOT NULL DEFAULT '',
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX idx_page_views_created ON page_views(created_at);
  CREATE INDEX idx_page_views_visitor ON page_views(visitor_hash, created_at);

  CREATE TABLE project_likes (
    project_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    visitor_hash TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (project_id, visitor_hash)
  );

  CREATE TABLE github_repos (
    name        TEXT PRIMARY KEY,
    description TEXT NOT NULL DEFAULT '',
    language    TEXT NOT NULL DEFAULT '',
    html_url    TEXT NOT NULL,
    homepage    TEXT NOT NULL DEFAULT '',
    stars       INTEGER NOT NULL DEFAULT 0,
    pushed_at   TEXT NOT NULL DEFAULT '',
    hidden      INTEGER NOT NULL DEFAULT 0
  );
  `,
];

export function migrate() {
  const { user_version } = db.prepare('PRAGMA user_version').get() as { user_version: number };
  for (let v = user_version; v < MIGRATIONS.length; v++) {
    db.exec('BEGIN');
    try {
      db.exec(MIGRATIONS[v]);
      db.exec(`PRAGMA user_version = ${v + 1}`);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }
}

export function tx<T>(fn: () => T): T {
  db.exec('BEGIN');
  try {
    const r = fn();
    db.exec('COMMIT');
    return r;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

/** JSON 컬럼을 파싱해서 돌려준다. */
export function parseJsonCols<T extends Record<string, unknown>>(row: T, cols: string[]): T {
  const out: Record<string, unknown> = { ...row };
  for (const c of cols) {
    if (typeof out[c] === 'string') {
      try { out[c] = JSON.parse(out[c] as string); } catch { /* keep raw */ }
    }
  }
  return out as T;
}

export function getSetting<T>(key: string, fallback: T): T {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  if (!row) return fallback;
  try { return JSON.parse(row.value) as T; } catch { return fallback; }
}

export function setSetting(key: string, value: unknown) {
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, JSON.stringify(value));
}
