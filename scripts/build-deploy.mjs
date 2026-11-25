// Firebase App Hosting 배포용 빌드.
// App Hosting은 server/ 만 보고 미리 빌드된 server/dist 와 server/public 을 그대로 실행하므로,
// 코드를 고친 뒤에는 이 스크립트를 돌리고 결과물까지 커밋해야 사이트에 반영된다.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const run = cmd => { console.log(`\n$ ${cmd}`); execSync(cmd, { stdio: 'inherit' }); };

run('npm run build --workspace client');               // client/dist (vite가 폴더를 비우고 다시 만든다)
fs.rmSync('server/public', { recursive: true, force: true });
fs.cpSync('client/dist', 'server/public', { recursive: true });
console.log('✔ client/dist → server/public');

fs.rmSync('server/dist', { recursive: true, force: true });
run('npx tsc -p server/tsconfig.json');                 // server/dist
console.log('\n✔ 배포 빌드 완료. server/dist 와 server/public 을 커밋하세요.');
