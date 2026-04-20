'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useUploadMutation } from '@/features/upload/state/useUploadMutation';

interface UseMarkdownEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

/**
 * MarkdownEditor 로직 훅
 * - 이미지 업로드 (드래그앤드롭, 붙여넣기)
 * - 자동 임시저장
 * - 슬러그 자동 생성
 */
export function useMarkdownEditor({
  initialContent = '',
  onContentChange,
}: UseMarkdownEditorProps = {}) {
  const { draft, updateDraft, setDirty } = useEditorStore();
  const autoSaveTimeoutRef = useRef<any>(undefined);

  // 컨텐츠 변경 처리
  const handleContentChange = useCallback(
    (content: string) => {
      updateDraft({ content });
      setDirty(true);
      onContentChange?.(content);

      // 자동저장 스케줄링
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        // Server Action 또는 별도의 저장 로직
        // 지금은 Zustand store의 localStorage에 자동 저장됨
      }, 3000); // 3초 후 저장
    },
    [updateDraft, setDirty, onContentChange]
  );

  // 이미지 업로드 뮤테이션 (onSuccess로 content 업데이트)
  const { mutate: uploadImage, isPending: isUploading } = useUploadMutation({
    onSuccess: (response) => {
      // 이미지 URL을 마크다운 형식으로 삽입
      const markdown = `![image](${response.url})`;
      if (draft?.content) {
        handleContentChange(draft.content + `\n${markdown}`);
      } else {
        handleContentChange(markdown);
      }
    },
  });

  // 제목 변경 처리
  const handleTitleChange = useCallback(
    (title: string) => {
      updateDraft({ title });
      setDirty(true);
    },
    [updateDraft, setDirty]
  );

  // 이미지 업로드 (드래그앤드롭, 붙여넣기)
  const handleImageUpload = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        throw new Error('이미지 파일만 업로드 가능합니다');
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB 제한
        throw new Error('파일 크기는 5MB 이하여야 합니다');
      }

      uploadImage(file);
    },
    [uploadImage]
  );

  // 드래그앤드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => {
        try {
          handleImageUpload(file);
        } catch (error) {
          console.error('Upload error:', error);
        }
      });
    },
    [handleImageUpload]
  );

  // 붙여넣기 핸들러
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const files = Array.from(e.clipboardData.files);
      if (files.length > 0) {
        e.preventDefault();
        files.forEach((file) => {
          try {
            handleImageUpload(file);
          } catch (error) {
            console.error('Upload error:', error);
          }
        });
      }
    },
    [handleImageUpload]
  );

  // 정리
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    draft,
    isUploading,
    handleContentChange,
    handleTitleChange,
    handleImageUpload,
    handleDragOver,
    handleDrop,
    handlePaste,
  };
}
