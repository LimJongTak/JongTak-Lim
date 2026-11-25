import { useEffect, useMemo, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { POST_CATEGORY, type Post } from '../lib/api';
import { useApi } from '../lib/hooks';
import Markdown, { bodyImages } from '../components/Markdown';
import { Lightbox, useLightbox } from '../components/Gallery';
import { PostCover } from '../components/PostCard';
import * as I from '../components/Icons';

export default function BlogPost() {
  const { slug } = useParams();
  const { data: p, error } = useApi<Post>(`/posts/${slug}`);
  useEffect(() => { if (p) document.title = `${p.title} | 임종탁`; }, [p]);

  // 본문 이미지 + 갤러리를 하나의 라이트박스 목록으로 (중복 제거)
  const photos = useMemo(() => {
    if (!p) return [];
    const seen = new Set<string>();
    return [...bodyImages(p.body), ...p.images].filter(x => !seen.has(x.src) && seen.add(x.src));
  }, [p]);
  const lb = useLightbox(photos);

  if (error) return (
    <div className="page-loading"><div style={{ textAlign: 'center' }}><h1>글을 찾을 수 없어요</h1><Link to="/blog" className="btn btn-ghost" style={{ marginTop: 20 }}>목록으로</Link></div></div>
  );
  if (!p) return <div className="page-loading"><div className="loader" /></div>;

  const cat = POST_CATEGORY[p.category] ?? POST_CATEGORY.etc;
  const galleryInBody = p.body.includes('[[gallery]]');

  return (
    <article className="post" style={{ '--c': cat.color } as CSSProperties}>
      <header className="post-hero">
        <div className="container post-narrow">
          <Link to="/blog" className="back"><I.ArrowLeft /> 활동 기록</Link>
          <div className="post-meta"><span className="post-cat">{cat.label}</span><span>{p.period}</span></div>
          <h1>{p.title}</h1>
          <p className="post-excerpt">{p.excerpt}</p>
          <dl className="post-facts">
            {p.role && <div><dt>역할</dt><dd>{p.role}</dd></div>}
            {p.place && <div><dt>어디서</dt><dd>{p.place}</dd></div>}
            <div><dt>기간</dt><dd>{p.period}</dd></div>
          </dl>
        </div>
        <div className="container">
          <div className={`post-cover ${p.cover ? '' : 'is-fallback'}`}><PostCover post={p} large /></div>
        </div>
      </header>

      <div className="container post-narrow post-content">
        <Markdown source={p.body} images={p.images} onOpen={lb.open} />
        {!galleryInBody && p.images.length > 0 && <Markdown source="[[gallery]]" images={p.images} onOpen={lb.open} />}
        {p.tags.length > 0 && <div className="post-tags">{p.tags.map(t => <span key={t} className="chip">#{t}</span>)}</div>}
        <nav className="pn" aria-label="다른 글">
          {p.prev && <Link to={`/blog/${p.prev.slug}`}><small>← 이전 글</small><b>{p.prev.title}</b></Link>}
          {p.next && <Link to={`/blog/${p.next.slug}`} className="next"><small>다음 글 →</small><b>{p.next.title}</b></Link>}
        </nav>
      </div>
      <Lightbox photos={photos} index={lb.index} onClose={lb.close} onIndex={lb.setIndex} />
    </article>
  );
}
