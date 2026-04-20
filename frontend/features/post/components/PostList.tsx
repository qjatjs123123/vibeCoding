'use client';

import { useEffect, useRef, useCallback } from 'react';
import { PostCard } from './PostCard';
import type { Post } from '../model/post';

interface PostListProps {
  initialPosts: Post[];
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

export function PostList({
  initialPosts,
  onLoadMore,
  isLoading = false,
  hasMore = true,
}: PostListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading && onLoadMore) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '100px',
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleIntersection]);

  return (
    <div className="space-y-8">
      {initialPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-[--color-text-secondary] text-lg">
            No posts found
          </p>
        </div>
      ) : (
        <>
          {initialPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Intersection observer target */}
          <div ref={observerTarget} className="py-8" />

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-[--color-text-secondary]">
                Loading more posts...
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
