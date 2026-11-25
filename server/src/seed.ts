import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';
import { fdb, setSetting, getSetting } from './db.js';
import { config } from './config.js';
import * as data from './seed-data.js';

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
    await Promise.all(['projects', 'experiences', 'awards', 'skills', 'github_repos'].map(deleteCollection));
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
        cover: p.cover ?? '', accent: p.accent, featured: !!p.featured, published: true,
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

  // github_repos: 항상 upsert (없으면 추가)
  {
    const batch = fdb.batch();
    for (const g of data.githubRepos) {
      const ref = fdb.collection('github_repos').doc(g.name);
      batch.set(ref, {
        description: g.description,
        language: g.language,
        html_url: `https://github.com/${config.githubUser}/${g.name}`,
        homepage: '',
        stars: 0,
        pushed_at: g.pushed_at,
        hidden: false,
      }, { merge: true });
    }
    await batch.commit();
  }

  await ensureAdmin();
  return isNew;
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
