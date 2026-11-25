import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { seed } from './seed.js';
import { errorHandler } from './middleware.js';
import { publicRouter } from './routes/public.js';
import { communityRouter } from './routes/community.js';
import { authRouter, adminRouter } from './routes/admin.js';
import { scheduleGithubSync } from './github.js';
async function main() {
    // 첫 실행이면 Firestore에 기본 콘텐츠 삽입
    const isNew = await seed({ reset: false });
    if (isNew)
        console.log('✔ 새 Firestore에 기본 콘텐츠를 넣었습니다.');
    const app = express();
    app.set('trust proxy', 1);
    app.disable('x-powered-by');
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
                fontSrc: ["'self'", 'https://cdn.jsdelivr.net', 'data:'],
                connectSrc: ["'self'"],
            },
        },
    }));
    if (!config.isProd)
        app.use(cors({ origin: config.corsOrigin, credentials: true }));
    app.use(express.json({ limit: '200kb' }));
    app.use(cookieParser());
    app.get('/api/health', (_req, res) => { res.json({ ok: true }); });
    app.use('/api', publicRouter);
    app.use('/api', communityRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/admin', adminRouter);
    app.use('/api', (_req, res) => { res.status(404).json({ error: 'Not found' }); });
    // 프로덕션: 빌드된 클라이언트를 같은 서버에서 서빙 (SPA fallback)
    if (fs.existsSync(path.join(config.clientDist, 'index.html'))) {
        app.use(express.static(config.clientDist, { maxAge: '7d', index: false }));
        app.get(/^\/(?!api\/).*/, (_req, res) => {
            res.set('Cache-Control', 'no-cache');
            res.sendFile(path.join(config.clientDist, 'index.html'));
        });
    }
    app.use(errorHandler);
    app.listen(config.port, () => {
        console.log(`▶ API 서버: http://localhost:${config.port}`);
        if (!process.env.DISABLE_GITHUB_SYNC)
            scheduleGithubSync();
    });
}
main().catch(err => { console.error(err); process.exit(1); });
