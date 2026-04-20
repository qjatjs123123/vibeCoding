import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { Post } from '../model/post';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  isLiked?: boolean;
}

export function PostCard({ post, onLike, isLiked = false }: PostCardProps) {
  const postUrl = `/${post.author.username}/${post.slug}`;
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onLike?.(post.id);
  };

  return (
    <Link href={postUrl}>
      <article className="group overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-200 hover:shadow-md dark:hover:shadow-lg">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative h-48 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col gap-3 p-4 sm:p-5 md:p-6">
          {/* Header: Author + Date */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar
                src={post.author.avatarUrl}
                alt={post.author.username}
                size="sm"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {post.author.username}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {post.excerpt}
          </p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.name}
                  className="inline-block rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                >
                  #{tag.name}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="inline-block text-xs text-slate-500 dark:text-slate-400">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Meta Stats + Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-700 pt-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span>{post.readingTime} min read</span>
              <span>{post.viewCount.toLocaleString()} views</span>
              <span>{post.commentCount} comments</span>
            </div>

            {/* Like Button */}
            <Button
              variant={isLiked ? 'primary' : 'ghost'}
              size="sm"
              onClick={handleLikeClick}
              className="!px-2"
              title={`${post.likeCount} likes`}
              aria-pressed={isLiked}
              aria-label={`Like post by ${post.author.username}`}
            >
              <span className="text-base">♥</span>
              <span className="ml-1 text-xs">{post.likeCount}</span>
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}
