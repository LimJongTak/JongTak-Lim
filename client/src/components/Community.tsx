import { useState, type FormEvent } from 'react';
import { api, errorText, formatDate, type GuestbookEntry, type Profile } from '../lib/api';
import { useApi } from '../lib/hooks';
import * as I from './Icons';

const AVATAR_COLORS = ['#7c3aed', '#3b5bdb', '#f59e0b', '#ec4899', '#10b981', '#0ea5e9', '#ef4444'];
const colorOf = (name: string) => AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

type GbPage = { items: GuestbookEntry[]; total: number; page: number; pageSize: number };

export function Guestbook() {
  const [page, setPage] = useState(1);
  const { data, reload } = useApi<GbPage>(`/guestbook?page=${page}`);
  const [form, setForm] = useState({ name: '', message: '', password: '', website: '' });
  const [state, setState] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setState(null);
    try {
      await api('/guestbook', { method: 'POST', json: form });
      setForm({ name: '', message: '', password: '', website: '' });
      setState({ type: 'ok', text: '방명록이 등록되었습니다. 감사합니다!' });
      if (page !== 1) setPage(1); else reload();
    } catch (err) {
      setState({ type: 'err', text: errorText(err) });
    } finally { setBusy(false); }
  };


  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <section className="section" id="guestbook">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Guestbook</span>
          <h2>한 줄의 응원도 큰 선이 됩니다</h2>
          <p>다녀가신 흔적을 남겨주세요. {data ? `지금까지 ${data.total}개의 메시지가 남겨졌어요.` : ''}</p>
        </div>
        <div className="gb-grid">
          <form className="gb-form reveal" onSubmit={submit}>
            <div className="form-row">
              <div className="field"><label htmlFor="gb-name">이름</label>
                <input id="gb-name" className="input" maxLength={20} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label htmlFor="gb-pw">비밀번호</label>
                <input id="gb-pw" className="input" type="password" minLength={4} maxLength={50} required placeholder="삭제할 때 필요" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            </div>
            <div className="field"><label htmlFor="gb-msg">메시지</label>
              <textarea id="gb-msg" className="textarea" maxLength={500} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="응원, 피드백, 인사 모두 환영해요" />
              <small style={{ color: 'var(--muted)', textAlign: 'right' }}>{form.message.length} / 500</small>
            </div>
            <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
            {state && <div className={`notice ${state.type}`} role="status">{state.text}</div>}
            <button className="btn btn-brand" disabled={busy}>{busy ? '등록 중…' : '남기기'}</button>
          </form>

          <div>
            <ul className="gb-list">
              {data?.items.length === 0 && <li className="empty">첫 번째 방명록을 남겨주세요 ✍️</li>}
              {data?.items.map(g => <GuestbookItem key={g.id} g={g} onDeleted={reload} />)}
            </ul>
            {pages > 1 && (
              <div className="pager">
                {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                  <button key={n} className={n === page ? 'active' : ''} onClick={() => setPage(n)} aria-label={`${n} 페이지`}>{n}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact({ profile }: { profile: Profile }) {
  const empty = { name: '', email: '', company: '', subject: '', message: '', website: '' };
  const [form, setForm] = useState(empty);
  const [state, setState] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setState(null);
    try {
      await api('/contact', { method: 'POST', json: form });
      setForm(empty);
      setState({ type: 'ok', text: '메시지를 잘 받았습니다. 빠르게 회신드리겠습니다!' });
    } catch (err) {
      setState({ type: 'err', text: errorText(err) });
    } finally { setBusy(false); }
  };

  const c = profile.closing;
  return (
    <section className="section section-alt" id="contact">
      <div className="container contact-wrap">
        <div className="closing reveal">
          <span className="eyebrow">Contact</span>
          <h2 style={{ marginTop: 14 }}>{c.title}</h2>
          <p className="sub">{c.subtitle}</p>
          <p>{c.body}</p>
          <div className="contact-links">
            <a className="contact-link" href={`mailto:${profile.email}`}><I.Mail /><span><small>Email</small><b>{profile.email}</b></span></a>
            <a className="contact-link" href={profile.github} target="_blank" rel="noreferrer"><I.Github /><span><small>GitHub</small><b>{profile.github.replace('https://', '')}</b></span></a>
          </div>
        </div>
        <form className="contact-form reveal d1" onSubmit={submit}>
          <div className="form-row">
            <div className="field"><label htmlFor="c-name">이름 *</label><input id="c-name" className="input" required maxLength={50} value={form.name} onChange={set('name')} /></div>
            <div className="field"><label htmlFor="c-email">이메일 *</label><input id="c-email" className="input" type="email" required maxLength={120} value={form.email} onChange={set('email')} /></div>
          </div>
          <div className="form-row">
            <div className="field"><label htmlFor="c-company">회사 / 소속</label><input id="c-company" className="input" maxLength={80} value={form.company} onChange={set('company')} /></div>
            <div className="field"><label htmlFor="c-subject">제목</label><input id="c-subject" className="input" maxLength={120} value={form.subject} onChange={set('subject')} /></div>
          </div>
          <div className="field"><label htmlFor="c-msg">내용 *</label><textarea id="c-msg" className="textarea" style={{ minHeight: 160 }} required minLength={10} maxLength={3000} value={form.message} onChange={set('message')} placeholder="채용 제안, 협업, 질문 무엇이든 좋아요." /></div>
          <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden value={form.website} onChange={set('website')} />
          {state && <div className={`notice ${state.type}`} role="status">{state.text}</div>}
          <button className="btn btn-primary" disabled={busy}>{busy ? '보내는 중…' : <>메시지 보내기 <I.ArrowRight width={18} /></>}</button>
        </form>
      </div>
    </section>
  );
}

function GuestbookItem({ g, onDeleted }: { g: GuestbookEntry; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr('');
    try { await api(`/guestbook/${g.id}`, { method: 'DELETE', json: { password: pw } }); onDeleted(); }
    catch (e2) { setErr(errorText(e2)); }
  };
  return (
    <li className="gb-item">
      <header>
        <span className="avatar" style={{ background: colorOf(g.name) }}>{[...g.name][0]}</span>
        <div><b>{g.name}</b><br /><time dateTime={g.created_at}>{formatDate(g.created_at)}</time></div>
        <button className="del" onClick={() => { setDeleting(d => !d); setErr(''); setPw(''); }}>{deleting ? '취소' : '삭제'}</button>
      </header>
      {deleting && (
        <form className="gb-del" onSubmit={submit}>
          <input className="input" type="password" placeholder="작성할 때 정한 비밀번호" aria-label="비밀번호" value={pw} onChange={e => setPw(e.target.value)} required autoFocus />
          <button className="btn btn-danger btn-sm">삭제</button>
          {err && <span className="gb-del-err" role="alert">{err}</span>}
        </form>
      )}
      <p>{g.message}</p>
      {g.reply && <div className="gb-reply"><b>임종탁</b>{g.reply}</div>}
    </li>
  );
}
