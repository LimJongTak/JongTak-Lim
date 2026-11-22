import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { Award, Experience, Profile, Project, Repo, Rich, Skill } from '../lib/api';
import { CATEGORY_LABEL } from '../lib/api';
import { useCountUp } from '../lib/hooks';
import * as I from './Icons';

/* ───────────── Hero ───────────── */

function RichText({ parts }: { parts: Rich[] }) {
  return <>{parts.map((p, i) => typeof p === 'string' ? <span key={i}>{p}</span> : <span key={i} className={`c-${p.color}`}>{p.text}</span>)}</>;
}

function Typer({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [len, setLen] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    if (!words.length) return;
    const w = words[i % words.length];
    const t = setTimeout(() => {
      if (!del && len < w.length) setLen(len + 1);
      else if (!del && len === w.length) setDel(true);
      else if (del && len > 0) setLen(len - 1);
      else { setDel(false); setI(i + 1); }
    }, !del && len === w.length ? 1800 : del ? 40 : 80);
    return () => clearTimeout(t);
  }, [len, del, i, words]);
  return <b>{words[i % words.length]?.slice(0, len)}<span className="caret" /></b>;
}

function Stat({ value, suffix, label }: Profile['stats'][number]) {
  const { ref, value: v } = useCountUp(value);
  return (
    <div className="stat" ref={ref as React.RefObject<HTMLDivElement>}>
      <b>{v.toLocaleString()}{suffix}</b>
      <span>{label}</span>
    </div>
  );
}

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section className="hero" id="top">
      <div className="hero-bg"><div className="hero-grid" /><div className="blob b1" /><div className="blob b2" /><div className="blob b3" /></div>
      <div className="container hero-inner">
        <div className="hero-top">
          <div><strong>{new Date().getFullYear()}</strong>Portfolio</div>
          <span className="status-pill">함께할 팀을 찾고 있어요</span>
        </div>
        <h1>
          <span className="row"><span><RichText parts={profile.headline.line1} /></span></span>
          <span className="row"><span><RichText parts={profile.headline.line2} /></span></span>
          <span className="row"><span className="quote">“{profile.headline.line3}”</span></span>
        </h1>
        <div className="hero-line" aria-hidden>
          <span className="track" /><span className="pt start" /><span className="pt end" />
        </div>
        <div className="hero-bottom">
          <div>
            <p className="hero-intro">{profile.intro}</p>
            <p className="hero-roles">&gt; <Typer words={profile.roles} /></p>
            <div className="hero-cta">
              <a href="#projects" className="btn btn-primary">프로젝트 보기 <I.ArrowRight width={18} /></a>
              <a href="#contact" className="btn btn-ghost">연락하기</a>
            </div>
          </div>
          <div className="stats">{profile.stats.map(s => <Stat key={s.label} {...s} />)}</div>
        </div>
      </div>
      <div className="scroll-hint">SCROLL</div>
    </section>
  );
}

/* ───────────── About + Skills ───────────── */

export function About({ profile, skills }: { profile: Profile; skills: Skill[] }) {
  const groups = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const s of skills) m.set(s.category, [...(m.get(s.category) ?? []), s.name]);
    return [...m.entries()];
  }, [skills]);
  const e = profile.education;
  return (
    <section className="section" id="about">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">About me</span>
          <h2>점을 이어 선을 만드는 사람</h2>
        </div>
        <div className="about-grid">
          <aside className="profile-card reveal">
            {profile.photo && <img className="profile-photo" src={profile.photo} alt={`${profile.name} 프로필 사진`} width={120} height={150} />}
            <h3>{profile.name}<small>{profile.nameEn}</small></h3>
            <p className="role">{profile.role}</p>
            <ul className="info-list">
              <li><I.Mail /><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
              <li><I.Github /><a href={profile.github} target="_blank" rel="noreferrer">{profile.github.replace('https://', '')}</a></li>
              <li><I.Cap /><span>{e.school} {e.major}<br /><small>{e.period} · {e.status} · 학점 {e.gpa}</small></span></li>
              <li><I.Pin /><span>{profile.location}</span></li>
              {profile.military && <li><I.Shield /><span>{profile.military}</span></li>}
            </ul>
          </aside>
          <div className="about-body">
            <h3 className="reveal">
              학생회장, 동아리 회장, PM, 디자이너, 프론트엔드 개발자.<br />
              여러 역할을 거치며 <em>“내 일이 아닌 일은 없다”</em>는 태도와, <em>함께 성장하는 방법</em>을 배웠습니다.
            </h3>
            <p className="reveal d1">
              초등학생 때 Visual Basic으로 ‘내 아이디어로 누군가를 편리하게 만들 수 있다’는 매력에 빠졌습니다.
              혼자 하는 학습의 한계를 느끼고 고등학교에서는 컴퓨터 동아리를, 대학에서는 코딩 동아리와 스터디, 자체 해커톤을 만들었습니다.
              ‘혼자’가 아닌 ‘함께’ 성장하는 가치를 믿습니다.
            </p>
            <p className="reveal d2">
              {e.school} {e.major}를 학점 {e.gpa}로 졸업했고, 졸업작품으로 <b>{e.thesis}</b>을 만들었습니다.
              7개 이상의 프로젝트에서 PM, 기획, 디자인, 개발을 맡아 결과물을 직접 출시하고 운영했습니다.
            </p>
            <div className="skill-groups">
              {groups.map(([cat, names], i) => (
                <div className={`skill-group reveal d${Math.min(i, 4)}`} key={cat}>
                  <h4>{CATEGORY_LABEL[cat] ?? cat}</h4>
                  <ul>{names.map(n => <li key={n} className="chip">{n}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Philosophy: The Start of Line ───────────── */

export function Philosophy({ profile }: { profile: Profile }) {
  const p = profile.philosophy;
  const rot = [-8, 6, -4, 9, -6];
  return (
    <section className="section section-alt" id="philosophy">
      <div className="container">
        <div className="section-head center reveal">
          <span className="eyebrow">{p.title}</span>
          <h2>「 {p.quote} 」</h2>
          <p>개발을 대하는 태도, 그리고 시스템을 통해 ‘함께의 가치’를 깨닫기까지</p>
        </div>
        <div className="philo-grid">
          <div className="philo-card reveal">
            <div className="tangle">
              <svg viewBox="0 0 200 150" aria-hidden>
                {[0, 1, 2, 3, 4, 5].map(i => <ellipse key={i} cx="100" cy="75" rx={70 - i * 4} ry={40 + i * 5} fill="none" stroke="currentColor" strokeWidth="2" transform={`rotate(${i * 30} 100 75)`} />)}
              </svg>
              {p.before.tags.map((t, i) => <span key={t} className="chip" style={{ '--r': `${rot[i % rot.length]}deg` } as CSSProperties}>{t}</span>)}
            </div>
            <h3>{p.before.title}</h3>
            <p>{p.before.body}</p>
          </div>
          <div className="philo-arrow reveal d1"><I.BigArrow /></div>
          <div className="philo-card reveal d2">
            <div className="flow">
              {p.after.flow.map((f, i) => (
                <span key={f} style={{ display: 'contents' }}>
                  {i > 0 && <span className="flow-sep"><I.ArrowRight width={18} /></span>}
                  <span className="flow-node">{f}</span>
                </span>
              ))}
            </div>
            <h3>{p.after.title}</h3>
            <p>{p.after.body}</p>
          </div>
        </div>
        <p className="lesson reveal">“{p.lesson}”</p>
      </div>
    </section>
  );
}

/* ───────────── Projects ───────────── */

function ProjectMedia({ p, featured }: { p: Project; featured?: boolean }) {
  if (p.cover) return <img src={p.cover} alt={`${p.title} 화면`} loading="lazy" />;
  return <span className="mono" style={featured ? { fontSize: 72 } : undefined}>{p.title.replace(/[^A-Za-z가-힣0-9:]/g, '').slice(0, 2)}</span>;
}

export function Projects({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<'all' | 'web' | 'app'>('all');
  const featured = projects.filter(p => p.featured);
  const rest = projects.filter(p => !p.featured && (filter === 'all' || p.category === filter));
  const count = (c: string) => projects.filter(p => !p.featured && (c === 'all' || p.category === c)).length;

  return (
    <section className="section" id="projects">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Projects</span>
          <h2>기술로 그린 성장의 선</h2>
          <p>문제를 정의하고, 과정을 설계하고, 사용자에게 닿을 때까지. 직접 만들고 운영한 서비스들입니다.</p>
        </div>

        <div className="featured-list">
          {featured.map((p, i) => (
            <Link to={`/projects/${p.slug}`} key={p.slug} className="feature reveal" style={{ '--accent': p.accent } as CSSProperties}>
              <div className="feature-media"><ProjectMedia p={p} featured /></div>
              <div className="feature-body">
                <div className="feature-meta">
                  <span>Technical Line {i + 1}</span><span className="dot" /><span>{p.year}</span><span className="dot" /><span>{CATEGORY_LABEL[p.category]}</span>
                </div>
                <h3>{p.title}</h3>
                <p className="sub">{p.subtitle}</p>
                <p className="sum">{p.summary}</p>
                {p.highlights.length > 0 && (
                  <div className="highlights">{p.highlights.map(h => <div key={h.label}><b>{h.value}</b><span>{h.label}</span></div>)}</div>
                )}
                <div className="tech-list">{p.tech.map(t => <span key={t} className="chip">{t}</span>)}</div>
                <span className="more-link">자세히 보기 <I.ArrowRight /></span>
              </div>
            </Link>
          ))}
        </div>

        <div className="filters reveal" role="tablist" aria-label="프로젝트 분류">
          {(['all', 'web', 'app'] as const).map(f => (
            <button key={f} role="tab" aria-selected={filter === f} className={`filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : CATEGORY_LABEL[f]}<small>{count(f)}</small>
            </button>
          ))}
        </div>
        <div className="card-grid">
          {rest.map(p => (
            <Link to={`/projects/${p.slug}`} key={p.slug} className="card" style={{ '--accent': p.accent } as CSSProperties}>
              <div className="card-media">
                <ProjectMedia p={p} />
                <span className="chip yr">{p.year}</span>
              </div>
              <div className="card-body">
                <h3>{p.title}</h3>
                <p className="sub">{p.subtitle}</p>
                <div className="tech-list" style={{ paddingTop: 14, marginTop: 0 }}>{p.tech.slice(0, 4).map(t => <span key={t} className="chip">{t}</span>)}</div>
                <div className="card-stats">
                  <span><I.Eye /> {p.views}</span><span><I.Heart /> {p.likes}</span>
                  <span className="more-link" style={{ marginTop: 0, marginLeft: 'auto', fontSize: 14 }}>View <I.ArrowRight /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Experience timeline ───────────── */

export function ExperienceSection({ items }: { items: Experience[] }) {
  return (
    <section className="section section-alt" id="experience">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Experience</span>
          <h2>함께 그려온 선들</h2>
          <p>학생회, 동아리, 봉사와 멘토링. 사람과 조직 사이에서 문제를 해결해 온 기록입니다.</p>
        </div>
        <ol className="timeline">
          {items.map(x => (
            <li key={x.id} className="tl-item reveal">
              <div className="tl-card">
                <div className="tl-date">
                  {x.start_date} – {x.end_date || '현재'}
                  <div><span className="chip chip-brand">{CATEGORY_LABEL[x.category] ?? x.category}</span></div>
                </div>
                <div>
                  <h3>{x.org}<small>{x.title}</small></h3>
                  <ul>{x.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ───────────── Growing together ───────────── */

export function Growth({ profile }: { profile: Profile }) {
  const g = profile.growth;
  return (
    <section className="section" id="growth">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">{g.title}</span>
          <h2>4년간 증명된 꾸준함과 책임감</h2>
        </div>
        <div className="growth-grid">
          <div className="years reveal">
            {g.timeline.map(t => <div className="year" key={t.year}><b>{t.year}</b><span>{t.text}</span></div>)}
          </div>
          <div>
            <h3 className="conv-title reveal"><span className="c-line">경험</span>에서 <span className="c-brand">실무 역량</span>으로</h3>
            <div className="conv">
              {g.conversions.map((c, i) => (
                <div className={`conv-row reveal d${i + 1}`} key={c.from}>
                  <div className="conv-from">{c.from}</div>
                  <div className="conv-arrow" aria-hidden />
                  <div className="conv-to">{c.to}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Awards ───────────── */

export function Awards({ items }: { items: Award[] }) {
  const icon = { award: <I.Trophy />, certificate: <I.Doc />, completion: <I.Badge /> };
  return (
    <section className="section section-alt" id="awards">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Awards & Certificates</span>
          <h2>수상 · 자격 · 수료</h2>
        </div>
        <div className="award-grid">
          {items.map((a, i) => (
            <div key={a.id} className={`award reveal d${i % 2} ${a.kind === 'award' ? 'is-award' : ''}`}>
              <div className="award-icon">{icon[a.kind]}</div>
              <div>
                <h3>{a.title}</h3>
                <p className="meta">{a.date} · {a.issuer} · {CATEGORY_LABEL[a.kind]}</p>
                {a.description && <p>{a.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Future Line ───────────── */

export function Future({ profile }: { profile: Profile }) {
  const f = profile.future;
  return (
    <section className="section" id="future">
      <div className="container">
        <div className="section-head center reveal">
          <span className="eyebrow">{f.title}</span>
          <h2>AI 시대의 가치를 같이 성장하는 내일</h2>
          <p>{f.subtitle}</p>
        </div>
        <div className="steps">
          {f.steps.map((s, i) => (
            <div className={`step reveal d${i + 1}`} key={s.stage}>
              <div className="step-num">0{i + 1}</div>
              <h3>{s.stage}</h3>
              <span className="tool">{s.tool}</span>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
        <p className="future-quote reveal">“{f.quote}”</p>
      </div>
    </section>
  );
}

/* ───────────── GitHub repos ───────────── */

const LANG_COLOR: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5', Dart: '#00B4AB', 'C#': '#178600',
  HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', Kotlin: '#A97BFF',
};

export function GithubSection({ repos, github }: { repos: Repo[]; github: string }) {
  if (!repos.length) return null;
  return (
    <section className="section section-alt" id="github">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Open source</span>
          <h2>최근 GitHub 활동</h2>
          <p>서버가 GitHub API와 주기적으로 동기화하는 최신 레포지토리입니다.</p>
        </div>
        <div className="repo-grid">
          {repos.map(r => (
            <a key={r.name} href={r.html_url} target="_blank" rel="noreferrer" className="repo reveal">
              <h3><I.Repo />{r.name}</h3>
              <p>{r.description || '설명 없음'}</p>
              <div className="meta">
                {r.language && <span><i className="lang-dot" style={{ background: LANG_COLOR[r.language] ?? '#999' }} />{r.language}</span>}
                {r.stars > 0 && <span>★ {r.stars}</span>}
                <span>{r.pushed_at}</span>
              </div>
            </a>
          ))}
        </div>
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <a href={github} target="_blank" rel="noreferrer" className="btn btn-ghost"><I.Github width={18} /> GitHub에서 더 보기</a>
        </div>
      </div>
    </section>
  );
}
