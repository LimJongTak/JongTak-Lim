import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, CATEGORY_LABEL, type ProjectDetail as PD } from '../lib/api';
import { useApi } from '../lib/hooks';
import * as I from '../components/Icons';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: p, setData, error } = useApi<PD>(`/projects/${slug}`);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (p) document.title = `${p.title} | 임종탁`; }, [p]);

  if (error) return (
    <div className="page-loading"><div style={{ textAlign: 'center' }}><h1>프로젝트를 찾을 수 없어요</h1><Link to="/#projects" className="btn btn-ghost" style={{ marginTop: 20 }}>목록으로</Link></div></div>
  );
  if (!p) return <div className="page-loading"><div className="loader" /></div>;

  const like = async () => {
    setBusy(true);
    try {
      const r = await api<{ liked: boolean; likes: number }>(`/projects/${p.slug}/like`, { method: 'POST' });
      setData({ ...p, ...r });
    } finally { setBusy(false); }
  };

  return (
    <div style={{ '--accent': p.accent } as CSSProperties}>
      <section className="detail-hero">
        <div className="container">
          <Link to="/#projects" className="back"><I.ArrowLeft /> 모든 프로젝트</Link>
          <h1>{p.title}</h1>
          <p className="sub">{p.subtitle}</p>
          <div className="detail-meta">
            <div><small>YEAR</small><b>{p.period || p.year}</b></div>
            <div><small>TYPE</small><b>{CATEGORY_LABEL[p.category]}</b></div>
            <div><small>ROLE</small><b>{p.role || '-'}</b></div>
            <div><small>TEAM</small><b>{p.team || '개인 / 팀'}</b></div>
          </div>
          {p.cover && <div className="detail-cover"><img src={p.cover} alt={`${p.title} 화면`} /></div>}
        </div>
      </section>

      <div className="container">
        <div className="detail-body">
          <article>
            <section><h2>Overview</h2><p className="lead">{p.summary}</p></section>
            {!!p.problem?.length && <section><h2>Problem</h2><ol className="num-list">{p.problem.map((x, i) => <li key={i}>{x}</li>)}</ol></section>}
            {!!p.process?.length && <section><h2>Process</h2><ol className="num-list">{p.process.map((x, i) => <li key={i}>{x}</li>)}</ol></section>}
            {p.insight && <section><h2>Insight</h2><p className="insight">“{p.insight}”</p></section>}
          </article>
          <aside className="side">
            <button className={`btn btn-ghost like-btn ${p.liked ? 'liked' : ''}`} onClick={like} disabled={busy} aria-pressed={p.liked}>
              <I.Heart filled={p.liked} /> {p.liked ? '좋아요 취소' : '좋아요'} · {p.likes}
            </button>
            {p.highlights.length > 0 && (
              <div className="side-box"><h4>Highlights</h4>
                <div className="highlights" style={{ marginTop: 0 }}>{p.highlights.map(h => <div key={h.label}><b>{h.value}</b><span>{h.label}</span></div>)}</div>
              </div>
            )}
            <div className="side-box"><h4>Tech stack</h4><div className="tech-list" style={{ padding: 0 }}>{p.tech.map(t => <span key={t} className="chip">{t}</span>)}</div></div>
            <div className="side-box" style={{ display: 'grid', gap: 8 }}>
              <h4>Links</h4>
              {p.github_url && <a className="btn btn-primary btn-sm" href={p.github_url} target="_blank" rel="noreferrer"><I.Github width={16} /> GitHub</a>}
              {p.demo_url && <a className="btn btn-ghost btn-sm" href={p.demo_url} target="_blank" rel="noreferrer">Live demo <I.ArrowUpRight width={16} /></a>}
              {!p.github_url && !p.demo_url && <span style={{ fontSize: 14, color: 'var(--muted)' }}>공개 링크가 없습니다.</span>}
              <span style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 6, alignItems: 'center' }}><I.Eye width={14} /> 조회 {p.views}</span>
            </div>
          </aside>
        </div>
        <nav className="pn" aria-label="다른 프로젝트">
          {p.prev && <Link to={`/projects/${p.prev.slug}`}><small>← 이전 프로젝트</small><b>{p.prev.title}</b></Link>}
          {p.next && <Link to={`/projects/${p.next.slug}`} className="next"><small>다음 프로젝트 →</small><b>{p.next.title}</b></Link>}
        </nav>
      </div>
    </div>
  );
}
