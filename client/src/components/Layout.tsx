import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useApi, usePageTracking, useReveal, useTheme } from '../lib/hooks';
import { ArrowUp, Close, Menu, Moon, Sun } from './Icons';

const LINKS: { id: string; label: string; to?: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'activity', label: 'Blog', to: '/blog' },
  { id: 'awards', label: 'Awards' },
  { id: 'guestbook', label: 'Guestbook' },
  { id: 'contact', label: 'Contact' },
];

export default function Layout() {
  usePageTracking();
  useReveal();
  const { pathname, hash } = useLocation();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 10);
      setProgress(max > 0 ? y / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 현재 보고 있는 섹션을 메뉴에 표시
  useEffect(() => {
    if (pathname !== '/') { setActive(''); return; }
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
    }, { rootMargin: '-45% 0px -50% 0px' });
    const t = setTimeout(() => LINKS.forEach(l => { const el = document.getElementById(l.id); if (el) io.observe(el); }), 300);
    return () => { clearTimeout(t); io.disconnect(); };
  }, [pathname]);

  // 라우트 이동 시 스크롤 처리 (#hash 가 있으면 해당 섹션으로)
  useEffect(() => {
    setOpen(false);
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return (
    <>
      <div className="progress-bar" style={{ transform: `scaleX(${progress})`, width: '100%' }} />
      <header className={`nav ${scrolled || open ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <Link to="/" className="logo" aria-label="홈으로">
            <span className="logo-mark"><i /><i /></span>
            JongTak
          </Link>
          <nav className="nav-links" aria-label="주요 메뉴">
            {LINKS.map(l => (
              <Link key={l.id} to={l.to ?? `/#${l.id}`} className={active === l.id || (l.to && pathname.startsWith(l.to)) ? 'active' : ''}>{l.label}</Link>
            ))}
          </nav>
          <div className="nav-actions">
            <button className="icon-btn" onClick={toggle} aria-label={theme === 'dark' ? '라이트 모드' : '다크 모드'}>
              {theme === 'dark' ? <Sun /> : <Moon />}
            </button>
            <button className="icon-btn menu-btn" onClick={() => setOpen(o => !o)} aria-label="메뉴" aria-expanded={open}>
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <nav className={`mobile-menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        {LINKS.map(l => <Link key={l.id} to={l.to ?? `/#${l.id}`} tabIndex={open ? 0 : -1}>{l.label}</Link>)}
      </nav>

      <main><Outlet /></main>
      {import.meta.env.VITE_DEMO && <DemoBar />}

      <Footer />
      <button className={`icon-btn to-top ${progress > 0.15 ? 'show' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="맨 위로">
        <ArrowUp />
      </button>
    </>
  );
}

function Footer() {
  // 방문 기록(track)이 먼저 저장되도록 조금 늦게 조회
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 1200); return () => clearTimeout(t); }, []);
  const { data } = useApi<{ totalVisitors: number; todayVisitors: number }>(ready ? '/stats' : null);
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} JongTak Lim. Ready to draw the next line.</span>
        <span className="visitors">
          {data && <><span>Today {data.todayVisitors.toLocaleString()}</span><span>Total {data.totalVisitors.toLocaleString()}</span></>}
          <a href="https://github.com/LimJongTak" target="_blank" rel="noreferrer">GitHub</a>
        </span>
      </div>
    </footer>
  );
}

/** 미리보기 빌드에서만 보이는 안내 막대 */
function DemoBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  const reset = async () => {
    const { resetDemo } = await import('../lib/demo');
    resetDemo(); window.location.reload();
  };
  return (
    <div className="demo-bar" role="note">
      <span><b>미리보기</b> 방명록·문의·좋아요는 이 브라우저에만 저장돼요.</span>
      <Link to="/admin">관리자 화면 (admin / admin1234)</Link>
      <button onClick={reset}>데이터 초기화</button>
      <button onClick={() => setOpen(false)} aria-label="안내 닫기">✕</button>
    </div>
  );
}
