'use client';

import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownEditorPreviewProps {
  content: string;
}

const markdownComponents: any = {
  h1: (props: any) => (
    <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
      {props.children}
    </h1>
  ),
  h2: (props: any) => (
    <h2 className="mb-3 mt-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
      {props.children}
    </h2>
  ),
  h3: (props: any) => (
    <h3 className="mb-2 mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">
      {props.children}
    </h3>
  ),
  p: (props: any) => (
    <p className="mb-3 leading-relaxed text-slate-700 dark:text-slate-300">
      {props.children}
    </p>
  ),
  code: (props: any) => {
    if (!props.className) {
      return (
        <code className="rounded bg-slate-200 px-2 py-1 font-mono text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100">
          {props.children}
        </code>
      );
    }
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
  blockquote: (props: any) => (
    <blockquote className="mb-4 border-l-4 border-blue-500 bg-blue-50 py-1 pl-4 pr-4 italic text-slate-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-slate-300">
      {props.children}
    </blockquote>
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
  img: (props: any) => (
    <img
      src={props.src}
      alt={props.alt}
      className="my-4 max-w-full rounded-lg"
      loading="lazy"
    />
  ),
};

/**
 * Markdown 미리보기 (SSR 포함 가능)
 * 별도 컴포넌트로 분리해 성능 최적화
 */
export function MarkdownEditorPreview({ content }: MarkdownEditorPreviewProps) {
  if (!content) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        Preview will appear here...
      </div>
    );
  }

  return (
    <div className="overflow-y-auto p-6">
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeSanitize]}
          components={markdownComponents}
        >
          {content}
        </Markdown>
      </div>
    </div>
  );
}
