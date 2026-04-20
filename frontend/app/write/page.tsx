'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useCreatePost } from '@/features/post/state/usePostMutation';
import { useAuthStore } from '@/stores/authStore';
import { useEditorStore } from '@/stores/editorStore';
import { TagInput } from '@/features/tag/components/TagInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const MarkdownEditor = dynamic(
  () => import('@/features/post/components/MarkdownEditor').then(mod => mod.MarkdownEditor),
  { ssr: false, loading: () => <div>에디터 로딩 중...</div> }
);

export default function WritePage() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const draft = useEditorStore((state) => state.draft);
  const createPostMutation = useCreatePost();

  const [title, setTitle] = useState(draft?.title || '');
  const [content, setContent] = useState(draft?.content || '');
  const [excerpt, setExcerpt] = useState(draft?.excerpt || '');
  const [tags, setTags] = useState<string[]>(draft?.tags || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!session) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-lg bg-yellow-50 p-6 dark:bg-yellow-900">
          <p className="text-yellow-800 dark:text-yellow-200">
            글을 작성하려면{' '}
            <a href="/login" className="font-semibold hover:underline">
              로그인
            </a>
            하세요.
          </p>
        </div>
      </main>
    );
  }

  const handleSaveDraft = () => {
    const store = useEditorStore.getState();
    store.setDraft({
      title,
      content,
      excerpt,
      tags,
      published: false,
      lastSaved: Date.now(),
    });
    alert('임시저장되었습니다.');
  };

  const handlePublish = async () => {
    const store = useEditorStore.getState();
    const editorDraft = store.draft;

    // Always prefer values from editorStore since that's where MarkdownEditor updates them
    const finalTitle = editorDraft?.title || title || '';
    const finalContent = editorDraft?.content || content || '';
    const finalExcerpt = editorDraft?.excerpt || excerpt || '';
    const finalTags = (editorDraft?.tags && editorDraft.tags.length > 0) ? editorDraft.tags : tags;

    console.log('DEBUG handlePublish:', {
      editorDraft,
      localTitle: title,
      localContent: content,
      finalTitle,
      finalContent,
      titleTrim: finalTitle.trim(),
      contentTrim: finalContent.trim(),
    });

    if (!finalTitle.trim() || !finalContent.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await createPostMutation.mutateAsync({
        title: finalTitle,
        content: finalContent,
        excerpt: finalExcerpt || undefined,
        coverImage: editorDraft?.coverImage || undefined,
        published: true,
        tags: finalTags,
        seriesId: undefined,
        seriesOrder: undefined,
      });

      store.clearDraft();
      router.push('/');
    } catch (err: any) {
      setError(err.message || '포스트 발행에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            새 포스트 작성
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            마크다운으로 기술 블로그를 작성하세요.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        <MarkdownEditor
          initialDraft={{ title, content, excerpt, tags }}
          onSave={async (draft) => {
            setContent(draft.content);
            setTitle(draft.title);
            setExcerpt(draft.excerpt);
            setTags(draft.tags);
            handleSaveDraft();
          }}
        />

        <div className="flex gap-4">
          <Button
            onClick={handlePublish}
            disabled={isLoading}
          >
            {isLoading ? '발행 중...' : '발행하기'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={isLoading}
          >
            임시저장
          </Button>
        </div>
      </div>
    </main>
  );
}
