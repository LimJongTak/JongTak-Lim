import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';
import { db, migrate, setSetting, tx } from './db.js';
import { config } from './config.js';
import * as data from './seed-data.js';

/** 콘텐츠 테이블을 seed-data.ts 내용으로 채운다. reset=true면 기존 콘텐츠를 지운다. */
export function seed({ reset = false } = {}) {
  migrate();
  tx(() => {
    if (reset) {
      for (const t of ['projects', 'experiences', 'awards', 'skills', 'github_repos']) db.exec(`DELETE FROM ${t}`);
    }

    // 관리자가 수정한 프로필을 재시작 때 덮어쓰지 않도록, 없을 때(또는 reset)만 넣는다
    const hasProfile = db.prepare(`SELECT 1 FROM settings WHERE key = 'profile'`).get();
    if (reset || !hasProfile) setSetting('profile', data.profile);

    const hasContent = (t: string) => (db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get() as { c: number }).c > 0;

    // 콘텐츠 테이블은 비어 있을 때만 채운다 (관리자가 삭제한 항목이 재시작 때 되살아나지 않도록)
    if (!hasContent('projects')) {
    const pInsert = db.prepare(`INSERT OR IGNORE INTO projects
      (slug, title, subtitle, year, period, category, role, team, summary, problem, process, insight,
       highlights, tech, github_url, demo_url, cover, accent, featured, sort_order)
      VALUES (:slug, :title, :subtitle, :year, :period, :category, :role, :team, :summary, :problem, :process,
       :insight, :highlights, :tech, :github_url, :demo_url, :cover, :accent, :featured, :sort_order)`);
    data.projects.forEach((p, i) =>
      pInsert.run({
        slug: p.slug, title: p.title, subtitle: p.subtitle, year: p.year, period: p.period ?? '',
        category: p.category, role: p.role, team: p.team ?? '', summary: p.summary,
        problem: JSON.stringify(p.problem ?? []), process: JSON.stringify(p.process ?? []),
        insight: p.insight ?? '', highlights: JSON.stringify(p.highlights ?? []), tech: JSON.stringify(p.tech),
        github_url: p.github_url ?? '', demo_url: p.demo_url ?? '', cover: p.cover ?? '', accent: p.accent,
        featured: p.featured ? 1 : 0, sort_order: i,
      })
    );
    }

    if (!hasContent('experiences')) {
      const s = db.prepare(`INSERT INTO experiences (category, org, title, start_date, end_date, items, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)`);
      data.experiences.forEach((e, i) => s.run(e.category, e.org, e.title, e.start_date, e.end_date, JSON.stringify(e.items), i));
    }
    if (!hasContent('awards')) {
      const s = db.prepare('INSERT INTO awards (kind, date, title, issuer, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
      data.awards.forEach((a, i) => s.run(a.kind, a.date, a.title, a.issuer, a.description, i));
    }
    if (!hasContent('skills')) {
      const s = db.prepare('INSERT INTO skills (name, category, sort_order) VALUES (?, ?, ?)');
      let i = 0;
      for (const [cat, names] of Object.entries(data.skills)) for (const n of names) s.run(n, cat, i++);
    }
    const r = db.prepare(`INSERT OR IGNORE INTO github_repos (name, description, language, html_url, pushed_at)
      VALUES (?, ?, ?, ?, ?)`);
    for (const g of data.githubRepos) r.run(g.name, g.description, g.language, `https://github.com/${config.githubUser}/${g.name}`, g.pushed_at);
  });
  ensureAdmin();
}

/** 관리자 계정이 없으면 환경 변수 값으로 만든다. */
export function ensureAdmin() {
  const exists = db.prepare('SELECT id FROM admins WHERE username = ?').get(config.adminUsername);
  if (!exists) {
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)')
      .run(config.adminUsername, bcrypt.hashSync(config.adminPassword, 12));
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed({ reset: process.argv.includes('--reset') });
  console.log('✔ seed 완료:', config.dbPath);
}
