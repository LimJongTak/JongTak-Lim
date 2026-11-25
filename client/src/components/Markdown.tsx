import { Fragment, type ReactNode } from 'react';
import type { Photo } from '../lib/api';
import Gallery from './Gallery';

/**
 * 블로그 본문용 작은 마크다운 렌더러. HTML을 주입하지 않고 React 요소로만 만든다.
 * 지원: 빈 줄 문단, ## 소제목, > 인용, - 목록, **굵게**, ![캡션](경로), [[gallery]]
 */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>);
}

export default function Markdown({ source, images = [], onOpen }: {
  source: string; images?: Photo[]; onOpen?: (src: string) => void;
}) {
  const blocks = source.replace(/\r\n/g, '\n').split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
  return (
    <div className="md">
      {blocks.map((b, i) => {
        if (b === '[[gallery]]') return images.length ? <Gallery key={i} images={images} onOpen={onOpen} /> : null;
        if (b.startsWith('## ')) return <h2 key={i}>{inline(b.slice(3))}</h2>;
        const img = b.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
        if (img) return (
          <figure key={i} className="md-figure">
            <button type="button" onClick={() => onOpen?.(img[2])} aria-label={`${img[1] || '이미지'} 크게 보기`}>
              <img src={img[2]} alt={img[1]} loading="lazy" />
            </button>
            {img[1] && <figcaption>{img[1]}</figcaption>}
          </figure>
        );
        const lines = b.split('\n');
        if (lines.every(l => l.startsWith('> '))) return <blockquote key={i}>{inline(lines.map(l => l.slice(2)).join(' '))}</blockquote>;
        if (lines.every(l => l.startsWith('- '))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul>;
        return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(l)}</Fragment>)}</p>;
      })}
    </div>
  );
}

/** 본문에 쓰인 이미지 경로 목록 (라이트박스 순서용) */
export function bodyImages(source: string): Photo[] {
  return [...source.matchAll(/^!\[([^\]]*)\]\(([^)\s]+)\)$/gm)].map(m => ({ src: m[2], caption: m[1] }));
}
