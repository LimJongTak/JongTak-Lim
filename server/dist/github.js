import { fdb } from './db.js';
import { config } from './config.js';
/**
 * GitHub 공개 레포 목록을 가져와 github_repos 컬렉션에 upsert 한다.
 * 관리자가 숨김 처리한 레포(hidden)는 유지된다.
 */
export async function syncGithubRepos() {
    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-sync' };
    if (config.githubToken)
        headers.Authorization = `Bearer ${config.githubToken}`;
    const repos = [];
    for (let page = 1; page <= 5; page++) {
        const res = await fetch(`https://api.github.com/users/${config.githubUser}/repos?per_page=100&sort=pushed&page=${page}`, { headers });
        if (!res.ok)
            throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
        const batch = (await res.json());
        repos.push(...batch);
        if (batch.length < 100)
            break;
    }
    const list = repos.filter(r => !r.fork && !r.private && r.name !== config.githubUser);
    const batch = fdb.batch();
    for (const r of list) {
        const ref = fdb.collection('github_repos').doc(r.name);
        // merge: true 로 hidden 필드를 덮어쓰지 않음
        batch.set(ref, {
            description: r.description ?? '',
            language: r.language ?? '',
            html_url: r.html_url,
            homepage: r.homepage ?? '',
            stars: r.stargazers_count,
            pushed_at: r.pushed_at.slice(0, 10),
        }, { merge: true });
    }
    await batch.commit();
    return list.length;
}
/** 서버 실행 중 주기적으로 동기화 (기본 6시간). 실패해도 서버에는 영향 없음 */
export function scheduleGithubSync(intervalMs = 6 * 3600_000) {
    const run = () => syncGithubRepos()
        .then(n => console.log(`GitHub 레포 ${n}개 동기화`))
        .catch(e => console.warn('GitHub 동기화 건너뜀:', e.message));
    setTimeout(run, 5_000);
    return setInterval(run, intervalMs).unref();
}
