import { db, tx } from './db.js';
import { config } from './config.js';

type GhRepo = {
  name: string; description: string | null; language: string | null; html_url: string;
  homepage: string | null; stargazers_count: number; pushed_at: string; fork: boolean; private: boolean;
};

/**
 * GitHub 공개 레포 목록을 가져와 github_repos 테이블에 upsert 한다.
 * 관리자가 숨김 처리한 레포(hidden)는 유지된다.
 */
export async function syncGithubRepos(): Promise<number> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-sync' };
  if (config.githubToken) headers.Authorization = `Bearer ${config.githubToken}`;

  const repos: GhRepo[] = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`https://api.github.com/users/${config.githubUser}/repos?per_page=100&sort=pushed&page=${page}`, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    const batch = (await res.json()) as GhRepo[];
    repos.push(...batch);
    if (batch.length < 100) break;
  }

  const upsert = db.prepare(`INSERT INTO github_repos (name, description, language, html_url, homepage, stars, pushed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET description = excluded.description, language = excluded.language,
      html_url = excluded.html_url, homepage = excluded.homepage, stars = excluded.stars, pushed_at = excluded.pushed_at`);

  const list = repos.filter(r => !r.fork && !r.private && r.name !== config.githubUser);
  tx(() => {
    for (const r of list) {
      upsert.run(r.name, r.description ?? '', r.language ?? '', r.html_url, r.homepage ?? '', r.stargazers_count, r.pushed_at.slice(0, 10));
    }
  });
  return list.length;
}

/** 서버 실행 중 주기적으로 동기화 (기본 6시간). 실패해도 서버에는 영향 없음 */
export function scheduleGithubSync(intervalMs = 6 * 3600_000) {
  const run = () => syncGithubRepos()
    .then(n => console.log(`GitHub 레포 ${n}개 동기화`))
    .catch(e => console.warn('GitHub 동기화 건너뜀:', (e as Error).message));
  setTimeout(run, 5_000);
  return setInterval(run, intervalMs).unref();
}
