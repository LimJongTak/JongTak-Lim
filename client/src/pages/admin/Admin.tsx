import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { api, errorText, formatDate, type GuestbookEntry, type Message, type Repo } from '../../lib/api';
import { useApi, useTheme } from '../../lib/hooks';
import ResourceEditor, { type Field } from './ResourceEditor';
import ConfirmButton from '../../components/ConfirmButton';
import './admin.css';

/* ───────────── 필드 정의 ───────────── */

const PROJECT_FIELDS: Field[] = [
  { key: 'title', label: '제목', type: 'text', required: true },
  { key: 'slug', label: 'Slug (URL)', type: 'text', required: true, help: '영문 소문자, 숫자, -' },
  { key: 'subtitle', label: '부제', type: 'text', wide: true },
  { key: 'year', label: '연도', type: 'number', required: true },
  { key: 'period', label: '기간', type: 'text' },
  { key: 'category', label: '분류', type: 'select', options: ['web', 'app', 'etc'] },
  { key: 'role', label: '역할', type: 'text' },
  { key: 'team', label: '팀 / 소속', type: 'text' },
  { key: 'accent', label: '포인트 색', type: 'color' },
  { key: 'summary', label: '요약', type: 'textarea' },
  { key: 'problem', label: 'Problem', type: 'lines' },
  { key: 'process', label: 'Process', type: 'lines' },
  { key: 'insight', label: 'Insight', type: 'textarea' },
  { key: 'highlights', label: '하이라이트 수치', type: 'pairs' },
  { key: 'tech', label: '기술 스택', type: 'tags', wide: true },
  { key: 'github_url', label: 'GitHub URL', type: 'text', wide: true },
  { key: 'demo_url', label: '데모 URL', type: 'text', wide: true },
  { key: 'cover', label: '커버 이미지 경로/URL', type: 'text', wide: true, help: '/images/파일명.webp 또는 https:// 이미지 주소' },
  { key: 'sort_order', label: '정렬 순서', type: 'number' },
  { key: 'featured', label: '대표 프로젝트', type: 'bool' },
  { key: 'published', label: '공개', type: 'bool' },
];

const EXP_FIELDS: Field[] = [
  { key: 'org', label: '기관 / 단체', type: 'text', required: true },
  { key: 'title', label: '직책', type: 'text' },
  { key: 'category', label: '분류', type: 'select', options: ['leadership', 'club', 'volunteer', 'work', 'education', 'etc'] },
  { key: 'sort_order', label: '정렬 순서', type: 'number' },
  { key: 'start_date', label: '시작 (YYYY.MM)', type: 'text', required: true },
  { key: 'end_date', label: '종료 (비우면 현재)', type: 'text' },
  { key: 'items', label: '활동 내용', type: 'lines' },
];

const AWARD_FIELDS: Field[] = [
  { key: 'title', label: '이름', type: 'text', required: true, wide: true },
  { key: 'kind', label: '종류', type: 'select', options: ['award', 'certificate', 'completion'] },
  { key: 'date', label: '날짜', type: 'text', required: true },
  { key: 'issuer', label: '발급 기관', type: 'text' },
  { key: 'sort_order', label: '정렬 순서', type: 'number' },
  { key: 'description', label: '설명', type: 'textarea' },
];

const SKILL_FIELDS: Field[] = [
  { key: 'name', label: '이름', type: 'text', required: true },
  { key: 'category', label: '분류', type: 'select', options: ['language', 'frontend', 'backend', 'mobile', 'tool', 'design'] },
  { key: 'sort_order', label: '정렬 순서', type: 'number' },
];

/* ───────────── 로그인 / 레이아웃 ───────────── */

export default function Admin() {
  const [me, setMe] = useState<{ username: string } | null | undefined>(undefined);
  useTheme();
  useEffect(() => {
    document.title = '관리자 | 임종탁 포트폴리오';
    api<{ username: string }>('/auth/me').then(setMe).catch(() => setMe(null));
  }, []);

  if (me === undefined) return <div className="page-loading"><div className="loader" /></div>;
  if (!me) return <Login onLogin={setMe} />;

  const logout = async () => { await api('/auth/logout', { method: 'POST' }); setMe(null); };
  const tabs = [
    ['', '대시보드'], ['projects', '프로젝트'], ['experiences', '경력·활동'], ['awards', '수상·자격'],
    ['skills', '기술'], ['profile', '프로필'], ['messages', '문의함'], ['guestbook', '방명록'], ['github', 'GitHub'], ['account', '계정'],
  ];

  return (
    <div className="adm">
      <aside className="adm-side">
        <Link to="/" className="logo"><span className="logo-mark"><i /><i /></span>Admin</Link>
        <nav>{tabs.map(([to, label]) => <NavLink key={to} to={`/admin/${to}`} end>{label}</NavLink>)}</nav>
        <div className="adm-me">{me.username}<button className="btn btn-ghost btn-sm" onClick={logout}>로그아웃</button></div>
      </aside>
      <main className="adm-main">
        <Routes>
          <Route index element={<Page title="대시보드"><Dashboard /></Page>} />
          <Route path="projects" element={<Page title="프로젝트"><ResourceEditor resource="projects" fields={PROJECT_FIELDS} columns={['title', 'year', 'category', 'featured', 'published', 'views', 'likes']} defaults={{ year: new Date().getFullYear(), category: 'web', accent: '#8b5cf6', published: true, tech: [], problem: [], process: [], highlights: [] }} /></Page>} />
          <Route path="experiences" element={<Page title="경력 · 활동"><ResourceEditor resource="experiences" fields={EXP_FIELDS} columns={['org', 'title', 'category', 'start_date', 'end_date']} defaults={{ category: 'leadership', items: [] }} /></Page>} />
          <Route path="awards" element={<Page title="수상 · 자격 · 수료"><ResourceEditor resource="awards" fields={AWARD_FIELDS} columns={['title', 'kind', 'date', 'issuer']} defaults={{ kind: 'award' }} /></Page>} />
          <Route path="skills" element={<Page title="기술 스택"><ResourceEditor resource="skills" fields={SKILL_FIELDS} columns={['name', 'category', 'sort_order']} defaults={{ category: 'frontend' }} /></Page>} />
          <Route path="profile" element={<Page title="프로필 · 메인 문구"><ProfileEditor /></Page>} />
          <Route path="messages" element={<Page title="문의함"><Messages /></Page>} />
          <Route path="guestbook" element={<Page title="방명록 관리"><GuestbookAdmin /></Page>} />
          <Route path="github" element={<Page title="GitHub 레포"><GithubAdmin /></Page>} />
          <Route path="account" element={<Page title="계정"><Account /></Page>} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function Page({ title, children }: { title: string; children: React.ReactNode }) {
  return <><h1 className="adm-title">{title}</h1>{children}</>;
}

function Login({ onLogin }: { onLogin: (u: { username: string }) => void }) {
  const [f, setF] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr('');
    try { onLogin(await api('/auth/login', { method: 'POST', json: f })); } catch (e2) { setErr(errorText(e2)); }
  };
  return (
    <div className="adm-login">
      <form onSubmit={submit} className="contact-form" style={{ width: 'min(380px, 100%)' }}>
        <Link to="/" className="logo" style={{ marginBottom: 8 }}><span className="logo-mark"><i /><i /></span>Admin</Link>
        <div className="field"><label htmlFor="u">아이디</label><input id="u" className="input" autoComplete="username" value={f.username} onChange={e => setF({ ...f, username: e.target.value })} required /></div>
        <div className="field"><label htmlFor="p">비밀번호</label><input id="p" className="input" type="password" autoComplete="current-password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} required /></div>
        {err && <div className="notice err">{err}</div>}
        <button className="btn btn-primary">로그인</button>
      </form>
    </div>
  );
}

/* ───────────── 대시보드 ───────────── */

type Stats = {
  totals: Record<'visitors' | 'pageViews' | 'todayVisitors' | 'unreadMessages' | 'guestbook' | 'likes', number>;
  daily: { day: string; views: number; visitors: number }[];
  topPaths: { path: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
  projects: { slug: string; title: string; views: number; likes: number }[];
};

function Dashboard() {
  const { data } = useApi<Stats>('/admin/stats');
  if (!data) return <div className="loader" />;
  const t = data.totals;
  const max = Math.max(1, ...data.daily.map(d => d.views));
  const cards: [string, number][] = [['오늘 방문자', t.todayVisitors], ['누적 방문자', t.visitors], ['누적 페이지뷰', t.pageViews], ['읽지 않은 문의', t.unreadMessages], ['방명록', t.guestbook], ['좋아요', t.likes]];
  return (
    <div className="adm-dash">
      <div className="adm-cards">{cards.map(([l, v]) => <div key={l} className="adm-card"><span>{l}</span><b>{v.toLocaleString()}</b></div>)}</div>
      <section className="adm-box">
        <h3>최근 30일 페이지뷰</h3>
        {data.daily.length === 0 ? <p className="adm-muted">아직 데이터가 없습니다.</p> : (
          <div className="adm-chart" role="img" aria-label="일별 페이지뷰 막대 그래프">
            {data.daily.map(d => (
              <div key={d.day} className="adm-bar" title={`${d.day} · 페이지뷰 ${d.views} · 방문자 ${d.visitors}`}>
                <i style={{ height: `${(d.views / max) * 100}%` }} /><small>{d.day.slice(5)}</small>
              </div>
            ))}
          </div>
        )}
      </section>
      <div className="adm-two">
        <section className="adm-box"><h3>많이 본 페이지</h3>
          <table className="adm-table"><tbody>{data.topPaths.map(p => <tr key={p.path}><td>{p.path}</td><td className="num">{p.views}</td></tr>)}</tbody></table>
        </section>
        <section className="adm-box"><h3>프로젝트 반응</h3>
          <table className="adm-table"><thead><tr><th>프로젝트</th><th className="num">조회</th><th className="num">좋아요</th></tr></thead>
            <tbody>{data.projects.map(p => <tr key={p.slug}><td>{p.title}</td><td className="num">{p.views}</td><td className="num">{p.likes}</td></tr>)}</tbody></table>
        </section>
      </div>
      {data.topReferrers.length > 0 && (
        <section className="adm-box"><h3>유입 경로</h3>
          <table className="adm-table"><tbody>{data.topReferrers.map(r => <tr key={r.referrer}><td>{r.referrer}</td><td className="num">{r.views}</td></tr>)}</tbody></table>
        </section>
      )}
    </div>
  );
}

/* ───────────── 프로필 JSON 편집 ───────────── */

function ProfileEditor() {
  const { data } = useApi<Record<string, unknown>>('/admin/profile');
  const [text, setText] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  useEffect(() => { if (data) setText(JSON.stringify(data, null, 2)); }, [data]);
  const save = async () => {
    let json: unknown;
    try { json = JSON.parse(text); } catch (e) { setMsg({ type: 'err', text: 'JSON 형식 오류: ' + (e as Error).message }); return; }
    try { await api('/admin/profile', { method: 'PUT', json }); setMsg({ type: 'ok', text: '저장했습니다. 메인 페이지에 바로 반영됩니다.' }); }
    catch (e) { setMsg({ type: 'err', text: errorText(e) }); }
  };
  return (
    <div className="adm-box">
      <p className="adm-muted" style={{ marginBottom: 12 }}>메인 문구, 소개, 연락처, 통계 숫자, The Start of Line · Growing Together · Future Line 섹션 내용을 JSON으로 수정합니다.</p>
      <textarea className="textarea adm-code" value={text} onChange={e => setText(e.target.value)} spellCheck={false} />
      {msg && <div className={`notice ${msg.type}`} style={{ marginTop: 12 }}>{msg.text}</div>}
      <button className="btn btn-brand" style={{ marginTop: 12 }} onClick={save}>저장</button>
    </div>
  );
}

/* ───────────── 문의함 ───────────── */

function Messages() {
  const { data, setData } = useApi<Message[]>('/admin/messages');
  const [open, setOpen] = useState<number | null>(null);
  if (!data) return <div className="loader" />;
  if (!data.length) return <p className="empty">아직 받은 문의가 없습니다.</p>;
  const mark = async (m: Message, is_read: boolean) => {
    await api(`/admin/messages/${m.id}`, { method: 'PATCH', json: { is_read } });
    setData(data.map(x => x.id === m.id ? { ...x, is_read: is_read ? 1 : 0 } : x));
  };
  const del = async (m: Message) => {
    await api(`/admin/messages/${m.id}`, { method: 'DELETE' });
    setData(data.filter(x => x.id !== m.id));
  };
  return (
    <ul className="adm-list">
      {data.map(m => (
        <li key={m.id} className={`adm-item ${m.is_read ? '' : 'unread'}`}>
          <button className="adm-item-head" onClick={() => { setOpen(open === m.id ? null : m.id); if (!m.is_read) mark(m, true); }}>
            <b>{m.name}</b> <span className="adm-muted">{m.email}{m.company && ` · ${m.company}`}</span>
            <span className="adm-subject">{m.subject || m.message.slice(0, 40)}</span>
            <time className="adm-muted">{formatDate(m.created_at)}</time>
          </button>
          {open === m.id && (
            <div className="adm-item-body">
              <p style={{ whiteSpace: 'pre-wrap' }}>{m.message}</p>
              <div className="adm-actions">
                <a className="btn btn-primary btn-sm" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || '문의 주셔서 감사합니다'))}`}>메일로 답장</a>
                <button className="btn btn-ghost btn-sm" onClick={() => mark(m, false)}>안 읽음으로</button>
                <ConfirmButton onConfirm={() => del(m)} />
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ───────────── 방명록 관리 ───────────── */

function GuestbookAdmin() {
  const { data, reload } = useApi<GuestbookEntry[]>('/admin/guestbook');
  if (!data) return <div className="loader" />;
  if (!data.length) return <p className="empty">방명록이 없습니다.</p>;
  return <ul className="adm-list">{data.map(g => <GuestbookAdminItem key={g.id} g={g} onChange={reload} />)}</ul>;
}

function GuestbookAdminItem({ g, onChange }: { g: GuestbookEntry; onChange: () => void }) {
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState(g.reply);
  const patch = async (body: object) => { await api(`/admin/guestbook/${g.id}`, { method: 'PATCH', json: body }); onChange(); };
  const del = async () => { await api(`/admin/guestbook/${g.id}`, { method: 'DELETE' }); onChange(); };
  return (
    <li className={`adm-item ${g.is_hidden ? 'hidden' : ''}`}>
      <div className="adm-item-body">
        <p><b>{g.name}</b> <span className="adm-muted">{formatDate(g.created_at)} {g.is_hidden ? '· 숨김' : ''}</span></p>
        <p style={{ whiteSpace: 'pre-wrap' }}>{g.message}</p>
        {g.reply && !replying && <p className="gb-reply"><b>답글</b>{g.reply}</p>}
        {replying && (
          <form style={{ display: 'grid', gap: 8 }} onSubmit={async e => { e.preventDefault(); await patch({ reply }); setReplying(false); }}>
            <textarea id={`reply-${g.id}`} className="textarea" style={{ minHeight: 80 }} maxLength={500} value={reply} onChange={e => setReply(e.target.value)} placeholder="비워서 저장하면 답글이 지워집니다" />
            <div className="adm-actions"><button className="btn btn-brand btn-sm">답글 저장</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => { setReplying(false); setReply(g.reply); }}>취소</button></div>
          </form>
        )}
        {!replying && (
          <div className="adm-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setReplying(true)}>{g.reply ? '답글 수정' : '답글'}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => patch({ is_hidden: !g.is_hidden })}>{g.is_hidden ? '다시 보이기' : '숨기기'}</button>
            <ConfirmButton onConfirm={del} />
          </div>
        )}
      </div>
    </li>
  );
}

/* ───────────── GitHub ───────────── */

function GithubAdmin() {
  const { data, reload } = useApi<Repo[]>('/admin/github');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const sync = async () => {
    setBusy(true); setMsg(null);
    try { const r = await api<{ synced: number }>('/admin/github/sync', { method: 'POST' }); setMsg({ type: 'ok', text: `${r.synced}개 레포를 동기화했습니다.` }); reload(); }
    catch (e) { setMsg({ type: 'err', text: errorText(e) }); } finally { setBusy(false); }
  };
  const toggle = async (r: Repo) => { await api(`/admin/github/${encodeURIComponent(r.name)}`, { method: 'PATCH', json: { hidden: !r.hidden } }); reload(); };
  return (
    <div>
      <div className="adm-toolbar">
        <span className="adm-muted">서버가 6시간마다 자동 동기화합니다. 메인에는 숨기지 않은 최신 12개가 보입니다.</span>
        <button className="btn btn-brand btn-sm" onClick={sync} disabled={busy}>{busy ? '동기화 중…' : '지금 동기화'}</button>
      </div>
      {msg && <div className={`notice ${msg.type}`} style={{ marginBottom: 12 }}>{msg.text}</div>}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>이름</th><th>설명</th><th>언어</th><th>업데이트</th><th /></tr></thead>
          <tbody>{data?.map(r => (
            <tr key={r.name} style={{ opacity: r.hidden ? .45 : 1 }}>
              <td><a href={r.html_url} target="_blank" rel="noreferrer">{r.name}</a></td><td>{r.description}</td><td>{r.language}</td><td>{r.pushed_at}</td>
              <td><button className="btn btn-ghost btn-sm" onClick={() => toggle(r)}>{r.hidden ? '보이기' : '숨기기'}</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────── 계정 ───────────── */

function Account() {
  const [f, setF] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (f.next !== f.confirm) { setMsg({ type: 'err', text: '새 비밀번호가 서로 다릅니다.' }); return; }
    try { await api('/auth/password', { method: 'PUT', json: { current: f.current, next: f.next } }); setMsg({ type: 'ok', text: '비밀번호를 변경했습니다.' }); setF({ current: '', next: '', confirm: '' }); }
    catch (e2) { setMsg({ type: 'err', text: errorText(e2) }); }
  };
  return (
    <form className="adm-box" onSubmit={submit} style={{ maxWidth: 420, display: 'grid', gap: 12 }}>
      <div className="field"><label htmlFor="cur">현재 비밀번호</label><input id="cur" className="input" type="password" autoComplete="current-password" value={f.current} onChange={e => setF({ ...f, current: e.target.value })} required /></div>
      <div className="field"><label htmlFor="nx">새 비밀번호 (8자 이상)</label><input id="nx" className="input" type="password" autoComplete="new-password" minLength={8} value={f.next} onChange={e => setF({ ...f, next: e.target.value })} required /></div>
      <div className="field"><label htmlFor="cf">새 비밀번호 확인</label><input id="cf" className="input" type="password" autoComplete="new-password" value={f.confirm} onChange={e => setF({ ...f, confirm: e.target.value })} required /></div>
      {msg && <div className={`notice ${msg.type}`}>{msg.text}</div>}
      <button className="btn btn-primary">변경</button>
    </form>
  );
}
