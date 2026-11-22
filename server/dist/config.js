import path from 'node:path';
import crypto from 'node:crypto';
const isProd = process.env.NODE_ENV === 'production';
function required(name, devFallback) {
    const v = process.env[name];
    if (v)
        return v;
    if (isProd)
        throw new Error(`환경 변수 ${name} 가 설정되지 않았습니다.`);
    return devFallback;
}
export const config = {
    isProd,
    port: Number(process.env.PORT ?? 4000),
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? 'jongtak-lim',
    jwtSecret: required('JWT_SECRET', 'dev-only-secret-change-me'),
    /** 방문자 IP를 해시할 때 쓰는 salt. 원본 IP는 저장하지 않는다. */
    hashSalt: process.env.HASH_SALT ?? crypto.createHash('sha256').update('jongtak-portfolio').digest('hex'),
    adminUsername: process.env.ADMIN_USERNAME ?? 'admin',
    adminPassword: required('ADMIN_PASSWORD', 'admin1234'),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    githubUser: process.env.GITHUB_USER ?? 'LimJongTak',
    githubToken: process.env.GITHUB_TOKEN ?? '',
    /** 문의가 들어오면 POST로 알려줄 웹훅(슬랙/디스코드 등). 선택. */
    notifyWebhook: process.env.NOTIFY_WEBHOOK_URL ?? '',
    clientDist: path.resolve(process.env.CLIENT_DIST ?? (isProd ? './public' : '../client/dist')),
};
