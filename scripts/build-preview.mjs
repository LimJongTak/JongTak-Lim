// 미리보기용 단일 HTML 생성: dist-preview 의 JS/CSS 를 인라인하고 이미지는 옆 파일로 둔다.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('client/dist-preview');
const out = path.resolve(process.argv[2] ?? 'preview');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const read = rel => fs.readFileSync(path.join(dist, rel.replace(/^\.\//, '')), 'utf8');

const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="(\.\/assets\/[^"]+\.css)"[^>]*>/g)].map(m => read(m[1])).join('\n');
const js = [...html.matchAll(/<script type="module"[^>]*src="(\.\/assets\/[^"]+\.js)"[^>]*><\/script>/g)].map(m => read(m[1])).join('\n');

const page = `<title>임종탁 포트폴리오</title>
<meta name="description" content="결과라는 점(Dot)보다, 성장의 선(Line)을 그리는 개발자 임종탁의 포트폴리오 미리보기">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600&display=swap">
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js.replace(/<\/script/gi, '<\\/script')}
</script>
`;
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'images'), { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), page);
fs.cpSync('client/public/images', path.join(out, 'images'), { recursive: true });
console.log(`✔ ${out}/index.html (${(page.length / 1024).toFixed(0)} KB)`);
