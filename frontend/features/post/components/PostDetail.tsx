'use client';

import React, { memo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import { Avatar } from '../../../src/components/ui/Avatar';
import type { Post } from '../model/post';

interface PostDetailProps {
  post: Post;
  content: string;
  onLike?: (postId: string) => void;
  isLiked?: boolean;
}

/**
 * Custom markdown components for styling
 */
const markdownComponents: any = {
  h1: (props: any) => (
    <h1 className="mb-6 text-4xl font-bold text-slate-900 dark:text-slate-100">
      {props.children}
    </h1>
  ),
  h2: (props: any) => (
    <h2 className="mb-4 mt-8 text-3xl font-bold text-slate-900 dark:text-slate-100">
      {props.children}
    </h2>
  ),
  h3: (props: any) => (
    <h3 className="mb-3 mt-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
      {props.children}
    </h3>
  ),
  p: (props: any) => (
    <p className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300">
      {props.children}
    </p>
  ),
  blockquote: (props: any) => (
    <blockquote className="mb-4 border-l-4 border-blue-500 bg-blue-50 py-1 pl-4 pr-4 italic text-slate-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-slate-300">
      {props.children}
    </blockquote>
  ),
  code: (props: any) => {
    // Inline code
    if (!props.className) {
      return (
        <code className="rounded bg-slate-200 px-2 py-1 font-mono text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100">
          {props.children}
        </code>
      );
    }
    // Code block with syntax highlighting
    return (
      <code className={`${props.className} block overflow-x-auto rounded bg-slate-900 p-4 text-sm text-slate-100`}>
        {props.children}
      </code>
    );
  },
  pre: (props: any) => (
    <pre className="mb-4 overflow-x-auto">
      {props.children}
    </pre>
  ),
  ul: (props: any) => (
    <ul className="mb-4 list-inside list-disc space-y-2 text-slate-700 dark:text-slate-300">
      {props.children}
    </ul>
  ),
  ol: (props: any) => (
    <ol className="mb-4 list-inside list-decimal space-y-2 text-slate-700 dark:text-slate-300">
      {props.children}
    </ol>
  ),
  li: (props: any) => (
    <li className="ml-4">
      {props.children}
    </li>
  ),
  a: (props: any) => (
    <a
      href={props.href}
      className="text-blue-600 hover:underline dark:text-blue-400"
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  ),
  img: (props: any) => (
    <img
      src={props.src}
      alt={props.alt}
      title={props.title}
      className="my-4 max-w-full rounded-lg"
      loading="lazy"
    />
  ),
  table: (props: any) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse border border-slate-300 dark:border-slate-600">
        {props.children}
      </table>
    </div>
  ),
  thead: (props: any) => (
    <thead className="bg-slate-100 dark:bg-slate-800">
      {props.children}
    </thead>
  ),
  th: (props: any) => (
    <th className="border border-slate-300 px-4 py-2 text-left font-bold dark:border-slate-600">
      {props.children}
    </th>
  ),
  td: (props: any) => (
    <td className="border border-slate-300 px-4 py-2 dark:border-slate-600">
      {props.children}
    </td>
  ),
  hr: () => (
    <hr className="my-8 border-slate-300 dark:border-slate-600" />
  ),
};

export const PostDetail = memo(function PostDetail({
  post,
  content,
  onLike,
  isLiked = false,
}: PostDetailProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleLikeClick = () => {
    onLike?.(post.id);
  };

  return (
    <article className="mx-auto max-w-3xl">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="mb-8 overflow-hidden rounded-lg">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-96 w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        {/* Title */}
        <h1 className="mb-4 text-5xl font-bold text-slate-900 dark:text-slate-100">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-700">
          {/* Author & Date */}
          <div className="flex items-center gap-3">
            <Avatar
              src={post.author.avatarUrl}
              alt={post.author.username}
              size="md"
            />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {post.author.username}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <span>{post.readingTime} min read</span>
            <span>{post.viewCount.toLocaleString()} views</span>
            <span>{post.commentCount} comments</span>
            <button
              onClick={handleLikeClick}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors ${
                isLiked
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              aria-pressed={isLiked}
              aria-label={`Like post (${post.likeCount} likes)`}
            >
              <span>♥</span>
              <span>{post.likeCount}</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.name}
                className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Excerpt */}
      {post.excerpt && (
        <div className="mb-8 rounded-lg bg-slate-50 p-4 italic text-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
          {post.excerpt}
        </div>
      )}

      {/* Content */}
      <div className="prose max-w-none dark:prose-invert">
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeSanitize]}
          components={markdownComponents}
        >
          {content}
        </Markdown>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              src={post.author.avatarUrl}
              alt={post.author.username}
              size="lg"
            />
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {post.author.username}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Software developer
              </p>
            </div>
          </div>
          <button
            onClick={handleLikeClick}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
              isLiked
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
            }`}
            aria-pressed={isLiked}
          >
            <span>♥</span>
            {isLiked ? 'Liked' : 'Like'}
          </button>
        </div>
      </footer>
    </article>
  );
});
