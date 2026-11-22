import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import './styles/global.css';

// 관리자 화면은 방문자가 받을 필요 없으므로 별도 청크로 분리
const Admin = lazy(() => import('./pages/admin/Admin'));

function NotFound() {
  return (
    <div className="page-loading">
      <div style={{ textAlign: 'center' }}>
        <p className="eyebrow">404</p>
        <h1 style={{ fontSize: 40, marginTop: 12 }}>선이 끊긴 곳이에요</h1>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>홈으로</Link>
      </div>
    </div>
  );
}

// 미리보기(아티팩트) 빌드는 주소창 경로를 쓸 수 없어 메모리 라우터를 사용
const Router = import.meta.env.VITE_DEMO ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/admin/*" element={<Suspense fallback={<div className="page-loading"><div className="loader" /></div>}><Admin /></Suspense>} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  </StrictMode>
);
