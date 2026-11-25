import { useEffect, useMemo, useState } from 'react';
import { POST_CATEGORY, type PostCategory, type PostSummary } from '../lib/api';
import { useApi } from '../lib/hooks';
import PostCard from '../components/PostCard';

export default function Blog() {
  const { data, error } = useApi<PostSummary[]>('/posts');
  const [cat, setCat] = useState<PostCategory | 'all'>('all');
  useEffect(() => { document.title = '활동 기록 | 임종탁'; }, []);

  const cats = useMemo(() => {
    const set = new Set((data ?? []).map(p => p.category));
    return (Object.keys(POST_CATEGORY) as PostCategory[]).filter(c => set.has(c));
  }, [data]);
  const list = (data ?? []).filter(p => cat === 'all' || p.category === cat);

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="container">
          <span className="eyebrow">Activity Log</span>
          <h1>점들이 모여 선이 된 기록</h1>
          <p>학생회, 해커톤, 지역 상생 프로젝트, 봉사와 멘토링. 결과보다 그 과정에서 무엇을 배웠는지를 남겨둡니다.</p>
        </div>
      </section>
      <div className="container blog-wrap">
        {error && <p className="empty">글을 불러오지 못했습니다.</p>}
        {data && (
          <>
            <div className="filters" role="tablist" aria-label="활동 분류">
              <button role="tab" aria-selected={cat === 'all'} className={`filter ${cat === 'all' ? 'active' : ''}`} onClick={() => setCat('all')}>전체<small>{data.length}</small></button>
              {cats.map(c => (
                <button key={c} role="tab" aria-selected={cat === c} className={`filter ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
                  {POST_CATEGORY[c].label}<small>{data.filter(p => p.category === c).length}</small>
                </button>
              ))}
            </div>
            <div className="post-grid">
              {list.map((p, i) => <PostCard key={p.slug} post={p} featured={cat === 'all' && i === 0} />)}
            </div>
          </>
        )}
        {!data && !error && <div className="page-loading" style={{ minHeight: 300 }}><div className="loader" /></div>}
      </div>
    </div>
  );
}
