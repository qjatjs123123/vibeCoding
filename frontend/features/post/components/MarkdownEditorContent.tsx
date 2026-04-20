'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MarkdownEditorPreview } from './MarkdownEditorPreview';
import type { EditorDraft } from '@/stores/editorStore';

interface MarkdownEditorContentProps {
  draft: EditorDraft | null;
  isUploading: boolean;
  onTitleChange: (title: string) => void;
  onExcerptChange: (excerpt: string) => void;
  onContentChange: (content: string) => void;
  onCoverImageChange: (url: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onPaste: (e: React.ClipboardEvent) => void;
}

/**
 * MarkdownEditor 콘텐츠 (분할 뷰)
 * - 좌측: 에디터 (title, excerpt, content, coverImage)
 * - 우측: 미리보기
 * - 모바일: 탭으로 전환
 */
export function MarkdownEditorContent({
  draft,
  isUploading,
  onTitleChange,
  onExcerptChange,
  onContentChange,
  onCoverImageChange,
  onDragOver,
  onDrop,
  onPaste,
}: MarkdownEditorContentProps) {
  const [splitView, setSplitView] = useState(true);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  if (!draft) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="flex h-full flex-col gap-4 bg-slate-50 dark:bg-slate-950">
      {/* Header: 메타데이터 입력 */}
      <div className="space-y-4 border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        {/* 제목 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Title *
          </label>
          <input
            type="text"
            placeholder="Post title"
            value={draft.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
          {draft.title && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Slug: {draft.title.toLowerCase().replace(/\s+/g, '-')}
            </p>
          )}
        </div>

        {/* Excerpt (한 줄 요약) */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Excerpt (Optional)
          </label>
          <input
            type="text"
            placeholder="Brief summary of your post"
            value={draft.excerpt || ''}
            onChange={(e) => onExcerptChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {(draft.excerpt || '').length}/160
          </p>
        </div>

        {/* Cover Image */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Cover Image (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={draft.coverImage || ''}
              onChange={(e) => onCoverImageChange(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
            <Button disabled={isUploading} size="sm">
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
          {draft.coverImage && (
            <div className="mt-3 overflow-hidden rounded-lg">
              <img
                src={draft.coverImage}
                alt="cover"
                className="max-h-40 w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabs (모바일) */}
      {isMobile && (
        <div className="flex gap-2 border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('edit')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'edit'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            Preview
          </button>
        </div>
      )}

      {/* Split View Toggle (데스크탑) */}
      {!isMobile && (
        <div className="flex justify-end gap-2 border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
          <button
            onClick={() => setSplitView(!splitView)}
            className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {splitView ? 'Full Width' : 'Split View'}
          </button>
        </div>
      )}

      {/* Editor / Preview */}
      <div
        className={`flex flex-1 overflow-hidden gap-4 px-4 pb-4 ${
          isMobile ? 'flex-col' : splitView ? 'flex-row' : ''
        }`}
      >
        {/* Editor */}
        {(!isMobile || activeTab === 'edit') && (
          <div
            className={`flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${
              isMobile ? 'flex-1' : splitView ? 'flex-1' : 'flex-1'
            }`}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onPaste={onPaste}
          >
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              Markdown Editor {isUploading && '(Uploading...)'}
            </div>
            <textarea
              value={draft.content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Write your markdown here... (supports drag & drop images)"
              className="flex-1 resize-none border-0 bg-white p-4 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
        )}

        {/* Preview */}
        {(!isMobile || activeTab === 'preview') && (
          <div
            className={`flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${
              isMobile ? 'flex-1' : splitView ? 'flex-1' : 'hidden'
            }`}
          >
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              Preview
            </div>
            <MarkdownEditorPreview content={draft.content} />
          </div>
        )}
      </div>
    </div>
  );
}
