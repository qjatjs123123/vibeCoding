'use client';

import { Suspense, useState } from 'react';
import { useComments } from '@/features/comment/state/useCommentQuery';
import { useToggleLike } from '@/features/post/state/usePostMutation';
import { useCreateComment } from '@/features/comment/state/useCommentMutation';
import { useAuthStore } from '@/stores/authStore';
import { CommentForm } from '@/features/comment/components/CommentForm';
import { CommentList } from '@/features/comment/components/CommentList';
import { LikeButton } from '@/features/post/components/LikeButton';

interface PostPageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

async function fetchPost(username: string, slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const res = await fetch(
    `${baseUrl}/api/posts/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) throw new Error('Post not found');
  return res.json();
}

function PostInteractions({ postId }: { postId: string }) {
  const session = useAuthStore((state) => state.session);
  const { data: comments } = useComments(postId);
  const toggleLikeMutation = useToggleLike(postId);
  const createCommentMutation = useCreateComment(postId);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const handleToggleLike = async () => {
    await toggleLikeMutation.mutateAsync();
  };

  const handleCreateComment = async (content: string) => {
    await createCommentMutation.mutateAsync({ content });
    setShowCommentForm(false);
  };

  return (
    <div className="space-y-8 border-t border-gray-200 dark:border-gray-700 pt-8">
      {/* 좋아요 버튼 */}
      <div>
        <LikeButton
          postId={postId}
          onToggle={handleToggleLike}
          currentUserId={session?.userId}
        />
      </div>

      {/* 댓글 섹션 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          댓글 {comments?.length || 0}
        </h3>

        {!session ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            댓글을 작성하려면{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              로그인
            </a>
            하세요.
          </p>
        ) : (
          <>
            {!showCommentForm ? (
              <button
                onClick={() => setShowCommentForm(true)}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                댓글 작성
              </button>
            ) : (
              <CommentForm
                currentUserId={session.userId}
                onSubmit={handleCreateComment}
                onCancel={() => setShowCommentForm(false)}
              />
            )}
          </>
        )}

        {comments && comments.length > 0 && (
          <CommentList
            comments={comments}
            currentUserId={session?.userId}
          />
        )}
      </div>
    </div>
  );
}

export default async function PostPage({ params }: PostPageProps) {
  const { username, slug } = await params;
  const post = await fetchPost(username, slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="space-y-8">
        {/* 헤더 */}
        <header className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {post.author?.username || 'Unknown'}
              </p>
              <p className="text-sm">
                {new Date(post.publishedAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          )}
        </header>

        {/* 메타 정보 */}
        <div className="flex gap-8 text-sm text-gray-600 dark:text-gray-400">
          <span>{post.readingTime || 5}분 읽음</span>
          <span>조회 {post.viewCount || 0}</span>
          <span>좋아요 {post.likeCount || 0}</span>
          <span>댓글 {post.commentCount || 0}</span>
        </div>

        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: any) => (
              <a
                key={tag.name}
                href={`/tags/${tag.name}`}
                className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition"
              >
                #{tag.name}
              </a>
            ))}
          </div>
        )}

        {/* 본문 */}
        <div className="prose dark:prose-invert max-w-none">
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {post.content || 'No content'}
          </div>
        </div>

        {/* Interactive: 좋아요 + 댓글 */}
        <Suspense fallback={<div>로딩 중...</div>}>
          <PostInteractions postId={post.id} />
        </Suspense>
      </article>
    </main>
  );
}
