'use client';

import dynamic from 'next/dynamic';
import { useEditorStore } from '@/stores/editorStore';
import { useMarkdownEditor } from '../hooks/useMarkdownEditor';
import type { EditorDraft } from '@/stores/editorStore';

// Dynamic import로 SSR 제외 (MDEditor는 window 객체 필요)
const MarkdownEditorContent = dynamic(
  () => import('./MarkdownEditorContent').then((mod) => mod.MarkdownEditorContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading editor...</div>
      </div>
    ),
  }
);

interface MarkdownEditorProps {
  initialDraft?: EditorDraft;
  onSave?: (draft: EditorDraft) => Promise<void>;
}

/**
 * MarkdownEditor 메인 컴포넌트
 * - Dynamic import로 SSR 제외
 * - 분할 뷰 (편집/미리보기)
 * - 이미지 업로드 (드래그앤드롭, 붙여넣기)
 * - 자동 임시저장 (localStorage)
 * - 슬러그 자동 생성
 */
export function MarkdownEditor({ initialDraft, onSave }: MarkdownEditorProps) {
  const { draft, setDraft, updateDraft } = useEditorStore();
  const {
    isUploading,
    handleContentChange,
    handleTitleChange,
    handleImageUpload,
    handleDragOver,
    handleDrop,
    handlePaste,
  } = useMarkdownEditor({
    initialContent: draft?.content || initialDraft?.content || '',
  });

  // 초기 드래프트 설정
  if (initialDraft && !draft) {
    setDraft(initialDraft);
  }

  if (!draft) {
    return <div>No draft loaded</div>;
  }

  const handleExcerptChange = (excerpt: string) => {
    updateDraft({ excerpt });
  };

  const handleCoverImageChange = (url: string) => {
    updateDraft({ coverImage: url || undefined });
  };

  return (
    <MarkdownEditorContent
      draft={draft}
      isUploading={isUploading}
      onTitleChange={handleTitleChange}
      onExcerptChange={handleExcerptChange}
      onContentChange={handleContentChange}
      onCoverImageChange={handleCoverImageChange}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPaste={handlePaste}
    />
  );
}
