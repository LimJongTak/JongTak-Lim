import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';
import { fdb, setSetting, getSetting } from './db.js';
import { config } from './config.js';
import * as data from './seed-data.js';
import { posts as seedPosts } from './seed-posts.js';

/** Firestore에 초기 콘텐츠를 넣는다. reset=true면 기존 콘텐츠를 삭제 후 재삽입. */
export async function seed({ reset = false } = {}): Promise<boolean> {
  const hasProfile = await getSetting('profile', null);
  const isNew = hasProfile === null;

  if (reset || isNew) await setSetting('profile', data.profile);

  const hasContent = async (col: string) => {
    const snap = await fdb.collection(col).limit(1).get();
    return !snap.empty;
  };

  const deleteCollection = async (col: string) => {
    const snap = await fdb.collection(col).get();
    const batch = fdb.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    if (snap.size > 0) await batch.commit();
  };

  if (reset) {
    await Promise.all(['projects', 'experiences', 'awards', 'skills', 'github_repos', 'posts'].map(deleteCollection));
  }

  // 콘텐츠 테이블은 비어 있을 때만 채운다
  if (!(await hasContent('projects'))) {
    const batch = fdb.batch();
    const now = new Date().toISOString();
    data.projects.forEach((p, i) => {
      const ref = fdb.collection('projects').doc();
      batch.set(ref, {
        slug: p.slug, title: p.title, subtitle: p.subtitle, year: p.year,
        period: p.period ?? '', category: p.category, role: p.role, team: p.team ?? '',
        summary: p.summary, problem: p.problem ?? [], process: p.process ?? [],
        insight: p.insight ?? '', highlights: p.highlights ?? [], tech: p.tech,
        github_url: p.github_url ?? '', demo_url: p.demo_url ?? '',
        cover: p.cover ?? '', images: p.images ?? [], accent: p.accent, featured: !!p.featured, published: true,
        sort_order: i, views: 0, likes: 0, created_at: now, updated_at: now,
      });
    });
    await batch.commit();
  }

  if (!(await hasContent('experiences'))) {
    const batch = fdb.batch();
    data.experiences.forEach((e, i) => {
      const ref = fdb.collection('experiences').doc();
      batch.set(ref, { ...e, items: e.items, sort_order: i, created_at: new Date().toISOString() });
    });
    await batch.commit();
  }

  if (!(await hasContent('awards'))) {
    const batch = fdb.batch();
    data.awards.forEach((a, i) => {
      const ref = fdb.collection('awards').doc();
      batch.set(ref, { ...a, sort_order: i, created_at: new Date().toISOString() });
    });
    await batch.commit();
  }

  if (!(await hasContent('skills'))) {
    const batch = fdb.batch();
    let i = 0;
    for (const [cat, names] of Object.entries(data.skills)) {
      for (const name of names) {
        const ref = fdb.collection('skills').doc();
        batch.set(ref, { name, category: cat, sort_order: i++ });
      }
    }
    await batch.commit();
  }

  // github_repos: 없는 레포만 추가 (관리자가 숨긴 hidden 값을 재시작 때 덮어쓰지 않도록)
  {
    const refs = data.githubRepos.map(g => fdb.collection('github_repos').doc(g.name));
    const existing = await fdb.getAll(...refs);
    const batch = fdb.batch();
    let n = 0;
    data.githubRepos.forEach((g, i) => {
      if (existing[i].exists) return;
      batch.set(refs[i], {
        description: g.description, language: g.language,
        html_url: `https://github.com/${config.githubUser}/${g.name}`,
        homepage: '', stars: 0, pushed_at: g.pushed_at, hidden: false,
      });
      n++;
    });
    if (n) await batch.commit();
  }

  if (reset || !(await hasContent('posts'))) await insertPosts();
  await runContentMigrations();

  await ensureAdmin();
  return isNew;
}

async function insertPosts() {
  const batch = fdb.batch();
  const now = new Date().toISOString();
  seedPosts.forEach((p, i) => {
    batch.set(fdb.collection('posts').doc(), {
      slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category,
      period: p.period, place: p.place ?? '', role: p.role, tags: p.tags,
      cover: p.cover ?? '', images: p.images ?? [], body: p.body,
      featured: !!p.featured, published: true, sort_order: i, views: 0,
      created_at: now, updated_at: now,
    });
  });
  await batch.commit();
}

/**
 * 이미 운영 중인 DB에 새 콘텐츠를 한 번만 반영하는 마이그레이션.
 * 적용한 id는 settings/migrations 에 기록해 다시 실행하지 않는다.
 */
const CONTENT_MIGRATIONS: { id: string; run: () => Promise<void> }[] = [
  {
    // MyWay 기획서·RE:POINT 발표자료 내용으로 두 프로젝트를 보강
    id: '2026-11-myway-repoint-pdf',
    run: async () => {
      for (const slug of ['myway', 'repoint']) {
        const src = data.projects.find(p => p.slug === slug);
        const snap = await fdb.collection('projects').where('slug', '==', slug).limit(1).get();
        if (!src || snap.empty) continue;
        await snap.docs[0].ref.update({
          subtitle: src.subtitle, summary: src.summary, role: src.role, team: src.team ?? '',
          problem: src.problem ?? [], process: src.process ?? [], insight: src.insight ?? '',
          highlights: src.highlights ?? [], tech: src.tech, cover: src.cover ?? '',
          images: src.images ?? [], updated_at: new Date().toISOString(),
        });
      }
    },
  },
];

async function runContentMigrations() {
  const applied = await getSetting<string[]>('migrations', []);
  for (const m of CONTENT_MIGRATIONS) {
    if (applied.includes(m.id)) continue;
    await m.run();
    applied.push(m.id);
    await setSetting('migrations', applied);
    console.log(`✔ 콘텐츠 마이그레이션 적용: ${m.id}`);
  }
}

/** 관리자 계정이 없으면 환경 변수 값으로 만든다. */
export async function ensureAdmin() {
  const snap = await fdb.collection('admins').where('username', '==', config.adminUsername).limit(1).get();
  if (snap.empty) {
    await fdb.collection('admins').add({
      username: config.adminUsername,
      password_hash: await bcrypt.hash(config.adminPassword, 12),
      created_at: new Date().toISOString(),
    });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed({ reset: process.argv.includes('--reset') })
    .then(() => { console.log('✔ seed 완료'); process.exit(0); })
    .catch(err => { console.error(err); process.exit(1); });
}
