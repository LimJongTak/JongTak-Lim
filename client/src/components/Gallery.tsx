import { useCallback, useEffect, useState } from 'react';
import type { Photo } from '../lib/api';
import * as I from './Icons';

/** 사진 묶음. 개수에 따라 배치가 바뀌고, 누르면 라이트박스로 연다 */
export default function Gallery({ images, onOpen }: { images: Photo[]; onOpen?: (src: string) => void }) {
  if (!images.length) return null;
  return (
    <div className={`gallery ${images.length === 1 ? 'g-one' : images.length % 2 ? 'g-odd' : 'g-even'}`}>
      {images.map((p, i) => (
        <figure key={p.src + i}>
          <button type="button" onClick={() => onOpen?.(p.src)} aria-label={`${p.caption || `사진 ${i + 1}`} 크게 보기`}>
            <img src={p.src} alt={p.caption} loading="lazy" />
          </button>
          {p.caption && <figcaption>{p.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

/** 전체 화면 사진 보기. ←/→ 로 넘기고 Esc 로 닫는다 */
export function Lightbox({ photos, index, onClose, onIndex }: {
  photos: Photo[]; index: number | null; onClose: () => void; onIndex: (i: number) => void;
}) {
  const go = useCallback((d: number) => {
    if (index === null) return;
    onIndex((index + d + photos.length) % photos.length);
  }, [index, photos.length, onIndex]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [index, go, onClose]);

  if (index === null || !photos[index]) return null;
  const p = photos[index];
  return (
    <div className="lightbox" role="dialog" aria-modal aria-label="사진 크게 보기" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <button className="lb-close icon-btn" onClick={onClose} aria-label="닫기"><I.Close /></button>
      {photos.length > 1 && <button className="lb-nav prev icon-btn" onClick={() => go(-1)} aria-label="이전 사진"><I.ArrowLeft /></button>}
      <figure>
        <img src={p.src} alt={p.caption} />
        <figcaption>{p.caption}<span>{index + 1} / {photos.length}</span></figcaption>
      </figure>
      {photos.length > 1 && <button className="lb-nav next icon-btn" onClick={() => go(1)} aria-label="다음 사진"><I.ArrowRight /></button>}
    </div>
  );
}

/** 라이트박스 상태 훅: 경로로 열고, 목록 안에서 이동 */
export function useLightbox(photos: Photo[]) {
  const [index, setIndex] = useState<number | null>(null);
  const open = useCallback((src: string) => {
    const i = photos.findIndex(p => p.src === src);
    setIndex(i >= 0 ? i : null);
  }, [photos]);
  return { index, setIndex, open, close: () => setIndex(null) };
}
