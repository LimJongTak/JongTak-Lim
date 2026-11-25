import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { POST_CATEGORY, type PostSummary } from '../lib/api';
import * as I from './Icons';

/** 사진이 없는 글의 표지: 카테고리 색 위에 점과 선, 기간 */
export function PostCover({ post, large }: { post: Pick<PostSummary, 'cover' | 'title' | 'period' | 'category'>; large?: boolean }) {
  const cat = POST_CATEGORY[post.category] ?? POST_CATEGORY.etc;
  if (post.cover) return <img src={post.cover} alt="" loading="lazy" />;
  return (
    <span className={`post-cover-fallback ${large ? 'large' : ''}`} style={{ '--c': cat.color } as CSSProperties} aria-hidden>
      <span className="pcf-line"><i /><i /></span>
      <span className="pcf-year">{post.period.slice(0, 4)}</span>
      <span className="pcf-label">{cat.label}</span>
    </span>
  );
}

export default function PostCard({ post, featured }: { post: PostSummary; featured?: boolean }) {
  const cat = POST_CATEGORY[post.category] ?? POST_CATEGORY.etc;
  return (
    <Link to={`/blog/${post.slug}`} className={`post-card ${featured ? 'is-featured' : ''}`} style={{ '--c': cat.color } as CSSProperties}>
      <div className="post-media">
        <PostCover post={post} large={featured} />
        {post.photo_count > 0 && <span className="chip post-photos">사진 {post.photo_count}</span>}
      </div>
      <div className="post-body">
        <div className="post-meta"><span className="post-cat">{cat.label}</span><span>{post.period}</span></div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <span className="more-link">읽어보기 <I.ArrowRight /></span>
      </div>
    </Link>
  );
}
