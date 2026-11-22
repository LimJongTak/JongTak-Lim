import { useState, type FormEvent } from 'react';
import { api, errorText } from '../../lib/api';
import { useApi } from '../../lib/hooks';
import ConfirmButton from '../../components/ConfirmButton';

export type Field = {
  key: string; label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'lines' | 'tags' | 'pairs' | 'bool' | 'color';
  options?: string[]; required?: boolean; help?: string; wide?: boolean;
};

type Row = Record<string, unknown> & { id: number };

/** 폼 문자열 ↔ API 값 변환 */
function toForm(f: Field, v: unknown): string | boolean {
  if (f.type === 'bool') return !!v;
  if (f.type === 'lines') return ((v as string[]) ?? []).join('\n');
  if (f.type === 'tags') return ((v as string[]) ?? []).join(', ');
  if (f.type === 'pairs') return ((v as { label: string; value: string }[]) ?? []).map(p => `${p.label} | ${p.value}`).join('\n');
  return v == null ? '' : String(v);
}
function fromForm(f: Field, v: string | boolean): unknown {
  if (f.type === 'bool') return !!v;
  const s = String(v);
  if (f.type === 'number') return Number(s || 0);
  if (f.type === 'lines') return s.split('\n').map(x => x.trim()).filter(Boolean);
  if (f.type === 'tags') return s.split(',').map(x => x.trim()).filter(Boolean);
  if (f.type === 'pairs') return s.split('\n').map(x => x.split('|').map(y => y.trim())).filter(x => x[0]).map(([label, value]) => ({ label, value: value ?? '' }));
  return s;
}

export default function ResourceEditor({ resource, fields, columns, defaults = {} }: {
  resource: string; fields: Field[]; columns: string[]; defaults?: Record<string, unknown>;
}) {
  const { data, reload } = useApi<Row[]>(`/admin/content/${resource}`);
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [msg, setMsg] = useState<string | null>(null);

  const open = (row: Row | 'new') => {
    const src = row === 'new' ? defaults : row;
    setForm(Object.fromEntries(fields.map(f => [f.key, toForm(f, src[f.key])])));
    setEditing(row); setMsg(null);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const body = Object.fromEntries(fields.map(f => [f.key, fromForm(f, form[f.key])]));
    try {
      if (editing === 'new') await api(`/admin/content/${resource}`, { method: 'POST', json: body });
      else if (editing) await api(`/admin/content/${resource}/${editing.id}`, { method: 'PUT', json: body });
      setEditing(null); reload();
    } catch (err) { setMsg(errorText(err)); }
  };

  const remove = async (row: Row) => {
    await api(`/admin/content/${resource}/${row.id}`, { method: 'DELETE' });
    reload();
  };

  return (
    <div>
      <div className="adm-toolbar">
        <span>{data?.length ?? 0}개 항목</span>
        <button className="btn btn-brand btn-sm" onClick={() => open('new')}>+ 새로 추가</button>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr>{columns.map(c => <th key={c}>{fields.find(f => f.key === c)?.label ?? c}</th>)}<th /></tr></thead>
          <tbody>
            {data?.map(row => (
              <tr key={row.id}>
                {columns.map(c => <td key={c}>{Array.isArray(row[c]) ? (row[c] as unknown[]).length + '개' : typeof row[c] === 'number' && (c === 'featured' || c === 'published') ? (row[c] ? '✔' : '') : String(row[c] ?? '')}</td>)}
                <td className="adm-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => open(row)}>수정</button>
                  <ConfirmButton onConfirm={() => remove(row)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="adm-modal" role="dialog" aria-modal onClick={e => { if (e.target === e.currentTarget) setEditing(null); }}>
          <form className="adm-panel" onSubmit={save}>
            <header><h3>{editing === 'new' ? '새 항목' : '수정'}</h3><button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>닫기</button></header>
            <div className="adm-fields">
              {fields.map(f => (
                <div key={f.key} className={`field ${f.wide || ['textarea', 'lines', 'pairs'].includes(f.type) ? 'wide' : ''}`}>
                  <label htmlFor={`f-${f.key}`}>{f.label}{f.required && ' *'}</label>
                  {f.type === 'bool' ? (
                    <label className="adm-check"><input id={`f-${f.key}`} type="checkbox" checked={!!form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.checked })} /> 사용</label>
                  ) : f.type === 'select' ? (
                    <select id={`f-${f.key}`} className="select" value={String(form[f.key])} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                      {f.options!.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : ['textarea', 'lines', 'pairs'].includes(f.type) ? (
                    <textarea id={`f-${f.key}`} className="textarea" rows={f.type === 'textarea' ? 3 : 4} value={String(form[f.key])} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  ) : (
                    <input id={`f-${f.key}`} className="input" type={f.type === 'number' ? 'number' : f.type === 'color' ? 'color' : 'text'} required={f.required}
                      value={String(form[f.key])} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  )}
                  {(f.help || f.type === 'lines' || f.type === 'tags' || f.type === 'pairs') && (
                    <small className="adm-help">{f.help ?? (f.type === 'lines' ? '한 줄에 하나씩' : f.type === 'tags' ? '쉼표로 구분' : '한 줄에 "라벨 | 값"')}</small>
                  )}
                </div>
              ))}
            </div>
            {msg && <div className="notice err">{msg}</div>}
            <footer><button className="btn btn-brand">저장</button></footer>
          </form>
        </div>
      )}
    </div>
  );
}
