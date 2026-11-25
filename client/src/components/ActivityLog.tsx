import { Link } from 'react-router-dom';
import type { PostSummary } from '../lib/api';
import { useApi } from '../lib/hooks';
import PostCard from './PostCard';
import * as I from './Icons';

/** 메인 화면의 활동 블로그 미리보기 (최신 5개: 큰 카드 1 + 4 → 두 줄) */
export default function ActivityLog() {
  const { data } = useApi<PostSummary[]>('/posts');
  if (!data?.length) return null;
  return (
    <section className="section" id="activity">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Activity Log</span>
          <h2>현장에서 남긴 기록</h2>
          <p>타임라인의 한 줄 뒤에 있는 이야기들입니다. 무엇을 했고, 무엇을 배웠는지 적었습니다.</p>
        </div>
        <div className="post-grid reveal">
          {data.slice(0, 5).map((p, i) => <PostCard key={p.slug} post={p} featured={i === 0} />)}
        </div>
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link to="/blog" className="btn btn-ghost">활동 기록 전체 보기 ({data.length}) <I.ArrowRight width={18} /></Link>
        </div>
      </div>
    </section>
  );
}
