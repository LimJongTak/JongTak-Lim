// 활동 사진 가져오기
//
// 사용법 (프로젝트 폴더에서):
//   npm run import-photos -- "C:\Users\MSI\Desktop\포트폴리오 사진\포트폴리오 사진"
//
// 지정한 폴더 안의 "활동별 하위 폴더"를 읽어서
//   - 사진을 긴 변 1600px 이하 WebP로 줄이고 (원본은 건드리지 않음)
//   - 휴대폰 사진의 회전 정보(EXIF)를 반영하고, 위치·촬영기기 같은 메타데이터는 지운 뒤
//   - client/public/images/activities/import/<번호>/ 에 저장하고
//   - 어떤 폴더가 어떤 번호인지 client/public/images/activities/import/manifest.json 에 적는다.
// 그다음 git add / commit / push 하면 된다.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const src = process.argv[2];
if (!src || !fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
  console.error('사진 폴더 경로를 따옴표로 감싸서 넣어주세요.\n예) npm run import-photos -- "C:\\Users\\MSI\\Desktop\\포트폴리오 사진\\포트폴리오 사진"');
  process.exit(1);
}

const OUT = path.resolve('client/public/images/activities/import');
const IMAGE = /\.(jpe?g|png|webp|heic|heif|gif|tiff?|bmp|avif)$/i;
const MAX = 1600;

const naturalSort = (a, b) => a.localeCompare(b, 'ko', { numeric: true });

// 하위 폴더가 없으면 지정한 폴더 자체를 하나의 활동으로 본다
const entries = fs.readdirSync(src, { withFileTypes: true });
let groups = entries.filter(e => e.isDirectory()).map(e => ({ name: e.name, dir: path.join(src, e.name) })).sort((a, b) => naturalSort(a.name, b.name));
if (!groups.length) groups = [{ name: path.basename(src), dir: src }];

/** 폴더 안(하위 폴더 포함)의 이미지 파일 */
function listImages(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listImages(p));
    else if (IMAGE.test(e.name)) out.push(p);
  }
  return out.sort(naturalSort);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const manifest = [];
let total = 0, failed = [];
for (const [gi, g] of groups.entries()) {
  const id = String(gi + 1).padStart(2, '0');
  const dir = path.join(OUT, id);
  fs.mkdirSync(dir, { recursive: true });
  const files = listImages(g.dir);
  const saved = [];
  for (const [fi, file] of files.entries()) {
    const name = `${String(fi + 1).padStart(2, '0')}.webp`;
    try {
      const info = await sharp(file, { failOn: 'none' })
        .rotate()                                            // EXIF 회전 반영
        .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })                               // 메타데이터는 기본으로 제거됨
        .toFile(path.join(dir, name));
      saved.push({ file: name, original: path.relative(g.dir, file), width: info.width, height: info.height });
      total++;
      process.stdout.write('.');
    } catch (e) {
      failed.push(`${g.name}/${path.basename(file)} (${e.message})`);
    }
  }
  manifest.push({ id, folder: g.name, count: saved.length, photos: saved });
  console.log(`\n[${id}] ${g.name}: ${saved.length}장`);
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
const size = manifest.flatMap(m => m.photos).reduce((n, p) => n + fs.statSync(path.join(OUT, manifest.find(x => x.photos.includes(p)).id, p.file)).size, 0);
console.log(`\n✔ ${groups.length}개 폴더, 사진 ${total}장 → ${path.relative(process.cwd(), OUT)} (${(size / 1024 / 1024).toFixed(1)} MB)`);
if (failed.length) console.log(`⚠ 변환하지 못한 파일 ${failed.length}개 (HEIC는 iPhone 설정에서 '높은 호환성'으로 저장하거나 JPG로 바꿔주세요):\n  ` + failed.join('\n  '));
console.log('\n다음 단계:\n  git add client/public/images/activities/import\n  git commit -m "Add activity photos"\n  git push');
