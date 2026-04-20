import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EditorDraft {
  postId?: string; // 기존 포스트 수정 시
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  published: boolean;
  seriesId?: string;
  seriesOrder?: number;
  lastSaved: number; // timestamp
}

export interface EditorState {
  // 상태
  draft: EditorDraft | null;
  isDirty: boolean; // 변경사항 있는지 여부

  // 액션
  setDraft: (draft: EditorDraft) => void;
  updateDraft: (partial: Partial<EditorDraft>) => void;
  saveDraft: () => void;
  clearDraft: () => void;
  setDirty: (dirty: boolean) => void;
}

/**
 * 에디터 임시저장 상태 (Zustand + localStorage)
 * - 포스트 작성/편집 중 임시저장
 * - 페이지 새로고침 시에도 복구
 * - 주기적으로 자동 저장 (5초)
 */
export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      draft: null,
      isDirty: false,

      setDraft: (draft) =>
        set({
          draft,
          isDirty: false,
        }),

      updateDraft: (partial) =>
        set((state) => {
          if (!state.draft) return state;
          return {
            draft: {
              ...state.draft,
              ...partial,
              lastSaved: Date.now(),
            },
            isDirty: true,
          };
        }),

      saveDraft: () =>
        set((state) => {
          if (!state.draft) return state;
          return {
            draft: {
              ...state.draft,
              lastSaved: Date.now(),
            },
            isDirty: false,
          };
        }),

      clearDraft: () =>
        set({
          draft: null,
          isDirty: false,
        }),

      setDirty: (dirty) => set({ isDirty: dirty }),
    }),
    {
      name: 'editor-store',
      version: 1,
    }
  )
);
